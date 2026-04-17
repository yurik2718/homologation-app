Ты опытный дизайнер + маркетолог + fullstack-разработчик. Мы продолжаем работу над homologation-app — лендинг и приложение для помощи студентам с омологацией дипломов в Испании (Rails 8 + Inertia.js + React 19, 3 языка es/en/ru). Цель — превратить лендинг в главный инструмент продаж: максимально нарастить органический трафик из Google, Yandex, Bing, попадание в AI-чаты (ChatGPT, Claude, Perplexity), улучшить поведенческие факторы.

## Перед началом прочитай обязательно

1. `CLAUDE.md` (в корне репо) — правила проекта (i18n, Inertia-паттерны, authorization, тесты).
2. `docs/20_SEO_ANALYTICS.md` — полный справочник по всему, что уже настроено в SEO/Analytics (Sprint 1). Там же — все env vars и порядок деплоя.
3. `.env.example` — единый источник истины для env-переменных (Contacts, Stripe, App host, webmaster verification, GTM, Sentry).

## Что уже сделано (Sprint 1, зашипили 2026-04-17)

**SEO-фундамент:**
- Динамический `sitemap.xml` (multilingual, `xhtml:link hreflang`) + динамический `robots.txt` с явным allow для AI-краулеров
- `llms.txt` — факт-плотный документ для LLM
- Canonical URL на всех публичных страницах
- Schema.org JSON-LD: `EducationalOrganization` + `WebSite` site-wide (server-rendered), `BreadcrumbList` + `Service` per-page
- Twitter Cards + OG-теги

**Аналитика + GDPR:**
- CMP на `vanilla-cookieconsent` v3 с переводами на 3 языка, 3 категории (necessary/analytics/marketing)
- Google Tag Manager (env-gated на `GTM_ID`) с Consent Mode v2 defaults (всё "denied" до согласия)
- CSP автоматически расширяется под GTM/GA/Metrica/Clarity/Meta Pixel при наличии `GTM_ID`
- Meta-теги верификации Google/Yandex/Bing/Meta (env-gated)

**Error tracking:**
- Sentry backend (`sentry-rails`) + frontend (`@sentry/react`), PII scrubbed, legitimate interest basis (без CMP-согласия), DSN через meta-теги (без Vite build-time env)

**Dark mode разбанен в CLAUDE.md**, но сам toggle не реализован — это задача Sprint 2.

## Что делаем дальше (по приоритету)

### Sprint 2 — Core Web Vitals + UX апгрейды (НАЧИНАТЬ ЗДЕСЬ)
1. Lighthouse-аудит и оптимизация: LCP < 2.5s, INP < 200ms, CLS < 0.1 (lazy-load картинок, preload Geist, bundle-split, inline critical CSS)
2. Dark mode toggle в хедере (sun/moon icon, localStorage + `prefers-color-scheme` fallback, прогон всех публичных секций под токены темы). Инфраструктура CSS vars уже есть в `application.css`.
3. Dynamic OG images (per-locale, per-page)
4. Sticky WhatsApp + sticky CTA на мобильном
5. FAQ accordion на главной (данные уже есть в `app/frontend/locales/*.json` под `public.homologation.faq_*` и т.п.)
6. Visible breadcrumbs (Schema уже эмитится, UI-компонент отсутствует)

### Sprint 3 — Поведенческие магниты
1. Eligibility Checker — 2-минутный квиз: тип диплома → оценка шансов + сроки + ориентир цены
2. Cost calculator
3. Видео-отзыв в hero (muted autoplay 30с)
4. Exit-intent модал с лид-магнитом ("Чек-лист 8 документов")
5. Progress bar при скролле

### Sprint 4 — Контент + авторитет (долгосрочно)
1. Блог / Resources — 10 long-tail статей для старта
2. Trustpilot business profile + настройка сбора отзывов
3. Google Business Profile
4. Wikidata entry для бренда
5. PR-активности: HARO, guest posts на educaweb.com, universia.es
6. Ручное присутствие на Reddit/Quora (r/Spain, r/IWantOut, r/expats)

## Рабочие правила (критично)

- **НИКОГДА не делай git commit.** Пользователь коммитит руками.
- Перед любым мержем: `bin/rails test` + `npm run check` + `bundle exec brakeman`. Все три должны быть зелёными.
- Все тексты через `t()` (react-i18next на фронте, Rails I18n на бэке). 3 языка обязательно.
- Inertia-паттерны: `useForm()`, `router.post/patch/delete`, `<Link>`. Никогда `fetch()`/`<a href>`/`window.location`.
- Авторизация через Pundit (`authorize @record` в каждом экшене).
- Mobile-first: 360px+. Кнопки `min-h-[44px]`.
- Все страницы через `<Card>`, не card-like `<div>`.
- GDPR-совместимость: любой новый пиксель / трекер — через CMP (категория analytics или marketing), кроме error-only Sentry.
- Не делай "хаки" для поведенческих факторов (Yandex/Google ловят и банят).

## Старт

Подтверди, что прочитал `CLAUDE.md` и `docs/20_SEO_ANALYTICS.md`, затем предложи план Sprint 2 — с чего начнём (рекомендую **Lighthouse-аудит**, чтобы видеть baseline метрики Core Web Vitals, потом уже оптимизации). Жду подтверждения перед имплементацией.
