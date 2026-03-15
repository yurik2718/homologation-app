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
- `encrypts :phone, :whatsapp, :identity_card, :passport` (User)
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
submitted → in_review → awaiting_payment → payment_confirmed → in_progress → resolved
                ↓                                                                ↓
          awaiting_reply                                                       closed
```

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
