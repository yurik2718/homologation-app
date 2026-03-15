# Principles

## Core Rule: FAST & SIMPLE

Every decision follows one question: **does this make the user's experience better RIGHT NOW?**

If no → don't build it.

## What Matters (build this)
- Student submits a form and uploads files in under 5 minutes
- Coordinator sees new requests immediately and can chat
- Payment confirmation → auto-sync to AmoCRM with WhatsApp
- Everyone sees statuses and gets notifications

## What Doesn't Matter (skip this)
- Dark mode
- Command menu (Cmd+K)
- Audit logs
- Rich text editor (textarea is fine)
- Complex data tables with column sorting
- Multiple form libraries (Inertia `useForm` is enough)
- Data export / GDPR self-service portal
- Zustand / TanStack Table / react-hook-form + zod

## Stack Simplification

| Instead of | Use |
|---|---|
| Tiptap rich text | `<textarea>` from shadcn/ui |
| react-hook-form + zod | Inertia.js `useForm()` (built-in validation) |
| @tanstack/react-table | shadcn/ui `<Table>` + simple React state |
| zustand | Inertia shared data + `useState` |
| DOMPurify | No rich text = no XSS risk from user HTML |
| Dark mode + ThemeSwitch | Light mode only |
| Command menu | Simple sidebar navigation |
| DeletionRequest model | "Contact us" email link on profile page |
| Data export JSON | Not for MVP |
| Audit log | Not for MVP |

## NPM Packages (final list — 9 total)

```bash
npm install react-i18next i18next i18next-browser-languagedetector  # i18n
npm install react-dropzone                  # File drag & drop
npm install @rails/activestorage            # Direct upload
npm install @rails/actioncable              # WebSocket chat
npm install recharts                        # Admin charts
npm install lucide-react                    # Icons
npm install date-fns                        # Date formatting
# shadcn/ui prerequisites (class-variance-authority, clsx, tailwind-merge)
# installed automatically by `npx shadcn@latest init`
```

## Gems to Add (final list — 7 total)

```ruby
gem "omniauth"
gem "omniauth-google-oauth2"
gem "omniauth-apple"
gem "omniauth-rails_csrf_protection"
gem "pundit"
gem "faraday"
gem "faraday-multipart"
gem "active_storage_validations"
```

## Security (minimum viable, EU-compliant)

- `force_ssl = true` (1 line, already default)
- `encrypts :phone, :whatsapp` in User model (2 lines)
- `encrypts :identity_card, :passport` in Request model (2 lines)
- `rate_limit` on login/register controllers (3 lines each)
- Privacy policy checkbox + `privacy_accepted_at` timestamp
- Static privacy policy page
- Pundit on all controllers (already planned)
- Active Storage files served through controller (already planned)
- "Contact us to delete your account" link (instead of self-service GDPR portal)
- Filter PII from logs (1 initializer)

Total security code: ~30 lines. Not 300.
