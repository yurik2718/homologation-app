# Prompt: Landing Page Rewrite — Phase 1

## Context

This is a Rails 8 + React 19 + Inertia.js + TypeScript + Tailwind CSS 4 + shadcn/ui app. Read `CLAUDE.md` first — it has all coding rules.

The app is **Space for Edu** — a platform for education services in Spain (degree homologation, university admission, Spanish language courses). The business has **10+ years of experience** and **500+ students from 20+ countries**.

**Target audience:** Parents (primarily from CIS countries) who want quality European education for their children. They buy not a "document service" — they buy **a bright future for their child**.

**Business goal:** Sell the full turnkey package (homologation + university admission + support), not individual services. Homologation is the traffic magnet, but the full package is the most profitable product.

## What to change

### Files to modify

**i18n only (6 files):**
- `app/frontend/locales/en.json` — sections `public.home`, `public.precios`
- `app/frontend/locales/es.json` — same sections
- `app/frontend/locales/ru.json` — same sections
- `config/locales/en.yml` — `seo.home`
- `config/locales/es.yml` — `seo.home`
- `config/locales/ru.yml` — `seo.home`

**React components (2 files):**
- `app/frontend/pages/public/Home.tsx` — How It Works: 4 steps → 5 steps
- `app/frontend/pages/public/Precios.tsx` — Completo features: 6 → 8

**Sub-page CTA texts (i18n only, same 3 JSON files):**
- `public.homologacion.cta_*` — update to cross-sell packages
- `public.universidad.cta_*` — update to cross-sell packages
- `public.espanol.cta_*` — fix "free class" reference

### Do NOT touch
- Component structure, layouts, routes, controllers
- Navigation menu items
- Pages Homologacion.tsx, Universidad.tsx, Espanol.tsx, Consulta.tsx (code)
- Any other files

---

## 1. Hero section — Home page (`public.home.hero_*`)

Sell the RESULT (child's future), not the process (document management).

### EN:
```
hero_title_1: "European education"
hero_title_accent: "for your child"
hero_subtitle: "We handle all the bureaucracy — from document preparation to university enrollment. Over 10 years of experience, 500+ students from 20 countries."
cta_start: "Start the journey"
cta_consult: "Book a consultation"
```

### ES:
```
hero_title_1: "Educación europea"
hero_title_accent: "para tu hijo"
hero_subtitle: "Nos encargamos de toda la burocracia — desde la preparación de documentos hasta la matriculación universitaria. Más de 10 años de experiencia, 500+ estudiantes de 20 países."
cta_start: "Comenzar el camino"
cta_consult: "Solicitar consulta"
```

### RU:
```
hero_title_1: "Европейское образование"
hero_title_accent: "для вашего ребёнка"
hero_subtitle: "Берём на себя всю бюрократию — от подготовки документов до зачисления в университет. Более 10 лет опыта, 500+ студентов из 20 стран."
cta_start: "Начать путь"
cta_consult: "Записаться на консультацию"
```

## 2. Trust stats (`public.home.stat_*`)

Update values and labels. Change "3+ years" → "10+ years", "3 languages" → "20+ countries".

In `Home.tsx` `TrustSection`, update the `stats` array:
```tsx
{ value: 500, suffix: "+", label: t("public.home.stat_students") },
{ value: 98, suffix: "%", label: t("public.home.stat_success") },
{ value: 10, suffix: "+", label: t("public.home.stat_years") },    // was 3
{ value: 20, suffix: "+", label: t("public.home.stat_countries") }, // was 3, languages
```

### i18n keys (rename `stat_languages` → `stat_countries`):
- EN: `stat_countries: "countries represented"`, `stat_success: "success rate"`, keep `stat_students` and `stat_years`
- ES: `stat_countries: "países representados"`, `stat_success: "tasa de éxito"`
- RU: `stat_countries: "стран — география студентов"`, `stat_success: "процент успеха"`

Delete `stat_languages` key from all 3 locales (replaced by `stat_countries`).

## 3. Services section (`public.home.services_*`)

Update subtitle to emphasize full-service approach:
- EN: `services_subtitle: "From degree homologation to university enrollment — we cover every step"`
- ES: `services_subtitle: "Desde la homologación del título hasta la matriculación — cubrimos cada paso"`
- RU: `services_subtitle: "От омологации диплома до зачисления в университет — сопровождаем на каждом этапе"`

Keep `services_title` and all 3 service cards as is.

## 4. How It Works → 5 steps (`public.home.how_*`, `step_*`)

Change from app-centric steps (submit, upload, pay, receive) to client journey steps.

### i18n keys:
**EN:**
```
how_subtitle: "Your path from the first consultation to enrollment"
step_1: "Consultation — we analyze your case"
step_2: "Documents — we prepare everything"
step_3: "Homologation — we manage the process"
step_4: "University — admission and enrollment"
step_5: "You're a student in Spain!"
```

**ES:**
```
how_subtitle: "Tu camino desde la primera consulta hasta la matriculación"
step_1: "Consulta — analizamos tu caso"
step_2: "Documentos — preparamos todo"
step_3: "Homologación — gestionamos el proceso"
step_4: "Universidad — admisión y matriculación"
step_5: "¡Ya eres estudiante en España!"
```

**RU:**
```
how_subtitle: "Ваш путь от первой консультации до зачисления"
step_1: "Консультация — анализируем ваш случай"
step_2: "Документы — подготовим всё за вас"
step_3: "Омологация — ведём весь процесс"
step_4: "Университет — поступление и зачисление"
step_5: "Вы — студент в Испании!"
```

### Home.tsx changes:

In `HowItWorksSection`, add `PartyPopper` (or `Sparkles`) icon for step 5 and change grid from `lg:grid-cols-4` to `lg:grid-cols-5`:

```tsx
import { ..., GraduationCap, Sparkles } from "lucide-react"

const steps = [
  { icon: ClipboardCheck, label: t("public.home.step_1") },
  { icon: FileCheck, label: t("public.home.step_2") },
  { icon: Shield, label: t("public.home.step_3") },        // was CreditCard
  { icon: GraduationCap, label: t("public.home.step_4") },  // was CheckCircle2
  { icon: Sparkles, label: t("public.home.step_5") },       // NEW
]
```

Grid: change `lg:grid-cols-4` → `lg:grid-cols-5`.

Note: `Shield` and `GraduationCap` are already imported in Home.tsx. `Sparkles` needs to be added to the lucide-react import. `CreditCard` can be removed from imports if unused elsewhere.

## 5. Advantages section (`public.home.adv_*`)

Make advantages speak to PARENTS, not to tech users:
- EN: `adv_coordinator: "Personal coordinator for your family"`, `adv_chat: "Direct communication with your coordinator"`, `adv_tracking: "Track progress in real time"`, `adv_security: "Your documents are safe and encrypted"`, `adv_languages: "Support in Russian, Spanish, and English"`, `adv_crm: "10+ years of proven experience"`
- ES: `adv_coordinator: "Coordinador personal para tu familia"`, `adv_chat: "Comunicación directa con tu coordinador"`, `adv_tracking: "Seguimiento del progreso en tiempo real"`, `adv_security: "Tus documentos están seguros y cifrados"`, `adv_languages: "Atención en ruso, español e inglés"`, `adv_crm: "Más de 10 años de experiencia probada"`
- RU: `adv_coordinator: "Персональный координатор для вашей семьи"`, `adv_chat: "Прямая связь с координатором"`, `adv_tracking: "Отслеживание прогресса в реальном времени"`, `adv_security: "Документы надёжно защищены"`, `adv_languages: "Поддержка на русском, испанском и английском"`, `adv_crm: "Более 10 лет проверенного опыта"`

## 6. CTA bottom — Home (`public.home.cta_*`)

- EN: `cta_title: "Give your child a European future"`, `cta_subtitle: "Join 500+ families who trusted us with their children's education in Spain."`
- ES: `cta_title: "Dale a tu hijo un futuro europeo"`, `cta_subtitle: "Únete a más de 500 familias que nos confiaron la educación de sus hijos en España."`
- RU: `cta_title: "Подарите ребёнку европейское будущее"`, `cta_subtitle: "Присоединяйтесь к 500+ семьям, которые доверили нам образование своих детей в Испании."`

## 7. Precios page — turnkey packages (`public.precios.*`)

### Hero:
- EN: `hero_title_1: "Plans for every"`, `hero_title_accent: "goal"`, `hero_subtitle: "From degree homologation to full university enrollment support. Transparent pricing, no hidden fees."`
- ES: `hero_title_1: "Planes para cada"`, `hero_title_accent: "objetivo"`, `hero_subtitle: "Desde la homologación del título hasta el acompañamiento completo en la matriculación. Precios transparentes, sin costes ocultos."`
- RU: `hero_title_1: "Планы для каждой"`, `hero_title_accent: "цели"`, `hero_subtitle: "От омологации диплома до полного сопровождения при зачислении. Прозрачные цены, без скрытых платежей."`

### Plan Básico → "Homologación" (4 features, keep count):
- EN: `plan_basico_title: "Homologation"`, `plan_basico_price: "€399"`, `plan_basico_desc: "Degree homologation with full support"`, features: `"Complete document preparation"`, `"Ministry submission and follow-up"`, `"Chat support with coordinator"`, `"Online status tracking"`
- ES: `plan_basico_title: "Homologación"`, `plan_basico_price: "€399"`, `plan_basico_desc: "Homologación de título con soporte completo"`, features: `"Preparación completa de documentos"`, `"Presentación y seguimiento en el Ministerio"`, `"Soporte por chat con coordinador"`, `"Seguimiento del estado online"`
- RU: `plan_basico_title: "Омологация"`, `plan_basico_price: "€399"`, `plan_basico_desc: "Омологация диплома с полной поддержкой"`, features: `"Полная подготовка документов"`, `"Подача и отслеживание в Министерстве"`, `"Чат-поддержка с координатором"`, `"Онлайн-отслеживание статуса"`

### Plan Completo → "Bajo Llave" / "Turnkey" (6 → 8 features):
- EN: `plan_completo_title: "Turnkey"`, `plan_completo_price: "€899"`, `plan_completo_desc: "Homologation + university admission — the complete path"`, features: `"Everything in Homologation plan"`, `"Personal coordinator assigned"`, `"University selection assistance"`, `"Admission document preparation"`, `"University enrollment support"`, `"Selectividad preparation guidance"`, `"File tracking at every stage"`, `"Priority support"`
- ES: `plan_completo_title: "Bajo llave"`, `plan_completo_price: "€899"`, `plan_completo_desc: "Homologación + admisión universitaria — el camino completo"`, features: `"Todo lo del plan Homologación"`, `"Coordinador personal asignado"`, `"Asesoramiento en elección de universidad"`, `"Preparación de documentos de admisión"`, `"Acompañamiento en la matriculación"`, `"Orientación para la Selectividad"`, `"Seguimiento del expediente en cada etapa"`, `"Soporte prioritario"`
- RU: `plan_completo_title: "Под ключ"`, `plan_completo_price: "€899"`, `plan_completo_desc: "Омологация + поступление — полный путь"`, features: `"Всё из плана Омологация"`, `"Персональный координатор"`, `"Помощь в выборе университета"`, `"Подготовка документов для поступления"`, `"Сопровождение при зачислении"`, `"Подготовка к Selectividad"`, `"Отслеживание дела на каждом этапе"`, `"Приоритетная поддержка"`

In `Precios.tsx`, change completo features count from 6 to 8:
```tsx
{ key: "completo", features: 8, highlighted: true },
```

### Plan Premium (8 features, keep count):
- EN: `plan_premium_title: "Premium"`, `plan_premium_price: "€1 499"`, `plan_premium_desc: "Complete service with language preparation and personal curator"`, features: `"Everything in Turnkey plan"`, `"3-month Spanish course (A1–B1)"`, `"Personal curator for your family"`, `"Sworn translation management"`, `"Document apostille"`, `"24/7 WhatsApp support"`, `"Visa guidance (if applicable)"`, `"Satisfaction guarantee"`
- ES: `plan_premium_title: "Premium"`, `plan_premium_price: "€1 499"`, `plan_premium_desc: "Servicio completo con preparación lingüística y curador personal"`, features: `"Todo lo del plan Bajo llave"`, `"Curso de español de 3 meses (A1–B1)"`, `"Curador personal para tu familia"`, `"Gestión de traducción jurada"`, `"Apostilla de documentos"`, `"Soporte 24/7 por WhatsApp"`, `"Asesoramiento de visado (si aplica)"`, `"Garantía de satisfacción"`
- RU: `plan_premium_title: "Premium"`, `plan_premium_price: "€1 499"`, `plan_premium_desc: "Полный сервис с языковой подготовкой и персональным куратором"`, features: `"Всё из плана Под ключ"`, `"Курс испанского 3 месяца (A1–B1)"`, `"Персональный куратор для вашей семьи"`, `"Управление присяжным переводом"`, `"Апостиль документов"`, `"Поддержка 24/7 в WhatsApp"`, `"Помощь с визой (при необходимости)"`, `"Гарантия результата"`

### CTA bottom — Precios:
- EN: `cta_title: "Ready to start?"`, `cta_subtitle: "Choose a plan or book a consultation — we'll help you pick the right option."`, `cta_start: "Create account"`, `cta_consult: "Book a consultation"`
- ES: `cta_title: "¿Listo para empezar?"`, `cta_subtitle: "Elige un plan o reserva una consulta — te ayudaremos a elegir la mejor opción."`, `cta_start: "Crear cuenta"`, `cta_consult: "Solicitar consulta"`
- RU: `cta_title: "Готовы начать?"`, `cta_subtitle: "Выберите план или запишитесь на консультацию — поможем подобрать оптимальный вариант."`, `cta_start: "Создать аккаунт"`, `cta_consult: "Записаться на консультацию"`

## 8. SEO meta — Home page (YML files)

- EN: `title: "Space for Edu — European Education in Spain"`, `description: "Degree homologation, university admission, and Spanish courses. Full support from documents to enrollment. 10+ years, 500+ students."`
- ES: `title: "Space for Edu — Educación Europea en España"`, `description: "Homologación de títulos, admisión universitaria y cursos de español. Acompañamiento completo desde los documentos hasta la matriculación. 10+ años, 500+ estudiantes."`
- RU: `title: "Space for Edu — Европейское образование в Испании"`, `description: "Омологация дипломов, поступление в университет и курсы испанского. Полное сопровождение от документов до зачисления. 10+ лет, 500+ студентов."`

## 9. Sub-page CTA cross-sell (i18n JSON only)

Update CTA sections on Homologación, Universidad, Español to cross-sell packages:

### Homologación CTA:
- EN: `cta_title: "Ready to homologate your degree?"`, `cta_subtitle: "Start with homologation — or choose a turnkey package for the full journey."`, `cta_start: "View plans"`
- ES: `cta_title: "¿Listo para homologar tu título?"`, `cta_subtitle: "Comienza con la homologación — o elige un paquete completo para todo el camino."`, `cta_start: "Ver planes"`
- RU: `cta_title: "Готовы омологировать диплом?"`, `cta_subtitle: "Начните с омологации — или выберите пакет «под ключ» для полного сопровождения."`, `cta_start: "Смотреть планы"`

### Universidad CTA:
- EN: `cta_title: "Ready to study in Spain?"`, `cta_subtitle: "Our turnkey package covers everything — from homologation to enrollment."`, `cta_start: "View plans"`
- ES: `cta_title: "¿Listo para estudiar en España?"`, `cta_subtitle: "Nuestro paquete completo cubre todo — desde la homologación hasta la matriculación."`, `cta_start: "Ver planes"`
- RU: `cta_title: "Готовы учиться в Испании?"`, `cta_subtitle: "Наш пакет «под ключ» покрывает всё — от омологации до зачисления."`, `cta_start: "Смотреть планы"`

### Español CTA:
- EN: `cta_title: "Ready to learn Spanish?"`, `cta_subtitle: "Spanish courses are included in our Premium plan, or book separately."`, `cta_trial: "Book a trial class"`
- ES: `cta_title: "¿Listo para aprender español?"`, `cta_subtitle: "Los cursos de español están incluidos en nuestro plan Premium, o contrátalos por separado."`, `cta_trial: "Reservar clase de prueba"`
- RU: `cta_title: "Готовы учить испанский?"`, `cta_subtitle: "Курсы испанского включены в план Premium или доступны отдельно."`, `cta_trial: "Записаться на пробный урок"`

**IMPORTANT:** The sub-page CTA buttons on Homologación and Universidad currently link to `routes.register`. After this change, `cta_start` says "View plans" — so these buttons should link to `publicRoute(publicPages.precios, locale)` instead. This requires a small code change in `Homologacion.tsx` and `Universidad.tsx`: change the `GradientButton href` in the CTA section from `routes.register` to `publicRoute(publicPages.precios, locale)`. Both pages already import `publicRoute` and `publicPages`.

---

## Verification checklist

After making all changes:

1. Run `node -e "..."` to verify all 3 JSON files have identical key sets
2. Run `npm run check` — must pass with 0 errors
3. Run `bin/rails test` — must pass with 0 failures
4. Visually verify the stats values in Home.tsx match: 500+, 98%, 10+, 20+
5. Verify Precios.tsx has `features: 8` for completo plan
6. Verify Home.tsx HowItWorksSection has 5 steps with `lg:grid-cols-5`
