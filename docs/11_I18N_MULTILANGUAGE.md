# Internationalization (i18n) — 3 Languages

## Overview

Приложение поддерживает **3 языка с первого дня**:
- **es** — Español (primary, default)
- **en** — English
- **ru** — Русский

**Важно:** i18n закладывается в архитектуру сразу. Ни одна строка UI-текста не пишется хардкодом.
Каждый React-компонент использует `t()` функцию вместо строковых литералов.

## Architecture

```
Frontend (React):  react-i18next + JSON translation files
Backend (Rails):   Rails I18n + YAML translation files
Select options:    config/select_options.yml (multi-label per option)
Emails:            Rails mailer views per locale
```

### Language Detection Priority
1. User's saved locale (`users.locale` column) — if logged in
2. URL param `?lang=ru` — for switching
3. Browser `Accept-Language` header — for first visit
4. Default: `es`

---

## Frontend: react-i18next

### Setup

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Configuration

```ts
// app/frontend/lib/i18n.ts
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import es from "@/locales/es.json"
import en from "@/locales/en.json"
import ru from "@/locales/ru.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,  // React already escapes
    },
    detection: {
      // Priority: saved locale from Inertia props > URL > browser
      order: ["querystring", "navigator"],
      lookupQuerystring: "lang",
    },
  })

export default i18n
```

### Initialize in Inertia entrypoint

```tsx
// app/frontend/entrypoints/inertia.tsx
import "@/lib/i18n"  // Must be imported BEFORE any components
import { createInertiaApp } from "@inertiajs/react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

// Sync i18n language with user's saved locale from server
function LocaleSync({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const { current_user } = usePage().props as any

  useEffect(() => {
    if (current_user?.locale && i18n.language !== current_user.locale) {
      i18n.changeLanguage(current_user.locale)
    }
  }, [current_user?.locale])

  return <>{children}</>
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("../pages/**/*.tsx", { eager: true })
    return pages[`../pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <LocaleSync>
        <App {...props} />
      </LocaleSync>
    )
  },
})
```

---

## Translation Files Structure

```
app/frontend/locales/
├── es.json    # Spanish (primary)
├── en.json    # English
└── ru.json    # Russian
```

### Translation keys organized by page/feature

```json
// app/frontend/locales/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "submit": "Enviar",
    "delete": "Eliminar",
    "edit": "Editar",
    "search": "Buscar",
    "filter": "Filtrar",
    "loading": "Cargando...",
    "no_results": "No se encontraron resultados",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "yes": "Sí",
    "no": "No",
    "or": "o",
    "download": "Descargar",
    "download_all": "Descargar todo",
    "required": "Obligatorio",
    "optional": "Opcional",
    "error": "Error",
    "success": "Éxito"
  },

  "auth": {
    "sign_in": "Iniciar sesión",
    "sign_up": "Crear cuenta",
    "sign_out": "Cerrar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "confirm_password": "Confirmar contraseña",
    "forgot_password": "¿Olvidaste tu contraseña?",
    "reset_password": "Restablecer contraseña",
    "continue_with_google": "Continuar con Google",
    "continue_with_apple": "Continuar con Apple",
    "no_account": "¿No tienes cuenta?",
    "has_account": "¿Ya tienes cuenta?",
    "accept_privacy": "He leído y acepto la política de privacidad"
  },

  "profile": {
    "complete_title": "Completa tu perfil",
    "whatsapp": "Número de WhatsApp",
    "whatsapp_hint": "Con código de país, ej: +34612345678",
    "phone": "Teléfono",
    "birthday": "Fecha de nacimiento",
    "country": "País de origen",
    "save_continue": "Guardar y continuar"
  },

  "requests": {
    "title": "Mis solicitudes",
    "new_request": "Nueva solicitud",
    "submit_request": "Enviar solicitud",
    "save_draft": "Guardar borrador",
    "no_requests": "Aún no tienes solicitudes",

    "status": {
      "draft": "Borrador",
      "submitted": "Enviada",
      "in_review": "En revisión",
      "awaiting_payment": "Pendiente de pago",
      "payment_confirmed": "Pago confirmado",
      "in_progress": "En proceso",
      "awaiting_reply": "Esperando respuesta",
      "resolved": "Resuelta",
      "closed": "Cerrada"
    },

    "table": {
      "subject": "Asunto",
      "id": "ID",
      "created": "Creada",
      "last_activity": "Última actividad",
      "status": "Estado",
      "status_filter": "Estado"
    },

    "form": {
      "section_about": "Sobre ti",
      "section_request": "Tu solicitud",
      "section_education": "Educación",
      "section_optional": "Opcional",
      "section_documents": "Documentos",

      "name": "Nombre y apellidos",
      "service_type": "Servicio solicitado",
      "subject": "Asunto",
      "description": "Descripción",
      "description_hint": "Introduce los detalles de tu solicitud. Un miembro de nuestro equipo responderá lo antes posible.",
      "identity_card": "Documento de identidad",
      "passport": "Pasaporte",
      "education_system": "Sistema educativo de estudios",
      "studies_finished": "¿Estudios terminados?",
      "study_type_spain": "Tipo de estudios a realizar en España",
      "studies_spain": "Estudios a realizar en España",
      "university": "Universidad donde vas a estudiar",
      "language_level": "Nivel de idioma",
      "language_certificate": "Certificado de idioma",
      "referral_source": "¿Cómo nos encontraste?",
      "privacy_policy": "He leído y acepto la política de privacidad",

      "application_file": "Solicitud (заявление)",
      "originals_files": "Documentos originales",
      "other_files": "Otros documentos",
      "drop_file": "Arrastra un archivo aquí o haz clic para seleccionar",
      "drop_files": "Arrastra archivos aquí o haz clic para seleccionar",
      "max_size": "Máximo {{size}} MB por archivo"
    }
  },

  "chat": {
    "title": "Conversación",
    "type_message": "Escribe un mensaje...",
    "send": "Enviar",
    "attach_file": "Adjuntar archivo",
    "no_messages": "Aún no hay mensajes. ¡Inicia la conversación!"
  },

  "notifications": {
    "title": "Notificaciones",
    "mark_all_read": "Marcar todo como leído",
    "no_notifications": "No tienes notificaciones",
    "new_request": "Nueva solicitud recibida",
    "new_message": "Nuevo mensaje de {{name}}",
    "status_changed": "Estado actualizado a {{status}}",
    "payment_confirmed": "Pago confirmado: €{{amount}}"
  },

  "coordinator": {
    "confirm_payment": "Confirmar pago",
    "payment_amount": "Importe (€)",
    "confirm_sync": "Confirmar y sincronizar con CRM",
    "confirm_dialog_title": "Confirmar pago recibido",
    "confirm_dialog_description": "Introduce el importe del pago. Esto sincronizará los datos con AmoCRM.",
    "change_status": "Cambiar estado",
    "assign_to_me": "Asignarme esta solicitud",
    "unassigned": "Sin asignar",
    "crm_synced": "Sincronizado con CRM",
    "crm_syncing": "Sincronizando...",
    "crm_error": "Error de sincronización",
    "crm_retry": "Reintentar sincronización",
    "crm_not_synced": "No sincronizado"
  },

  "admin": {
    "dashboard": "Panel de administración",
    "users": "Usuarios",
    "reports": "Informes",
    "stats": {
      "total_requests": "Total solicitudes",
      "open_requests": "Abiertas",
      "awaiting_payment": "Pendientes de pago",
      "resolved": "Resueltas"
    },
    "user_management": {
      "add_user": "Añadir usuario",
      "edit_user": "Editar usuario",
      "role": "Rol",
      "roles": "Roles",
      "assign_role": "Asignar rol",
      "remove_role": "Quitar rol",
      "deactivate": "Desactivar"
    },
    "charts": {
      "requests_over_time": "Solicitudes a lo largo del tiempo",
      "by_status": "Por estado",
      "avg_response_time": "Tiempo medio de respuesta"
    }
  },

  "nav": {
    "dashboard": "Inicio",
    "requests": "Solicitudes",
    "new_request": "Nueva solicitud",
    "notifications": "Notificaciones",
    "profile": "Perfil",
    "admin": "Administración",
    "language": "Idioma"
  }
}
```

```json
// app/frontend/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter",
    "loading": "Loading...",
    "no_results": "No results found",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "yes": "Yes",
    "no": "No",
    "or": "or",
    "download": "Download",
    "download_all": "Download all",
    "required": "Required",
    "optional": "Optional",
    "error": "Error",
    "success": "Success"
  },

  "auth": {
    "sign_in": "Sign In",
    "sign_up": "Create Account",
    "sign_out": "Sign Out",
    "email": "Email",
    "password": "Password",
    "confirm_password": "Confirm Password",
    "forgot_password": "Forgot your password?",
    "reset_password": "Reset Password",
    "continue_with_google": "Continue with Google",
    "continue_with_apple": "Continue with Apple",
    "no_account": "Don't have an account?",
    "has_account": "Already have an account?",
    "accept_privacy": "I have read and accept the privacy policy"
  },

  "profile": {
    "complete_title": "Complete Your Profile",
    "whatsapp": "WhatsApp Number",
    "whatsapp_hint": "With country code, e.g.: +34612345678",
    "phone": "Phone",
    "birthday": "Date of Birth",
    "country": "Country of Origin",
    "save_continue": "Save & Continue"
  },

  "requests": {
    "title": "My Requests",
    "new_request": "New Request",
    "submit_request": "Submit Request",
    "save_draft": "Save Draft",
    "no_requests": "You don't have any requests yet",

    "status": {
      "draft": "Draft",
      "submitted": "Submitted",
      "in_review": "In Review",
      "awaiting_payment": "Awaiting Payment",
      "payment_confirmed": "Payment Confirmed",
      "in_progress": "In Progress",
      "awaiting_reply": "Awaiting Reply",
      "resolved": "Resolved",
      "closed": "Closed"
    },

    "table": {
      "subject": "Subject",
      "id": "ID",
      "created": "Created",
      "last_activity": "Last Activity",
      "status": "Status",
      "status_filter": "Status"
    },

    "form": {
      "section_about": "About You",
      "section_request": "Your Request",
      "section_education": "Education",
      "section_optional": "Optional",
      "section_documents": "Documents",

      "name": "Name and Surname",
      "service_type": "Service Requested",
      "subject": "Subject",
      "description": "Description",
      "description_hint": "Please enter the details of your request. A member of our team will respond as soon as possible.",
      "identity_card": "Identity Card",
      "passport": "Passport",
      "education_system": "Educational System of Studies",
      "studies_finished": "Studies Finished?",
      "study_type_spain": "Type of Studies in Spain",
      "studies_spain": "Studies to Be Carried Out in Spain",
      "university": "University Where You Are Going to Study",
      "language_level": "Language Level",
      "language_certificate": "Language Certificate",
      "referral_source": "How Did You Find Us?",
      "privacy_policy": "I have read and accept the privacy policy",

      "application_file": "Application Form",
      "originals_files": "Original Documents",
      "other_files": "Other Documents",
      "drop_file": "Drop file here or click to browse",
      "drop_files": "Drop files here or click to browse",
      "max_size": "Maximum {{size}} MB per file"
    }
  },

  "chat": {
    "title": "Conversation",
    "type_message": "Type a message...",
    "send": "Send",
    "attach_file": "Attach file",
    "no_messages": "No messages yet. Start the conversation!"
  },

  "notifications": {
    "title": "Notifications",
    "mark_all_read": "Mark all as read",
    "no_notifications": "You have no notifications",
    "new_request": "New request received",
    "new_message": "New message from {{name}}",
    "status_changed": "Status updated to {{status}}",
    "payment_confirmed": "Payment confirmed: €{{amount}}"
  },

  "coordinator": {
    "confirm_payment": "Confirm Payment",
    "payment_amount": "Amount (€)",
    "confirm_sync": "Confirm & Sync to CRM",
    "confirm_dialog_title": "Confirm Payment Received",
    "confirm_dialog_description": "Enter the payment amount. This will sync the data to AmoCRM.",
    "change_status": "Change Status",
    "assign_to_me": "Assign to Me",
    "unassigned": "Unassigned",
    "crm_synced": "Synced to CRM",
    "crm_syncing": "Syncing...",
    "crm_error": "Sync Error",
    "crm_retry": "Retry Sync",
    "crm_not_synced": "Not Synced"
  },

  "admin": {
    "dashboard": "Admin Dashboard",
    "users": "Users",
    "reports": "Reports",
    "stats": {
      "total_requests": "Total Requests",
      "open_requests": "Open",
      "awaiting_payment": "Awaiting Payment",
      "resolved": "Resolved"
    },
    "user_management": {
      "add_user": "Add User",
      "edit_user": "Edit User",
      "role": "Role",
      "roles": "Roles",
      "assign_role": "Assign Role",
      "remove_role": "Remove Role",
      "deactivate": "Deactivate"
    },
    "charts": {
      "requests_over_time": "Requests Over Time",
      "by_status": "By Status",
      "avg_response_time": "Average Response Time"
    }
  },

  "nav": {
    "dashboard": "Dashboard",
    "requests": "Requests",
    "new_request": "New Request",
    "notifications": "Notifications",
    "profile": "Profile",
    "admin": "Admin",
    "language": "Language"
  }
}
```

```json
// app/frontend/locales/ru.json
{
  "common": {
    "save": "Сохранить",
    "cancel": "Отмена",
    "submit": "Отправить",
    "delete": "Удалить",
    "edit": "Редактировать",
    "search": "Поиск",
    "filter": "Фильтр",
    "loading": "Загрузка...",
    "no_results": "Ничего не найдено",
    "back": "Назад",
    "next": "Далее",
    "previous": "Назад",
    "yes": "Да",
    "no": "Нет",
    "or": "или",
    "download": "Скачать",
    "download_all": "Скачать всё",
    "required": "Обязательно",
    "optional": "Необязательно",
    "error": "Ошибка",
    "success": "Успешно"
  },

  "auth": {
    "sign_in": "Войти",
    "sign_up": "Создать аккаунт",
    "sign_out": "Выйти",
    "email": "Электронная почта",
    "password": "Пароль",
    "confirm_password": "Подтвердите пароль",
    "forgot_password": "Забыли пароль?",
    "reset_password": "Сбросить пароль",
    "continue_with_google": "Войти через Google",
    "continue_with_apple": "Войти через Apple",
    "no_account": "Нет аккаунта?",
    "has_account": "Уже есть аккаунт?",
    "accept_privacy": "Я прочитал(а) и принимаю политику конфиденциальности"
  },

  "profile": {
    "complete_title": "Заполните профиль",
    "whatsapp": "Номер WhatsApp",
    "whatsapp_hint": "С кодом страны, например: +34612345678",
    "phone": "Телефон",
    "birthday": "Дата рождения",
    "country": "Страна происхождения",
    "save_continue": "Сохранить и продолжить"
  },

  "requests": {
    "title": "Мои заявки",
    "new_request": "Новая заявка",
    "submit_request": "Отправить заявку",
    "save_draft": "Сохранить черновик",
    "no_requests": "У вас пока нет заявок",

    "status": {
      "draft": "Черновик",
      "submitted": "Отправлена",
      "in_review": "На рассмотрении",
      "awaiting_payment": "Ожидает оплаты",
      "payment_confirmed": "Оплата подтверждена",
      "in_progress": "В работе",
      "awaiting_reply": "Ожидает ответа",
      "resolved": "Завершена",
      "closed": "Закрыта"
    },

    "table": {
      "subject": "Тема",
      "id": "ID",
      "created": "Создана",
      "last_activity": "Последняя активность",
      "status": "Статус",
      "status_filter": "Статус"
    },

    "form": {
      "section_about": "О вас",
      "section_request": "Ваша заявка",
      "section_education": "Образование",
      "section_optional": "Дополнительно",
      "section_documents": "Документы",

      "name": "Имя и фамилия",
      "service_type": "Запрашиваемая услуга",
      "subject": "Тема",
      "description": "Описание",
      "description_hint": "Опишите детали вашей заявки. Наш сотрудник ответит как можно скорее.",
      "identity_card": "Удостоверение личности",
      "passport": "Паспорт",
      "education_system": "Система образования",
      "studies_finished": "Обучение завершено?",
      "study_type_spain": "Тип обучения в Испании",
      "studies_spain": "Обучение в Испании",
      "university": "Университет, где будете учиться",
      "language_level": "Уровень языка",
      "language_certificate": "Языковой сертификат",
      "referral_source": "Как вы нас нашли?",
      "privacy_policy": "Я прочитал(а) и принимаю политику конфиденциальности",

      "application_file": "Заявление",
      "originals_files": "Оригиналы документов",
      "other_files": "Другие документы",
      "drop_file": "Перетащите файл сюда или нажмите для выбора",
      "drop_files": "Перетащите файлы сюда или нажмите для выбора",
      "max_size": "Максимум {{size}} МБ на файл"
    }
  },

  "chat": {
    "title": "Переписка",
    "type_message": "Введите сообщение...",
    "send": "Отправить",
    "attach_file": "Прикрепить файл",
    "no_messages": "Сообщений пока нет. Начните переписку!"
  },

  "notifications": {
    "title": "Уведомления",
    "mark_all_read": "Отметить все как прочитанные",
    "no_notifications": "У вас нет уведомлений",
    "new_request": "Получена новая заявка",
    "new_message": "Новое сообщение от {{name}}",
    "status_changed": "Статус обновлён: {{status}}",
    "payment_confirmed": "Оплата подтверждена: €{{amount}}"
  },

  "coordinator": {
    "confirm_payment": "Подтвердить оплату",
    "payment_amount": "Сумма (€)",
    "confirm_sync": "Подтвердить и синхронизировать с CRM",
    "confirm_dialog_title": "Подтверждение оплаты",
    "confirm_dialog_description": "Введите сумму оплаты. Данные будут синхронизированы с AmoCRM.",
    "change_status": "Изменить статус",
    "assign_to_me": "Назначить на меня",
    "unassigned": "Не назначен",
    "crm_synced": "Синхронизировано с CRM",
    "crm_syncing": "Синхронизация...",
    "crm_error": "Ошибка синхронизации",
    "crm_retry": "Повторить синхронизацию",
    "crm_not_synced": "Не синхронизировано"
  },

  "admin": {
    "dashboard": "Панель управления",
    "users": "Пользователи",
    "reports": "Отчёты",
    "stats": {
      "total_requests": "Всего заявок",
      "open_requests": "Открытые",
      "awaiting_payment": "Ожидают оплаты",
      "resolved": "Завершённые"
    },
    "user_management": {
      "add_user": "Добавить пользователя",
      "edit_user": "Редактировать пользователя",
      "role": "Роль",
      "roles": "Роли",
      "assign_role": "Назначить роль",
      "remove_role": "Убрать роль",
      "deactivate": "Деактивировать"
    },
    "charts": {
      "requests_over_time": "Заявки за период",
      "by_status": "По статусу",
      "avg_response_time": "Среднее время ответа"
    }
  },

  "nav": {
    "dashboard": "Главная",
    "requests": "Заявки",
    "new_request": "Новая заявка",
    "notifications": "Уведомления",
    "profile": "Профиль",
    "admin": "Администрирование",
    "language": "Язык"
  }
}
```

---

## React: How to Write Components (Rules)

### Rule 1: NEVER hardcode text

```tsx
// ❌ WRONG — hardcoded text
<Button>Submit</Button>
<Label>Name and Surname</Label>
<p>No results found</p>

// ✅ CORRECT — always use t()
import { useTranslation } from "react-i18next"

function MyComponent() {
  const { t } = useTranslation()

  return (
    <>
      <Button>{t("common.submit")}</Button>
      <Label>{t("requests.form.name")}</Label>
      <p>{t("common.no_results")}</p>
    </>
  )
}
```

### Rule 2: Use interpolation for dynamic values

```tsx
// ❌ WRONG
<p>New message from {name}</p>
<p>{`Maximum ${size} MB per file`}</p>

// ✅ CORRECT
<p>{t("notifications.new_message", { name })}</p>
<p>{t("requests.form.max_size", { size: 10 })}</p>
```

### Rule 3: Use t() for select option labels

```tsx
// Select options from Inertia shared data already have labels per language.
// Use the user's current locale to pick the right label.

function getOptionLabel(option: SelectOption, locale: string): string {
  // Options in select_options.yml have label_es, label_en, label_ru
  // If only "label" exists, it's the same in all languages (e.g., country names)
  return option[`label_${locale}`] || option.label || option.key
}

// Usage:
const { i18n } = useTranslation()
const locale = i18n.language  // "es" | "en" | "ru"

<Select>
  {options.map((opt) => (
    <SelectItem key={opt.key} value={opt.key}>
      {getOptionLabel(opt, locale)}
    </SelectItem>
  ))}
</Select>
```

### Rule 4: Translate status badges

```tsx
// ❌ WRONG
<Badge>{request.status}</Badge>

// ✅ CORRECT
<Badge>{t(`requests.status.${request.status}`)}</Badge>
```

### Rule 5: Date formatting respects locale

```tsx
import { useTranslation } from "react-i18next"
import { formatDistanceToNow, format } from "date-fns"
import { es, enUS, ru } from "date-fns/locale"

const DATE_LOCALES = { es, en: enUS, ru }

function FormattedDate({ date }: { date: string }) {
  const { i18n } = useTranslation()
  const locale = DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] || es

  return <span>{formatDistanceToNow(new Date(date), { addSuffix: true, locale })}</span>
}

// "2 months ago" / "hace 2 meses" / "2 месяца назад"
```

### Rule 6: Language Switcher component

```tsx
// app/frontend/components/LanguageSwitcher.tsx
import { useTranslation } from "react-i18next"
import { router } from "@inertiajs/react"

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code)
    // Persist to server (updates user.locale)
    router.patch("/profile", { locale: code }, { preserveState: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {LANGUAGES.find((l) => l.code === i18n.language)?.flag || "🌐"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={i18n.language === lang.code ? "font-bold" : ""}
          >
            {lang.flag} {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Backend: Rails I18n

### Config

```ruby
# config/application.rb
config.i18n.available_locales = [:es, :en, :ru]
config.i18n.default_locale = :es
config.i18n.fallbacks = true
```

### Set locale from user

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  around_action :switch_locale

  private

  def switch_locale(&action)
    locale = current_user&.locale || extract_locale_from_header || I18n.default_locale
    I18n.with_locale(locale, &action)
  end

  def extract_locale_from_header
    accept = request.env["HTTP_ACCEPT_LANGUAGE"]
    return nil unless accept
    preferred = accept.scan(/[a-z]{2}/).first
    I18n.available_locales.map(&:to_s).include?(preferred) ? preferred : nil
  end
end
```

### Backend translation files

```yaml
# config/locales/es.yml
es:
  activerecord:
    models:
      homologation_request: "Solicitud de homologación"
      user: "Usuario"
    attributes:
      homologation_request:
        subject: "Asunto"
        service_type: "Tipo de servicio"
        status: "Estado"
      user:
        name: "Nombre"
        email_address: "Correo electrónico"
    errors:
      models:
        homologation_request:
          attributes:
            privacy_accepted:
              accepted: "debe aceptar la política de privacidad"
  mailers:
    request_mailer:
      new_request:
        subject: "Nueva solicitud recibida: %{request_subject}"
      payment_confirmed:
        subject: "Pago confirmado para: %{request_subject}"
      status_changed:
        subject: "Estado actualizado: %{request_subject}"
  notifications:
    new_request: "Nueva solicitud de %{name}"
    new_message: "Nuevo mensaje de %{name}"
    payment_confirmed: "Pago de €%{amount} confirmado para '%{subject}'"
```

```yaml
# config/locales/en.yml
en:
  activerecord:
    models:
      homologation_request: "Homologation Request"
      user: "User"
    attributes:
      homologation_request:
        subject: "Subject"
        service_type: "Service Type"
        status: "Status"
      user:
        name: "Name"
        email_address: "Email"
    errors:
      models:
        homologation_request:
          attributes:
            privacy_accepted:
              accepted: "you must accept the privacy policy"
  mailers:
    request_mailer:
      new_request:
        subject: "New request received: %{request_subject}"
      payment_confirmed:
        subject: "Payment confirmed for: %{request_subject}"
      status_changed:
        subject: "Status updated: %{request_subject}"
  notifications:
    new_request: "New request from %{name}"
    new_message: "New message from %{name}"
    payment_confirmed: "Payment of €%{amount} confirmed for '%{subject}'"
```

```yaml
# config/locales/ru.yml
ru:
  activerecord:
    models:
      homologation_request: "Заявка на омологацию"
      user: "Пользователь"
    attributes:
      homologation_request:
        subject: "Тема"
        service_type: "Тип услуги"
        status: "Статус"
      user:
        name: "Имя"
        email_address: "Электронная почта"
    errors:
      models:
        homologation_request:
          attributes:
            privacy_accepted:
              accepted: "необходимо принять политику конфиденциальности"
  mailers:
    request_mailer:
      new_request:
        subject: "Получена новая заявка: %{request_subject}"
      payment_confirmed:
        subject: "Оплата подтверждена: %{request_subject}"
      status_changed:
        subject: "Статус обновлён: %{request_subject}"
  notifications:
    new_request: "Новая заявка от %{name}"
    new_message: "Новое сообщение от %{name}"
    payment_confirmed: "Оплата €%{amount} подтверждена для '%{subject}'"
```

---

## Select Options: Multi-language Labels

```yaml
# config/select_options.yml — multi-language labels
service_types:
  - key: "equivalencia"
    label_es: "Equivalencia"
    label_en: "Equivalence"
    label_ru: "Эквивалентность"
  - key: "invoice"
    label_es: "Solicitud de factura"
    label_en: "Invoice Request"
    label_ru: "Запрос счёта"

studies_finished:
  - key: "yes"
    label_es: "Sí"
    label_en: "Yes"
    label_ru: "Да"
  - key: "no"
    label_es: "No"
    label_en: "No"
    label_ru: "Нет"
  - key: "in_progress"
    label_es: "En curso"
    label_en: "In Progress"
    label_ru: "В процессе"

# For items where label is the same in all languages (proper nouns):
universities:
  - key: "ucm"
    label: "Universidad Complutense de Madrid"  # Same in all languages
  - key: "uam"
    label: "Universidad Autónoma de Madrid"
```

---

## Checklist for Every New Component

Before creating any React component, verify:

- [ ] All visible text uses `t("key")` — NO hardcoded strings
- [ ] Dynamic values use interpolation: `t("key", { name, amount })`
- [ ] Status values translated: `t(\`requests.status.${status}\`)`
- [ ] Select options use `getOptionLabel(opt, locale)`
- [ ] Dates formatted with locale-aware `date-fns`
- [ ] Form validation messages come from Rails I18n (sent via Inertia errors)
- [ ] Email subjects/bodies use Rails I18n (`t()` in mailers)
- [ ] Notifications use Rails I18n for `title` and `body`
