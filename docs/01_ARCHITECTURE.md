# Architecture Overview

## Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Language       | Ruby 3.4.9, TypeScript 5.9              |
| Framework      | Rails 8.1.2                             |
| Frontend       | React 19 + Inertia.js 2.3              |
| Build          | Vite 7.3                                |
| CSS            | Tailwind CSS 4.2 + shadcn/ui (shadcn-admin style) |
| Database       | SQLite3                                 |
| Auth           | Rails built-in generator (`has_secure_password`) + OmniAuth (Google, Apple) |
| Authorization  | Pundit                                  |
| File Storage   | Active Storage (local disk) |
| Real-time      | Action Cable (Solid Cable adapter)      |
| Testing        | Minitest + Capybara                     |
| CRM            | AmoCRM API integration                  |
| Deployment     | Kamal + Puma + Thruster                 |

## High-Level Architecture

```
Browser (React + Inertia.js)
    |
    | JSON (Inertia protocol)
    |
Rails Router
    |
    +-- InertiaController (base)
    |       |
    |       +-- Auth::SessionsController      (login/logout/OAuth)
    |       +-- Auth::RegistrationsController  (signup)
    |       +-- HomologationRequestsController (CRUD requests)
    |       +-- MessagesController             (chat via Action Cable)
    |       +-- DocumentsController            (file upload/download)
    |       +-- Admin::DashboardController     (superadmin panel)
    |       +-- Admin::UsersController         (manage coordinators/teachers)
    |       +-- Api::AmoCrmWebhooksController  (CRM sync)
    |
    +-- Action Cable Channels
    |       +-- ConversationChannel (real-time chat per request)
    |       +-- NotificationChannel (real-time notifications)
    |
    +-- Active Jobs
            +-- AmoCrmSyncJob   (push data to AmoCRM)
            +-- NotificationJob (send email/in-app notifications)
```

## Directory Structure (Target)

```
app/
├── controllers/
│   ├── application_controller.rb
│   ├── inertia_controller.rb           # Base for all Inertia controllers
│   ├── auth/
│   │   ├── sessions_controller.rb      # Login (email + OAuth)
│   │   ├── registrations_controller.rb # Signup
│   │   ├── omniauth_callbacks_controller.rb
│   │   └── passwords_controller.rb     # Password reset
│   ├── homologation_requests_controller.rb
│   ├── messages_controller.rb
│   ├── documents_controller.rb
│   ├── notifications_controller.rb
│   └── admin/
│       ├── dashboard_controller.rb
│       ├── users_controller.rb
│       └── reports_controller.rb
├── models/
│   ├── user.rb
│   ├── role.rb
│   ├── homologation_request.rb
│   ├── message.rb
│   ├── conversation.rb
│   ├── notification.rb
│   └── concerns/
│       └── amo_crm_syncable.rb
├── policies/                           # Pundit policies
│   ├── application_policy.rb
│   ├── homologation_request_policy.rb
│   ├── message_policy.rb
│   ├── user_policy.rb
│   └── admin/
│       └── dashboard_policy.rb
├── channels/
│   ├── application_cable/
│   ├── conversation_channel.rb
│   └── notification_channel.rb
├── jobs/
│   ├── amo_crm_sync_job.rb
│   └── notification_job.rb
├── mailers/
│   ├── request_mailer.rb
│   └── notification_mailer.rb
├── services/
│   ├── amo_crm_client.rb              # AmoCRM API wrapper
│   └── amo_crm_contact_sync.rb
├── frontend/
│   ├── entrypoints/
│   │   ├── application.ts
│   │   ├── application.css
│   │   └── inertia.tsx
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx          # Main app layout with sidebar
│   │   │   ├── AuthLayout.tsx         # Auth pages layout
│   │   │   └── AdminLayout.tsx        # Admin dashboard layout
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── requests/
│   │   │   ├── RequestForm.tsx
│   │   │   ├── RequestTable.tsx
│   │   │   └── RequestStatusBadge.tsx
│   │   ├── documents/
│   │   │   ├── FileDropZone.tsx
│   │   │   └── FileList.tsx
│   │   └── admin/
│   │       ├── StatsCard.tsx
│   │       ├── Chart.tsx
│   │       └── UserManagementTable.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── dashboard/
│   │   │   └── Index.tsx              # User home page
│   │   ├── requests/
│   │   │   ├── Index.tsx              # My requests list
│   │   │   ├── New.tsx                # Submit a request form
│   │   │   └── Show.tsx              # Request detail + chat + files
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx          # Admin overview with charts
│   │   │   ├── Users.tsx             # Manage users
│   │   │   └── Reports.tsx
│   │   └── profile/
│   │       └── Edit.tsx
│   ├── hooks/
│   │   ├── useActionCable.ts
│   │   └── useFileUpload.ts
│   ├── lib/
│   │   └── utils.ts                   # shadcn/ui utility (cn function)
│   └── types/
│       ├── index.d.ts
│       └── models.d.ts
```

## Key Architectural Decisions

### 1. Authentication: Rails Generator + OmniAuth (NOT Devise)
- Use `bin/rails generate authentication` (Rails 8 built-in)
- Provides `has_secure_password`, session management, password resets
- Add OmniAuth separately for Google and Apple ID

### 2. Inertia.js as SPA Bridge
- No separate API; controllers render Inertia responses
- Server-side routing, client-side rendering
- Shared data (current_user, flash, notifications) via Inertia middleware

### 3. Real-time Chat via Action Cable
- Solid Cable adapter (SQLite-backed, already configured)
- One channel per conversation (tied to homologation request)
- Messages persisted to DB, Action Cable broadcasts new ones

### 4. File Handling via Active Storage
- Direct upload from React to Rails
- Drag-and-drop UI component
- Coordinators can download any attached file
- Files linked to HomologationRequest

### 5. Authorization via Pundit
- Role-based policies
- Roles stored in `roles` table with join table `user_roles`
- Simple role check helpers in policies

### 6. AmoCRM Integration
- Background job syncs new users/requests to AmoCRM
- Uses AmoCRM REST API v4
- Webhook endpoint for receiving CRM updates
