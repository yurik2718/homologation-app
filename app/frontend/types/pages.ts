// Page-specific props interfaces — one per page, added per step

import type { PageProps } from "@inertiajs/core"
import type { SeoProps } from "@/components/public/SeoHead"

// All public marketing pages share this shape
export interface PublicPageProps extends PageProps {
  seo: SeoProps
  [key: string]: unknown
}

// notifications/Index
export interface NotificationItem {
  id: number
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
  notifiableType: string
  notifiableId: number
}

export interface NotificationsIndexProps {
  notifications: NotificationItem[]
}

// auth/ResetPassword
export interface ResetPasswordProps {
  token: string
}

// profile/Edit
export interface ProfileEditProps {
  profile: SettingsProfileData
}

// settings/*
export interface SettingsProfileData {
  id: number
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  birthday: string | null
  country: string | null
  locale: string
  isMinor: boolean
  guardianName: string | null
  guardianEmail: string | null
  guardianPhone: string | null
  guardianWhatsapp: string | null
  profileComplete: boolean
  notificationEmail: boolean
  notificationTelegram: boolean
  telegramConnected: boolean
}

export interface SettingsProfileProps {
  profile: SettingsProfileData
}

export interface SettingsAccountProps {
  account: {
    id: number
    name: string
    email: string
    provider: string | null
    hasPassword: boolean
    deletionRequestedAt: string | null
  }
}

export interface SettingsNotificationsProps {
  notifications: {
    notificationEmail: boolean
    notificationTelegram: boolean
    telegramConnected: boolean
  }
}

// requests/Index
export interface RequestListItem {
  id: number
  subject: string
  serviceType: string
  status: string
  createdAt: string
  updatedAt: string
  user: { id: number; name: string }
  filesCount?: number
}

export interface RequestsIndexProps {
  requests: RequestListItem[]
}

// requests/Show + requests/New
export interface FileInfo {
  id: number
  filename: string
  contentType: string
  byteSize: number
  category: "application" | "originals" | "documents"
}

export interface ConversationDetail {
  id: number
  messages: import("@/types/models.d").ChatMessage[]
}

export interface RequestDetail extends RequestListItem {
  description: string | null
  identityCard: string | null
  passport: string | null
  educationSystem: string | null
  studiesFinished: string | null
  studyTypeSpain: string | null
  studiesSpain: string | null
  university: string | null
  languageKnowledge: string | null
  languageCertificate: string | null
  paymentAmount: number | null
  paymentConfirmedAt: string | null
  amoCrmLeadId: string | null
  amoCrmSyncedAt: string | null
  amoCrmSyncError: string | null
  user: { id: number; name: string; email: string }
  conversation: ConversationDetail | null
  files: FileInfo[]
}

export interface RequestsShowProps {
  request: RequestDetail
}

// dashboard/Index
// chat/Index
export interface ChatIndexProps {
  conversations: import("@/types/models.d").ConversationListItem[]
}

// chat/Show
export interface ChatShowProps {
  conversation: import("@/types/models.d").ConversationFull
}

// chats/Index + chats/Show
export interface InboxConversation {
  id: number
  type: "request" | "teacher_student"
  title: string
  lastMessage: { body: string; createdAt: string } | null
  unread: boolean
  lastMessageAt: string | null
}

export interface InboxConversationDetail extends InboxConversation {
  messages: import("@/types/models.d").ChatMessage[]
  context:
    | {
        type: "request"
        requestId: number
        subject: string
        serviceType: string | null
        university: string | null
        status: string
        paymentAmount: number | null
        amoCrmLeadId: string | null
        amoCrmSyncedAt: string | null
        amoCrmSyncError: string | null
      }
    | {
        type: "teacher_student"
        teacherName: string | null
        studentName: string | null
      }
}

export interface InboxIndexProps {
  conversations: InboxConversation[]
  selectedConversation?: InboxConversationDetail | null
}

// teachers/Index
export interface TeacherItem {
  id: number
  name: string
  avatarUrl: string | null
  level: string | null
  hourlyRate: number | null
  bio: string | null
  permanentMeetingLink: string | null
  studentsCount: number
  lessonsThisWeek: number
  students: Array<{ id: number; name: string }>
}

export interface TeachersIndexProps {
  teachers: TeacherItem[]
  availableStudents: Array<{ id: number; name: string }>
}

// dashboard/Index
export interface DashboardStudentStats {
  myRequests: number
  pendingRequests: number
}

export interface DashboardAdminStats {
  totalRequests: number
  openRequests: number
  awaitingPayment: number
  resolved: number
  totalUsers: number
  newUsersThisMonth: number
  usersChange: number
  requestsThisMonth: number
  requestsChange: number
}

export interface DashboardIndexProps {
  stats: DashboardStudentStats | DashboardAdminStats
  requestsByMonth?: Record<string, number>
  recentRequests?: RequestListItem[]
}

// Shared lesson item for calendar/lessons/admin pages
export interface LessonItem {
  id: number
  teacherId: number
  studentId: number
  teacherName: string
  studentName: string
  scheduledAt: string
  durationMinutes: number
  meetingLink: string | null
  effectiveMeetingLink: string | null
  meetingLinkReady: boolean
  status: "scheduled" | "completed" | "cancelled"
  notes: string | null
}

// calendar/Index (teacher + student)
export interface CalendarIndexProps {
  view: "week" | "month" | "list"
  lessons: LessonItem[]
  weekStart?: string
  monthStart?: string
  monthSummary?: Record<string, MonthDayLesson[]>
  upcoming?: LessonItem[]
  past?: LessonItem[]
  assignedStudents: Array<{ id: number; name: string }>
}

// lessons/Index (student) — legacy, kept for compatibility
export interface LessonsIndexProps {
  upcoming: LessonItem[]
  past: LessonItem[]
}

// lessons/Show
export interface LessonsShowProps {
  lesson: LessonItem
}

// admin/Lessons
export interface MonthDayLesson {
  id: number
  teacherId: number
  teacherName: string
  studentName: string
  scheduledAt: string
  durationMinutes: number
  status: "scheduled" | "completed" | "cancelled"
  meetingLinkReady: boolean
}

export interface UserProfile {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  roles: string[]
  isTeacher: boolean
  phone: string | null
  whatsapp: string | null
  conversationId: number | null
  country: string | null
  locale: string | null
  createdAt: string
  teacherLevel?: string | null
  hourlyRate?: number | null
  permanentMeetingLink?: string | null
}

export interface AdminLessonsProps {
  view: "week" | "month" | "list"
  lessons: LessonItem[]
  teachers: Array<{ id: number; name: string }>
  students: Array<{ id: number; name: string }>
  weekStart?: string
  monthStart?: string
  monthSummary?: Record<string, MonthDayLesson[]>
  userProfiles?: Record<number, UserProfile>
  filters?: { teacherId?: string | null }
}

// admin/Dashboard
export interface AdminUser {
  id: number
  name: string
  email: string
  roles: string[]
  locale: string
  avatarUrl: string | null
  createdAt: string
  discarded: boolean
  deletionRequestedAt: string | null
  hasHomologation: boolean
  hasEducation: boolean
  purgeScheduledAt: string | null
  purgeable: boolean
  purgeStats: { requests: number; files: number }
}

export interface FinanceData {
  homologationRevenue: number
  homologationCount: number
  averageDeal: number
  revenueByYear: Record<string, number>
  educationRevenue: number
  educationLessons: number
  totalRevenue: number
}

export interface AdminDashboardProps {
  stats: {
    totalRequests: number
    openRequests: number
    awaitingPayment: number
    resolved: number
    totalUsers: number
    totalTeachers: number
  }
  finance: FinanceData
  requestsByMonth: Record<string, number>
  requestsByStatus: Record<string, number>
  recentRequests: RequestListItem[]
  failedSyncs: number
}

// admin/Pipeline
export interface PipelineCard {
  id: number
  studentName: string
  country: string | null
  identityCard: string | null
  year: number
  serviceType: string
  amount: number
  pipelineStage: string
  pipelineNotes: string | null
  documentChecklist: Record<string, boolean>
  documentsComplete: number
  documentsTotal: number
  cotejoRoute: "ministerio" | "delegacion" | "unknown"
  updatedAt: string
  countryMissing: boolean
  canAdvance: boolean
  canRetreat: boolean
  nextStageName: string | null
  requiresTranslation: boolean
}

export interface PipelineStats {
  active: number
  revenue: number
  byYear: Record<string, number>
  noPago: number
  cotejo: number
  cotejoMinisterio: number
  cotejoDelegacion: number
}

export interface PipelineFilters {
  q: string | null
  year: string | null
  cotejoRoute: string | null
  serviceType: string | null
}

export interface PipelineIndexProps {
  stages: Record<string, PipelineCard[]>
  stats: PipelineStats
  filters: PipelineFilters
}

// admin/Users
export interface AdminUsersProps {
  users: AdminUser[]
  newUser?: boolean
  editUser?: AdminUser
}
