// Page-specific props interfaces — one per page, added per step

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
  profile: {
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
  referralSource: string | null
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
}

export interface DashboardIndexProps {
  stats: DashboardStudentStats | DashboardAdminStats
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

// calendar/Index (teacher)
export interface CalendarIndexProps {
  lessons: LessonItem[]
  weekStart: string
  assignedStudents: Array<{ id: number; name: string }>
}

// lessons/Index (student)
export interface LessonsIndexProps {
  upcoming: LessonItem[]
  past: LessonItem[]
}

// lessons/Show
export interface LessonsShowProps {
  lesson: LessonItem
}

// admin/Lessons
export interface AdminLessonsProps {
  lessons: LessonItem[]
  teachers: Array<{ id: number; name: string }>
  students: Array<{ id: number; name: string }>
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
  requestsByMonth: Record<string, number>
  requestsByStatus: Record<string, number>
  recentRequests: RequestListItem[]
  failedSyncs: number
}

// admin/Users
export interface AdminUsersProps {
  users: AdminUser[]
  newUser?: boolean
  editUser?: AdminUser
}
