# Mobile-First Responsive Design

Every page MUST work on mobile (360px+). Students and teachers primarily use phones.

## Rules

- Use Tailwind responsive prefixes: base = mobile, `md:` = tablet, `lg:` = desktop
- Sidebar: use shadcn/ui `Sheet` on mobile (slide-out), fixed sidebar on `lg:`
- Inbox 3-column layout: on mobile show only conversation list → tap → full-screen chat → back button
- Tables: on mobile use card/list view instead of `<Table>` (tables are unreadable on phones)
- Forms: full-width inputs, large touch targets (min 44px height)
- File upload: "Add file" button works on mobile (no drag & drop needed, it's a bonus on desktop)
- Calendar: on mobile show day view only (not week grid)
- Test every page at 360px, 768px, 1280px

## Patterns

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
