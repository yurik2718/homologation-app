import { Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { usePage } from "@inertiajs/react"
import {
  LayoutDashboard,
  Inbox,
  FileText,
  FilePlus,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  Bell,
  ShieldCheck,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"

export function AppSidebar() {
  const { t } = useTranslation()
  const { auth, features } = usePage<SharedProps>().props
  const user = auth.user

  const navItems = [
    {
      show: features.canSeeDashboard,
      href: routes.root,
      icon: LayoutDashboard,
      label: t("nav.dashboard"),
    },
    {
      show: features.canAccessInbox,
      href: routes.inbox,
      icon: Inbox,
      label: t("nav.inbox"),
    },
    {
      show: features.canSeeAllRequests,
      href: routes.requests,
      icon: FileText,
      label: t("nav.all_requests"),
    },
    {
      show: features.canCreateRequest,
      href: routes.newRequest,
      icon: FilePlus,
      label: t("nav.new_request"),
    },
    {
      show: features.canSeeMyRequests,
      href: routes.requests,
      icon: FileText,
      label: t("nav.my_requests"),
    },
    {
      show: features.canManageTeachers,
      href: routes.teachers,
      icon: Users,
      label: t("nav.teachers"),
    },
    {
      show: features.canSeeAllLessons,
      href: routes.admin.lessons,
      icon: BookOpen,
      label: t("nav.all_lessons"),
    },
    {
      show: features.canSeeCalendar,
      href: routes.lessons,
      icon: Calendar,
      label: t("nav.calendar"),
    },
    {
      show: features.canSeeMyLessons,
      href: routes.lessons,
      icon: BookOpen,
      label: t("nav.my_lessons"),
    },
    {
      show: features.canSeeChat,
      href: routes.conversations,
      icon: MessageCircle,
      label: t("nav.chat"),
    },
    {
      show: true,
      href: routes.notifications,
      icon: Bell,
      label: t("nav.notifications"),
    },
    {
      show: features.canAccessAdmin,
      href: routes.admin.root,
      icon: ShieldCheck,
      label: t("nav.admin"),
    },
  ]

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-2 font-semibold text-sm truncate">
          HomologApp
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <SidebarMenuItem key={item.href + item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="size-6">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                  <DropdownMenuItem asChild>
                    <Link href={routes.profile}>{t("nav.profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={routes.logout} method="delete" as="button">
                      {t("auth.sign_out")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
