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

## Current State
> Update this section as steps are completed. See `docs/07_IMPLEMENTATION_PLAN.md` for details.

- [ ] Step 0: Foundation — shadcn/ui init, i18n setup, layouts, select_options.yml, routes.ts
- [ ] Step 1: Authentication — Rails 8 generator, OmniAuth (Google/Apple), CompleteProfile
- [ ] Step 2: Roles & Authorization — Pundit, 4 roles seeded, RoleGuard component
- [ ] Step 3: Homologation Requests — CRUD, Active Storage uploads, FileDropZone
- [ ] Step 4: Chat — Conversations, Messages, Action Cable, real-time UI
- [ ] Step 5: Notifications — in-app bell, NotificationChannel, email (later)
- [ ] Step 6: Teachers & Lessons — profiles, assignments, calendar, lesson CRUD
- [ ] Step 7: Coordinator Workspace — Inbox (unified chat), Teachers management panel
- [ ] Step 8: Admin Dashboard — stats, charts, user management, lessons overview
- [ ] Step 9: AmoCRM Integration — Faraday client, sync job, token refresh
- [ ] Step 10: Polish — privacy policy, profile edit, email notifications, brakeman scan

## Project Structure

> Full directory tree in `docs/01_ARCHITECTURE.md`.

```
app/
├── controllers/     # Inertia responses (NOT JSON API). Pattern: authorize → build → render
├── models/          # ActiveRecord + Pundit policies in app/policies/
├── channels/        # ConversationChannel, NotificationChannel (Action Cable)
├── jobs/            # AmoCrmSyncJob, NotificationJob (Solid Queue)
├── services/        # AmoCrmClient (Faraday)
├── frontend/
│   ├── components/  # layout/, ui/ (shadcn), common/, chat/, documents/, inbox/, teachers/, lessons/
│   ├── pages/       # auth/, profile/, dashboard/, requests/, inbox/, teachers/, calendar/, chat/, admin/
│   ├── hooks/       # useActionCable, useFileUpload
│   ├── lib/         # routes.ts, utils.ts, i18n.ts
│   ├── locales/     # es.json, en.json, ru.json
│   └── types/       # index.ts (SharedProps), pages.ts (page props), models.d.ts
config/
├── select_options.yml   # All dropdown options (single source of truth)
├── locales/             # Rails I18n (es.yml, en.yml, ru.yml)
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

### 1. Centralized routes — `app/frontend/lib/routes.ts`

```ts
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
  admin:            ()  => "/admin",
  adminUsers:       ()  => "/admin/users",
  adminUser:        (id: number) => `/admin/users/${id}`,
  adminLessons:     ()  => "/admin/lessons",
  login:            ()  => "/session/new",
  register:         ()  => "/registration/new",
} as const;
```

```tsx
// ❌ <Link href={`/requests/${id}`}>  ✅ <Link href={routes.request(id)}>
// ❌ router.post(`/requests/${id}/confirm_payment`)  ✅ router.post(routes.confirmPayment(id))
```

### 2. Serialization — private `_json` methods, explicit camelCase

```ruby
# ❌ render inertia: "Requests/Show", props: { request: @request.as_json }
# ✅ render inertia: "Requests/Show", props: { request: request_json(@request) }

private

def request_json(r)
  {
    id: r.id, subject: r.subject, serviceType: r.service_type,
    status: r.status, paymentAmount: r.payment_amount,
    createdAt: r.created_at.iso8601, user: user_json(r.user),
  }
end
```

Dates = ISO 8601 strings. One `_json` method = one TypeScript interface.

### 3. Shared Props — typed, never duplicate current_user in page props

```ruby
# app/controllers/application_controller.rb
inertia_share do
  {
    auth:     { user: current_user ? auth_user_json(current_user) : nil },
    flash:    { notice: flash.notice, alert: flash.alert },
    features: current_user ? build_features(current_user) : {},
    unreadNotificationsCount: current_user&.notifications&.unread&.count || 0,
    selectOptions: YAML.load_file(Rails.root.join("config/select_options.yml")),
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

### 4. Page props — TypeScript interfaces mirroring controller props

```ts
// app/frontend/types/pages.ts — every page gets one
export interface RequestsShowProps {
  request: RequestDetail;
  messages: Message[];
  conversation: Conversation;
}

// Usage: const { request } = usePage<SharedProps & RequestsShowProps>().props;
```

### 5. Controller pattern — authorize → build → render

```ruby
def show
  @request = HomologationRequest.find(params[:id])
  authorize @request                              # 1. Always first
  props = {
    request:  request_detail_json(@request),      # 2. Private _json methods
    messages: @request.conversation.messages.map { |m| message_json(m) },
  }
  if current_user.coordinator? || current_user.super_admin?
    props[:adminActions] = { canConfirmPayment: @request.awaiting_payment? }
  end
  render inertia: "Requests/Show", props: props   # 3. Render
end
```

### 6. Feature flags — server decides, frontend reads

```ruby
def build_features(user)
  {
    canCreateRequest:   user.student?,
    canConfirmPayment:  user.coordinator? || user.super_admin?,
    canManageUsers:     user.super_admin?,
    canManageTeachers:  user.coordinator? || user.super_admin?,
    canCreateLessons:   user.teacher? || user.coordinator? || user.super_admin?,
    canViewAllRequests: user.coordinator? || user.super_admin?,
  }
end
```

```tsx
// ❌ {currentUser.roles.includes('coordinator') && <Button />}
// ✅ {features.canConfirmPayment && <Button />}
```

### 7. Navigation and mutations — only Inertia

```tsx
<Link href={routes.request(id)}>View</Link>                        // ✅
router.post(routes.confirmPayment(id), { paymentAmount: amount })  // ✅
// ❌ <a href>, window.location, fetch(), axios
```

Exception: Action Cable WebSocket receives are not Inertia — that's fine.

### 8. Flash messages — always I18n

```ruby
# ❌ redirect_to path, notice: "Payment confirmed"
# ✅ redirect_to path, notice: t("flash.payment_confirmed")
```

Key naming: `flash.{entity}_{past_tense}` — `flash.request_created`, `flash.payment_confirmed`, `flash.lesson_cancelled`.

### 9. N+1 — `.includes()` in controller, never lazy load in `_json`

```ruby
# ❌ policy_scope(HomologationRequest)  — then r.user triggers N+1
# ✅ policy_scope(HomologationRequest).includes(:user, :conversation).order(updated_at: :desc)
```

For lookups: `users = User.where(id: ids).index_by(&:id)` — one query, O(1) access.

## Testing Patterns (Minitest)

### What to test where

| Layer | Test for | Don't test |
|---|---|---|
| **Models** | Validations, `transition_to!` guards, scopes, associations | Controller logic, rendering |
| **Controllers** | HTTP status, Inertia component name, authorization (Pundit), redirects | Business logic (push to model) |
| **Jobs** | Side effects (AmoCRM sync), error handling | HTTP internals (mock with WebMock) |
| **System** | Critical user journeys: login, submit request, chat | Every edge case |

### Rules

- **Fixtures only** — no FactoryBot, no mocks for ActiveRecord. Fixtures in `test/fixtures/*.yml`.
- **Every new controller action gets a test before merge.** No exceptions.
- Run `bin/rails test && npm run check` before committing.

### Controller test example

```ruby
class HomologationRequestsControllerTest < ActionDispatch::IntegrationTest
  test "student sees own requests" do
    sign_in users(:student_ana)
    get homologation_requests_path
    assert_response :ok
    assert_inertia component: "Requests/Index"
  end

  test "coordinator can confirm payment" do
    sign_in users(:coordinator_maria)
    request = homologation_requests(:ana_equivalencia)
    request.update!(status: "awaiting_payment")
    post confirm_payment_homologation_request_path(request), params: { payment_amount: 60 }
    assert_redirected_to homologation_request_path(request)
    assert_equal "payment_confirmed", request.reload.status
  end
end
```

### Model test example

```ruby
class HomologationRequestTest < ActiveSupport::TestCase
  test "valid transition: in_review → awaiting_payment" do
    r = homologation_requests(:ana_equivalencia)
    r.update!(status: "in_review")
    r.transition_to!("awaiting_payment", changed_by: users(:coordinator_maria))
    assert_equal "awaiting_payment", r.status
  end

  test "invalid transition: draft → payment_confirmed raises" do
    r = homologation_requests(:ana_equivalencia)
    r.update!(status: "draft")
    assert_raises(HomologationRequest::InvalidTransition) do
      r.transition_to!("payment_confirmed", changed_by: users(:coordinator_maria))
    end
  end
end
```

## Dropdown Options

- **Source of truth:** `config/select_options.yml` — all keys, labels (es/en/ru), and AmoCRM enum IDs live here.
- **Delivery to frontend:** loaded once in `inertia_share` as `selectOptions`, available in every page via `usePage<SharedProps>().props.selectOptions`.
- **Rule:** never hardcode option values in React components — always read from `selectOptions` and render with `opt[label_${locale}] || opt.label || opt.key`.

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

### Transition enforcement

No state machine gem — transitions are enforced via a `StatusTransition` concern with manual methods.

```ruby
# app/models/concerns/status_transition.rb
module StatusTransition
  extend ActiveSupport::Concern

  TRANSITIONS = {
    "draft"             => %w[submitted],
    "submitted"         => %w[in_review],
    "in_review"         => %w[awaiting_reply awaiting_payment],
    "awaiting_reply"    => %w[in_review],
    "awaiting_payment"  => %w[payment_confirmed],
    "payment_confirmed" => %w[in_progress],
    "in_progress"       => %w[resolved closed],
  }.freeze

  def transition_to!(new_status, changed_by:)
    unless TRANSITIONS[status]&.include?(new_status)
      raise InvalidTransition, "Cannot move from #{status} to #{new_status}"
    end
    update!(status: new_status, status_changed_at: Time.current, status_changed_by: changed_by.id)
  end
end
```

Controller usage: `@request.transition_to!("payment_confirmed", changed_by: current_user)`

Guards and side-effects (e.g. AmoCRM sync) go in `after_commit` callbacks or are called explicitly in the controller after `transition_to!`.

## Roles (4 total, no family)

| Role | Key capabilities |
|---|---|
| `super_admin` | Everything + Stripe billing + user management + teacher config |
| `coordinator` | Inbox (unified chat), manage requests, assign teachers, confirm payments |
| `teacher` | Calendar of lessons, meeting links, chat with students, see assigned students |
| `student` | Submit requests, upload docs, chat, view lessons |

## Teachers & Lessons

- `teacher_profiles`: level, hourly_rate (super_admin only), bio, permanent_meeting_link
- `teacher_students`: many-to-many, assigned by coordinator
- `lessons`: scheduled_at, duration, meeting_link (fallback: teacher's permanent link), status, notes
- Teachers only do lessons + chat. No access to documents or homologation.

## Minors & Guardians

- `users.is_minor` — true if under 18. Guardian fields: `guardian_name`, `guardian_email`, `guardian_phone`, `guardian_whatsapp`
- If minor → Stripe invoice → `guardian_email`, AmoCRM → `guardian_whatsapp`
- MVP: parent has no login, receives invoices/notifications by email

## Documentation — When to Read What

Full docs live in `/docs`. Read the specific doc when you hit one of these situations:

| Situation | Read |
|---|---|
| Adding/changing a DB table or field | `docs/02_DATABASE_SCHEMA.md` + `.dbml` |
| Adding a user story or feature | `docs/03_FEATURES.md` |
| Adding a role or changing permissions | `docs/04_ROLES_AND_AUTHORIZATION.md` |
| Setting up or debugging OAuth | `docs/05_AUTH_OAUTH.md` |
| Touching AmoCRM sync or field mapping | `docs/06_AMOCRM_INTEGRATION.md` |
| What step to build next | `docs/07_IMPLEMENTATION_PLAN.md` |
| Adding a route, controller, or Action Cable channel | `docs/08_API_ROUTES.md` |
| Building a new page or component | `docs/09_UI_COMPONENTS.md` |
| Working with select options, file uploads, or WebSocket | `docs/10_TECHNICAL_DETAILS.md` |
| Missing i18n keys or adding translations | `docs/11_I18N_MULTILANGUAGE.md` |
| Security, encryption, GDPR, rate limiting | `docs/12_SECURITY_GDPR.md` |
| Scheduling lessons or building calendar | `docs/13_LESSONS_CALENDAR.md` |
| Building inbox or teacher management | `docs/14_COORDINATOR_WORKSPACE.md` |
| Questioning a design decision | `docs/00_PRINCIPLES.md` + `docs/01_ARCHITECTURE.md` |

## What Claude Should Never Do

- [ ] Use `.as_json` in controllers — always private `_json` methods with explicit camelCase
- [ ] Hardcode visible text — always `t()` via react-i18next or Rails I18n
- [ ] Use `react-hook-form`, `zod`, or any form library — only Inertia `useForm()`
- [ ] Use `<a href>` for internal links — only Inertia `<Link>`
- [ ] Use `fetch()`, `axios`, or `window.location` for mutations — only `router.post/patch/delete`
- [ ] Check roles in React components — use `features.*` from shared props
- [ ] Hardcode URL paths in components — use `routes.*` from `lib/routes.ts`
- [ ] Skip `authorize` in any controller action — `verify_authorized` will catch it
- [ ] Add N+1 queries inside `_json` methods — `.includes()` in the controller
- [ ] Use `@tanstack/react-table`, Tiptap, zustand, or dark mode — see Core Rule 10
- [ ] Add a rich text editor — always `<textarea>` from shadcn/ui
- [ ] Sync data to AmoCRM before payment confirmation — CRM stays clean until `payment_confirmed`
- [ ] Hardcode flash messages — always `t("flash.entity_action")` through I18n
- [ ] Skip `bin/rails test && npm run check` before considering work done
