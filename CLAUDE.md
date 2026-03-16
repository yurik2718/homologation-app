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
- **Notifications:** In-app (Action Cable) + Email + Telegram Bot API (free, opt-in)
- **Testing:** Minitest
- **i18n:** 3 languages (es, en, ru) — react-i18next + Rails I18n

## Commands

```bash
bin/rails server              # Start Rails + Vite
bin/rails test                # Minitest    |  bin/rails test:system  # System tests
npm run check                 # TS types    |  bundle exec brakeman   # Security scan
bin/rails db:migrate          # Migrations  |  bin/rails db:seed      # Seed 4 roles
bin/rails generate model Foo  # New model   |  bin/rails generate channel Foo  # Action Cable
```

## Current State

See `docs/07_IMPLEMENTATION_PLAN.md` for the full step-by-step checklist (Steps 0–10).

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
│   ├── components/  # layout/, ui/ (shadcn), common/, chat/, documents/, chats/, teachers/, lessons/
│   ├── pages/       # auth/, profile/, dashboard/, requests/, chats/, teachers/, calendar/, chat/, admin/
│   ├── hooks/       # useActionCable, useFileUpload
│   ├── lib/         # routes.ts, utils.ts, i18n.ts
│   ├── locales/     # es.json, en.json, ru.json
│   └── types/       # index.ts (SharedProps), pages.ts (page props), models.d.ts
config/
├── select_options.yml   # All dropdown options (single source of truth)
├── locales/             # Rails I18n (es.yml, en.yml, ru.yml)
```

## Core Rules

1. **i18n** — All visible text via `t()`. Status: `t(\`requests.status.${status}\`)`. Options: `opt[label_${locale}] || opt.label`.
2. **Forms** — Inertia `useForm()` only. No zod, no react-hook-form. Server-side validation, errors via Inertia.
3. **Authorization** — `authorize @record` in every action. `after_action :verify_authorized` in ApplicationController.
4. **Files** — Active Storage direct upload via `FileDropZone`. Three categories: `:application` (one), `:originals` (many), `:documents` (many).
5. **Chat** — Send via `router.post()` (Inertia), receive via `useChannel()` hook (Action Cable).
6. **AmoCRM sync** — ONLY on payment confirmation. No data to CRM before `payment_confirmed`.
7. **Select options** — `config/select_options.yml` → `inertia_share` → `selectOptions` in every page. Never hardcode — always `opt[label_${locale}] || opt.label`.
8. **Security** — `encrypts` on PII fields, `rate_limit` on auth, files served through controller (Pundit), PII filtered from logs. Soft delete (`discarded_at`) on `users` and `homologation_requests` — use `.kept` scope, never hard delete without GDPR request.
9. **Mobile-first** — Every page works at 360px+. See `docs/15_MOBILE_PATTERNS.md`.
10. **Keep it simple** — `<textarea>` not rich text, light mode only, no command menu/audit log/dark mode.

## Coding Patterns (Rails + Inertia.js + React)

### 1. Centralized routes — `app/frontend/lib/routes.ts`

Full route list lives in `app/frontend/lib/routes.ts` — add new routes there, never inline.

```tsx
// ❌ <Link href={`/requests/${id}`}>  ✅ <Link href={routes.request(id)}>
// ❌ router.post(`/requests/${id}/confirm_payment`)  ✅ router.post(routes.confirmPayment(id))
```

### 2. Serialization — private `_json` methods, explicit camelCase

Never `.as_json`. Dates = ISO 8601 strings. One `_json` method = one TS interface.
```ruby
# ✅ render inertia: "Requests/Show", props: { request: request_json(@request) }
private
def request_json(r)
  { id: r.id, subject: r.subject, serviceType: r.service_type,
    status: r.status, createdAt: r.created_at.iso8601, user: user_json(r.user) }
end
```

### 3. Shared Props — `inertia_share` in ApplicationController

Keys: `auth` (user), `flash`, `features` (from `build_features`), `unreadNotificationsCount`, `selectOptions`.
Type in `app/frontend/types/index.ts` as `SharedProps extends PageProps`. Never duplicate `current_user` in page props.

### 4. Page props — one TS interface per page in `types/pages.ts`

Usage: `const { request } = usePage<SharedProps & RequestsShowProps>().props;`

### 5. Controller pattern — `authorize` → build props via `_json` methods → `render inertia:`

Conditional props by role: `props[:adminActions] = { ... } if current_user.coordinator?`

### 6. Feature flags — `build_features(user)` returns `{ canConfirmPayment:, canManageUsers:, ... }`

```tsx
// ❌ {currentUser.roles.includes('coordinator') && <Button />}
// ✅ {features.canConfirmPayment && <Button />}
```

### 7. Navigation and mutations — only Inertia

`<Link>` for links, `router.post/patch/delete` for mutations. Never `<a href>`, `fetch()`, `window.location`.
Exception: Action Cable WebSocket receives are not Inertia — that's fine.

### 8. Flash messages — always I18n

`redirect_to path, notice: t("flash.payment_confirmed")`. Key naming: `flash.{entity}_{past_tense}`.

### 9. N+1 — `.includes()` in controller, never lazy load in `_json`

`policy_scope(HomologationRequest).includes(:user, :conversation).order(updated_at: :desc)`
For lookups: `User.where(id: ids).index_by(&:id)` — one query, O(1) access.

## Testing (Minitest)

- **Fixtures only** — no FactoryBot, no mocks for ActiveRecord. Fixtures in `test/fixtures/*.yml`.
- **Every new controller action gets a test before merge.** No exceptions.
- Run `bin/rails test && npm run check` before committing.
- Full patterns, test matrix: `docs/16_TESTING.md`.

```ruby
test "student sees own requests" do
  sign_in users(:student_ana)
  get homologation_requests_path
  assert_response :ok
  assert_inertia component: "Requests/Index"
end
```

## Status Flow

`draft → submitted → in_review ⇄ awaiting_reply → awaiting_payment → payment_confirmed → in_progress → resolved/closed`

- Enforced via `@request.transition_to!("new_status", changed_by: current_user)` — invalid raises `InvalidTransition`.
- AmoCRM Lead created at `payment_confirmed`. Pre-payment statuses exist only in our app.
- Full state machine table: `docs/03_FEATURES.md`.

## Documentation — When to Read What

| Situation | Read |
|---|---|
| Adding/changing a DB table or field | `docs/02_DATABASE_SCHEMA.md` + `.dbml` |
| Adding a user story or feature | `docs/03_FEATURES.md` |
| Roles, permissions, or what each role can do | `docs/04_ROLES_AND_AUTHORIZATION.md` |
| Setting up or debugging OAuth | `docs/05_AUTH_OAUTH.md` |
| Touching AmoCRM sync or field mapping | `docs/06_AMOCRM_INTEGRATION.md` |
| What step to build next | `docs/07_IMPLEMENTATION_PLAN.md` |
| Adding a route, controller, or Action Cable channel | `docs/08_API_ROUTES.md` |
| Building a new page or component | `docs/09_UI_COMPONENTS.md` |
| Working with select options, file uploads, or WebSocket | `docs/10_TECHNICAL_DETAILS.md` |
| Missing i18n keys or adding translations | `docs/11_I18N_MULTILANGUAGE.md` |
| Security, encryption, GDPR, rate limiting | `docs/12_SECURITY_GDPR.md` |
| Teachers, lessons, or calendar | `docs/13_LESSONS_CALENDAR.md` |
| Minors, guardians, or guardian invoicing | `docs/02_DATABASE_SCHEMA.md` (Minor/Guardian section) |
| Building chats or teacher management | `docs/14_COORDINATOR_WORKSPACE.md` |
| Mobile/responsive patterns and examples | `docs/15_MOBILE_PATTERNS.md` |
| Writing tests or test conventions | `docs/16_TESTING.md` |
| Questioning a design decision | `docs/00_PRINCIPLES.md` + `docs/01_ARCHITECTURE.md` |

## Banned Patterns

`.as_json` · `react-hook-form` · `zod` · `<a href>` · `fetch()`/`axios` · `window.location` · hardcoded URL paths · role checks in React · Tiptap · zustand · dark mode · AmoCRM sync before `payment_confirmed` · skipping `authorize` · skipping tests
