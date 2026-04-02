import { useMemo, memo, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  LayoutDashboard,
  MessagesSquare,
  FileText,
  FilePlus,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  Bell,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronsUpDown,
  GraduationCap,
  Rocket,
  Kanban,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { routes } from "@/lib/routes"
import { getInitials, cn } from "@/lib/utils"
import type { SharedProps, User } from "@/types"
import type { LucideIcon } from "lucide-react"

type Cabinet = "homologation" | "education"

interface NavItem {
  show: boolean
  href: string
  icon: LucideIcon
  label: string
  badge?: number
  exact?: boolean
  cabinet?: Cabinet | "both"
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function isActive(href: string, currentPath: string, exact?: boolean): boolean {
  if (exact || href === "/") return currentPath === href
  return currentPath === href || currentPath.startsWith(href + "/")
}

const UserCard = memo(function UserCard({ user, initials }: { user: User; initials: string }) {
  return (
    <div className="flex items-center gap-2 text-left text-sm">
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
        <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 leading-tight">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  )
})

export function AppSidebar() {
  const { t } = useTranslation()
  const { url, props } = usePage<SharedProps>()
  const { auth, features, unreadNotificationsCount, unreadChatsCount } = props
  const user = auth.user

  // Super admin gets 4 domain-oriented groups; other roles get the flat layout
  const isSuperAdmin = features.canAccessAdmin
  const hasBothCabinets = features.hasHomologation && features.hasEducation
  const showSwitcher = !isSuperAdmin && hasBothCabinets

  const [activeCabinet, setActiveCabinet] = useState<Cabinet>(() => {
    if (!hasBothCabinets) return features.hasHomologation ? "homologation" : "education"
    return (typeof window !== "undefined"
      ? localStorage.getItem("activeCabinet") as Cabinet
      : null) ?? "homologation"
  })

  function switchCabinet(cabinet: Cabinet) {
    setActiveCabinet(cabinet)
    localStorage.setItem("activeCabinet", cabinet)
  }

  const navGroups = useMemo<NavGroup[]>(() => isSuperAdmin
    ? [
        {
          label: t("nav.homologation"),
          items: [
            {
              show: features.hasHomologation,
              href: routes.dashboard,
              icon: LayoutDashboard,
              label: t("nav.dashboard"),
            },
            {
              show: features.hasHomologation,
              href: routes.requests,
              icon: FileText,
              label: t("nav.all_requests"),
              exact: true,
            },
            {
              show: features.hasHomologation,
              href: routes.chats,
              icon: MessagesSquare,
              label: t("nav.chats"),
              badge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
            },
            {
              show: features.hasHomologation && features.canAccessPipeline,
              href: routes.admin.pipeline,
              icon: Kanban,
              label: t("nav.pipeline"),
            },
          ],
        },
        {
          label: t("nav.teaching"),
          items: [
            {
              show: features.hasEducation,
              href: routes.teachers,
              icon: GraduationCap,
              label: t("nav.teachers"),
            },
            {
              show: features.hasEducation,
              href: routes.admin.lessons,
              icon: BookOpen,
              label: t("nav.all_lessons"),
            },
            {
              show: features.hasEducation,
              href: routes.lessons,
              icon: Calendar,
              label: t("nav.calendar"),
            },
          ],
        },
        {
          label: t("nav.administration"),
          items: [
            {
              show: true,
              href: routes.admin.users,
              icon: Users,
              label: t("admin.users"),
            },
            {
              show: true,
              href: routes.admin.root,
              icon: ShieldCheck,
              label: t("nav.admin"),
              exact: true,
            },
          ],
        },
        {
          label: t("nav.other"),
          items: [
            {
              show: true,
              href: routes.notifications,
              icon: Bell,
              label: t("nav.notifications"),
              badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
            },
            {
              show: true,
              href: routes.settings.root,
              icon: Settings,
              label: t("nav.settings"),
            },
          ],
        },
      ]
    : [
        {
          label: t("nav.general"),
          items: [
            {
              show: features.canSeeDashboard && features.hasHomologation && features.hasEducation,
              href: routes.dashboard,
              icon: LayoutDashboard,
              label: t("nav.dashboard"),
              cabinet: "both" as const,
            },
            {
              show: features.canSeeMyRequests && features.hasHomologation,
              href: routes.requests,
              icon: FileText,
              label: t("nav.my_requests"),
              exact: true,
              cabinet: "homologation" as const,
            },
            {
              show: features.canCreateRequest && features.hasHomologation,
              href: routes.newRequest,
              icon: FilePlus,
              label: t("nav.new_request"),
              cabinet: "homologation" as const,
            },
            {
              show: features.canSeeChat && features.hasEducation,
              href: routes.conversations,
              icon: MessageCircle,
              label: t("nav.chat"),
              badge: unreadChatsCount > 0 ? unreadChatsCount : undefined,
              cabinet: "education" as const,
            },
            {
              show: features.canSeeCalendar && features.hasEducation,
              href: routes.lessons,
              icon: BookOpen,
              label: t("nav.my_lessons"),
              cabinet: "education" as const,
            },
          ],
        },
        {
          label: t("nav.management"),
          items: [
            {
              show: features.canManageTeachers && features.hasEducation,
              href: routes.teachers,
              icon: GraduationCap,
              label: t("nav.teachers"),
              cabinet: "education" as const,
            },
            {
              show: features.canSeeAllLessons && features.hasEducation,
              href: routes.admin.lessons,
              icon: BookOpen,
              label: t("nav.all_lessons"),
              cabinet: "education" as const,
            },
          ],
        },
        {
          label: t("nav.other"),
          items: [
            {
              show: true,
              href: routes.notifications,
              icon: Bell,
              label: t("nav.notifications"),
              badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
              cabinet: "both" as const,
            },
            {
              show: true,
              href: routes.settings.root,
              icon: Settings,
              label: t("nav.settings"),
              cabinet: "both" as const,
            },
          ],
        },
      ],
  [isSuperAdmin, features, unreadNotificationsCount, unreadChatsCount, t])

  const visibleGroups = useMemo(() =>
    navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!item.show) return false
          if (!showSwitcher) return true
          if (!item.cabinet || item.cabinet === "both") return true
          return item.cabinet === activeCabinet
        }),
      }))
      .filter((group) => group.items.length > 0),
    [navGroups, showSwitcher, activeCabinet])

  const initials = useMemo(() =>
    user?.name ? getInitials(user.name) : "?",
    [user?.name])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:justify-center">
              <Link href={routes.dashboard}>
                <Rocket className="!size-5 text-[#E8453C]" />
                <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
                  Space for <span className="text-[#2D7FF9]">Edu</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {showSwitcher && (
        <div className="px-3 pb-2 pt-1">
          <div className="flex rounded-lg bg-sidebar-accent/50 p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => switchCabinet("homologation")}
              className={cn(
                "flex-1 rounded-md px-2 py-2.5 text-xs font-medium transition-colors min-h-[44px]",
                activeCabinet === "homologation"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("nav.cabinet_homologation")}
            </button>
            <button
              type="button"
              onClick={() => switchCabinet("education")}
              className={cn(
                "flex-1 rounded-md px-2 py-2.5 text-xs font-medium transition-colors min-h-[44px]",
                activeCabinet === "education"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("nav.cabinet_education")}
            </button>
          </div>
        </div>
      )}

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href + item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href, url, item.exact)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge != null && (
                      <SidebarMenuBadge className="!bg-primary !text-primary-foreground rounded-full h-5 min-w-5 px-1.5 text-[11px] font-semibold">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <UserCard user={user} initials={initials} />
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="px-1 py-1.5">
                      <UserCard user={user} initials={initials} />
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={routes.session} method="delete" as="button" className="w-full text-destructive">
                      <LogOut className="mr-2 size-4" />
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
