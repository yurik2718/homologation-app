# Implementation Plan

**Principle:** Minimum code, maximum user value. See `docs/00_PRINCIPLES.md`.

## Step 0: Foundation Setup
```bash
npx shadcn@latest init
npx shadcn@latest add button input label textarea select checkbox \
  card dialog sheet sidebar table badge avatar separator \
  dropdown-menu tabs popover toast sonner scroll-area form
npm install lucide-react react-dropzone recharts date-fns \
  @rails/activestorage @rails/actioncable \
  react-i18next i18next i18next-browser-languagedetector
```
Then:
- Create `app/frontend/lib/i18n.ts` + `locales/{es,en,ru}.json`
- Create `config/select_options.yml` with all dropdown options
- Create layouts: `AuthenticatedLayout`, `AuthLayout`, `AppSidebar`, `Header`
- Create shared components: `LanguageSwitcher`, `StatusBadge`, `FormattedDate`, `RoleGuard`
- **Rule: every component uses `t()` from this point forward**

## Step 1: Authentication
```bash
bin/rails generate authentication
bundle add omniauth omniauth-google-oauth2 omniauth-apple omniauth-rails_csrf_protection
```
- Extend User model (name, whatsapp, phone, birthday, country, locale, provider, uid)
- `encrypts :phone, :whatsapp`
- `rate_limit` on sessions + registrations controllers
- OmniAuth callbacks controller
- Pages: Login, Register, ForgotPassword, CompleteProfile
- Inertia shared data: `current_user`, `select_options`, `flash`

## Step 2: Roles & Authorization
```bash
bundle add pundit
bin/rails generate pundit:install
bin/rails generate model Role name:string
bin/rails generate model UserRole user:references role:references
```
- Role helpers on User (`student?`, `coordinator?`, `super_admin?`)
- Seed 4 roles
- Pundit in InertiaController with `verify_authorized`
- `RoleGuard` component for sidebar navigation

## Step 3: Homologation Requests
```bash
bin/rails generate model HomologationRequest user:references subject:string \
  description:text service_type:string identity_card:string passport:string \
  education_system:string studies_finished:string study_type_spain:string \
  studies_spain:string university:string country:string referral_source:string \
  language_knowledge:string language_certificate:string status:string \
  privacy_accepted:boolean payment_amount:decimal amo_crm_lead_id:string
bundle add active_storage_validations
```
- Add `coordinator_id`, `payment_confirmed_at/by`, `amo_crm_synced_at`, `amo_crm_sync_error`
- `encrypts :identity_card, :passport`
- Active Storage: `has_one_attached :application`, `has_many_attached :originals, :documents`
- Validations (content_type, size, required fields)
- Controller: index, show, new, create, update, confirm_payment
- Policy: students see own, coordinators see all
- Pages: Index (table), New (form with `useForm`), Show (detail + chat)
- `FileDropZone` component with direct upload + progress bar

## Step 4: Chat
```bash
bin/rails generate model Conversation homologation_request:references
bin/rails generate model Message conversation:references user:references body:text
bin/rails generate channel Conversation
bin/rails generate channel Notification
```
- Auto-create conversation with request
- `ConversationChannel` — subscribe per conversation, authorize access
- Messages: `after_create_commit :broadcast_to_conversation`
- `useChannel` React hook for real-time
- Send via HTTP POST (`router.post`), receive via WebSocket
- `ChatWindow`, `MessageBubble`, `MessageInput` components
- File attachments on messages (`has_many_attached :attachments`)

## Step 5: Notifications
```bash
bin/rails generate model Notification user:references \
  notifiable:references{polymorphic} title:string body:text read_at:datetime
```
- `NotificationChannel` — per-user, broadcasts new notifications
- `NotificationJob` — creates in-app + (later) email
- `NotificationBell` component with unread count
- Mark as read

## Step 6: Teachers & Lessons
```bash
bin/rails generate model TeacherProfile user:references bio:text \
  permanent_meeting_link:string level:string hourly_rate:decimal
bin/rails generate model TeacherStudent teacher:references student:references assigned_by:integer
bin/rails generate model Lesson teacher:references student:references \
  scheduled_at:datetime duration_minutes:integer meeting_link:string \
  status:string notes:text
```
- `TeacherProfile` — bio, permanent_meeting_link, level, hourly_rate
- `TeacherStudent` — many-to-many, assigned by coordinator
- `Lesson` — calendar entry with meeting link fallback logic
- `LessonsController` — create/update/destroy, filtered by role (teacher sees own, student sees own)
- Policy: teacher creates for assigned students, coordinator for any pair
- Validation: no past lessons, no double-booking, student must be assigned to teacher
- Pages: Teacher calendar (week grid, custom CSS Grid + shadcn Cards), Student lessons list
- Notifications: new lesson, cancelled lesson, link added

## Step 7: Coordinator Workspace
- `InboxController` — unified conversation list with filters (All, Requests, Teacher chats, Unread)
- `TeachersController` — teacher cards with stats, assign/remove students
- Pages: Inbox (3-column: conversation list → chat → context panel), Teachers (cards + dialogs)
- Components: ConversationList, ConversationItem, ChatPanel, ContextPanel, TeacherCard, AssignStudentDialog
- Mobile: conversation list → tap → full-screen chat → back button
- Real-time: Action Cable updates conversation list ordering + unread badges

## Step 8: Admin Dashboard
- `Admin::DashboardController` — stats + chart data as Inertia props (no separate API endpoints)
- `Admin::UsersController` — CRUD, role assignment
- `Admin::LessonsController` — all lessons overview table with filters
- Pundit: super_admin only (except lessons: coordinator too)
- Pages: Dashboard (4 stat cards + 2 Recharts), Users (table + dialog), Lessons (table)

## Step 9: AmoCRM Integration
```bash
bundle add faraday faraday-multipart
bin/rails generate model AmoCrmToken access_token:text refresh_token:text expires_at:datetime
```
- `AmoCrmClient` service (Faraday, auto-retry, token refresh)
- `AmoCrmSyncJob` — triggered by `confirm_payment` action
- Syncs: Contact (with WhatsApp) + Lead + files
- CRM sync status on request detail page
- Admin: retry failed syncs

## Step 10: Polish
- Privacy policy page
- Profile edit page
- Email notifications (RequestMailer)
- Edge cases, error handling
- `brakeman` + `bundler-audit` scan

---

## Gems (final — 8 additions)

```ruby
gem "omniauth"
gem "omniauth-google-oauth2"
gem "omniauth-apple"
gem "omniauth-rails_csrf_protection"
gem "pundit"
gem "faraday"
gem "faraday-multipart"
gem "active_storage_validations"
```

## NPM Packages (final — 9 additions)

```bash
npm install react-i18next i18next i18next-browser-languagedetector
npm install react-dropzone @rails/activestorage @rails/actioncable
npm install recharts lucide-react date-fns
```

## Test Strategy (Minitest)

Focus tests on what can break:
- **Models:** validations, role checks, status transitions
- **Controllers:** authorization (Pundit), CRUD, confirm_payment
- **Jobs:** AmoCrmSyncJob (mock Faraday calls with WebMock)
- **System tests:** login flow, submit request, chat

```ruby
# Gemfile (test group)
gem "webmock"  # Mock HTTP calls to AmoCRM
```
