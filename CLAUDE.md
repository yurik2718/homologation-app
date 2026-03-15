# CLAUDE.md — Project Guide

## What is this?

Homologation app for managing student document equivalencia requests in Spain.
Students submit requests, upload documents, chat with coordinators, and data syncs to AmoCRM after payment confirmation.
Teachers give Spanish lessons to students with calendar and video call links.
Super admin manages everything including Stripe billing.

## Tech Stack

- **Backend:** Rails 8.1.2, Ruby 3.4.9
- **Frontend:** React 19, TypeScript 5.9, Inertia.js 2.3
- **Build:** Vite 7.3, Tailwind CSS 4.2
- **UI:** shadcn/ui components (shadcn-admin layout style)
- **Database:** SQLite3
- **Auth:** Rails 8 built-in generator + OmniAuth (Google, Apple). NOT Devise.
- **Authorization:** Pundit (4 roles: super_admin, coordinator, teacher, student)
- **Payments:** Stripe (super_admin creates invoices)
- **Files:** Active Storage with direct upload (local disk, no S3)
- **Real-time:** Action Cable (Solid Cable adapter, SQLite-backed, no Redis)
- **Background jobs:** Solid Queue (SQLite-backed, no Redis)
- **CRM:** AmoCRM API via Faraday
- **Testing:** Minitest
- **i18n:** 3 languages (es, en, ru) — react-i18next + Rails I18n

## Commands

```bash
# Development
bin/rails server                     # Start Rails + Vite
bin/rails test                       # Run Minitest
bin/rails test:system                # Run system tests (Capybara)
npm run check                        # TypeScript type checking

# Generators
bin/rails generate authentication    # Auth (already done or to be done in Step 1)
bin/rails generate model Foo         # New model
bin/rails generate channel Foo       # Action Cable channel

# Security
bundle exec brakeman                 # Static security analysis
bundle exec bundler-audit check      # Check gems for vulnerabilities

# Database
bin/rails db:migrate
bin/rails db:seed                    # Seeds roles
bin/rails db:encryption:init         # Setup Active Record Encryption keys
```

## Project Structure

```
app/
├── controllers/           # Rails controllers (render Inertia responses, NOT JSON API)
├── models/                # ActiveRecord models
├── policies/              # Pundit authorization policies
├── channels/              # Action Cable (ConversationChannel, NotificationChannel)
├── jobs/                  # Background jobs (AmoCrmSyncJob, NotificationJob)
├── services/              # AmoCrmClient (Faraday HTTP client)
├── mailers/               # Email notifications
├── frontend/              # ← All React/TypeScript code lives here
│   ├── entrypoints/       # Vite entrypoints (inertia.tsx, application.ts/css)
│   ├── components/        # Reusable React components
│   │   ├── layout/        # AppSidebar, Header, AuthenticatedLayout, AuthLayout
│   │   ├── ui/            # shadcn/ui primitives (auto-generated)
│   │   ├── common/        # LanguageSwitcher, StatusBadge, RoleGuard, etc.
│   │   ├── chat/          # ChatWindow, MessageBubble, MessageInput
│   │   ├── documents/     # FileDropZone, FileList
│   │   └── admin/         # StatsCard, Charts
│   ├── pages/             # Inertia pages (mapped to Rails routes)
│   │   ├── auth/          # Login, Register, ForgotPassword
│   │   ├── profile/       # Complete, Edit
│   │   ├── dashboard/     # Index
│   │   ├── requests/      # Index, New, Show
│   │   └── admin/         # Dashboard, Users
│   ├── hooks/             # useActionCable, useFileUpload
│   ├── lib/               # utils.ts (cn function), i18n.ts
│   ├── locales/           # es.json, en.json, ru.json
│   └── types/             # TypeScript type definitions
config/
├── select_options.yml     # All dropdown options (single source of truth)
├── locales/               # Rails I18n (es.yml, en.yml, ru.yml)
docs/                      # Architecture, features, DB schema, implementation plan
```

## Core Rules

### 1. i18n — NEVER hardcode text
```tsx
// ❌ WRONG
<Button>Submit</Button>

// ✅ CORRECT
const { t } = useTranslation()
<Button>{t("common.submit")}</Button>
```
All visible text must use `t()`. Status badges: `t(\`requests.status.${status}\`)`. Select option labels: `opt[label_${locale}] || opt.label`.

### 2. Forms — use Inertia useForm, NOT react-hook-form
```tsx
const { data, setData, post, processing, errors } = useForm({ subject: "" })
```
No zod, no react-hook-form. Validation is server-side (Rails model validations), errors come back via Inertia.

### 3. Authorization — Pundit on every controller action
```ruby
authorize @request             # In every action
after_action :verify_authorized # Catches missing authorize calls
```

### 4. Files — Active Storage with direct upload
Students upload via `FileDropZone` (react-dropzone + @rails/activestorage DirectUpload). Three categories: `:application` (one file), `:originals` (many), `:documents` (many).

### 5. Chat — send HTTP, receive WebSocket
- Send messages: `router.post()` (Inertia) → MessagesController → saves to DB → broadcasts via Action Cable
- Receive messages: `useChannel()` hook subscribes to ConversationChannel → updates React state

### 6. AmoCRM sync — ONLY on payment confirmation
Coordinator clicks "Confirm Payment" → `AmoCrmSyncJob` runs in background → creates Contact (with WhatsApp) + Lead in AmoCRM. No data goes to CRM before payment.

### 7. Select options — single YAML file
All dropdowns read from `config/select_options.yml`. This file has multi-language labels and AmoCRM enum ID mappings. Passed to frontend via Inertia shared data.

### 8. Security — simple and mandatory
- `encrypts :phone, :whatsapp, :guardian_phone, :guardian_whatsapp` (User)
- `encrypts :identity_card, :passport` (HomologationRequest)
- `rate_limit` on auth controllers
- Privacy policy checkbox with `privacy_accepted_at` timestamp
- Files served through controller (Pundit checks access)
- PII filtered from logs

### 9. Mobile-first responsive design
Every page MUST work on mobile (360px+). Students and teachers primarily use phones.
- Use Tailwind responsive prefixes: base = mobile, `md:` = tablet, `lg:` = desktop
- Sidebar: use shadcn/ui `Sheet` on mobile (slide-out), fixed sidebar on `lg:`
- Inbox 3-column layout: on mobile show only conversation list → tap → full-screen chat → back button
- Tables: on mobile use card/list view instead of `<Table>` (tables are unreadable on phones)
- Forms: full-width inputs, large touch targets (min 44px height)
- File upload: "Add file" button works on mobile (no drag & drop needed, it's a bonus on desktop)
- Calendar: on mobile show day view only (not week grid)
- Test every page at 360px, 768px, 1280px

```tsx
// ❌ WRONG — desktop-only layout
<div className="grid grid-cols-3 gap-4">

// ✅ CORRECT — mobile-first
<div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">

// ❌ WRONG — small touch target
<Button size="sm">

// ✅ CORRECT — mobile-friendly
<Button size="default" className="min-h-[44px]">

// ❌ WRONG — table on mobile
<Table> always

// ✅ CORRECT — responsive
<div className="hidden md:block"><Table>...</Table></div>
<div className="md:hidden"><CardList>...</CardList></div>
```

### 10. Keep it simple
- `<textarea>` not rich text editor
- shadcn/ui `<Table>` on desktop, card list on mobile
- Light mode only
- No command menu, no audit log, no dark mode
- Minimum viable security (~30 lines)

## Coding Patterns (Rails + Inertia.js + React)

### 1. Centralized routes — no hardcoded paths in components

Create `app/frontend/lib/routes.ts` on day one. Every URL goes through this file.

```ts
// app/frontend/lib/routes.ts
export const routes = {
  dashboard:        ()  => "/",
  requests:         ()  => "/requests",
  requestNew:       ()  => "/requests/new",
  request:          (id: number) => `/requests/${id}`,
  confirmPayment:   (id: number) => `/requests/${id}/confirm_payment`,
  inbox:            ()  => "/inbox",
  inboxConversation:(id: number) => `/inbox/${id}`,
  conversations:    ()  => "/conversations",
  conversation:     (id: number) => `/conversations/${id}`,
  teachers:         ()  => "/teachers",
  lessons:          ()  => "/lessons",
  lesson:           (id: number) => `/lessons/${id}`,
  profile:          ()  => "/profile",
  profileEdit:      ()  => "/profile/edit",
  notifications:    ()  => "/notifications",
  privacyPolicy:    ()  => "/privacy-policy",
  // Admin
  admin:            ()  => "/admin",
  adminUsers:       ()  => "/admin/users",
  adminUser:        (id: number) => `/admin/users/${id}`,
  adminLessons:     ()  => "/admin/lessons",
  // Auth
  login:            ()  => "/session/new",
  register:         ()  => "/registration/new",
} as const;
```

```tsx
// ❌ WRONG — hardcoded paths
<Link href={`/requests/${id}`}>View</Link>
router.post(`/requests/${id}/confirm_payment`, data)

// ✅ CORRECT — centralized
<Link href={routes.request(id)}>View</Link>
router.post(routes.confirmPayment(id), data)
```

### 2. Serialization — private `_json` methods, explicit camelCase

Never use `.as_json` in controllers. Always define private methods with explicit camelCase keys.

```ruby
# ❌ WRONG — leaks fields, snake_case breaks TypeScript types
render inertia: "Requests/Show", props: { request: @request.as_json }

# ✅ CORRECT — explicit contract, camelCase
render inertia: "Requests/Show", props: { request: request_json(@request) }

private

def request_json(r)
  {
    id:               r.id,
    subject:          r.subject,
    serviceType:      r.service_type,
    status:           r.status,
    paymentAmount:    r.payment_amount,
    createdAt:        r.created_at.iso8601,
    statusChangedAt:  r.status_changed_at&.iso8601,
    user:             user_json(r.user),
    crmSyncedAt:      r.amo_crm_synced_at&.iso8601,
    crmSyncError:     r.amo_crm_sync_error,
  }
end

def user_json(u)
  {
    id:        u.id,
    name:      u.name,
    email:     u.email_address,
    avatarUrl: u.avatar_url,
  }
end
```

Dates are always ISO 8601 strings. One `_json` method = one TypeScript interface.

### 3. Shared Props — typed, available everywhere

```ruby
# app/controllers/application_controller.rb
inertia_share do
  {
    auth: {
      user: current_user ? auth_user_json(current_user) : nil,
    },
    flash: {
      notice: flash.notice,
      alert:  flash.alert,
    },
    features:                current_user ? build_features(current_user) : {},
    unreadNotificationsCount: current_user&.notifications&.unread&.count || 0,
    selectOptions:           YAML.load_file(Rails.root.join("config/select_options.yml")),
  }
end
```

```ts
// app/frontend/types/index.ts
export interface SharedProps extends PageProps {
  auth: { user: AuthUser | null };
  flash: { notice?: string; alert?: string };
  features: Features;
  unreadNotificationsCount: number;
  selectOptions: SelectOptions;
}
```

Never pass `current_user` data again through page props — it's already in `auth.user`.

### 4. Page props — TypeScript interfaces that mirror controller props

```ts
// app/frontend/types/pages.ts
export interface RequestsIndexProps {
  requests: Request[];
  statusFilter: string | null;
}

export interface RequestsShowProps {
  request: RequestDetail;
  messages: Message[];
  conversation: Conversation;
}

export interface InboxIndexProps {
  conversations: ConversationPreview[];
  activeFilter: string;
}

// Usage in page component:
export default function RequestsShow() {
  const { request, messages, conversation } = usePage<SharedProps & RequestsShowProps>().props;
}
```

Every page has a props interface. This is the only way to catch Rails ↔ TypeScript drift at compile time.

### 5. Controller pattern — authorize → build → render

```ruby
def show
  @request = HomologationRequest.find(params[:id])
  authorize @request                              # 1. Always first

  props = {
    request:      request_detail_json(@request),  # 2. Private _json methods
    messages:     @request.conversation.messages.map { |m| message_json(m) },
    conversation: conversation_json(@request.conversation),
  }

  # 3. Conditional props by role
  if current_user.coordinator? || current_user.super_admin?
    props[:adminActions] = { canConfirmPayment: @request.awaiting_payment? }
  end

  render inertia: "Requests/Show", props: props   # 4. Render
end
```

`after_action :verify_authorized` in ApplicationController is mandatory. Public endpoints: `skip_after_action :verify_authorized`.

### 6. Feature flags in shared props — not role checks in components

```ruby
# app/controllers/application_controller.rb
def build_features(user)
  {
    canCreateRequest:    user.student?,
    canConfirmPayment:   user.coordinator? || user.super_admin?,
    canManageUsers:      user.super_admin?,
    canManageTeachers:   user.coordinator? || user.super_admin?,
    canCreateLessons:    user.teacher? || user.coordinator? || user.super_admin?,
    canViewAllRequests:  user.coordinator? || user.super_admin?,
  }
end
```

```tsx
// ❌ WRONG — role logic scattered across frontend
{currentUser.roles.includes('coordinator') && <ConfirmPaymentButton />}

// ✅ CORRECT — server decides, frontend just reads
const { features } = usePage<SharedProps>().props;
{features.canConfirmPayment && <ConfirmPaymentButton />}
```

### 7. Navigation and mutations — only through Inertia

```tsx
// Links — always Inertia <Link>
<Link href={routes.request(id)}>View</Link>          // ✅
<a href={`/requests/${id}`}>View</a>                  // ❌

// Mutations — always router.*
router.post(routes.confirmPayment(id), { paymentAmount: amount })  // ✅
router.delete(routes.lesson(id), { onSuccess: () => {} })          // ✅
window.location.href = routes.dashboard()              // ❌ never
await fetch("/requests", { method: "POST" })           // ❌ never (use router)
```

Exception: Action Cable receives (WebSocket) are not Inertia — that's fine.

### 8. Flash messages — always through I18n

```ruby
# ❌ WRONG — hardcoded string
redirect_to request_path(@request), notice: "Payment confirmed"

# ✅ CORRECT — I18n key
redirect_to request_path(@request), notice: t("flash.payment_confirmed")
```

Key naming: `flash.{entity}_{past_tense}` — `flash.request_created`, `flash.payment_confirmed`, `flash.lesson_cancelled`.

Add flash keys to `config/locales/{es,en,ru}.yml`.

### 9. N+1 — solve in controller, never in serializer

```ruby
# ❌ WRONG — N+1 inside _json method
def index
  @requests = policy_scope(HomologationRequest)
  # each request_json(r) calls r.user → separate query per request
end

# ✅ CORRECT — eager load in controller
def index
  @requests = policy_scope(HomologationRequest)
                .includes(:user, :conversation)
                .order(updated_at: :desc)
  # now request_json(r) uses preloaded data
end
```

For lookups in loops, use `index_by`:
```ruby
users = User.where(id: user_ids).index_by(&:id)  # one query → hash
items.map { |i| { ...item_json(i), userName: users[i.user_id]&.name } }
```

## Dropdown Options

All defined in `config/select_options.yml`:
- service_types: equivalencia, invoice, informe, other
- education_systems: argentina, colombia, mexico, peru, venezuela, russia, ukraine...
- studies_finished: yes, no, in_progress
- study_types_spain: bachillerato, fp_medio, fp_superior, grado, master, doctorado
- universities: ucm, uam, ceu, ue... (extend as needed)
- language_levels: a1-c2, none
- language_certificates: dele, siele, other, none
- referral_sources: google, instagram, facebook, friend, university, other
- countries: AR, CO, MX, PE, VE, RU, UA, US...

## Status Flow

```
draft → submitted → in_review ⇄ awaiting_reply → awaiting_payment → payment_confirmed → in_progress → resolved
                                                                                                         ↓
                                                                                                       closed
```

Valid transitions:
- `draft` → `submitted` (student submits)
- `submitted` → `in_review` (coordinator picks up)
- `in_review` ⇄ `awaiting_reply` (coordinator asks / student responds)
- `in_review` → `awaiting_payment` (coordinator sets price)
- `awaiting_payment` → `payment_confirmed` (coordinator confirms → triggers AmoCRM sync)
- `payment_confirmed` → `in_progress` (work begins)
- `in_progress` → `resolved` / `closed`

AmoCRM Lead created at `payment_confirmed`. Pre-payment statuses exist only in our app.

## Roles (4 total, no family)

| Role | Key capabilities |
|---|---|
| `super_admin` | Everything + Stripe billing + user management + teacher config |
| `coordinator` | Inbox (unified chat), manage requests, assign teachers, confirm payments |
| `teacher` | Calendar of lessons, meeting links, chat with students, see assigned students |
| `student` | Submit requests, upload docs, chat, view lessons |

## Teachers & Lessons

- `teacher_profiles`: level, hourly_rate (private, super_admin only), bio, permanent_meeting_link (public)
- `teacher_students`: many-to-many, assigned by coordinator
- `lessons`: scheduled_at, duration, meeting_link (overrides permanent if set), status, notes
- If lesson has no meeting_link → use teacher's permanent link from profile
- Teacher shares changing links via chat
- Teachers only do lessons + chat. No access to documents or homologation.

## Minors & Guardians (Variant 1.5)

- `users.is_minor` — true if student is under 18
- Guardian fields on users: `guardian_name`, `guardian_email`, `guardian_phone`, `guardian_whatsapp`
- If minor → Stripe invoice → `guardian_email`, AmoCRM → `guardian_whatsapp`
- `guardian_user_id` (FK → users) — optional, for future parent login
- MVP: parent has no login, receives invoices/notifications by email
- Future: parent registers, links via `guardian_user_id`, sees child's status

## Documentation

Full docs in `/docs`:
- `00_PRINCIPLES.md` — Core rules: fast & simple
- `01_ARCHITECTURE.md` — Stack, high-level architecture, directory structure
- `02_DATABASE_SCHEMA.md` + `.dbml` — Schema for dbdiagram.io (12 tables, color-coded)
- `03_FEATURES.md` — User stories, data flow diagram
- `04_ROLES_AND_AUTHORIZATION.md` — 4 roles, permission matrix, Pundit policies
- `05_AUTH_OAUTH.md` — Rails 8 auth generator + OmniAuth setup
- `06_AMOCRM_INTEGRATION.md` — Trigger flow, field mapping, Faraday client, sync job
- `07_IMPLEMENTATION_PLAN.md` — Steps, gems, npm packages, test strategy
- `08_API_ROUTES.md` — All routes, controllers, Action Cable channels
- `09_UI_COMPONENTS.md` — shadcn-admin layout, pages, file structure
- `10_TECHNICAL_DETAILS.md` — Select options YAML, Faraday, Active Storage, Action Cable
- `11_I18N_MULTILANGUAGE.md` — i18n setup, translation files, React rules
- `12_SECURITY_GDPR.md` — EU compliance, encryption, rate limiting
- `13_LESSONS_CALENDAR.md` — Calendar flow, lesson booking, meeting links, UI per role
- `14_COORDINATOR_WORKSPACE.md` — Inbox (unified chat) + Teachers management panel
