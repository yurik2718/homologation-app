# Lessons & Calendar

## Flow

```
1. Coordinator assigns teacher to student (teacher_students)
                    ↓
2. Teacher opens calendar → sees assigned students
                    ↓
3. Teacher creates lesson: picks student, date, time, duration, meeting link
                    ↓
4. Student gets notification: "New lesson scheduled"
                    ↓
5. Both see lesson in their calendars
                    ↓
6. Before lesson: student sees meeting link
                    ↓
7. After lesson: teacher marks "completed", adds notes (optional)
```

## Who Sees What

### Teacher — "My Calendar"

Full week/day calendar with all their lessons across all students.

```
┌─ Sidebar ──┐┌── Header: My Calendar ──────────────────────┐
│             ││                                              │
│ Dashboard   ││  My Calendar                  [+ New Lesson] │
│ Calendar  ● ││                                              │
│ My Students ││  [< Week]  March 17–21, 2026  [Week >]      │
│ Chat        ││  [Day] [Week] [Month]                       │
│             ││                                              │
│             ││  ┌─────┬──────┬──────┬──────┬──────┐        │
│             ││  │ Mon │ Tue  │ Wed  │ Thu  │ Fri  │        │
│             ││  │     │      │      │      │      │        │
│             ││  │     │10:00 │      │10:00 │      │        │
│             ││  │     │Ana K.│      │Ana K.│      │        │
│             ││  │     │60min │      │60min │      │        │
│             ││  │     │🟢    │      │🟢    │      │        │
│             ││  │     │      │      │      │      │        │
│             ││  │     │      │15:00 │      │15:00 │        │
│             ││  │     │      │Pedro │      │Pedro │        │
│             ││  │     │      │60min │      │60min │        │
│             ││  │     │      │🟡    │      │🟡    │        │
│             ││  └─────┴──────┴──────┴──────┴──────┘        │
│             ││                                              │
│             ││  🟢 Link ready  🟡 Link needed  ⚪ Done     │
└─────────────┘└──────────────────────────────────────────────┘
```

**Teacher clicks on lesson slot → sees/edits:**
```
┌─────────────────────────────────────┐
│  Lesson Details                     │
│                                     │
│  Student:    Ana Kowalski           │
│  Date:       Tue, March 18, 2026   │
│  Time:       10:00                  │
│  Duration:   60 min                 │
│  Status:     [Scheduled ▼]         │
│                                     │
│  Meeting Link:                      │
│  [https://zoom.us/j/123...    ]    │
│  (auto-filled from profile if set)  │
│                                     │
│  Notes (private, after lesson):     │
│  [________________________]         │
│                                     │
│  [Cancel Lesson]    [Save]         │
└─────────────────────────────────────┘
```

### Student — "My Lessons"

Simple list of upcoming and past lessons. No full calendar — students don't need to manage schedule, just see what's booked.

```
┌─ Sidebar ──┐┌── Header: My Lessons ───────────────────────┐
│             ││                                              │
│ Dashboard   ││  My Lessons                                  │
│ Requests    ││                                              │
│ Lessons   ● ││  ── Upcoming ──────────────────────────────  │
│ Chat        ││                                              │
│             ││  ┌────────────────────────────────────────┐  │
│             ││  │ 📅 Tue, Mar 18 · 10:00 · 60 min       │  │
│             ││  │ 👩‍🏫 Teacher: Maria Garcia               │  │
│             ││  │ 🔗 Join lesson                    →    │  │
│             ││  └────────────────────────────────────────┘  │
│             ││                                              │
│             ││  ┌────────────────────────────────────────┐  │
│             ││  │ 📅 Thu, Mar 20 · 10:00 · 60 min       │  │
│             ││  │ 👩‍🏫 Teacher: Maria Garcia               │  │
│             ││  │ 🔗 Join lesson                    →    │  │
│             ││  └────────────────────────────────────────┘  │
│             ││                                              │
│             ││  ── Past ──────────────────────────────────  │
│             ││                                              │
│             ││  ┌────────────────────────────────────────┐  │
│             ││  │ 📅 Tue, Mar 11 · 10:00 · 60 min  ✅   │  │
│             ││  │ 👩‍🏫 Teacher: Maria Garcia               │  │
│             ││  └────────────────────────────────────────┘  │
│             ││                                              │
└─────────────┘└──────────────────────────────────────────────┘
```

**"Join lesson"** → opens meeting link:
- If `lesson.meeting_link` exists → use it
- Else if `teacher.permanent_meeting_link` exists → use it
- Else → "Link will be added by teacher"

### Coordinator / Super Admin — "All Lessons"

Overview table of all lessons across all teachers and students. Filter by teacher, student, date, status.

```
┌─ Sidebar ──┐┌── Header: Lessons Overview ─────────────────┐
│             ││                                              │
│             ││  Lessons         [+ Assign Teacher] [Export] │
│             ││                                              │
│             ││  [Teacher ▼] [Student ▼] [Status ▼] [Date]  │
│             ││                                              │
│             ││  ┌──────────────────────────────────────────┐│
│             ││  │ Date       │Teacher │Student │Dur │Status││
│             ││  ├──────────────────────────────────────────┤│
│             ││  │ Mar 18 10h │Maria G.│Ana K.  │60m │🟢 OK ││
│             ││  │ Mar 18 15h │Maria G.│Pedro L.│60m │🟡 No ││
│             ││  │ Mar 19 11h │Ivan P. │Ana K.  │60m │🟢 OK ││
│             ││  └──────────────────────────────────────────┘│
│             ││                                              │
│             ││  🟢 Link ready  🟡 Link needed  ⚪ Done     │
└─────────────┘└──────────────────────────────────────────────┘
```

## Creating a Lesson

### Who can create:
- **Teacher** — for their assigned students only
- **Coordinator / Super Admin** — for any teacher-student pair

### New Lesson Dialog

```
┌─────────────────────────────────────┐
│  New Lesson                         │
│                                     │
│  Teacher:    [Maria Garcia    ▼]    │
│  (pre-filled if teacher creates)    │
│                                     │
│  Student:    [Ana Kowalski    ▼]    │
│  (only assigned students shown)     │
│                                     │
│  Date:       [📅 March 18, 2026]   │
│  Time:       [10:00          ▼]    │
│  Duration:   [60 min         ▼]    │
│                                     │
│  Meeting Link:                      │
│  [https://zoom.us/j/123...    ]    │
│  ℹ️ Leave empty to use teacher's   │
│     permanent link                  │
│                                     │
│  [Cancel]            [Create]      │
└─────────────────────────────────────┘
```

### Validation
- Can't create lesson in the past
- Can't double-book: same teacher, overlapping time
- Student must be assigned to teacher (teacher_students)
- If teacher has no permanent_meeting_link AND lesson.meeting_link is empty → warning (not blocking)

## Lesson Status Flow

```
scheduled → completed     (teacher marks after lesson)
         → cancelled      (teacher or coordinator cancels)
```

## Meeting Link Logic

```ruby
# app/models/lesson.rb
class Lesson < ApplicationRecord
  def effective_meeting_link
    meeting_link.presence || teacher.teacher_profile&.permanent_meeting_link
  end

  def meeting_link_ready?
    effective_meeting_link.present?
  end
end
```

## Notifications

| Event | Who gets notified |
|---|---|
| New lesson created | Student |
| Lesson cancelled | Student + Teacher |
| Lesson in 1 hour | Student + Teacher |
| Meeting link added | Student |

## Calendar NPM Package

```bash
npm install @schedule-x/react @schedule-x/theme-default
```

[Schedule-X](https://schedule-x.dev) — lightweight calendar component, works with React, supports week/day/month views, drag & drop. Or simpler: just build a custom week grid with shadcn/ui (less dependency).

**Recommendation:** Start with a simple custom week grid (CSS Grid + shadcn Cards). Add a calendar library only if needed later.

## Pages Summary

| Page | Role | What they see |
|---|---|---|
| `/lessons` | Student | List: upcoming + past lessons, join links |
| `/calendar` | Teacher | Week/day calendar, create/edit lessons |
| `/admin/lessons` | Coordinator, Super Admin | Table of all lessons, filters, assign |

## Sidebar Navigation Update

| Item | super_admin | coordinator | teacher | student |
|---|:-:|:-:|:-:|:-:|
| Calendar | — | — | ✅ | — |
| My Lessons | — | — | — | ✅ |
| All Lessons | ✅ | ✅ | — | — |
