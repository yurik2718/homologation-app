# Features & User Stories

## Phase 1: Core (MVP)

### F1. Authentication
- **F1.1** User can register with email + password
- **F1.2** User can log in with email + password
- **F1.3** User can log in via Google OAuth 2.0
- **F1.4** User can log in via Apple ID
- **F1.5** User can reset password via email
- **F1.6** User can log out
- **F1.7** Session management (Rails 8 built-in sessions table)

**Implementation:**
```bash
bin/rails generate authentication          # Built-in generator
# Then add: omniauth, omniauth-google-oauth2, omniauth-apple gems
```

### F2. Registration Profile (Step 1 — collected once)
After registration, student fills a short profile:
- **F2.1** Name and Surname
- **F2.2** WhatsApp number (required — used for AmoCRM contact)
- **F2.3** Phone (optional, if different from WhatsApp)
- **F2.4** Birthday
- **F2.5** Country of origin
- **F2.6** "I am under 18" checkbox → if checked, show guardian fields:
  - Guardian name (required)
  - Guardian email (required — Stripe invoices go here)
  - Guardian phone
  - Guardian WhatsApp (required — AmoCRM uses this instead of student's)

These fields are saved in `users` table and pre-filled in future requests.

**Minor logic:**
- `is_minor` auto-calculated from birthday OR manual checkbox
- If minor → Stripe invoices → `guardian_email`
- If minor → AmoCRM WhatsApp → `guardian_whatsapp`
- If minor → notifications duplicated to `guardian_email`
- If minor → GDPR consent signed by guardian

### F3. Submit a Homologation Request (Step 2 — per request)
- **F3.1** Student sees "Submit a request" form
- **F3.2** Form fields (12 fields total):

| #  | Field                    | Type             | Required | Notes                        |
|----|--------------------------|------------------|----------|------------------------------|
| 1  | Name and Surname         | text (pre-filled)| yes      | From profile                 |
| 2  | Service Requested        | dropdown         | yes      | Equivalencia / Invoice / Informe / Other |
| 3  | Subject                  | text             | yes      | Short title for the request  |
| 4  | Description              | rich text        | no       | Details (Tiptap editor)      |
| 5  | Identity Card / Passport | text             | yes      | DNI/NIE or passport number   |
| 6  | Education System         | dropdown         | yes      | Country/system of studies    |
| 7  | Studies Finished?        | dropdown         | yes      | Yes / No / In progress       |
| 8  | Type of Studies in Spain | dropdown         | yes      | Grado/Master/Doctorado/FP/Bachillerato |
| 9  | Studies in Spain         | text             | no       | Specific studies name        |
| 10 | University               | dropdown+search  | yes      | Target university in Spain   |
| 11 | Language Level           | dropdown         | no       | A1/A2/B1/B2/C1/C2           |
| 12 | Language Certificate     | dropdown         | no       | DELE/SIELE/Other/None        |
| 13 | How did you find us?     | dropdown         | no       | Referral source              |
| 14 | Privacy policy           | checkbox         | yes      | Must accept                  |

- **F3.3** File uploads (drag & drop + "Add file"):
  - Application (заявление) — one file
  - Originals (оригиналы) — multiple files
  - Other documents — multiple files
- **F3.4** Student can save draft before submitting
- **F3.5** On submit → status = "submitted", coordinators notified
- **F3.6** Files stored via Active Storage

**What students do NOT upload** (coordinator handles later in AmoCRM):
- Translations (делает переводчик после подачи)
- Registry (генерируется в процессе)

### F4. My Requests (Student)
- **F4.1** Table view of all student's requests
- **F4.2** Columns: Subject, ID, Created, Last Activity, Status
- **F4.3** Filter by status (Any / Open / Solved / Awaiting reply)
- **F4.4** Search by subject text
- **F4.5** Click to open request detail

### F5. Request Detail + Chat
- **F5.1** Show request details (all form fields, read-only)
- **F5.2** Chat panel (right side or below) — real-time via Action Cable
- **F5.3** Attached files panel — list of all documents with download links
- **F5.4** Student and Coordinator can send messages
- **F5.5** Messages can include file attachments
- **F5.6** Status badge visible and updated in real-time
- **F5.7** Coordinator can change request status
- **F5.8** **"Confirm Payment" button** for coordinator (when status = `awaiting_payment`)
  - Coordinator enters payment amount (Sale €)
  - Clicks confirm → triggers AmoCRM sync in background
  - Student gets notification "Payment confirmed, processing started"
- **F5.9** CRM sync indicator: shows if synced / syncing / error

### F6. Coordinator Workspace
See `docs/14_COORDINATOR_WORKSPACE.md` for full wireframes.

**Inbox** (`/inbox`) — main working page, 80% of coordinator's time:
- **F6.1** Unified chat: all conversations in one list (request chats + teacher-student chats)
- **F6.2** 3-column layout: conversation list → chat → context panel (status, files, actions)
- **F6.3** Filters: All / Requests / Teacher chats / Unread only
- **F6.4** Change request status directly from chat context panel
- **F6.5** Confirm payment from chat context panel
- **F6.6** Download student documents from chat context panel
- **F6.7** Real-time: new messages appear instantly via Action Cable
- **F6.8** Unread badges on conversation list

**Teachers** (`/teachers`) — teacher management:
- **F6.9** Teacher cards: name, level, rate, student count, lessons this week
- **F6.10** Assign student to teacher (dialog with search)
- **F6.11** Remove student from teacher
- **F6.12** View teacher's calendar
- **F6.13** Edit teacher profile (level, rate, permanent link)
- **F6.14** Receives notifications on new requests and messages

### F7. Notifications
- **F7.1** In-app notifications (bell icon with badge count)
- **F7.2** Real-time via Action Cable (NotificationChannel)
- **F7.3** Email notifications for:
  - New request submitted (→ coordinators)
  - New message received (→ student or coordinator)
  - Status changed (→ student)
  - Payment confirmed (→ student)
- **F7.4** Mark as read / mark all as read

### F8. User Roles & Authorization (Pundit)
- **F8.1** 4 roles: super_admin, coordinator, teacher, student (family removed — duplicates student)
- **F8.2** Students: see/edit own requests, book lessons, chat with coordinator and teacher
- **F8.3** Coordinators: manage all requests, assign teachers to students, change statuses
- **F8.4** Teachers: see assigned students, calendar of lessons, share meeting links
- **F8.5** Super Admin: full access + Stripe billing + user management

### F9. Teachers & Lessons
- **F9.1** Teacher profile: level (junior/mid/senior/native), hourly rate (€), bio
- **F9.2** Permanent meeting link (Zoom/Meet) stored in profile — used by default for all lessons
- **F9.3** Coordinator assigns students to teachers (many-to-many)
- **F9.4** Teacher calendar: list of upcoming lessons with date, time, student name
- **F9.5** Lessons: scheduled_at, duration (default 60 min), status (scheduled/completed/cancelled)
- **F9.6** Teacher can attach/change meeting link per specific lesson (overrides permanent link)
- **F9.7** Teacher can share meeting link in chat with student
- **F9.8** Student sees own upcoming lessons and meeting link
- **F9.9** Teacher can add notes after lesson (private, not visible to student)
- **F9.10** Notifications: lesson reminder, new lesson booked, lesson cancelled

### F10. Teacher-Student Chat
- **F10.1** Separate chat between teacher and student (not tied to homologation request)
- **F10.2** Teacher shares meeting links in chat when they change
- **F10.3** Same Action Cable real-time as request chat
- **F10.4** Conversations table supports both: request chats AND teacher-student chats

---

## Phase 2: Admin & Integrations

### F11. Super Admin Dashboard
- **F11.1** Overview stats: total requests, by status, by month
- **F11.2** Charts: requests over time, response time avg, status distribution
- **F11.3** User management: list, create, edit, deactivate users
- **F11.4** Assign roles to users
- **F11.5** Add/remove Coordinators and Teachers
- **F11.6** View all requests across all students
- **F11.7** AmoCRM sync status panel
- **F11.8** Stripe billing: create invoices, track payments for homologation services
- **F11.9** Teacher management: set levels, hourly rates
- **F11.10** Assign teachers to students

**Charts library:** recharts

### F12. AmoCRM Integration (triggered by payment confirmation)

**What our app syncs automatically (saves 80% of manual work):**
- Contact: Name, Email, Phone, WhatsApp, Birthday, Country, Age, 18years
- Lead: Service type, Equivalencia, University, Subject, Description, Date of receipt, Referral
- Lead: ID/Passport from request
- Files: Application + Originals (student uploaded)

**What coordinator fills manually in AmoCRM (remaining 20%):**
- Sale / Expenses (price — entered via "Confirm Payment" button, synced)
- Translations (uploaded later by translator)
- Registry (generated during process)
- Teachers (assigned internally)
- Comments (internal notes)
- Reasons for refusal (only if rejected)

**Technical:**
- **F12.1** Coordinator clicks "Confirm Payment" → triggers CRM sync
- **F12.2** Creates Contact in AmoCRM with student's WhatsApp (for direct messaging)
- **F12.3** Creates Lead in "Homologation" pipeline linked to Contact
- **F12.4** Maps student form fields to AmoCRM custom fields
- **F12.5** Uploads Application + Originals files to Lead
- **F12.6** Background job (Solid Queue) — non-blocking
- **F12.7** Stores AmoCRM IDs on local records
- **F12.8** Admin can see sync status, errors, retry failed syncs
- **F12.9** Subsequent status changes update Lead stage in CRM

---

## Phase 3: Enhancements

### F13. Multi-language Support (BUILT INTO PHASE 1 — not deferred!)
i18n is built into the app from day one. See `docs/11_I18N_MULTILANGUAGE.md` for full details.
- **F11.1** 3 languages: Spanish (default), English, Russian
- **F11.2** Frontend: `react-i18next` — all UI text via `t()` function, ZERO hardcoded strings
- **F11.3** Backend: Rails I18n — mailers, notifications, validation errors
- **F11.4** Select options: multi-language labels in `config/select_options.yml`
- **F11.5** Language switcher in navbar (flag button)
- **F11.6** User locale saved in `users.locale`, detected from browser on first visit
- **F11.7** Dates formatted with locale-aware `date-fns`

### F14. Profile Management
- **F12.1** Edit profile (name, email, phone, whatsapp, birthday, country, avatar)
- **F12.2** Change password
- **F12.3** Link/unlink OAuth providers

### F13. Teacher & Family Views
- **F13.1** Teacher can view students' requests (read-only)
- **F13.2** Family member linked to student, can view progress
- **F13.3** Coordinator can link family to student

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STUDENT FILLS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Profile (once):          Request form (per request):               │
│  ┌──────────────────┐     ┌──────────────────────────────────────┐  │
│  │ Name             │     │ Service type      Identity card      │  │
│  │ WhatsApp         │     │ Subject           Education system   │  │
│  │ Phone            │     │ Description       Studies finished   │  │
│  │ Birthday         │     │ University        Study type Spain   │  │
│  │ Country          │     │ Language level     Referral source   │  │
│  └──────────────────┘     │ Language cert      Studies in Spain  │  │
│                           │ Files: Application + Originals       │  │
│                           └──────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   COORDINATOR IN OUR APP                            │
├─────────────────────────────────────────────────────────────────────┤
│  Reviews request → chats with student → sets payment amount        │
│  → clicks "Confirm Payment" (enters Sale €)                        │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼ AmoCrmSyncJob (background)
┌─────────────────────────────────────────────────────────────────────┐
│                   AUTO-SYNCED TO AMOCRM                             │
├─────────────────────────────────────────────────────────────────────┤
│  Contact: Name, Email, Phone, WhatsApp, Birthday, Country,         │
│           Age (calc), 18years (calc), ID/Passport                  │
│                                                                     │
│  Lead:    Service, Equivalencia, University, Subject, Description, │
│           Date of receipt, Referral, Sale €, Language level/cert   │
│                                                                     │
│  Files:   Application, Originals                                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              COORDINATOR FILLS MANUALLY IN AMOCRM                   │
├─────────────────────────────────────────────────────────────────────┤
│  Translations (file)  — uploaded after translator finishes          │
│  Registry (file)      — uploaded after ministry registration        │
│  Teachers             — assigned internally                         │
│  Comments             — internal notes                              │
│  Reasons for refusal  — only if rejected                            │
└─────────────────────────────────────────────────────────────────────┘
```

## UI Reference (from Zendesk screenshots)

### "Submit a request" page
- Clean form with labeled fields
- Dropdowns for structured data (service type, education system, etc.)
- Rich text editor for description
- Drag & drop zone for file attachments
- Red "Submit" button at bottom
- Breadcrumb navigation at top

### "My requests" page
- Table with columns: Subject, Id (#number), Created, Last activity, Status
- Status badges: colored (green = Solved, yellow = Awaiting your reply)
- Search bar + status filter dropdown
- Tabs: "My requests" / "Requests I'm CC'd on"

### Request detail page
- Split layout: conversation thread (left) + request details & files (right)
- Messages displayed chronologically with user avatars
- File list with download links
- Payment information section
- Status shown in sidebar
