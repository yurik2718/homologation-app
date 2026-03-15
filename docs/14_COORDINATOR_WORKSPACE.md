# Coordinator Workspace

## Overview

Coordinator has two main pages:
- **Inbox** (`/inbox`) — unified chat, 80% of work time
- **Teachers** (`/teachers`) — teacher cards, assign students, view workload

---

## 1. Inbox — Unified Chat

All conversations in one place: request chats + teacher-student chats (oversight).

```
┌─ Sidebar ──┐┌─ Conversations ──────┐┌─ Chat ─────────────────────┐
│             ││                      ││                             │
│ Dashboard   ││ [Search...] [All ▼]  ││ Ana Kowalski                │
│ Inbox     ● ││                      ││ Request #66763 · 🟡 Review  │
│ Requests    ││ 🔴 Ana Kowalski      ││                             │
│ Teachers    ││    Equiv. CEU Madrid  ││ [Ana] 14:32                 │
│ Lessons     ││    "Hola, adjunto..." ││ Hola, adjunto mis docs...   │
│             ││    2 min ago          ││                             │
│             ││                      ││ [You] 14:35                 │
│             ││ ⚪ Pedro Lopez        ││ Docs received. The cost     │
│             ││    Informe UE Madrid  ││ is €60. Please pay to...   │
│             ││    "Gracias por..."   ││                             │
│             ││    1 hour ago         ││ [Ana] 14:40                 │
│             ││                      ││ Done! Receipt attached.     │
│             ││ ⚪ Ivan Petrov        ││                             │
│             ││    Teacher chat       ││                             │
│             ││    "Link updated"     ││ ┌───────────────────────┐   │
│             ││    yesterday          ││ │ Type a message...  📎 │   │
│             ││                      ││ │              [Send]   │   │
│             ││ Filter:              ││ └───────────────────────┘   │
│             ││ [All] [Requests]     ││                             │
│             ││ [Teacher chats]      ││ ── Right panel ───────────  │
│             ││ [Unread only]        ││ Status: [In Review ▼]       │
│             ││                      ││ Files: 3 docs 📄            │
│             ││                      ││ [Confirm Payment]           │
└─────────────┘└──────────────────────┘└─────────────────────────────┘
```

### Layout: 3 columns

| Column | Width | Content |
|---|---|---|
| Left | ~280px | Conversation list: avatar, name, last message preview, time, unread badge |
| Center | flex | Chat messages + input |
| Right | ~260px | Context panel: depends on conversation type |

### Right panel changes by conversation type

**Request chat:**
- Request status (dropdown to change)
- Service type, university
- Attached files with download
- "Confirm Payment" button (if status = awaiting_payment)
- CRM sync status
- Link to full request detail

**Teacher-student chat (oversight):**
- Teacher name + student name
- Next lesson date
- Meeting link status
- Read-only (coordinator can message too if needed)

### Conversation list

```ruby
# Controller provides all conversations for coordinator
class InboxController < InertiaController
  def index
    authorize :inbox

    conversations = Conversation
      .includes(:homologation_request, :teacher_student, :conversation_participants)
      .order(last_message_at: :desc)

    render inertia: "inbox/Index", props: {
      conversations: conversations.map { |c| serialize_conversation(c) }
    }
  end
end
```

### Filters

| Filter | Shows |
|---|---|
| All | Every conversation |
| Requests | Only homologation request chats |
| Teacher chats | Only teacher-student chats |
| Unread only | Conversations with unread messages |

### Real-time

- New messages arrive via Action Cable (same ConversationChannel)
- Unread badges update via NotificationChannel
- Conversation list re-sorts when new message arrives

### Mobile Layout

On mobile (< 768px), the 3-column layout collapses:
1. Show conversation list only (full screen)
2. Tap conversation → full-screen chat + collapsible context panel
3. Back button → returns to conversation list

```
┌── Mobile: Conversation List ──┐    ┌── Mobile: Chat ────────────┐
│                                │    │ ← Ana Kowalski              │
│ [Search...] [All ▼]           │    │ Request #66763 · 🟡 Review  │
│                                │    │                              │
│ 🔴 Ana Kowalski               │    │ [Ana] 14:32                  │
│    Equiv. CEU Madrid           │ →  │ Hola, adjunto mis docs...    │
│    "Hola, adjunto..."          │    │                              │
│    2 min ago                   │    │ [▼ Details]  (collapsible)   │
│                                │    │                              │
│ ⚪ Pedro Lopez                 │    │ ┌──────────────────────────┐ │
│    Informe UE Madrid           │    │ │ Type a message...     📎 │ │
│    "Gracias por..."            │    │ │              [Send]      │ │
│    1 hour ago                  │    │ └──────────────────────────┘ │
└────────────────────────────────┘    └──────────────────────────────┘
```

### Keyboard shortcuts (future enhancement, not MVP)

- `↑` / `↓` — navigate conversation list
- `Enter` — focus chat input
- `Escape` — back to conversation list

---

## 2. Teachers — Management Panel

Cards view of all teachers with workload and assigned students.

```
┌─ Sidebar ──┐┌── Teachers ─────────────────────────────────┐
│             ││                                              │
│             ││ Teachers                     [+ Add Teacher] │
│             ││                                              │
│             ││ ┌────────────────────────────────────────┐   │
│             ││ │ 👩‍🏫 Maria Garcia      senior · €25/h    │   │
│             ││ │ 👥 3 students · 📅 8 lessons this week │   │
│             ││ │ 🔗 zoom.us/j/123...                    │   │
│             ││ │                                        │   │
│             ││ │ Students:                              │   │
│             ││ │  Ana K.  Pedro L.  Ivan P.  [+ Assign] │   │
│             ││ │                                        │   │
│             ││ │ [View Calendar]  [Edit]                │   │
│             ││ └────────────────────────────────────────┘   │
│             ││                                              │
│             ││ ┌────────────────────────────────────────┐   │
│             ││ │ 👨‍🏫 Ivan Petrov          mid · €18/h    │   │
│             ││ │ 👥 2 students · 📅 5 lessons this week │   │
│             ││ │ 🔗 No permanent link                   │   │
│             ││ │                                        │   │
│             ││ │ Students:                              │   │
│             ││ │  Carlos R.  [+ Assign]                 │   │
│             ││ │                                        │   │
│             ││ │ [View Calendar]  [Edit]                │   │
│             ││ └────────────────────────────────────────┘   │
│             ││                                              │
└─────────────┘└──────────────────────────────────────────────┘
```

### Teacher card shows

| Info | Source |
|---|---|
| Name, avatar | `users` |
| Level, hourly rate | `teacher_profiles` (coordinator + super_admin see this) |
| Permanent meeting link | `teacher_profiles` |
| Student count | `teacher_students.count` |
| Lessons this week | `lessons.where(scheduled_at: Time.current.all_week).count` |
| Student names | `teacher_students → users.name` |

### Actions

| Action | What it does |
|---|---|
| **+ Assign** | Dialog: search students, select, assign to this teacher |
| **View Calendar** | Opens teacher's calendar (same page as teacher sees) |
| **Edit** | Dialog: edit level, rate, bio, permanent link |
| **+ Add Teacher** | Dialog: select existing user → assign teacher role + create teacher_profile (level, rate, link) in one step |

### Assign Student Dialog

```
┌─────────────────────────────────┐
│ Assign Student to Maria Garcia  │
│                                 │
│ [Search student...         ]    │
│                                 │
│ Available students:             │
│ ☐ Carlos Ruiz                   │
│ ☐ Olga Smirnova                │
│ ☐ Ahmed Hassan                  │
│                                 │
│ (students already assigned      │
│  are not shown)                 │
│                                 │
│ [Cancel]          [Assign]      │
└─────────────────────────────────┘
```

### Remove student

Click on student name badge → confirm dialog → removes `teacher_student` record.

---

## Updated Sidebar Navigation

| Item | super_admin | coordinator | teacher | student |
|---|:-:|:-:|:-:|:-:|
| Dashboard | ✅ | ✅ | — | ✅ |

**Note:** Teacher has no Dashboard — teacher's landing page after login is `/calendar` (their lesson calendar).
| **Inbox** | ✅ | ✅ | — | — |
| Requests | ✅ | ✅ | — | — |
| New Request | — | — | — | ✅ |
| **Teachers** | ✅ | ✅ | — | — |
| All Lessons | ✅ | ✅ | — | — |
| Calendar | — | — | ✅ | — |
| My Lessons | — | — | — | ✅ |
| My Requests | — | — | — | ✅ |
| Chat | — | — | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | — | — | — |

**Inbox** replaces separate "Chat" for coordinator — all chats are in Inbox.

---

## React Pages

| Page | Route | File |
|---|---|---|
| Inbox | `/inbox` | `pages/inbox/Index.tsx` |
| Teachers | `/teachers` | `pages/teachers/Index.tsx` |

### Components

```
components/
├── inbox/
│   ├── ConversationList.tsx      # Left column: list of chats
│   ├── ConversationItem.tsx      # Single conversation preview
│   ├── ChatPanel.tsx             # Center: messages + input
│   └── ContextPanel.tsx          # Right: request details OR teacher-student info
├── teachers/
│   ├── TeacherCard.tsx           # Card with stats + students
│   ├── AssignStudentDialog.tsx   # Search + assign student
│   └── EditTeacherDialog.tsx     # Edit level, rate, link
```

All built with shadcn/ui: `Card`, `Dialog`, `ScrollArea`, `Badge`, `Avatar`, `Input`, `Select`, `Button`. No extra libraries.

---

## Routes

```ruby
# config/routes.rb

# Coordinator workspace
resources :inbox, only: [:index, :show]     # GET /inbox, GET /inbox/:conversation_id
resources :teachers, only: [:index, :update] do
  member do
    post :assign_student       # POST /teachers/:id/assign_student
    delete :remove_student     # DELETE /teachers/:id/remove_student
  end
end
```
