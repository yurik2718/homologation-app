# Implementation Plan — AI-Optimized TDD Development

> **How to use:** Each step is self-contained. Read the step, implement it, run the tests, verify the done criteria. No questions needed.
>
> **Current state:** Fresh Rails 8.1.2 + Inertia.js 2.3 + React 19 + Vite 7.3 skeleton. Only `InertiaExampleController` exists. No models, no migrations, no real pages.
>
> **Rule:** Every step follows TDD — write the test first (or at minimum, write tests alongside code). Run `bin/rails test && npm run check` before marking any step done.

---

## Step 0: Project Foundation

**Goal:** Install all dependencies, configure tools, create base layout shell. After this step, the app boots with a working sidebar layout, shadcn/ui components, i18n, and TypeScript types — but no real features yet.

### 0.1 — Install Ruby gems

Add to `Gemfile` and run `bundle install`:

```ruby
# Auth
gem "bcrypt", "~> 3.1.7"

# OAuth
gem "omniauth"
gem "omniauth-google-oauth2"
gem "omniauth-apple"
gem "omniauth-rails_csrf_protection"

# Authorization
gem "pundit"

# HTTP client (AmoCRM)
gem "faraday"
gem "faraday-multipart"

# File validation
gem "active_storage_validations"

# Inertia (already installed via vite-plugin-ruby, but ensure gem is present)
gem "inertia_rails"
```

Test group:
```ruby
gem "webmock"  # Mock HTTP calls to AmoCRM in tests
```

### 0.2 — Install NPM packages

```bash
npm install react-i18next i18next i18next-browser-languagedetector
npm install react-dropzone
npm install @rails/activestorage
npm install @rails/actioncable
npm install recharts
npm install lucide-react
npm install date-fns
```

### 0.3 — Initialize shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button input label textarea select checkbox \
  card dialog sheet sidebar table badge avatar separator \
  dropdown-menu tabs popover toast sonner scroll-area form
```

Verify: shadcn components appear in `app/frontend/components/ui/`.

### 0.4 — Create TypeScript types

**File:** `app/frontend/types/index.ts`

```ts
import { PageProps } from "@inertiajs/core"

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  avatarUrl: string | null
  locale: string
  profileComplete: boolean
}

export interface SharedProps extends PageProps {
  auth: { user: User | null }
  flash: { notice?: string; alert?: string }
  features: Record<string, boolean>
  unreadNotificationsCount: number
  selectOptions: Record<string, SelectOption[]>
}

export interface SelectOption {
  key: string
  label?: string
  label_es?: string
  label_en?: string
  label_ru?: string
}
```

**File:** `app/frontend/types/pages.ts` — Empty initially, interfaces added per step.

**File:** `app/frontend/types/models.d.ts` — Empty initially, model types added per step.

### 0.5 — Create centralized routes file

**File:** `app/frontend/lib/routes.ts`

Every frontend route reference MUST use this file. Never inline paths.

```ts
export const routes = {
  root: "/",
  login: "/session/new",
  register: "/registration/new",
  logout: "/session",
  forgotPassword: "/passwords/new",
  profile: "/profile",
  editProfile: "/profile/edit",
  requests: "/requests",
  newRequest: "/requests/new",
  request: (id: number) => `/requests/${id}`,
  confirmPayment: (id: number) => `/requests/${id}/confirm_payment`,
  downloadDocument: (id: number, docId: number) =>
    `/requests/${id}/download_document?document_id=${docId}`,
  requestMessages: (id: number) => `/requests/${id}/messages`,
  conversations: "/conversations",
  conversation: (id: number) => `/conversations/${id}`,
  conversationMessages: (id: number) => `/conversations/${id}/messages`,
  inbox: "/inbox",
  inboxConversation: (id: number) => `/inbox/${id}`,
  teachers: "/teachers",
  assignStudent: (id: number) => `/teachers/${id}/assign_student`,
  removeStudent: (id: number) => `/teachers/${id}/remove_student`,
  lessons: "/lessons",
  lesson: (id: number) => `/lessons/${id}`,
  notifications: "/notifications",
  markAllRead: "/notifications/mark_all_read",
  privacyPolicy: "/privacy-policy",
  admin: {
    root: "/admin",
    users: "/admin/users",
    newUser: "/admin/users/new",
    user: (id: number) => `/admin/users/${id}`,
    editUser: (id: number) => `/admin/users/${id}/edit`,
    assignRole: (id: number) => `/admin/users/${id}/assign_role`,
    removeRole: (id: number) => `/admin/users/${id}/remove_role`,
    lessons: "/admin/lessons",
  },
}
```

### 0.6 — Configure i18n

**File:** `app/frontend/lib/i18n.ts` — Setup as specified in `docs/11_I18N_MULTILANGUAGE.md` (i18next + react-i18next + LanguageDetector, bundled resources, fallback `es`).

**Files:** `app/frontend/locales/es.json`, `en.json`, `ru.json` — Full translations from `docs/11_I18N_MULTILANGUAGE.md`. Every key must exist in all 3 files.

### 0.7 — Create layout components

Use shadcn-admin layout patterns. All visible text via `t()`.

**Files to create:**
- `app/frontend/components/layout/AuthLayout.tsx` — Centered card layout for login/register. Language switcher in corner.
- `app/frontend/components/layout/AuthenticatedLayout.tsx` — Sidebar + Header + main content area. Wraps all authenticated pages.
- `app/frontend/components/layout/AppSidebar.tsx` — Collapsible sidebar. Menu items filtered by role from `auth.user.roles` in shared props. See sidebar matrix in `docs/09_UI_COMPONENTS.md`.
- `app/frontend/components/layout/Header.tsx` — Top bar: breadcrumb area, LanguageSwitcher, NotificationBell, user dropdown menu (profile, logout).

**Sidebar items by role** (source of truth — `docs/09_UI_COMPONENTS.md`):

| Item | super_admin | coordinator | teacher | student |
|---|:-:|:-:|:-:|:-:|
| Dashboard | + | + | — | + |
| Inbox | + | + | — | — |
| Requests / All Requests | + | + | — | — |
| New Request | — | — | — | + |
| My Requests | — | — | — | + |
| Teachers | + | + | — | — |
| All Lessons | + | + | — | — |
| Calendar | — | — | + | — |
| My Lessons | — | — | — | + |
| Chat | — | — | + | + |
| Notifications | + | + | + | + |
| Admin | + | — | — | — |

### 0.8 — Create common components

All text via `t()`. All dates via locale-aware `date-fns`.

- `app/frontend/components/common/LanguageSwitcher.tsx` — 3-language dropdown (es/en/ru), persists via `router.patch("/profile", { locale })`.
- `app/frontend/components/common/StatusBadge.tsx` — Colored badge per status. Label: `t(\`requests.status.${status}\`)`. Colors: draft=gray, submitted=blue, in_review=yellow, awaiting_reply=orange, awaiting_payment=purple, payment_confirmed=green, in_progress=blue, resolved=green, closed=gray.
- `app/frontend/components/common/FormattedDate.tsx` — Locale-aware `formatDistanceToNow` using `date-fns` + `date-fns/locale`. Import `{ es, enUS, ru }`.
- `app/frontend/components/common/NotificationBell.tsx` — Bell icon (lucide-react) + unread count badge from `unreadNotificationsCount` shared prop. Placeholder click handler (wired up in Step 8).

### 0.9 — Configure Inertia entrypoint

**File:** `app/frontend/entrypoints/inertia.tsx`:
- Import `@/lib/i18n` before any component
- `createInertiaApp` with page resolution via `import.meta.glob("../pages/**/*.tsx", { eager: true })`
- `LocaleSync` wrapper: syncs `i18n.language` with `auth.user.locale` from server props
- Wrap with layout: pages under `auth/` use `AuthLayout`, others use `AuthenticatedLayout`

### 0.10 — Configure ApplicationController for Inertia

**File:** `app/controllers/application_controller.rb`:
- Include `Pundit::Authorization`
- `after_action :verify_authorized` (controllers that skip must explicitly `skip_after_action`)
- `around_action :switch_locale` (detect from `current_user.locale` → header → default `es`)
- `inertia_share` lambda providing:
  - `auth: { user: current_user ? user_json(current_user) : nil }`
  - `flash: { notice: flash[:notice], alert: flash[:alert] }`
  - `features: current_user ? build_features(current_user) : {}`
  - `unreadNotificationsCount: current_user ? current_user.notifications.unread.count : 0`
  - `selectOptions: YAML.load_file(Rails.root.join("config/select_options.yml"))`

**File:** `app/controllers/inertia_controller.rb` — Inherits `ApplicationController`. Base class for all Inertia-rendering controllers.

**Helper method** `build_features(user)` returns hash:
```ruby
{
  canConfirmPayment: user.coordinator? || user.super_admin?,
  canManageUsers: user.super_admin?,
  canManageTeachers: user.coordinator? || user.super_admin?,
  canAccessInbox: user.coordinator? || user.super_admin?,
  canAccessAdmin: user.super_admin?,
  canCreateRequest: user.student?,
  canCreateLesson: user.teacher? || user.coordinator? || user.super_admin?,
}
```

### 0.11 — Create select_options.yml

**File:** `config/select_options.yml` — Full options from `docs/10_TECHNICAL_DETAILS.md`. Includes: `service_types`, `education_systems`, `studies_finished`, `study_types_spain`, `universities`, `language_levels`, `language_certificates`, `referral_sources`, `countries`.

### 0.12 — Create Rails I18n files

**Files:** `config/locales/es.yml`, `en.yml`, `ru.yml` — ActiveRecord model names/attributes, mailer subjects, notification messages, flash messages, validation errors. Full content from `docs/11_I18N_MULTILANGUAGE.md`.

### 0.13 — Configure security basics

**File:** `config/initializers/filter_parameter_logging.rb`:
```ruby
Rails.application.config.filter_parameters += [
  :password, :token, :secret,
  :email, :phone, :whatsapp,
  :identity_card, :passport, :birthday
]
```

### 0.14 — Clean up example code

- Delete `app/controllers/inertia_example_controller.rb`
- Delete `app/frontend/pages/inertia_example/` directory
- Update `config/routes.rb`: remove `inertia-example` route, set `root "dashboard#index"` (will create controller in Step 4)

### Done criteria for Step 0

- [ ] `bundle install` succeeds with all new gems
- [ ] `npm install` succeeds with all new packages
- [ ] `bin/rails server` boots without errors
- [ ] `npm run check` passes (TypeScript compiles with no errors)
- [ ] Visiting `localhost:3000` shows something (may redirect to login once auth is set up)
- [ ] Language switcher toggles between es/en/ru in the layout
- [ ] shadcn/ui components exist in `app/frontend/components/ui/`
- [ ] `config/select_options.yml` is loadable: `YAML.load_file(Rails.root.join("config/select_options.yml"))` in Rails console

---

## Step 1: Database Schema & Models

**Goal:** Create all 12 tables, models with validations/associations/encrypted fields, and seeds. No controllers or pages — just the data layer with full test coverage.

### 1.1 — Run Rails authentication generator

```bash
bin/rails generate authentication
```

This creates: `User` model (email_address, password_digest), `Session` model, `SessionsController`, `PasswordsController`, `Authentication` concern included in `ApplicationController`.

**Important:** The generator creates a migration for `users` with `email_address` and `password_digest`. We will extend this migration (or create a follow-up) with additional fields.

### 1.2 — Extend users table

Create migration to add all remaining user fields from `docs/02_DATABASE_SCHEMA.dbml`:

```ruby
class AddFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :name, :string, null: false, default: ""
    add_column :users, :provider, :string
    add_column :users, :uid, :string
    add_column :users, :avatar_url, :string
    add_column :users, :phone, :string
    add_column :users, :whatsapp, :string
    add_column :users, :birthday, :date
    add_column :users, :country, :string
    add_column :users, :locale, :string, default: "es"
    add_column :users, :is_minor, :boolean, null: false, default: false
    add_column :users, :guardian_name, :string
    add_column :users, :guardian_email, :string
    add_column :users, :guardian_phone, :string
    add_column :users, :guardian_whatsapp, :string
    add_column :users, :guardian_user_id, :integer
    add_column :users, :telegram_chat_id, :string
    add_column :users, :telegram_link_token, :string
    add_column :users, :notification_telegram, :boolean, null: false, default: false
    add_column :users, :notification_email, :boolean, null: false, default: true
    add_column :users, :amo_crm_contact_id, :string
    add_column :users, :privacy_accepted_at, :datetime
    add_column :users, :discarded_at, :datetime

    add_index :users, [:provider, :uid], unique: true
    add_index :users, :guardian_user_id
    add_index :users, :discarded_at
  end
end
```

### 1.3 — Create remaining migrations (in order)

**Migration 1: roles**
```ruby
create_table :roles do |t|
  t.string :name, null: false
  t.timestamps
end
add_index :roles, :name, unique: true
```

**Migration 2: user_roles**
```ruby
create_table :user_roles do |t|
  t.references :user, null: false, foreign_key: true
  t.references :role, null: false, foreign_key: true
  t.timestamps
end
add_index :user_roles, [:user_id, :role_id], unique: true
```

**Migration 3: teacher_profiles**
```ruby
create_table :teacher_profiles do |t|
  t.references :user, null: false, foreign_key: true, index: { unique: true }
  t.text :bio
  t.string :permanent_meeting_link
  t.string :level, null: false
  t.decimal :hourly_rate, null: false, precision: 8, scale: 2
  t.timestamps
end
```

**Migration 4: teacher_students**
```ruby
create_table :teacher_students do |t|
  t.integer :teacher_id, null: false
  t.integer :student_id, null: false
  t.integer :assigned_by, null: false
  t.datetime :created_at, null: false
end
add_index :teacher_students, [:teacher_id, :student_id], unique: true
add_index :teacher_students, :student_id
add_foreign_key :teacher_students, :users, column: :teacher_id
add_foreign_key :teacher_students, :users, column: :student_id
add_foreign_key :teacher_students, :users, column: :assigned_by
```

**Migration 5: homologation_requests**
```ruby
create_table :homologation_requests do |t|
  t.references :user, null: false, foreign_key: true
  t.integer :coordinator_id
  t.string :service_type, null: false
  t.string :subject, null: false
  t.text :description
  t.string :identity_card
  t.string :passport
  t.string :education_system
  t.string :studies_finished
  t.string :study_type_spain
  t.string :studies_spain
  t.string :university
  t.string :referral_source
  t.string :language_knowledge
  t.string :language_certificate
  t.boolean :privacy_accepted, null: false, default: false
  t.string :status, null: false, default: "draft"
  t.datetime :status_changed_at
  t.integer :status_changed_by
  t.decimal :payment_amount, precision: 10, scale: 2
  t.datetime :payment_confirmed_at
  t.integer :payment_confirmed_by
  t.string :stripe_payment_intent_id
  t.string :amo_crm_lead_id
  t.datetime :amo_crm_synced_at
  t.text :amo_crm_sync_error
  t.datetime :discarded_at
  t.timestamps
end
add_index :homologation_requests, :coordinator_id
add_index :homologation_requests, :status
add_index :homologation_requests, [:user_id, :status]
add_index :homologation_requests, :updated_at
add_index :homologation_requests, :discarded_at
add_foreign_key :homologation_requests, :users, column: :coordinator_id
add_foreign_key :homologation_requests, :users, column: :status_changed_by
add_foreign_key :homologation_requests, :users, column: :payment_confirmed_by
```

**Migration 6: conversations**
```ruby
create_table :conversations do |t|
  t.references :homologation_request, foreign_key: true, index: { unique: true }
  t.integer :teacher_student_id
  t.timestamps
end
add_index :conversations, :teacher_student_id
add_index :conversations, :updated_at
add_foreign_key :conversations, :teacher_students
```

**Migration 7: messages**
```ruby
create_table :messages do |t|
  t.references :conversation, null: false, foreign_key: true
  t.references :user, null: false, foreign_key: true
  t.text :body, null: false
  t.timestamps
end
add_index :messages, [:conversation_id, :created_at]
add_index :messages, :user_id
```

**Migration 8: lessons**
```ruby
create_table :lessons do |t|
  t.integer :teacher_id, null: false
  t.integer :student_id, null: false
  t.datetime :scheduled_at, null: false
  t.integer :duration_minutes, null: false, default: 60
  t.string :meeting_link
  t.string :status, null: false, default: "scheduled"
  t.text :notes
  t.timestamps
end
add_index :lessons, [:teacher_id, :scheduled_at]
add_index :lessons, [:student_id, :scheduled_at]
add_index :lessons, :status
add_foreign_key :lessons, :users, column: :teacher_id
add_foreign_key :lessons, :users, column: :student_id
```

**Migration 9: notifications**
```ruby
create_table :notifications do |t|
  t.references :user, null: false, foreign_key: true
  t.string :notifiable_type, null: false
  t.integer :notifiable_id, null: false
  t.string :title, null: false
  t.text :body
  t.datetime :read_at
  t.timestamps
end
add_index :notifications, [:user_id, :read_at]
add_index :notifications, [:user_id, :created_at]
add_index :notifications, [:notifiable_type, :notifiable_id]
```

**Migration 10: amo_crm_tokens**
```ruby
create_table :amo_crm_tokens do |t|
  t.text :access_token, null: false
  t.text :refresh_token, null: false
  t.datetime :expires_at, null: false
  t.timestamps
end
```

Run: `bin/rails db:migrate`

### 1.4 — Initialize encryption

```bash
bin/rails db:encryption:init
```

Add the generated keys to Rails credentials: `bin/rails credentials:edit`.

### 1.5 — Create models with validations & associations

**`app/models/user.rb`:**
- `has_secure_password validations: false` (allows OAuth-only users without password)
- Associations: `has_many :user_roles`, `has_many :roles, through: :user_roles`, `has_one :teacher_profile`, `has_many :homologation_requests`, teacher-student links (see `docs/04_ROLES_AND_AUTHORIZATION.md`), lesson links (taught_lessons, booked_lessons), `has_many :notifications`
- `encrypts :phone, :whatsapp, :guardian_phone, :guardian_whatsapp`
- Role helpers: `super_admin?`, `coordinator?`, `teacher?`, `student?` — each calls `has_role?(name)` which does `roles.exists?(name: name)`
- `self.find_or_create_from_oauth(auth)` — finds by provider+uid, then by email, creates with student role if new
- `profile_complete?` — `whatsapp.present? && birthday.present? && country.present?`
- Soft delete: `scope :kept, -> { where(discarded_at: nil) }`, `scope :discarded, -> { where.not(discarded_at: nil) }`, `def discard`, `def undiscard`, `def discarded?`
- Validations: `email_address` presence + uniqueness, `name` presence

**`app/models/role.rb`:**
- `validates :name, presence: true, uniqueness: true, inclusion: { in: %w[super_admin coordinator teacher student] }`
- `has_many :user_roles`
- `has_many :users, through: :user_roles`

**`app/models/user_role.rb`:**
- `belongs_to :user`, `belongs_to :role`
- `validates :user_id, uniqueness: { scope: :role_id }`

**`app/models/teacher_profile.rb`:**
- `belongs_to :user`
- `validates :level, presence: true, inclusion: { in: %w[junior mid senior native] }`
- `validates :hourly_rate, presence: true, numericality: { greater_than: 0 }`

**`app/models/teacher_student.rb`:**
- `belongs_to :teacher, class_name: "User"`, `belongs_to :student, class_name: "User"`
- `has_one :conversation, dependent: :destroy`
- `validates :teacher_id, uniqueness: { scope: :student_id }`

**`app/models/homologation_request.rb`:**
- `belongs_to :user`, `belongs_to :coordinator, class_name: "User", optional: true`
- `has_one :conversation, dependent: :destroy`
- `has_one_attached :application`, `has_many_attached :originals`, `has_many_attached :documents`
- `encrypts :identity_card, :passport`
- Status constants:
  ```ruby
  STATUSES = %w[draft submitted in_review awaiting_reply awaiting_payment payment_confirmed in_progress resolved closed].freeze

  VALID_TRANSITIONS = {
    "draft" => %w[submitted],
    "submitted" => %w[in_review],
    "in_review" => %w[awaiting_reply awaiting_payment],
    "awaiting_reply" => %w[in_review],
    "awaiting_payment" => %w[payment_confirmed],
    "payment_confirmed" => %w[in_progress],
    "in_progress" => %w[resolved closed],
  }.freeze
  ```
- `transition_to!(new_status, changed_by:)`:
  ```ruby
  def transition_to!(new_status, changed_by:)
    allowed = VALID_TRANSITIONS[status] || []
    raise InvalidTransition, "Cannot transition from #{status} to #{new_status}" unless allowed.include?(new_status)
    update!(status: new_status, status_changed_at: Time.current, status_changed_by: changed_by.id)
  end
  ```
- Custom exception: `class InvalidTransition < StandardError; end` (define in model or `app/models/concerns/`)
- Soft delete: `scope :kept, -> { where(discarded_at: nil) }`, `scope :discarded, -> { where.not(discarded_at: nil) }`, `def discard`, `def undiscard`, `def discarded?`
- Validations: `subject` presence, `service_type` presence + inclusion, `privacy_accepted` acceptance (on create when status != draft)

**`app/models/conversation.rb`:**
- `belongs_to :homologation_request, optional: true`
- `belongs_to :teacher_student_link, class_name: "TeacherStudent", foreign_key: :teacher_student_id, optional: true`
- `has_many :messages, dependent: :destroy`
- Custom validation: `validate :must_have_one_association` — either `homologation_request_id` or `teacher_student_id` must be present (but not both)

**`app/models/message.rb`:**
- `belongs_to :conversation`, `belongs_to :user`
- `has_many_attached :attachments`
- `validates :body, presence: true`
- `after_create_commit :broadcast_to_conversation` (broadcasts via `ConversationChannel.broadcast_to(conversation, ...)`)

**`app/models/lesson.rb`:**
- `belongs_to :teacher, class_name: "User"`, `belongs_to :student, class_name: "User"`
- `validates :status, inclusion: { in: %w[scheduled completed cancelled] }`
- `validates :scheduled_at, presence: true`
- `validates :duration_minutes, numericality: { greater_than: 0 }`
- `effective_meeting_link` — `meeting_link.presence || teacher.teacher_profile&.permanent_meeting_link`
- `meeting_link_ready?` — `effective_meeting_link.present?`

**`app/models/notification.rb`:**
- `belongs_to :user`, `belongs_to :notifiable, polymorphic: true`
- `scope :unread, -> { where(read_at: nil) }`
- `validates :title, presence: true`
- `def read? = read_at.present?`
- `def mark_as_read! = update!(read_at: Time.current)`

**`app/models/amo_crm_token.rb`:**
- `self.current` — `last || raise("No AmoCRM token configured")`
- `def expired?` — `expires_at < 5.minutes.from_now`

### 1.6 — Create Pundit policies

**`app/policies/application_policy.rb`:**
- Default: all actions return `false` (deny by default)
- Scope default: `scope.none`

**`app/policies/homologation_request_policy.rb`:**
- `index?` — any authenticated user
- `show?` — owner OR coordinator OR super_admin
- `create?` — student only
- `update?` — coordinator OR super_admin
- `confirm_payment?` — (coordinator OR super_admin) AND status == "awaiting_payment"
- `download_document?` — same as `show?`
- Scope: students → `scope.where(user: user)`, coordinators/admins → `scope.all`

**`app/policies/message_policy.rb`:**
- `create?` — user must be participant in conversation (check via request owner, coordinator, or teacher-student link)

**`app/policies/user_policy.rb`:**
- `manage?` / `index?` / `create?` / `update?` / `destroy?` — super_admin only
- Scope: super_admin → `scope.all`, others → `scope.none`

**`app/policies/lesson_policy.rb`:**
- `index?` — any authenticated
- `create?` — teacher (for assigned students) OR coordinator OR super_admin
- `show?` / `update?` / `destroy?` — teacher (own) OR coordinator OR super_admin
- Scope: teacher → own lessons, student → own lessons, coordinator/admin → all

**`app/policies/inbox_policy.rb`:**
- `index?` / `show?` — coordinator OR super_admin

**`app/policies/teacher_policy.rb`:**
- `index?` / `update?` / `assign_student?` / `remove_student?` — coordinator OR super_admin

### 1.7 — Create seeds

**File:** `db/seeds.rb`:
```ruby
%w[super_admin coordinator teacher student].each do |role_name|
  Role.find_or_create_by!(name: role_name)
end
```

Run: `bin/rails db:seed`

### 1.8 — Create test fixtures

**`test/fixtures/roles.yml`:**
```yaml
super_admin:
  name: super_admin
coordinator:
  name: coordinator
teacher:
  name: teacher
student:
  name: student
```

**`test/fixtures/users.yml`:** — minimum 5 users:
- `super_admin_boss` — email: boss@example.com, name: "Boss Admin"
- `coordinator_maria` — email: maria@example.com, name: "Maria Garcia"
- `teacher_ivan` — email: ivan@example.com, name: "Ivan Petrov"
- `student_ana` — email: ana@example.com, name: "Ana Kowalski", whatsapp: "+34600000001", birthday: 2000-01-15, country: "RU", profile complete
- `student_pedro` — email: pedro@example.com, name: "Pedro Lopez", whatsapp: "+34600000002", birthday: 2001-06-20, country: "CO"

All users need `password_digest` (use `BCrypt::Password.create("password123")`).

**`test/fixtures/user_roles.yml`:** — Link each user to their role.

**`test/fixtures/teacher_profiles.yml`:** — Profile for teacher_ivan: level "senior", hourly_rate 25.00, permanent_meeting_link "https://zoom.us/j/123456".

**`test/fixtures/teacher_students.yml`:** — teacher_ivan ↔ student_ana, assigned_by coordinator_maria.

**`test/fixtures/homologation_requests.yml`:** — At least 2 requests for student_ana:
- `ana_equivalencia` — status: "submitted", service_type: "equivalencia", subject: "Equivalencia CEU"
- `ana_draft` — status: "draft", service_type: "informe", subject: "Draft request"

**`test/fixtures/conversations.yml`:** — At least 1 request conversation linked to `ana_equivalencia`.

**`test/fixtures/messages.yml`:** — At least 2 messages in the conversation (one from student_ana, one from coordinator_maria).

**`test/fixtures/lessons.yml`:** — At least 1 lesson: teacher_ivan + student_ana, scheduled_at tomorrow 10:00, status "scheduled".

**`test/fixtures/notifications.yml`:** — At least 1 unread notification for student_ana.

### 1.9 — Write model tests

**`test/models/user_test.rb`:**
```ruby
test "role check methods work" do
  assert users(:super_admin_boss).super_admin?
  assert users(:coordinator_maria).coordinator?
  assert users(:teacher_ivan).teacher?
  assert users(:student_ana).student?
  refute users(:student_ana).coordinator?
end

test "find_or_create_from_oauth creates new user" do
  auth = OmniAuth::AuthHash.new(provider: "google_oauth2", uid: "12345",
    info: { email: "new@example.com", name: "New User", image: nil })
  user = User.find_or_create_from_oauth(auth)
  assert user.persisted?
  assert user.student?
  assert_equal "new@example.com", user.email_address
end

test "find_or_create_from_oauth finds existing by email" do
  auth = OmniAuth::AuthHash.new(provider: "google_oauth2", uid: "12345",
    info: { email: users(:student_ana).email_address, name: "Ana", image: nil })
  user = User.find_or_create_from_oauth(auth)
  assert_equal users(:student_ana).id, user.id
end

test "profile_complete? returns true when all fields present" do
  assert users(:student_ana).profile_complete?
end

test "profile_complete? returns false when whatsapp missing" do
  user = users(:student_ana)
  user.whatsapp = nil
  refute user.profile_complete?
end
```

**`test/models/homologation_request_test.rb`:**
```ruby
test "valid transition from draft to submitted" do
  request = homologation_requests(:ana_draft)
  request.transition_to!("submitted", changed_by: users(:student_ana))
  assert_equal "submitted", request.reload.status
end

test "invalid transition from draft to resolved raises error" do
  request = homologation_requests(:ana_draft)
  assert_raises(HomologationRequest::InvalidTransition) do
    request.transition_to!("resolved", changed_by: users(:coordinator_maria))
  end
end

test "full happy path transition chain" do
  request = homologation_requests(:ana_draft)
  coordinator = users(:coordinator_maria)
  student = users(:student_ana)

  request.transition_to!("submitted", changed_by: student)
  request.transition_to!("in_review", changed_by: coordinator)
  request.transition_to!("awaiting_payment", changed_by: coordinator)
  request.transition_to!("payment_confirmed", changed_by: coordinator)
  request.transition_to!("in_progress", changed_by: coordinator)
  request.transition_to!("resolved", changed_by: coordinator)
  assert_equal "resolved", request.reload.status
end

test "subject is required" do
  request = HomologationRequest.new(user: users(:student_ana), service_type: "equivalencia")
  refute request.valid?
  assert request.errors[:subject].any?
end
```

**`test/models/conversation_test.rb`:**
```ruby
test "must have either homologation_request or teacher_student" do
  conversation = Conversation.new
  refute conversation.valid?
end

test "valid with homologation_request" do
  # Uses fixture that has homologation_request_id set
  assert conversations(:ana_equivalencia_conversation).valid?
end
```

**`test/models/lesson_test.rb`:**
```ruby
test "effective_meeting_link returns lesson link if present" do
  lesson = lessons(:ivan_ana_lesson)
  lesson.meeting_link = "https://custom.link/123"
  assert_equal "https://custom.link/123", lesson.effective_meeting_link
end

test "effective_meeting_link falls back to teacher permanent link" do
  lesson = lessons(:ivan_ana_lesson)
  lesson.meeting_link = nil
  assert_equal "https://zoom.us/j/123456", lesson.effective_meeting_link
end

test "meeting_link_ready? returns true when link available" do
  assert lessons(:ivan_ana_lesson).meeting_link_ready?
end
```

### 1.10 — Add test helper for sign_in

**`test/test_helper.rb`:** Add helper method:
```ruby
def sign_in(user)
  post session_path, params: { email_address: user.email_address, password: "password123" }
end
```

(This relies on `SessionsController` from the auth generator. The exact method may need adjustment based on the generated code.)

### Done criteria for Step 1

- [ ] `bin/rails db:migrate` runs without errors
- [ ] `bin/rails db:seed` creates 4 roles (verify: `Role.count == 4` in console)
- [ ] `bin/rails test` — all model tests pass (minimum 14 tests)
- [ ] Encrypted fields work: `User.create!(email_address: "test@test.com", name: "Test", phone: "+123")` → `phone` is encrypted in DB
- [ ] `HomologationRequest.new.transition_to!("submitted", ...)` works from draft
- [ ] `HomologationRequest.new.transition_to!("resolved", ...)` from draft raises `InvalidTransition`
- [ ] Soft delete works: `user.discard` → `User.kept` excludes user, `User.discarded` includes user
- [ ] Fixtures load without errors: `bin/rails test` doesn't fail on fixture loading

---

## Step 2: Authentication (Email + OAuth)

**Goal:** Users can register, log in (email + OAuth), reset password, and log out. Auth pages use `AuthLayout`. Unauthenticated users are redirected to login.

### 2.1 — Configure controllers for Inertia

The auth generator created `SessionsController` and `PasswordsController` as plain Rails controllers. Convert them to render Inertia pages:

**`app/controllers/sessions_controller.rb`:**
- `new` → `render inertia: "auth/Login"`
- `create` → authenticate, start session, redirect to root. On failure: redirect back with Inertia errors.
- `destroy` → terminate session, redirect to login
- Add `rate_limit to: 10, within: 3.minutes, only: :create`
- Skip `verify_authorized` (auth controllers don't use Pundit)

**`app/controllers/registrations_controller.rb`:**
- `new` → `render inertia: "auth/Register"`
- `create` → create user with student role, start session, redirect to root
- Add `rate_limit to: 5, within: 1.hour, only: :create`
- Skip `verify_authorized`

**`app/controllers/passwords_controller.rb`:**
- `new` → `render inertia: "auth/ForgotPassword"`
- Keep reset flow from generator, render Inertia pages

### 2.2 — Configure OmniAuth

**File:** `config/initializers/omniauth.rb` — From `docs/05_AUTH_OAUTH.md`:
```ruby
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    Rails.application.credentials.dig(:google, :client_id),
    Rails.application.credentials.dig(:google, :client_secret),
    { scope: "email,profile", prompt: "select_account" }

  provider :apple,
    Rails.application.credentials.dig(:apple, :client_id), "",
    { scope: "email name",
      team_id: Rails.application.credentials.dig(:apple, :team_id),
      key_id: Rails.application.credentials.dig(:apple, :key_id),
      pem: Rails.application.credentials.dig(:apple, :pem) }
end
OmniAuth.config.allowed_request_methods = [:post]
```

**File:** `app/controllers/auth/omniauth_callbacks_controller.rb`:
```ruby
module Auth
  class OmniauthCallbacksController < ApplicationController
    skip_before_action :verify_authenticity_token, only: :create
    skip_after_action :verify_authorized

    def create
      auth = request.env["omniauth.auth"]
      user = User.find_or_create_from_oauth(auth)
      start_new_session_for(user)
      redirect_to root_path, notice: t("flash.signed_in")
    end

    def failure
      redirect_to new_session_path, alert: t("flash.auth_failed")
    end
  end
end
```

### 2.3 — Update routes

```ruby
resource :session, only: [:new, :create, :destroy]
resource :registration, only: [:new, :create]
resources :passwords, param: :token, only: [:new, :create, :edit, :update]

# OAuth
post "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
get  "/auth/:provider/callback", to: "auth/omniauth_callbacks#create"
get  "/auth/failure",            to: "auth/omniauth_callbacks#failure"
```

### 2.4 — Create auth pages

**`app/frontend/pages/auth/Login.tsx`:**
- Email + password form using Inertia `useForm`
- Google OAuth button (POST form with CSRF token)
- Apple OAuth button (POST form with CSRF token)
- Language switcher in corner
- Links: "Forgot password?" → `routes.forgotPassword`, "Create account" → `routes.register`
- All text via `t("auth.*")`
- Wrapped in `AuthLayout`

**`app/frontend/pages/auth/Register.tsx`:**
- Fields: name, email, password, confirm password
- Privacy policy checkbox (links to `routes.privacyPolicy`)
- OAuth buttons
- Link: "Already have an account?" → `routes.login`
- All text via `t("auth.*")`

**`app/frontend/pages/auth/ForgotPassword.tsx`:**
- Email input + submit
- Link back to login
- All text via `t("auth.*")`

### 2.5 — Write controller tests

**`test/controllers/sessions_controller_test.rb`:**
```ruby
test "GET /session/new renders login page" do
  get new_session_path
  assert_response :ok
  # assert_inertia component: "auth/Login"  (use inertia test helper if available)
end

test "POST /session with valid credentials logs in" do
  post session_path, params: { email_address: users(:student_ana).email_address, password: "password123" }
  assert_redirected_to root_path
end

test "POST /session with invalid credentials shows error" do
  post session_path, params: { email_address: users(:student_ana).email_address, password: "wrong" }
  # Should redirect back to login with error
end

test "DELETE /session logs out" do
  sign_in users(:student_ana)
  delete session_path
  assert_redirected_to new_session_path
end
```

**`test/controllers/registrations_controller_test.rb`:**
```ruby
test "GET /registration/new renders register page" do
  get new_registration_path
  assert_response :ok
end

test "POST /registration creates user with student role" do
  assert_difference "User.count", 1 do
    post registration_path, params: {
      name: "Test User", email_address: "newuser@example.com",
      password: "password123", password_confirmation: "password123"
    }
  end
  user = User.find_by(email_address: "newuser@example.com")
  assert user.student?
end

test "POST /registration with duplicate email returns error" do
  post registration_path, params: {
    name: "Dup", email_address: users(:student_ana).email_address,
    password: "password123", password_confirmation: "password123"
  }
  # Should show validation error, not create user
  assert_equal User.where(email_address: users(:student_ana).email_address).count, 1
end
```

### Done criteria for Step 2

- [ ] `bin/rails test` — all auth tests pass (minimum 6 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Browser: can register with email + password → redirected to root (or profile)
- [ ] Browser: can log in with email + password → see authenticated layout
- [ ] Browser: can log out → redirected to login
- [ ] Unauthenticated visit to `/` → redirected to `/session/new`
- [ ] New user gets `student` role automatically
- [ ] Rate limiting: 11th login attempt within 3 minutes is blocked

---

## Step 3: Profile Completion & Edit

**Goal:** After first login, student with incomplete profile is redirected to `/profile/edit`. Profile stores WhatsApp, birthday, country, locale, guardian info. Locale change updates language.

### 3.1 — Create ProfilesController

**File:** `app/controllers/profiles_controller.rb`:
```ruby
class ProfilesController < InertiaController
  before_action :set_user
  skip_before_action :require_complete_profile  # Don't redirect from profile page itself

  def show
    authorize @user, :show?
    render inertia: "profile/Edit", props: { profile: profile_json(@user) }
  end

  def edit
    authorize @user, :edit?
    render inertia: "profile/Edit", props: { profile: profile_json(@user) }
  end

  def update
    authorize @user, :update?
    if @user.update(profile_params)
      redirect_to root_path, notice: t("flash.profile_updated")
    else
      redirect_to edit_profile_path, inertia: { errors: @user.errors }
    end
  end

  private

  def set_user = @user = current_user

  def profile_params
    params.permit(:name, :phone, :whatsapp, :birthday, :country, :locale,
                  :is_minor, :guardian_name, :guardian_email, :guardian_phone, :guardian_whatsapp)
  end

  def profile_json(u)
    { id: u.id, name: u.name, email: u.email_address, phone: u.phone, whatsapp: u.whatsapp,
      birthday: u.birthday&.iso8601, country: u.country, locale: u.locale,
      isMinor: u.is_minor, guardianName: u.guardian_name, guardianEmail: u.guardian_email,
      guardianPhone: u.guardian_phone, guardianWhatsapp: u.guardian_whatsapp,
      profileComplete: u.profile_complete? }
  end
end
```

### 3.2 — Add profile_complete? redirect

**`app/controllers/application_controller.rb`:** Add `before_action :require_complete_profile`:
```ruby
def require_complete_profile
  return unless current_user
  return if current_user.profile_complete?
  return if request.path.start_with?("/profile", "/session", "/registration", "/auth", "/passwords")
  redirect_to edit_profile_path, notice: t("flash.complete_profile")
end
```

### 3.3 — Add profile policy

**`app/policies/profile_policy.rb`** (or add to UserPolicy):
- `show?` / `edit?` / `update?` — always true for own profile

### 3.4 — Add route

```ruby
resource :profile, only: [:show, :edit, :update]
```

### 3.5 — Create profile page

**`app/frontend/pages/profile/Edit.tsx`:**
- Inertia `useForm` with fields: name, whatsapp (required), phone, birthday (date input), country (dropdown from `selectOptions.countries`)
- "I am under 18" checkbox → conditionally shows: guardian_name, guardian_email, guardian_phone, guardian_whatsapp
- Locale selector (3 options)
- "Contact us to delete your account" link (mailto: link)
- Privacy policy link
- "Save" button
- All text via `t("profile.*")`

### 3.6 — Write tests

**`test/controllers/profiles_controller_test.rb`:**
```ruby
test "student can view profile" do
  sign_in users(:student_ana)
  get profile_path
  assert_response :ok
end

test "student can update profile" do
  sign_in users(:student_ana)
  patch profile_path, params: { whatsapp: "+34999999999", country: "ES" }
  assert_redirected_to root_path
  assert_equal "+34999999999", users(:student_ana).reload.whatsapp
end

test "incomplete profile redirects to edit" do
  user = users(:student_ana)
  user.update_columns(whatsapp: nil)  # Make profile incomplete
  sign_in user
  get root_path
  assert_redirected_to edit_profile_path
end

test "locale update saves to user" do
  sign_in users(:student_ana)
  patch profile_path, params: { locale: "ru" }
  assert_equal "ru", users(:student_ana).reload.locale
end

test "minor fields are saved" do
  sign_in users(:student_ana)
  patch profile_path, params: { is_minor: true, guardian_name: "Mama", guardian_email: "mama@test.com" }
  assert users(:student_ana).reload.is_minor?
  assert_equal "Mama", users(:student_ana).guardian_name
end
```

### Done criteria for Step 3

- [ ] `bin/rails test` — all profile tests pass (minimum 5 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] New user with no whatsapp/birthday/country → redirected to `/profile/edit`
- [ ] After filling profile → redirected to dashboard
- [ ] Language change in profile → page re-renders in new language
- [ ] Minor checkbox reveals guardian fields
- [ ] Guardian data saves correctly

---

## Step 4: Homologation Requests (CRUD + Status Machine + Files)

**Goal:** Students create/view/submit requests with file uploads. Coordinators view all requests and change status. Status transitions enforced. File download works with authorization.

### 4.1 — Create HomologationRequestsController

**File:** `app/controllers/homologation_requests_controller.rb`:

Actions:
- `index` — `policy_scope(HomologationRequest).includes(:user).order(updated_at: :desc)`. Props: `requests` array (list JSON).
- `new` — `authorize HomologationRequest.new`. Props: none (form uses selectOptions from shared props).
- `create` — build from `current_user.homologation_requests`, set status based on `params[:commit]` ("draft" or "submitted"). Create conversation on submit. Redirect to show.
- `show` — `find` with includes (user, conversation.messages.user). Props: `request` detail JSON.
- `update` — handle status changes via `transition_to!` and field updates.
- `confirm_payment` — set payment_amount, payment_confirmed_at/by, transition to "payment_confirmed", enqueue `AmoCrmSyncJob`.
- `download_document` — find blob by ID, authorize, redirect to proxy URL.

Use private `_json` methods with camelCase keys. Dates as ISO 8601.

**Serialization examples:**
```ruby
private

def request_list_json(r)
  { id: r.id, subject: r.subject, serviceType: r.service_type,
    status: r.status, createdAt: r.created_at.iso8601,
    updatedAt: r.updated_at.iso8601, user: { id: r.user.id, name: r.user.name } }
end

def request_detail_json(r)
  { id: r.id, subject: r.subject, serviceType: r.service_type, status: r.status,
    description: r.description, identityCard: r.identity_card, passport: r.passport,
    educationSystem: r.education_system, studiesFinished: r.studies_finished,
    studyTypeSpain: r.study_type_spain, studiesSpain: r.studies_spain,
    university: r.university, referralSource: r.referral_source,
    languageKnowledge: r.language_knowledge, languageCertificate: r.language_certificate,
    paymentAmount: r.payment_amount&.to_f, paymentConfirmedAt: r.payment_confirmed_at&.iso8601,
    amoCrmLeadId: r.amo_crm_lead_id, amoCrmSyncedAt: r.amo_crm_synced_at&.iso8601,
    amoCrmSyncError: r.amo_crm_sync_error,
    createdAt: r.created_at.iso8601, updatedAt: r.updated_at.iso8601,
    user: { id: r.user.id, name: r.user.name, email: r.user.email_address },
    conversation: r.conversation ? conversation_json(r.conversation) : nil,
    files: files_json(r) }
end
```

### 4.2 — Create file upload components

**`app/frontend/components/documents/FileDropZone.tsx`:**
- Props: `name: string`, `multiple: boolean`, `onUpload: (signedIds: string[]) => void`
- Uses `react-dropzone` for drag & drop
- Uses `@rails/activestorage` `DirectUpload` for uploading
- Shows progress bar during upload
- Shows file list with remove button
- Text via `t("requests.form.drop_file")` / `t("requests.form.drop_files")`
- Max size hint via `t("requests.form.max_size", { size: 10 })`

**`app/frontend/components/documents/FileList.tsx`:**
- Props: `files: Array<{ id: number, filename: string, url: string }>`, `requestId: number`
- Renders list with download links using `routes.downloadDocument(requestId, file.id)`
- Download icon from lucide-react

### 4.3 — Create request pages

**`app/frontend/pages/requests/Index.tsx`:**
- Table: Subject, ID, Created, Last Activity, Status (StatusBadge)
- Search input (client-side filter by subject)
- Status filter dropdown
- Desktop: `<Table>`, Mobile: card list (`docs/15_MOBILE_PATTERNS.md`)
- Click row → `router.visit(routes.request(id))`
- Empty state: `t("requests.no_requests")`
- All text via `t("requests.table.*")`

**`app/frontend/pages/requests/New.tsx`:**
- Inertia `useForm` with all 14 fields
- Sections: About You → Request → Education → Optional → Documents (from `docs/03_FEATURES.md`)
- Pre-fill name from `auth.user.name`
- Select options from `selectOptions` shared prop with `getOptionLabel(opt, locale)`
- 3 `FileDropZone` components: application (single), originals (multiple), documents (multiple)
- Two buttons: "Submit" (`type="submit"`) and "Save Draft" (`onClick → post with commit: "draft"`)
- Privacy checkbox (required for submit)
- Validation errors from server displayed inline

**`app/frontend/pages/requests/Show.tsx`:**
- Split layout: Left = chat area (placeholder, wired in Step 5), Right = request details + files
- Request detail fields (read-only)
- StatusBadge for current status
- FileList component for attached files
- Coordinator sees: status dropdown to change status, "Confirm Payment" button (only when status == "awaiting_payment")
- "Confirm Payment" dialog: amount input, confirm button → `router.post(routes.confirmPayment(id), { payment_amount })`
- CRM sync indicator: badge showing synced/syncing/error/not synced based on `amoCrmLeadId`, `amoCrmSyncedAt`, `amoCrmSyncError`
- Use `features.canConfirmPayment` to show/hide coordinator actions

### 4.4 — Create DashboardController

**`app/controllers/dashboard_controller.rb`:**
```ruby
class DashboardController < InertiaController
  def index
    authorize :dashboard, :index?
    # Teacher → redirect to calendar (their landing page)
    return redirect_to lessons_path if current_user.teacher? && !current_user.coordinator?

    props = { stats: build_stats }
    render inertia: "dashboard/Index", props: props
  end

  private

  def build_stats
    if current_user.student?
      { myRequests: current_user.homologation_requests.count,
        pendingRequests: current_user.homologation_requests.where.not(status: %w[resolved closed]).count }
    else
      { totalRequests: HomologationRequest.count,
        openRequests: HomologationRequest.where.not(status: %w[resolved closed draft]).count,
        awaitingPayment: HomologationRequest.where(status: "awaiting_payment").count,
        resolved: HomologationRequest.where(status: "resolved").count }
    end
  end
end
```

**`app/policies/dashboard_policy.rb`:** `index?` → any authenticated user.

**`app/frontend/pages/dashboard/Index.tsx`:**
- Student view: "My requests" count, quick link to new request
- Coordinator/Admin view: stat cards (total, open, awaiting payment, resolved)
- All text via `t("admin.stats.*")` and `t("requests.*")`

### 4.5 — Update routes

```ruby
root "dashboard#index"

resource :profile, only: [:show, :edit, :update]

resources :homologation_requests, path: "requests" do
  resources :messages, only: [:create]
  member do
    get :download_document
    post :confirm_payment
  end
end
```

### 4.6 — Add TS types for request pages

**`app/frontend/types/pages.ts`:**
```ts
export interface RequestListItem {
  id: number
  subject: string
  serviceType: string
  status: string
  createdAt: string
  updatedAt: string
  user: { id: number; name: string }
}

export interface RequestDetail extends RequestListItem {
  description: string | null
  identityCard: string | null
  passport: string | null
  educationSystem: string | null
  studiesFinished: string | null
  studyTypeSpain: string | null
  studiesSpain: string | null
  university: string | null
  referralSource: string | null
  languageKnowledge: string | null
  languageCertificate: string | null
  paymentAmount: number | null
  paymentConfirmedAt: string | null
  amoCrmLeadId: string | null
  amoCrmSyncedAt: string | null
  amoCrmSyncError: string | null
  user: { id: number; name: string; email: string }
  conversation: ConversationDetail | null
  files: FileInfo[]
}

export interface FileInfo {
  id: number
  filename: string
  contentType: string
  byteSize: number
  category: "application" | "originals" | "documents"
}
```

### 4.7 — Write tests

**`test/controllers/homologation_requests_controller_test.rb`:**
```ruby
test "student sees own requests" do
  sign_in users(:student_ana)
  get homologation_requests_path
  assert_response :ok
end

test "coordinator sees all requests" do
  sign_in users(:coordinator_maria)
  get homologation_requests_path
  assert_response :ok
end

test "student cannot see other's request" do
  sign_in users(:student_pedro)
  get homologation_request_path(homologation_requests(:ana_equivalencia))
  assert_response :forbidden  # or redirect depending on Pundit config
end

test "student can create request" do
  sign_in users(:student_ana)
  assert_difference "HomologationRequest.count", 1 do
    post homologation_requests_path, params: {
      homologation_request: { subject: "New Request", service_type: "equivalencia",
                              description: "Test", privacy_accepted: true }
    }
  end
end

test "student can save draft" do
  sign_in users(:student_ana)
  post homologation_requests_path, params: {
    commit: "draft",
    homologation_request: { subject: "Draft", service_type: "equivalencia" }
  }
  assert_equal "draft", HomologationRequest.last.status
end

test "coordinator can change status" do
  sign_in users(:coordinator_maria)
  request = homologation_requests(:ana_equivalencia)
  # ana_equivalencia is "submitted", transition to "in_review"
  patch homologation_request_path(request), params: { status: "in_review" }
  assert_equal "in_review", request.reload.status
end

test "coordinator can confirm payment" do
  sign_in users(:coordinator_maria)
  request = homologation_requests(:ana_equivalencia)
  # Set up: transition to awaiting_payment
  request.update!(status: "awaiting_payment")
  post confirm_payment_homologation_request_path(request), params: { payment_amount: 60 }
  assert_redirected_to homologation_request_path(request)
  assert_equal "payment_confirmed", request.reload.status
  assert_equal 60.0, request.payment_amount.to_f
end

test "student cannot confirm payment" do
  sign_in users(:student_ana)
  request = homologation_requests(:ana_equivalencia)
  request.update!(status: "awaiting_payment")
  post confirm_payment_homologation_request_path(request), params: { payment_amount: 60 }
  assert_response :forbidden
end

test "teacher cannot access requests" do
  sign_in users(:teacher_ivan)
  get homologation_requests_path
  assert_response :forbidden
end
```

### Done criteria for Step 4

- [ ] `bin/rails test` — all request tests pass (minimum 8 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Browser: student can create new request with file uploads
- [ ] Browser: student can save a draft
- [ ] Request list shows all student's requests with correct statuses
- [ ] Coordinator sees all requests in the list
- [ ] Coordinator can change status from request detail page
- [ ] Coordinator can confirm payment when status is "awaiting_payment"
- [ ] File upload shows progress and completes
- [ ] File download works for authorized users
- [ ] Select options render with correct translations per locale
- [ ] Dashboard shows stats appropriate to role

---

## Step 5: Real-time Chat (Action Cable)

**Goal:** Students and coordinators chat within request detail page. Messages sent via Inertia POST, received in real-time via Action Cable. File attachments on messages supported.

### 5.1 — Create MessagesController

**`app/controllers/messages_controller.rb`:**
- Nested under `homologation_requests` and `conversations`
- `create`:
  - Find conversation (from request or directly)
  - Build message: `conversation.messages.build(user: current_user, body: params[:body])`
  - Attach files if present
  - `authorize` the message
  - Save → Action Cable broadcasts automatically (via `after_create_commit` in Message model)
  - Redirect back to request/conversation

### 5.2 — Create Action Cable channels

**`app/channels/conversation_channel.rb`:**
```ruby
class ConversationChannel < ApplicationCable::Channel
  def subscribed
    conversation = Conversation.find(params[:conversation_id])
    # TODO: verify user has access (owner, coordinator, teacher)
    stream_for conversation
  end
end
```

**`app/channels/notification_channel.rb`:**
```ruby
class NotificationChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_user
  end
end
```

**`app/channels/application_cable/connection.rb`:** — Authenticate from session cookie (same session as HTTP requests).

### 5.3 — Update Message model broadcast

Ensure `after_create_commit` broadcasts to `ConversationChannel`:
```ruby
after_create_commit :broadcast_message

private

def broadcast_message
  ConversationChannel.broadcast_to(conversation, {
    id: id, body: body, createdAt: created_at.iso8601,
    user: { id: user.id, name: user.name, avatarUrl: user.avatar_url },
    attachments: attachments.map { |a| { id: a.id, filename: a.filename.to_s } }
  })
end
```

### 5.4 — Create React hooks

**`app/frontend/hooks/useActionCable.ts`:**
```ts
import { createConsumer } from "@rails/actioncable"

// Create single consumer instance
const consumer = createConsumer()

export function useChannel<T>(
  channelName: string,
  params: Record<string, unknown>,
  onReceived: (data: T) => void
) {
  // Subscribe on mount, unsubscribe on unmount
  // Return subscription object
}
```

### 5.5 — Create chat components

**`app/frontend/components/chat/ChatWindow.tsx`:**
- Props: `messages: Message[]`, `conversationId: number`
- Renders message list with `MessageBubble`
- Auto-scrolls to bottom on new message
- Subscribes to `ConversationChannel` via `useChannel`
- Appends new messages to local state when received via WebSocket
- Text: `t("chat.no_messages")` for empty state

**`app/frontend/components/chat/MessageBubble.tsx`:**
- Props: `message: Message`, `isOwn: boolean`
- Different alignment and colors for own vs other messages
- Shows: avatar, name, timestamp (FormattedDate), body, attachments

**`app/frontend/components/chat/MessageInput.tsx`:**
- Props: `onSend: (body: string, attachmentIds: string[]) => void`, `disabled: boolean`
- Textarea + Send button + Attach file button
- File attachment via `useFileUpload` hook (direct upload, returns signed_id)
- Send via Inertia: `router.post(url, { body, attachments: signedIds })`
- Text: `t("chat.type_message")`, `t("chat.send")`, `t("chat.attach_file")`

### 5.6 — Wire chat into Request Show page

Update `app/frontend/pages/requests/Show.tsx`:
- Replace chat placeholder with `ChatWindow` + `MessageInput`
- Pass conversation messages and ID from request detail props
- Messages sent via `router.post(routes.requestMessages(request.id), { body })`

### 5.7 — Create Conversations pages (for teacher/student /chat)

**`app/controllers/conversations_controller.rb`:**
- `index` — list user's conversations (teacher: with assigned students; student: with teachers + request chats)
- `show` — single conversation with messages
- Props: `conversations` list, `conversation` detail with messages

**`app/frontend/pages/chat/Index.tsx`:**
- Left panel: conversation list (name, last message preview, time)
- Right panel: selected conversation chat
- Mobile: list → full-screen chat → back button
- Real-time updates via Action Cable

### 5.8 — Update routes

```ruby
resources :conversations, only: [:index, :show] do
  resources :messages, only: [:create]
end
```

### 5.9 — Write tests

**`test/controllers/messages_controller_test.rb`:**
```ruby
test "student can send message in own request conversation" do
  sign_in users(:student_ana)
  conversation = conversations(:ana_equivalencia_conversation)
  assert_difference "Message.count", 1 do
    post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
         params: { body: "Hello coordinator" }
  end
end

test "coordinator can send message in any conversation" do
  sign_in users(:coordinator_maria)
  assert_difference "Message.count", 1 do
    post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
         params: { body: "I'll review your documents" }
  end
end

test "unauthorized user cannot send message" do
  sign_in users(:student_pedro)
  assert_no_difference "Message.count" do
    post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
         params: { body: "Hacking attempt" }
  end
end

test "message body is required" do
  sign_in users(:student_ana)
  post homologation_request_messages_path(homologation_requests(:ana_equivalencia)),
       params: { body: "" }
  # Should not create message
end
```

**`test/controllers/conversations_controller_test.rb`:**
```ruby
test "student sees own conversations" do
  sign_in users(:student_ana)
  get conversations_path
  assert_response :ok
end

test "student cannot see unrelated conversation" do
  sign_in users(:student_pedro)
  get conversation_path(conversations(:ana_equivalencia_conversation))
  assert_response :forbidden
end
```

### Done criteria for Step 5

- [ ] `bin/rails test` — all chat tests pass (minimum 5 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Browser: student sends message in request detail → message appears
- [ ] Browser: coordinator replies → message appears for student in real-time (no refresh)
- [ ] File attachment on message works
- [ ] `/chat` page shows conversation list for students
- [ ] Mobile: conversation list → full-screen chat → back button
- [ ] Action Cable connection established (check browser console for WebSocket)

---

## Step 6: Coordinator Workspace (Inbox + Teacher Management)

**Goal:** `/inbox` — 3-column unified chat. `/teachers` — teacher cards with student assignment. This is where coordinators spend 80% of their time.

### 6.1 — Create InboxController

**`app/controllers/inbox_controller.rb`:**
- `index` — all conversations ordered by last message time. Include conversation type (request vs teacher-student), unread status, last message preview. Authorize: coordinator/super_admin only.
- `show` — selected conversation with full messages + context. For request chats: include request details, files, status, CRM sync info. For teacher-student chats: include teacher name, student name, next lesson.
- Props: `conversations` list, `selectedConversation` (if show), `context` (request or teacher-student details)

### 6.2 — Create inbox components

Build per wireframes in `docs/14_COORDINATOR_WORKSPACE.md`:

**`app/frontend/components/inbox/ConversationList.tsx`:** Left column (~280px). List of conversations: avatar, name, last message preview (truncated), relative time, unread badge (red dot). Search input. Filter tabs: All / Requests / Teacher chats / Unread only.

**`app/frontend/components/inbox/ConversationItem.tsx`:** Single row in conversation list. Highlighted when selected. Unread indicator.

**`app/frontend/components/inbox/ChatPanel.tsx`:** Center column (flex). Reuses `ChatWindow` + `MessageInput` from Step 5.

**`app/frontend/components/inbox/ContextPanel.tsx`:** Right column (~260px). Content varies:
- **Request chat:** Request status (dropdown to change), service type, university, file list with download, "Confirm Payment" button (if awaiting_payment), CRM sync badge, link to full request detail.
- **Teacher-student chat:** Teacher name, student name, next lesson date, meeting link status.

### 6.3 — Create inbox page

**`app/frontend/pages/inbox/Index.tsx`:**
- Desktop: 3-column grid layout
- Mobile (<768px): show ConversationList only → tap → full-screen ChatPanel with collapsible ContextPanel → back button (see `docs/14_COORDINATOR_WORKSPACE.md` mobile wireframes)
- Real-time: subscribe to ConversationChannel for each visible conversation (or use NotificationChannel for unread updates)
- Status changes and payment confirmation directly from ContextPanel (reuse logic from Show page)

### 6.4 — Create TeachersController

**`app/controllers/teachers_controller.rb`:**
```ruby
class TeachersController < InertiaController
  def index
    authorize :teacher
    teachers = User.joins(:roles).where(roles: { name: "teacher" })
      .includes(:teacher_profile, teacher_student_links: :student)
    render inertia: "teachers/Index", props: {
      teachers: teachers.map { |t| teacher_json(t) }
    }
  end

  def update
    teacher = User.find(params[:id])
    authorize teacher, :update?
    teacher.teacher_profile.update!(teacher_params)
    redirect_to teachers_path, notice: t("flash.teacher_updated")
  end

  def assign_student
    teacher = User.find(params[:id])
    authorize teacher, :assign_student?
    TeacherStudent.create!(teacher_id: teacher.id, student_id: params[:student_id],
                           assigned_by: current_user.id)
    # Auto-create teacher-student conversation
    ts = TeacherStudent.find_by(teacher_id: teacher.id, student_id: params[:student_id])
    Conversation.find_or_create_by!(teacher_student_id: ts.id)
    redirect_to teachers_path, notice: t("flash.student_assigned")
  end

  def remove_student
    teacher = User.find(params[:id])
    authorize teacher, :remove_student?
    TeacherStudent.find_by!(teacher_id: teacher.id, student_id: params[:student_id]).destroy!
    redirect_to teachers_path, notice: t("flash.student_removed")
  end
end
```

### 6.5 — Create teacher components

**`app/frontend/components/teachers/TeacherCard.tsx`:** Card per wireframe in `docs/14_COORDINATOR_WORKSPACE.md`. Shows: name, avatar, level, rate (visible to coordinator/admin), student count, lessons this week, permanent link, list of student name badges, action buttons.

**`app/frontend/components/teachers/AssignStudentDialog.tsx`:** Dialog with search input, list of available students (not already assigned), checkbox select, "Assign" button.

**`app/frontend/components/teachers/EditTeacherDialog.tsx`:** Dialog: level dropdown (junior/mid/senior/native), hourly_rate input, bio textarea, permanent_meeting_link input. Save via `router.patch`.

### 6.6 — Create teachers page

**`app/frontend/pages/teachers/Index.tsx`:** Grid of TeacherCards. Mobile: single column. "+ Add Teacher" button (assigns teacher role to existing user via dialog).

### 6.7 — Update routes

```ruby
resources :inbox, only: [:index, :show]
resources :teachers, only: [:index, :update] do
  member do
    post :assign_student
    delete :remove_student
  end
end
```

### 6.8 — Write tests

**`test/controllers/inbox_controller_test.rb`:**
```ruby
test "coordinator can access inbox" do
  sign_in users(:coordinator_maria)
  get inbox_index_path
  assert_response :ok
end

test "student cannot access inbox" do
  sign_in users(:student_ana)
  get inbox_index_path
  assert_response :forbidden
end
```

**`test/controllers/teachers_controller_test.rb`:**
```ruby
test "coordinator can list teachers" do
  sign_in users(:coordinator_maria)
  get teachers_path
  assert_response :ok
end

test "coordinator can assign student to teacher" do
  sign_in users(:coordinator_maria)
  assert_difference "TeacherStudent.count", 1 do
    post assign_student_teacher_path(users(:teacher_ivan)), params: { student_id: users(:student_pedro).id }
  end
end

test "coordinator can remove student from teacher" do
  sign_in users(:coordinator_maria)
  assert_difference "TeacherStudent.count", -1 do
    delete remove_student_teacher_path(users(:teacher_ivan)), params: { student_id: users(:student_ana).id }
  end
end

test "student cannot access teachers page" do
  sign_in users(:student_ana)
  get teachers_path
  assert_response :forbidden
end
```

### Done criteria for Step 6

- [ ] `bin/rails test` — all inbox + teacher tests pass (minimum 5 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Coordinator sees inbox with all conversations
- [ ] 3-column layout renders on desktop
- [ ] Mobile: conversation list → full-screen chat → back
- [ ] Filters work: All / Requests / Teacher chats / Unread
- [ ] Context panel shows correct info per conversation type
- [ ] Status change from inbox context panel works
- [ ] Payment confirmation from inbox context panel works
- [ ] Teacher cards show correct data (name, level, students, lessons)
- [ ] Student assignment and removal work
- [ ] Teacher profile editing works

---

## Step 7: Teachers & Lessons (Calendar)

**Goal:** Teachers see weekly calendar. Students see lesson list. Coordinators/admins see all lessons table. Lessons: CRUD with validation (no past dates, no double-booking).

### 7.1 — Create LessonsController

**`app/controllers/lessons_controller.rb`:**
- `index`:
  - Teacher → render `calendar/Index` with week data
  - Student → render `lessons/Index` with upcoming + past lists
  - Coordinator/Admin → redirect to `/admin/lessons`
- `create` — validate: future date, no overlap for teacher, student assigned to teacher. Create lesson + notify student.
- `show` — lesson detail
- `update` — change meeting_link, status (completed/cancelled), notes
- `destroy` — cancel lesson (set status to "cancelled")

### 7.2 — Create calendar components

Per wireframes in `docs/13_LESSONS_CALENDAR.md`:

**`app/frontend/components/lessons/WeekGrid.tsx`:** CSS Grid: 5 columns (Mon–Fri), time rows (8:00–20:00). LessonCards placed at correct positions. Week navigation (< > buttons). Desktop only (`hidden lg:block`).

**`app/frontend/components/lessons/DayView.tsx`:** Mobile view. Date picker + list of lessons for selected day. Mobile only (`lg:hidden`).

**`app/frontend/components/lessons/LessonCard.tsx`:** Small card in grid slot: student name, time, duration. Color: green (link ready), yellow (link needed), gray (completed).

**`app/frontend/components/lessons/LessonDialog.tsx`:** Create/edit dialog. Fields: teacher (pre-filled for teacher), student (dropdown of assigned students only), date, time, duration (30/45/60/90 min), meeting link (optional — hint: "leave empty for teacher's permanent link"). Uses `useForm`.

**`app/frontend/components/lessons/LessonList.tsx`:** Student view. Two sections: "Upcoming" (cards with join link button) and "Past" (completed cards). Join link resolves `effective_meeting_link`.

### 7.3 — Create pages

**`app/frontend/pages/calendar/Index.tsx`:** Teacher's calendar. WeekGrid on desktop, DayView on mobile. "+ New Lesson" button. Click lesson → LessonDialog (edit mode).

**`app/frontend/pages/lessons/Index.tsx`:** Student's lesson list. LessonList component. "Join Lesson" opens meeting link in new tab.

### 7.4 — Create Admin::LessonsController

**`app/controllers/admin/lessons_controller.rb`:**
- `index` — all lessons with filters. Coordinator + super_admin only.
- Props: lessons array, filter options (teachers list, students list)

**`app/frontend/pages/admin/Lessons.tsx`:** Table of all lessons. Filters: Teacher, Student, Status, Date range. Desktop: table, Mobile: cards.

### 7.5 — Update routes

```ruby
resources :lessons, only: [:index, :create, :show, :update, :destroy]
namespace :admin do
  resources :lessons, only: [:index]
end
```

### 7.6 — Write tests

**`test/controllers/lessons_controller_test.rb`:**
```ruby
test "teacher sees own calendar" do
  sign_in users(:teacher_ivan)
  get lessons_path
  assert_response :ok
end

test "student sees own lessons" do
  sign_in users(:student_ana)
  get lessons_path
  assert_response :ok
end

test "teacher can create lesson for assigned student" do
  sign_in users(:teacher_ivan)
  assert_difference "Lesson.count", 1 do
    post lessons_path, params: {
      lesson: { student_id: users(:student_ana).id, scheduled_at: 1.week.from_now,
                duration_minutes: 60 }
    }
  end
end

test "teacher cannot create lesson for non-assigned student" do
  sign_in users(:teacher_ivan)
  assert_no_difference "Lesson.count" do
    post lessons_path, params: {
      lesson: { student_id: users(:student_pedro).id, scheduled_at: 1.week.from_now,
                duration_minutes: 60 }
    }
  end
end

test "cannot create lesson in the past" do
  sign_in users(:teacher_ivan)
  assert_no_difference "Lesson.count" do
    post lessons_path, params: {
      lesson: { student_id: users(:student_ana).id, scheduled_at: 1.day.ago,
                duration_minutes: 60 }
    }
  end
end

test "teacher can mark lesson completed" do
  sign_in users(:teacher_ivan)
  lesson = lessons(:ivan_ana_lesson)
  patch lesson_path(lesson), params: { lesson: { status: "completed", notes: "Good progress" } }
  assert_equal "completed", lesson.reload.status
end

test "student cannot create lessons" do
  sign_in users(:student_ana)
  assert_no_difference "Lesson.count" do
    post lessons_path, params: {
      lesson: { teacher_id: users(:teacher_ivan).id, student_id: users(:student_ana).id,
                scheduled_at: 1.week.from_now, duration_minutes: 60 }
    }
  end
end
```

### Done criteria for Step 7

- [ ] `bin/rails test` — all lesson tests pass (minimum 7 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Teacher sees weekly calendar with lesson slots
- [ ] Teacher can create lesson via dialog → appears in calendar
- [ ] Student sees upcoming lessons with "Join Lesson" button
- [ ] "Join Lesson" opens correct meeting link (lesson-specific or teacher permanent)
- [ ] Mobile: teacher sees day view, student sees card list
- [ ] Coordinator/admin sees all lessons table with filters
- [ ] Cannot create lesson in the past
- [ ] Cannot double-book teacher

---

## Step 8: Notifications (In-app + Email + Telegram)

**Goal:** In-app bell with real-time count. Email notifications (default on). Telegram Bot notifications (opt-in via profile button). Notification preferences. All triggered by background jobs. **Telegram is free — no providers, no message templates, no cost.**

### 8.1 — Add Telegram fields to users table

Create migration:
```ruby
class AddTelegramAndNotificationPrefsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :telegram_chat_id, :string
    add_column :users, :telegram_link_token, :string
    add_column :users, :notification_telegram, :boolean, null: false, default: false
    add_column :users, :notification_email, :boolean, null: false, default: true
  end
end
```

### 8.2 — Create TelegramClient service

**`app/services/telegram_client.rb`:**
```ruby
class TelegramClient
  API_BASE = "https://api.telegram.org/bot#{Rails.application.credentials.dig(:telegram, :bot_token)}"

  def initialize
    @conn = Faraday.new(url: API_BASE) do |f|
      f.request :json
      f.response :json
      f.request :retry, max: 2, interval: 1
    end
  end

  def send_message(chat_id, text)
    response = @conn.post("/sendMessage", {
      chat_id: chat_id,
      text: text,
      parse_mode: "HTML"
    })
    Rails.logger.warn("Telegram API error: #{response.body}") unless response.success?
    response
  end
end
```

No gem needed — reuses Faraday (already in Gemfile for AmoCRM).

### 8.3 — Create Telegram webhook controller

**`app/controllers/telegram_controller.rb`:**
```ruby
class TelegramController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_after_action :verify_authorized

  def webhook
    # Verify webhook secret from Telegram
    secret = request.headers["X-Telegram-Bot-Api-Secret-Token"]
    unless secret == Rails.application.credentials.dig(:telegram, :webhook_secret)
      return head :forbidden
    end

    data = JSON.parse(request.body.read)
    handle_message(data["message"]) if data["message"]
    head :ok
  end

  private

  def handle_message(message)
    text = message["text"]
    chat_id = message["chat"]["id"]

    if text&.start_with?("/start")
      user_token = text.split(" ")[1]
      user = User.find_by(telegram_link_token: user_token)
      if user
        user.update!(telegram_chat_id: chat_id.to_s, notification_telegram: true, telegram_link_token: nil)
        TelegramClient.new.send_message(chat_id, "✅ ¡Telegram conectado! Recibirás notificaciones aquí.\n\n✅ Telegram connected! You will receive notifications here.\n\n✅ Telegram подключён! Уведомления будут приходить сюда.")
      else
        TelegramClient.new.send_message(chat_id, "❌ Invalid link. Use the button in your profile / Usa el botón en tu perfil.")
      end
    end
  end
end
```

### 8.4 — Create NotificationsController

**`app/controllers/notifications_controller.rb`:**
- `index` — user's notifications, newest first. Render `notifications/Index`.
- `update` — mark single as read (`notification.mark_as_read!`)
- `mark_all_read` — `current_user.notifications.unread.update_all(read_at: Time.current)`
- Authorize: user can only see/update own notifications

### 8.5 — Create NotificationJob (multi-channel)

**`app/jobs/notification_job.rb`:**
```ruby
class NotificationJob < ApplicationJob
  queue_as :default

  def perform(user_id:, title:, body: nil, notifiable:)
    user = User.find(user_id)

    # 1. Always create in-app notification
    notification = Notification.create!(
      user_id: user_id, title: title, body: body, notifiable: notifiable
    )

    # 2. Always broadcast to Action Cable (real-time bell update)
    NotificationChannel.broadcast_to(user, {
      id: notification.id, title: title, body: body,
      createdAt: notification.created_at.iso8601,
      unreadCount: user.notifications.unread.count
    })

    # 3. Email (if user has it enabled — default: true)
    if user.notification_email?
      NotificationMailer.notify(notification).deliver_later
    end

    # 4. Telegram (if user connected and enabled)
    if user.notification_telegram? && user.telegram_chat_id.present?
      TelegramClient.new.send_message(
        user.telegram_chat_id,
        "<b>#{title}</b>\n#{body}"
      )
    end
  end
end
```

### 8.6 — Create NotificationMailer

**`app/mailers/notification_mailer.rb`:**
- `notify(notification)` — generic email with title + body
- Specific methods: `new_request`, `new_message`, `status_changed`, `payment_confirmed`
- All subjects via Rails I18n (use recipient's locale)

### 8.7 — Wire up notification triggers

Add `NotificationJob.perform_later(...)` calls to:
- **`HomologationRequestsController#create`** (when submitted) → notify all coordinators
- **`MessagesController#create`** → notify other conversation participants
- **`HomologationRequestsController#update`** (status change) → notify student
- **`HomologationRequestsController#confirm_payment`** → notify student
- **`LessonsController#create`** → notify student
- **`LessonsController#update`** (cancelled) → notify student + teacher

### 8.8 — Add "Connect Telegram" to profile page

**Update `app/controllers/profiles_controller.rb`:**
Add action `connect_telegram`:
```ruby
def connect_telegram
  token = SecureRandom.hex(16)
  current_user.update!(telegram_link_token: token)
  bot_name = Rails.application.credentials.dig(:telegram, :bot_name)
  redirect_to "https://t.me/#{bot_name}?start=#{token}", allow_other_host: true
end

def disconnect_telegram
  current_user.update!(telegram_chat_id: nil, notification_telegram: false)
  redirect_to edit_profile_path, notice: t("flash.telegram_disconnected")
end
```

**Update routes:**
```ruby
resource :profile, only: [:show, :edit, :update] do
  post :connect_telegram
  delete :disconnect_telegram
end
```

**Update `app/frontend/pages/profile/Edit.tsx`:**
- Section: "Notification Preferences"
- Toggle: "Email notifications" (checked by default)
- Button: "Connect Telegram" → if not connected, opens bot link. If connected, show "Telegram connected ✅" + "Disconnect" button.
- Toggle: "Telegram notifications" (visible only when connected, enabled when connected)

### 8.9 — Update NotificationBell component

Update `app/frontend/components/common/NotificationBell.tsx`:
- Subscribe to `NotificationChannel` via `useChannel`
- On receive: update unread count, optionally show toast (sonner)
- Click: dropdown with 5 latest notifications
- "View all" link → `routes.notifications`

### 8.10 — Create notification page

**`app/frontend/pages/notifications/Index.tsx`:**
- List of all notifications (newest first)
- Each: title, body, time (FormattedDate), read/unread indicator
- Click → navigate to related page (request, conversation, lesson)
- "Mark all as read" button
- Empty state: `t("notifications.no_notifications")`

### 8.11 — Update routes

```ruby
resources :notifications, only: [:index, :update] do
  collection do
    post :mark_all_read
  end
end
post "/telegram/webhook", to: "telegram#webhook"
```

### 8.12 — Add i18n keys for notifications/telegram

Add to all 3 locale files (es.json, en.json, ru.json):
```json
{
  "profile": {
    "notifications_section": "Notification preferences",
    "email_notifications": "Email notifications",
    "telegram_notifications": "Telegram notifications",
    "connect_telegram": "Connect Telegram",
    "disconnect_telegram": "Disconnect Telegram",
    "telegram_connected": "Telegram connected",
    "telegram_hint": "Receive instant notifications in Telegram — free"
  }
}
```

### 8.13 — Add credentials

```bash
bin/rails credentials:edit
```
```yaml
telegram:
  bot_token: "123456:ABC-DEF..."  # From @BotFather
  bot_name: "YourHomologationBot"  # Without @
  webhook_secret: "random_secret_string"
```

One-time setup after deploy:
```bash
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -d "url=https://yourapp.com/telegram/webhook&secret_token=random_secret_string"
```

### 8.14 — Write tests

**`test/controllers/notifications_controller_test.rb`:**
```ruby
test "user sees own notifications" do
  sign_in users(:student_ana)
  get notifications_path
  assert_response :ok
end

test "mark as read works" do
  sign_in users(:student_ana)
  notification = notifications(:ana_notification)
  patch notification_path(notification)
  assert notification.reload.read?
end

test "mark all as read works" do
  sign_in users(:student_ana)
  post mark_all_read_notifications_path
  assert_equal 0, users(:student_ana).notifications.unread.count
end
```

**`test/jobs/notification_job_test.rb`:**
```ruby
test "creates notification record" do
  assert_difference "Notification.count", 1 do
    NotificationJob.perform_now(
      user_id: users(:student_ana).id,
      title: "Test notification",
      notifiable: homologation_requests(:ana_equivalencia)
    )
  end
end

test "sends telegram when user has it enabled" do
  WebMock.enable!
  stub_request(:post, /api.telegram.org/).to_return(status: 200, body: '{"ok":true}')

  user = users(:student_ana)
  user.update!(telegram_chat_id: "123456", notification_telegram: true)

  NotificationJob.perform_now(
    user_id: user.id,
    title: "Test",
    notifiable: homologation_requests(:ana_equivalencia)
  )

  assert_requested :post, /api.telegram.org\/bot.*\/sendMessage/
  WebMock.disable!
end

test "does not send telegram when user has it disabled" do
  WebMock.enable!

  user = users(:student_ana)
  user.update!(telegram_chat_id: nil, notification_telegram: false)

  NotificationJob.perform_now(
    user_id: user.id,
    title: "Test",
    notifiable: homologation_requests(:ana_equivalencia)
  )

  assert_not_requested :post, /api.telegram.org/
  WebMock.disable!
end
```

**`test/controllers/telegram_controller_test.rb`:**
```ruby
test "webhook links telegram to user" do
  user = users(:student_ana)
  user.update!(telegram_link_token: "abc123")

  post "/telegram/webhook",
    params: { message: { text: "/start abc123", chat: { id: 999 } } }.to_json,
    headers: {
      "Content-Type" => "application/json",
      "X-Telegram-Bot-Api-Secret-Token" => Rails.application.credentials.dig(:telegram, :webhook_secret)
    }

  assert_response :ok
  assert_equal "999", user.reload.telegram_chat_id
  assert user.notification_telegram?
  assert_nil user.telegram_link_token  # Token consumed
end

test "webhook rejects invalid secret" do
  post "/telegram/webhook",
    params: { message: { text: "/start abc", chat: { id: 1 } } }.to_json,
    headers: { "Content-Type" => "application/json", "X-Telegram-Bot-Api-Secret-Token" => "wrong" }

  assert_response :forbidden
end
```

**`test/controllers/profiles_controller_test.rb`** (add to existing):
```ruby
test "connect_telegram generates token and redirects to bot" do
  sign_in users(:student_ana)
  post connect_telegram_profile_path
  assert users(:student_ana).reload.telegram_link_token.present?
  assert_response :redirect
end

test "disconnect_telegram clears chat_id" do
  user = users(:student_ana)
  user.update!(telegram_chat_id: "123", notification_telegram: true)
  sign_in user
  delete disconnect_telegram_profile_path
  assert_nil user.reload.telegram_chat_id
  refute user.notification_telegram?
end
```

### Done criteria for Step 8

- [ ] `bin/rails test` — all notification tests pass (minimum 8 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Bell icon shows correct unread count
- [ ] New notification appears in real-time (count updates without refresh)
- [ ] Click notification → navigates to correct page
- [ ] Mark as read / mark all works
- [ ] Email sent for new request submission (check logs)
- [ ] Emails use correct locale for recipient
- [ ] "Connect Telegram" button in profile generates link and opens bot
- [ ] After /start in bot → `telegram_chat_id` saved to user
- [ ] Telegram notification sent when user has it enabled
- [ ] Telegram notification NOT sent when disabled or no chat_id
- [ ] "Disconnect Telegram" clears chat_id and disables toggle
- [ ] Notification preferences (email/telegram toggles) save correctly

---

## Step 9: AmoCRM Integration

**Goal:** Payment confirmation triggers background sync to AmoCRM: Contact + Lead + files. Admin sees sync status. Failed syncs can be retried. Status changes after payment update Lead stage.

### 9.1 — Create AmoCrmClient service

**`app/services/amo_crm_client.rb`:** Full implementation from `docs/06_AMOCRM_INTEGRATION.md`.

Key methods:
- `find_or_create_contact(user)` — search by email, create if not found, update if exists. Include WhatsApp as IM field.
- `create_lead(request, contact_id)` — create in Homologation pipeline with all 17+ custom fields mapped per docs.
- `update_lead_status(lead_id, status_id)` — PATCH lead status.
- Token refresh via `AmoCrmToken.current`.
- Faraday with retry on 429/500/502/503.
- Field IDs from `Rails.application.credentials.dig(:amo_crm, :field_ids)`.

### 9.2 — Create AmoCrmSyncJob

**`app/jobs/amo_crm_sync_job.rb`:** From `docs/06_AMOCRM_INTEGRATION.md`:
1. Find or create Contact → save `amo_crm_contact_id` on User
2. Create Lead → save `amo_crm_lead_id` + `amo_crm_synced_at` on Request
3. Upload files (application + originals) to Lead
4. On error: save `amo_crm_sync_error`, re-raise for retry
5. `retry_on StandardError, wait: :polynomially_longer, attempts: 3`

### 9.3 — Create AmoCrmStatusSyncJob

**`app/jobs/amo_crm_status_sync_job.rb`:**
- Triggered after `transition_to!` for post-payment statuses
- Maps app status → AmoCRM pipeline stage:
  - `payment_confirmed` → "New" (lead already created)
  - `in_progress` → "In Progress"
  - `resolved` → "Won/Completed"
  - `closed` → "Lost"
- Only runs if `amo_crm_lead_id` is present

### 9.4 — Wire up status sync

In `HomologationRequest#transition_to!`, after status update:
```ruby
if amo_crm_lead_id.present? && %w[in_progress resolved closed].include?(new_status)
  AmoCrmStatusSyncJob.perform_later(id)
end
```

### 9.5 — Add retry endpoint

In `HomologationRequestsController`, add ability to retry sync:
- If `confirm_payment` is called with `retry: true`, re-enqueue `AmoCrmSyncJob`

### 9.6 — Update CRM sync UI

Already partially built in Step 4. Ensure:
- Request Show page shows: sync status badge, synced_at timestamp, error message, "Retry" button
- Inbox context panel shows same info
- Admin dashboard shows sync summary (count of failed syncs)

### 9.7 — Write tests (mock HTTP with WebMock)

**`test/services/amo_crm_client_test.rb`:**
```ruby
setup do
  WebMock.enable!
end

teardown do
  WebMock.disable!
end

test "create_contact sends correct payload" do
  stub_request(:get, /api\/v4\/contacts/).to_return(body: { _embedded: { contacts: [] } }.to_json)
  stub_request(:post, /api\/v4\/contacts/).to_return(
    body: { _embedded: { contacts: [{ id: 999 }] } }.to_json
  )
  client = AmoCrmClient.new
  contact_id = client.find_or_create_contact(users(:student_ana))
  assert_equal 999, contact_id
end

test "create_lead sends correct payload" do
  stub_request(:post, /api\/v4\/leads/).to_return(
    body: { _embedded: { leads: [{ id: 888 }] } }.to_json
  )
  client = AmoCrmClient.new
  lead_id = client.create_lead(homologation_requests(:ana_equivalencia), 999)
  assert_equal 888, lead_id
end
```

**`test/jobs/amo_crm_sync_job_test.rb`:**
```ruby
test "saves amo_crm_lead_id on success" do
  WebMock.enable!
  # Stub all AmoCRM API calls...
  AmoCrmSyncJob.perform_now(homologation_requests(:ana_equivalencia).id)
  assert homologation_requests(:ana_equivalencia).reload.amo_crm_lead_id.present?
  WebMock.disable!
end

test "saves sync error on failure" do
  WebMock.enable!
  stub_request(:any, /amocrm/).to_return(status: 500, body: "Server Error")
  assert_raises(StandardError) do
    AmoCrmSyncJob.perform_now(homologation_requests(:ana_equivalencia).id)
  end
  assert homologation_requests(:ana_equivalencia).reload.amo_crm_sync_error.present?
  WebMock.disable!
end
```

### Done criteria for Step 9

- [ ] `bin/rails test` — all AmoCRM tests pass (minimum 4 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Confirm payment enqueues AmoCrmSyncJob (check `SolidQueue` in console)
- [ ] Sync status visible on request detail page and inbox context panel
- [ ] Error state shows error message + "Retry" button
- [ ] Retry button re-enqueues the sync job
- [ ] Status changes after payment trigger AmoCrmStatusSyncJob
- [ ] Token refresh logic works (tested with mock)

---

## Step 10: Admin Dashboard & User Management

**Goal:** Super admin dashboard with stats + charts. User CRUD with role management. Privacy policy page. This completes all features.

### 10.1 — Create Admin::DashboardController

**`app/controllers/admin/dashboard_controller.rb`:**
- `index` — super_admin only (Pundit)
- Props:
  ```ruby
  {
    stats: {
      totalRequests: HomologationRequest.count,
      openRequests: HomologationRequest.where.not(status: %w[resolved closed draft]).count,
      awaitingPayment: HomologationRequest.where(status: "awaiting_payment").count,
      resolved: HomologationRequest.where(status: "resolved").count,
      totalUsers: User.count,
      totalTeachers: User.joins(:roles).where(roles: { name: "teacher" }).count,
    },
    requestsByMonth: HomologationRequest.group_by_month(:created_at, last: 12).count,
    requestsByStatus: HomologationRequest.group(:status).count,
    recentRequests: HomologationRequest.includes(:user).order(created_at: :desc).limit(10).map { |r| request_list_json(r) },
    failedSyncs: HomologationRequest.where.not(amo_crm_sync_error: nil).count,
  }
  ```
  Note: `group_by_month` may need the `groupdate` gem, or use raw SQL grouping by month.

### 10.2 — Create Admin::UsersController

**`app/controllers/admin/users_controller.rb`:**
- Full CRUD: index, new, create, show, edit, update, destroy (soft-deactivate)
- `assign_role` — `POST /admin/users/:id/assign_role` with `role_name` param
- `remove_role` — `DELETE /admin/users/:id/remove_role` with `role_name` param
- All actions: super_admin only (Pundit)

### 10.3 — Create admin pages

**`app/frontend/pages/admin/Dashboard.tsx`:**
- 4 StatsCards: Total requests, Open, Awaiting Payment, Resolved
- Line chart: Requests over time (Recharts `LineChart` with `requestsByMonth` data)
- Pie/Bar chart: Requests by status (Recharts `PieChart` or `BarChart`)
- Recent requests table (top 10)
- Failed syncs count with link to filtered list

**`app/frontend/components/admin/StatsCard.tsx`:** Reusable card: icon, label, value. Use lucide-react icons.

**`app/frontend/components/admin/Charts.tsx`:** Recharts wrapper. Accept data as props, render responsive charts.

**`app/frontend/pages/admin/Users.tsx`:**
- Table: Name, Email, Roles (badges), Created at, Actions
- "+ Add User" button → dialog with: name, email, password, role checkboxes
- Edit button → dialog (same form, pre-filled)
- Role badges with X to remove role
- "+ Role" button to assign additional role
- Deactivate button (with confirmation dialog)
- Mobile: card view instead of table

### 10.4 — Create PagesController

**`app/controllers/pages_controller.rb`:**
```ruby
class PagesController < ApplicationController
  skip_after_action :verify_authorized

  def privacy_policy
    render inertia: "PrivacyPolicy"
  end
end
```

**`app/frontend/pages/PrivacyPolicy.tsx`:** Static content. Three sections: what data we collect, transfer to AmoCRM, contact for deletion. All text via `t()` or hard-coded in 3 languages.

### 10.5 — Update routes

```ruby
get "privacy-policy", to: "pages#privacy_policy"

namespace :admin do
  root "dashboard#index"
  resources :users do
    member do
      post :assign_role
      delete :remove_role
    end
  end
  resources :lessons, only: [:index]
end
```

### 10.6 — Write tests

**`test/controllers/admin/dashboard_controller_test.rb`:**
```ruby
test "super admin can access dashboard" do
  sign_in users(:super_admin_boss)
  get admin_root_path
  assert_response :ok
end

test "coordinator cannot access admin dashboard" do
  sign_in users(:coordinator_maria)
  get admin_root_path
  assert_response :forbidden
end

test "student cannot access admin dashboard" do
  sign_in users(:student_ana)
  get admin_root_path
  assert_response :forbidden
end
```

**`test/controllers/admin/users_controller_test.rb`:**
```ruby
test "super admin can list users" do
  sign_in users(:super_admin_boss)
  get admin_users_path
  assert_response :ok
end

test "super admin can create user" do
  sign_in users(:super_admin_boss)
  assert_difference "User.count", 1 do
    post admin_users_path, params: {
      user: { name: "New User", email_address: "new@test.com", password: "password123" }
    }
  end
end

test "super admin can assign role" do
  sign_in users(:super_admin_boss)
  post assign_role_admin_user_path(users(:student_ana)), params: { role_name: "coordinator" }
  assert users(:student_ana).reload.coordinator?
end

test "super admin can remove role" do
  sign_in users(:super_admin_boss)
  delete remove_role_admin_user_path(users(:student_ana)), params: { role_name: "student" }
  refute users(:student_ana).reload.student?
end

test "coordinator cannot manage users" do
  sign_in users(:coordinator_maria)
  get admin_users_path
  assert_response :forbidden
end
```

### Done criteria for Step 10

- [ ] `bin/rails test` — all admin tests pass (minimum 7 tests)
- [ ] `npm run check` — TypeScript compiles
- [ ] Admin dashboard shows correct stat numbers
- [ ] Charts render with real data from database
- [ ] User list shows all users with roles
- [ ] User creation works (with password)
- [ ] Role assignment / removal works
- [ ] Only super_admin can access admin pages
- [ ] Privacy policy page renders at `/privacy-policy`
- [ ] Privacy policy accessible without authentication

---

## Final Verification Checklist

After all steps complete, run the full verification:

```bash
# All tests pass
bin/rails test

# TypeScript compiles with no errors
npm run check

# Security scan clean
bundle exec brakeman --no-pager
bundle exec bundler-audit check

# Database is clean (all migrations applied)
bin/rails db:migrate:status

# App boots without errors
bin/rails server
```

### Feature verification matrix

| Feature | Test file | Manual check |
|---|---|---|
| Register + Login | `sessions_controller_test`, `registrations_controller_test` | Register, login, logout |
| OAuth (Google) | Manual only | "Continue with Google" button |
| Profile completion | `profiles_controller_test` | New user → redirected to profile |
| Submit request | `homologation_requests_controller_test` | Create request with files |
| Status transitions | `homologation_request_test` | Change status as coordinator |
| Real-time chat | `messages_controller_test` | Send message, see it appear instantly |
| File upload/download | `homologation_requests_controller_test` | Upload + download file |
| Coordinator inbox | `inbox_controller_test` | 3-column layout, filters |
| Teacher management | `teachers_controller_test` | Assign/remove student |
| Teacher calendar | `lessons_controller_test` | Week view, create lesson |
| Student lessons | `lessons_controller_test` | List view, join link |
| Notifications | `notifications_controller_test`, `notification_job_test` | Bell icon, real-time |
| AmoCRM sync | `amo_crm_sync_job_test`, `amo_crm_client_test` | Confirm payment → check job |
| Admin dashboard | `admin/dashboard_controller_test` | Stats + charts |
| User management | `admin/users_controller_test` | CRUD + roles |
| i18n (3 languages) | Manual | Switch language, verify all text |
| Mobile responsive | Manual | Test at 360px width |
| Privacy policy | Manual | Page renders |

### Security checklist

- [ ] `encrypts` on PII fields (phone, whatsapp, identity_card, passport, guardian_phone, guardian_whatsapp)
- [ ] `rate_limit` on auth controllers (sessions: 10/3min, registrations: 5/1hr)
- [ ] `authorize` in every controller action
- [ ] `after_action :verify_authorized` in ApplicationController
- [ ] PII filtered from logs (config/initializers/filter_parameter_logging.rb)
- [ ] Files served through controller (Pundit check before download)
- [ ] No `dangerouslySetInnerHTML` anywhere
- [ ] No hardcoded secrets (all in `bin/rails credentials:edit`)
- [ ] Privacy policy checkbox on register + request forms
- [ ] CSRF protection on OAuth (omniauth-rails_csrf_protection gem)
- [ ] `force_ssl = true` in production
- [ ] `brakeman` passes with no warnings

---

## Dependency Graph

```
Step 0 (Foundation)
  └─→ Step 1 (Database & Models)
        └─→ Step 2 (Authentication)
              └─→ Step 3 (Profile)
                    └─→ Step 4 (Requests + Files + Dashboard)
                          ├─→ Step 5 (Chat / Action Cable)
                          │     └─→ Step 6 (Coordinator Workspace)
                          ├─→ Step 7 (Teachers & Lessons)
                          ├─→ Step 9 (AmoCRM Integration)
                          └─→ Step 8 (Notifications) *depends on 5+6+7
                                └─→ Step 10 (Admin Dashboard)
```

**Parallelization** (after Step 4 is done):
- Steps 5, 7, and 9 are independent of each other
- Step 6 requires Step 5 (chat components)
- Step 8 requires Steps 5+6+7 (notification triggers)
- Step 10 can start after Step 9

---

## Scope Summary

| Step | New files (approx) | Tests (approx) | Complexity |
|---|---|---|---|
| 0 — Foundation | ~20 | 0 | Low — setup & config |
| 1 — Database & Models | ~25 | ~15 | Medium — migrations, models, fixtures |
| 2 — Authentication | ~8 | ~8 | Medium — generator + OAuth + Inertia |
| 3 — Profile | ~4 | ~5 | Low — one controller, one page |
| 4 — Requests + Dashboard | ~15 | ~12 | High — CRUD, files, status machine, dashboard |
| 5 — Chat | ~10 | ~8 | High — Action Cable, real-time, hooks |
| 6 — Coordinator Workspace | ~12 | ~5 | High — 3-column inbox, teacher mgmt |
| 7 — Lessons & Calendar | ~12 | ~8 | Medium — calendar UI, CRUD, validation |
| 8 — Notifications | ~8 | ~4 | Medium — jobs, mailers, real-time bell |
| 9 — AmoCRM | ~6 | ~4 | Medium — service, jobs, WebMock tests |
| 10 — Admin Dashboard | ~10 | ~7 | Medium — stats, charts, user CRUD |

**Total: ~130 files, ~76 tests, 11 steps**

---

## Gems (final — 10 additions to Gemfile)

```ruby
gem "bcrypt", "~> 3.1.7"
gem "omniauth"
gem "omniauth-google-oauth2"
gem "omniauth-apple"
gem "omniauth-rails_csrf_protection"
gem "pundit"
gem "faraday"
gem "faraday-multipart"
gem "active_storage_validations"
gem "inertia_rails"

# Test group
gem "webmock"
```

## NPM Packages (final — 9 additions)

```bash
npm install react-i18next i18next i18next-browser-languagedetector
npm install react-dropzone @rails/activestorage @rails/actioncable
npm install recharts lucide-react date-fns
```

## External Services

| Service | Purpose | Cost | Setup |
|---|---|---|---|
| Google OAuth | Social login | Free | Google Cloud Console → credentials |
| Apple OAuth | Social login | Free | Apple Developer → Services IDs |
| AmoCRM API | CRM sync after payment | Included in AmoCRM plan | Integration in AmoCRM settings |
| Telegram Bot API | Push notifications | **Free forever** | @BotFather → create bot → set webhook |
| Stripe | Invoicing (future) | Per transaction | Stripe Dashboard |
