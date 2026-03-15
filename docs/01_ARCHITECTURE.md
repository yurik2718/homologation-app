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
    |       +-- ProfilesController             (complete + edit profile)
    |       +-- HomologationRequestsController (CRUD requests + confirm_payment)
    |       +-- MessagesController             (chat messages)
    |       +-- ConversationsController         (chat list for teacher/student)
    |       +-- InboxController                 (unified inbox for coordinator)
    |       +-- TeachersController              (teacher management)
    |       +-- LessonsController               (lesson CRUD + calendar)
    |       +-- NotificationsController         (in-app notifications)
    |       +-- Admin::DashboardController     (stats + charts)
    |       +-- Admin::UsersController         (manage users + roles)
    |       +-- Admin::LessonsController       (all lessons overview)
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
│   ├── profiles_controller.rb          # Complete + edit profile
│   ├── homologation_requests_controller.rb  # CRUD + confirm_payment
│   ├── messages_controller.rb
│   ├── conversations_controller.rb     # Chat list for teacher/student
│   ├── inbox_controller.rb            # Unified inbox for coordinator
│   ├── teachers_controller.rb         # Teacher management + assign students
│   ├── lessons_controller.rb          # Lesson CRUD + calendar
│   ├── notifications_controller.rb
│   ├── pages_controller.rb            # Static pages (privacy policy)
│   └── admin/
│       ├── dashboard_controller.rb     # Stats + charts as Inertia props
│       ├── users_controller.rb
│       └── lessons_controller.rb       # All lessons overview
├── models/
│   ├── user.rb
│   ├── role.rb
│   ├── user_role.rb
│   ├── homologation_request.rb
│   ├── teacher_profile.rb
│   ├── teacher_student.rb
│   ├── lesson.rb
│   ├── conversation.rb
│   ├── message.rb
│   ├── notification.rb
│   ├── amo_crm_token.rb
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
│   └── amo_crm_client.rb              # AmoCRM API wrapper (Faraday)
├── frontend/
│   ├── entrypoints/
│   │   ├── application.ts
│   │   ├── application.css
│   │   └── inertia.tsx
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx         # Collapsible sidebar with role-based items
│   │   │   ├── Header.tsx             # Top bar with language switcher, notifications, user menu
│   │   │   ├── AuthenticatedLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── common/
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── FormattedDate.tsx
│   │   │   └── RoleGuard.tsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── documents/
│   │   │   ├── FileDropZone.tsx
│   │   │   └── FileList.tsx
│   │   ├── inbox/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   └── ContextPanel.tsx
│   │   ├── teachers/
│   │   │   ├── TeacherCard.tsx
│   │   │   ├── AssignStudentDialog.tsx
│   │   │   └── EditTeacherDialog.tsx
│   │   ├── lessons/
│   │   │   ├── WeekGrid.tsx
│   │   │   ├── DayView.tsx
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonDialog.tsx
│   │   │   └── LessonList.tsx
│   │   └── admin/
│   │       ├── StatsCard.tsx
│   │       └── Charts.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── profile/
│   │   │   └── Edit.tsx               # Also serves as CompleteProfile
│   │   ├── dashboard/
│   │   │   └── Index.tsx
│   │   ├── requests/
│   │   │   ├── Index.tsx
│   │   │   ├── New.tsx
│   │   │   └── Show.tsx
│   │   ├── inbox/
│   │   │   └── Index.tsx              # Coordinator unified inbox
│   │   ├── teachers/
│   │   │   └── Index.tsx              # Coordinator teacher management
│   │   ├── lessons/
│   │   │   └── Index.tsx              # Student: my lessons list
│   │   ├── calendar/
│   │   │   └── Index.tsx              # Teacher: week/day calendar
│   │   ├── chat/
│   │   │   └── Index.tsx              # Teacher & student conversation list
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Users.tsx
│   │       └── Lessons.tsx
│   ├── hooks/
│   │   ├── useActionCable.ts
│   │   └── useFileUpload.ts
│   ├── lib/
│   │   ├── utils.ts                   # shadcn/ui utility (cn function)
│   │   └── i18n.ts                    # react-i18next setup
│   ├── locales/
│   │   ├── es.json
│   │   ├── en.json
│   │   └── ru.json
│   └── types/
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
- Background job syncs requests to AmoCRM **only after payment confirmation**
- Uses AmoCRM REST API v4 via Faraday HTTP client
- Token auto-refresh via `amo_crm_tokens` table
