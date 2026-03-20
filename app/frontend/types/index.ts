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
}

export interface SharedProps extends PageProps {
  auth: { user: User | null }
  flash: { notice?: string; alert?: string }
  features: AppFeatures
  unreadNotificationsCount: number
  unreadChatsCount: number
  selectOptions: Record<string, SelectOption[]>
}

export interface SelectOption {
  key: string
  label?: string
  label_es?: string
  label_en?: string
  label_ru?: string
}
