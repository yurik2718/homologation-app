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

export interface AppFeatures {
  // Cabinet access
  hasHomologation: boolean
  hasEducation: boolean
  // Action permissions
  canConfirmPayment: boolean
  canManageUsers: boolean
  canManageTeachers: boolean
  canAccessChats: boolean
  canAccessAdmin: boolean
  canCreateRequest: boolean
  canCreateLesson: boolean
  // Navigation visibility
  canSeeDashboard: boolean
  canSeeAllRequests: boolean
  canSeeMyRequests: boolean
  canSeeAllLessons: boolean
  canSeeCalendar: boolean
  canSeeChat: boolean
  canAccessPipeline: boolean
}

export interface PipelineStageConfig {
  key: string
  label_es: string
  label_en: string
  label_ru: string
  short: string
  icon: string
  color: string
  display: "kanban" | "horizontal"
}

export interface DocChecklistConfig {
  key: string
  label_es: string
  label_en: string
  label_ru: string
}

export interface PipelineConfig {
  stages: PipelineStageConfig[]
  document_checklist: DocChecklistConfig[]
  country_routing: {
    spanish_speaking: string[]
    cotejo_ministerio: string[]
    cotejo_delegacion_extra: string[]
  }
}

export interface SharedProps extends PageProps {
  auth: { user: User | null }
  flash: { notice?: string; alert?: string }
  features: AppFeatures
  unreadNotificationsCount: number
  unreadChatsCount: number
  selectOptions: Record<string, SelectOption[]>
  pipelineConfig: PipelineConfig
}

export interface SelectOption {
  key: string
  label?: string
  label_es?: string
  label_en?: string
  label_ru?: string
}
