# UI Components

## Design: shadcn-admin Style

Layout and navigation from [shadcn-admin](https://github.com/satnaing/shadcn-admin):
- Sidebar (collapsible) + Header + Main content
- Light mode only (no dark mode for MVP)
- shadcn/ui components via MCP server or CLI

### shadcn/ui Components Needed

```bash
npx shadcn@latest add \
  button input label textarea select checkbox \
  card dialog sheet sidebar \
  table badge avatar separator \
  dropdown-menu tabs popover \
  toast sonner scroll-area form
```

### NPM Packages

```bash
npm install lucide-react        # Icons
npm install react-dropzone      # Drag & drop uploads
npm install recharts            # Admin charts
npm install date-fns            # Dates
npm install @rails/activestorage # Direct upload
npm install @rails/actioncable  # WebSocket
npm install react-i18next i18next i18next-browser-languagedetector
```

---

## Layout

```
┌─── Sidebar ────┐┌─── Header ────────────────────── [🌐][🔔][👤] ──┐
│                 ││                                                  │
│  [Logo]         ││  Page content here                               │
│                 ││                                                  │
│  Dashboard      ││                                                  │
│  Requests       ││                                                  │
│  New Request    ││                                                  │
│  Notifications  ││                                                  │
│                 ││                                                  │
│  ── admin ──    ││                                                  │
│  Admin Panel    ││                                                  │
│  Users          ││                                                  │
│                 ││                                                  │
│  ── bottom ──   ││                                                  │
│  👤 User menu   ││                                                  │
└─────────────────┘└──────────────────────────────────────────────────┘
```

### Sidebar Items by Role

| Item | admin | coordinator | teacher | student | family |
|---|:-:|:-:|:-:|:-:|:-:|
| Dashboard | + | + | + | + | + |
| My Requests | - | - | - | + | + |
| New Request | - | - | - | + | - |
| All Requests | + | + | - | - | - |
| Notifications | + | + | + | + | + |
| Admin Panel | + | - | - | - | - |
| Users | + | - | - | - | - |

---

## Pages

### Login
- Email + password form
- Google / Apple OAuth buttons
- Language switcher (🇪🇸 🇬🇧 🇷🇺)
- Links: forgot password, create account

### Register
- Name, Email, Password, Confirm password
- OAuth buttons
- Privacy policy checkbox

### Complete Profile (after first login)
- WhatsApp (required), Phone, Birthday, Country
- One page, 4 fields

### My Requests (table)
- Simple `<Table>` with: Subject, ID, Created, Status
- Search input + Status dropdown filter
- Click row → open request

### New Request (form)
- Inertia `useForm()` — no extra form library
- Sections: About You → Request → Education → Optional → Documents
- File uploads: 3 drop zones (Application, Originals, Other)
- All labels via `t()` for i18n
- Submit button + Save Draft

### Request Detail (chat + files)
- Left: chat messages (Action Cable real-time)
- Right: status, request details, file list with download
- Coordinator sees: "Confirm Payment" button, status dropdown
- CRM sync indicator after payment confirmation

### Admin Dashboard
- 4 stat cards (total, open, awaiting, resolved)
- 2 charts (requests over time, by status) via Recharts
- Recent requests table

### Admin Users
- Simple table: Name, Email, Role, Actions
- Add/edit user dialog
- Assign/remove role

---

## File Structure

```
app/frontend/
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── Header.tsx
│   │   ├── AuthenticatedLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── ui/                  # shadcn/ui (auto-generated)
│   ├── common/
│   │   ├── LanguageSwitcher.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FormattedDate.tsx
│   │   └── RoleGuard.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── MessageInput.tsx
│   ├── documents/
│   │   ├── FileDropZone.tsx
│   │   └── FileList.tsx
│   └── admin/
│       ├── StatsCard.tsx
│       └── Charts.tsx
├── pages/
│   ├── auth/        (Login, Register, ForgotPassword)
│   ├── profile/     (Complete, Edit)
│   ├── dashboard/   (Index)
│   ├── requests/    (Index, New, Show)
│   └── admin/       (Dashboard, Users)
├── hooks/
│   ├── useActionCable.ts
│   └── useFileUpload.ts
├── lib/
│   ├── utils.ts
│   └── i18n.ts
├── locales/         (es.json, en.json, ru.json)
├── types/           (models.d.ts)
└── entrypoints/
    ├── application.ts
    ├── application.css
    └── inertia.tsx
```

## Forms: Inertia useForm (NO extra libraries)

```tsx
// Example: all forms use Inertia's built-in useForm
import { useForm } from "@inertiajs/react"

function RequestForm() {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors } = useForm({
    service_type: "",
    subject: "",
    // ...
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post("/requests")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label>{t("requests.form.service_type")}</Label>
      <Select value={data.service_type} onValueChange={(v) => setData("service_type", v)}>
        {/* options */}
      </Select>
      {errors.service_type && <p className="text-red-500">{errors.service_type}</p>}
      <Button type="submit" disabled={processing}>{t("common.submit")}</Button>
    </form>
  )
}
```
