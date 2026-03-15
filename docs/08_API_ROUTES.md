# Routes & API

## Routes Structure

All routes serve Inertia responses (HTML + JSON page data). No separate REST API needed thanks to Inertia.js protocol.

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # ─── Health ───
  get "up" => "rails/health#show", as: :rails_health_check

  # ─── Authentication ───
  resource  :session,      only: [:new, :create, :destroy]
  resource  :registration, only: [:new, :create]
  resources :passwords,    param: :token, only: [:new, :create, :edit, :update]

  # OAuth
  post "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
  get  "/auth/failure",            to: "auth/omniauth_callbacks#failure"

  # ─── Authenticated Routes ───
  # All routes below require authentication

  # Dashboard (home page after login)
  root "dashboard#index"

  # Profile (edit + complete after first login)
  resource :profile, only: [:show, :edit, :update]

  # Homologation Requests
  resources :homologation_requests, path: "requests" do
    resources :messages, only: [:create]  # Chat messages within request's conversation

    member do
      get  :download_document              # ?document_id=X
      post :confirm_payment                # Coordinator confirms payment → AmoCRM sync
    end
  end

  # ─── Conversations & Chat ───
  # Generic conversations route (teacher-student chats + request chats for student/teacher view)
  resources :conversations, only: [:index, :show] do
    resources :messages, only: [:create]   # Send message in any conversation
  end

  # ─── Coordinator Workspace ───
  resources :inbox, only: [:index, :show]  # Unified chat inbox for coordinators

  resources :teachers, only: [:index, :update] do
    member do
      post   :assign_student               # POST /teachers/:id/assign_student
      delete :remove_student               # DELETE /teachers/:id/remove_student
    end
  end

  # ─── Lessons & Calendar ───
  resources :lessons, only: [:index, :create, :show, :update, :destroy]

  # ─── Notifications ───
  resources :notifications, only: [:index, :update] do
    collection do
      post :mark_all_read
    end
  end

  # ─── Privacy ───
  get "privacy-policy", to: "pages#privacy_policy"

  # ─── Admin ───
  namespace :admin do
    root "dashboard#index"

    resources :users do
      member do
        post :assign_role
        delete :remove_role
      end
    end

    resources :lessons, only: [:index]     # All lessons overview for admin/coordinator
  end

  # ─── Action Cable ───
  # WebSocket endpoint (auto-configured via cable.yml)
end
```

## Controller Actions Detail

### SessionsController (built-in + extended)
| Method | Path              | Action  | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | /session/new      | new     | Login page            |
| POST   | /session          | create  | Login                 |
| DELETE | /session          | destroy | Logout                |

### RegistrationsController
| Method | Path               | Action | Description            |
|--------|--------------------|--------|------------------------|
| GET    | /registration/new  | new    | Signup page            |
| POST   | /registration      | create | Create account         |

### ProfilesController
| Method | Path               | Action | Description                           |
|--------|--------------------|--------|---------------------------------------|
| GET    | /profile           | show   | View profile                          |
| GET    | /profile/edit      | edit   | Edit profile (also serves as "Complete Profile" after first login) |
| PATCH  | /profile           | update | Update profile fields + locale        |

### HomologationRequestsController
| Method | Path                              | Action           | Description                    |
|--------|-----------------------------------|------------------|--------------------------------|
| GET    | /requests                         | index            | List requests (filtered by role)|
| GET    | /requests/new                     | new              | Submit request form            |
| POST   | /requests                         | create           | Create request (or save draft) |
| GET    | /requests/:id                     | show             | Request detail + chat + files  |
| PATCH  | /requests/:id                     | update           | Update status / assign coord.  |
| GET    | /requests/:id/download_document   | download_document| Download a file                |
| POST   | /requests/:id/confirm_payment     | confirm_payment  | Confirm payment → trigger AmoCRM sync |

### MessagesController (nested under requests)
| Method | Path                            | Action | Description        |
|--------|---------------------------------|--------|--------------------|
| POST   | /requests/:request_id/messages  | create | Send chat message in request conversation |

### ConversationsController
| Method | Path                                   | Action | Description                              |
|--------|----------------------------------------|--------|------------------------------------------|
| GET    | /conversations                         | index  | List conversations (teacher-student + request chats for student/teacher) |
| GET    | /conversations/:id                     | show   | Single conversation with messages        |
| POST   | /conversations/:conversation_id/messages | create | Send message in any conversation       |

*Messages are loaded as part of conversation/request show page. New messages arrive via Action Cable.*

### InboxController (Coordinator Workspace)
| Method | Path             | Action | Description                              |
|--------|------------------|--------|------------------------------------------|
| GET    | /inbox           | index  | Unified chat inbox (all conversations)   |
| GET    | /inbox/:id       | show   | Single conversation in inbox layout      |

### TeachersController (Coordinator Workspace)
| Method | Path                            | Action         | Description                 |
|--------|---------------------------------|----------------|-----------------------------|
| GET    | /teachers                       | index          | Teacher cards + workload    |
| PATCH  | /teachers/:id                   | update         | Edit teacher profile (level, rate, link) |
| POST   | /teachers/:id/assign_student    | assign_student | Assign student to teacher   |
| DELETE | /teachers/:id/remove_student    | remove_student | Remove student from teacher |

### LessonsController
| Method | Path             | Action  | Description                              |
|--------|------------------|---------|------------------------------------------|
| GET    | /lessons         | index   | Teacher: own calendar. Student: own lessons. |
| POST   | /lessons         | create  | Create lesson (teacher or coordinator)   |
| GET    | /lessons/:id     | show    | Lesson detail                            |
| PATCH  | /lessons/:id     | update  | Edit lesson (link, status, notes)        |
| DELETE | /lessons/:id     | destroy | Cancel lesson                            |

### NotificationsController
| Method | Path                       | Action        | Description        |
|--------|----------------------------|---------------|--------------------|
| GET    | /notifications             | index         | List notifications |
| PATCH  | /notifications/:id         | update        | Mark as read       |
| POST   | /notifications/mark_all_read | mark_all_read | Mark all read    |

### PagesController
| Method | Path              | Action         | Description         |
|--------|-------------------|----------------|---------------------|
| GET    | /privacy-policy   | privacy_policy | Static privacy page |

### Admin::DashboardController
| Method | Path             | Action | Description                              |
|--------|------------------|--------|------------------------------------------|
| GET    | /admin           | index  | Dashboard with stats + charts (all data as Inertia props) |

### Admin::UsersController
| Method | Path                          | Action      | Description        |
|--------|-------------------------------|-------------|--------------------|
| GET    | /admin/users                  | index       | List all users     |
| GET    | /admin/users/new              | new         | New user form      |
| POST   | /admin/users                  | create      | Create user        |
| GET    | /admin/users/:id              | show        | User detail        |
| GET    | /admin/users/:id/edit         | edit        | Edit user form     |
| PATCH  | /admin/users/:id              | update      | Update user        |
| DELETE | /admin/users/:id              | destroy     | Deactivate user    |
| POST   | /admin/users/:id/assign_role  | assign_role | Add role to user   |
| DELETE | /admin/users/:id/remove_role  | remove_role | Remove role        |

### Admin::LessonsController
| Method | Path             | Action | Description                              |
|--------|------------------|--------|------------------------------------------|
| GET    | /admin/lessons   | index  | All lessons table with filters (coordinator + super_admin) |

## Action Cable Channels

### ConversationChannel
```ruby
# Subscribe: { channel: "ConversationChannel", conversation_id: 123 }
# Broadcasts: new messages as JSON
```

### NotificationChannel
```ruby
# Subscribe: { channel: "NotificationChannel" }
# Broadcasts: new notification for current_user
```

## Inertia Shared Data (every request)

```json
{
  "current_user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["student"],
    "avatar_url": "https://...",
    "locale": "es",
    "profile_complete": true
  },
  "flash": {
    "notice": "...",
    "alert": "..."
  },
  "unread_notifications_count": 3,
  "select_options": { "...loaded from config/select_options.yml..." }
}
```

**Note:** If `profile_complete` is `false`, the app should redirect to `/profile/edit` to complete profile (WhatsApp, birthday, country).
