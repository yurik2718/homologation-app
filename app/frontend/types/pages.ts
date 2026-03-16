// Page-specific props interfaces — one per page, added per step

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
