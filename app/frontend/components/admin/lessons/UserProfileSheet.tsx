import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Mail, Phone, Globe, Calendar, ExternalLink, MessageSquare } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import { getInitials, formatDate } from "@/lib/utils"
import { ROLE_COLORS } from "@/lib/colors"
import type { UserProfile } from "@/types/pages"

interface UserProfileSheetProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileSheet({ user, open, onOpenChange }: UserProfileSheetProps) {
  const { t, i18n } = useTranslation()

  if (!user) return null

  const isTeacher = user.roles.includes("teacher")
  const chatHref = user.conversationId ? routes.chat(user.conversationId) : routes.chats

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-base">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{user.name}</SheetTitle>
              <SheetDescription className="flex flex-wrap gap-1.5 mt-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className={ROLE_COLORS[role] ?? ""}>
                    {t(`auth.roles.${role}`)}
                  </Badge>
                ))}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-4 space-y-4">
          <div className="space-y-2.5">
            <ProfileRow icon={Mail} value={user.email} />
            {user.phone && <ProfileRow icon={Phone} label={t("profile.phone")} value={user.phone} />}
            {user.whatsapp && (
              <ProfileRow icon={Phone} label={t("profile.whatsapp")} value={user.whatsapp} />
            )}
            {user.country && (
              <ProfileRow icon={Globe} label={t("profile.country")} value={user.country} />
            )}
            <ProfileRow
              icon={Calendar}
              label={t("common.created_at")}
              value={formatDate(user.createdAt, "date", i18n.language)}
            />
          </div>

          {isTeacher && (user.teacherLevel || user.hourlyRate != null) && (
            <div className="border-t pt-4 space-y-2.5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("auth.roles.teacher")}
              </h3>
              {user.teacherLevel && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t("teachers.level")}:</span>
                  <Badge variant="secondary">{user.teacherLevel}</Badge>
                </div>
              )}
              {user.hourlyRate != null && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t("teachers.hourly_rate")}:</span>
                  <span className="font-medium">€{user.hourlyRate}/h</span>
                </div>
              )}
              {user.permanentMeetingLink && (
                <a
                  href={user.permanentMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="truncate">{t("teachers.permanent_link")}</span>
                </a>
              )}
            </div>
          )}
        </div>

        <SheetFooter>
          <Button className="w-full min-h-[44px]" asChild>
            <Link href={chatHref}>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              {t("chat.title")}
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label?: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      {label && <span className="text-muted-foreground">{label}:</span>}
      <span className="font-medium truncate">{value}</span>
    </div>
  )
}
