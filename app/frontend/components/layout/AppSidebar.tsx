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
import { getInitials } from "@/lib/utils"
import type { SharedProps, User } from "@/types"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  show: boolean
  href: string
  icon: LucideIcon
  label: string
  badge?: number
  exact?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function isActive(href: string, currentPath: string, exact?: boolean): boolean {
  if (exact || href === "/") return currentPath === href
  return currentPath === href || currentPath.startsWith(href + "/")
}

function UserCard({ user, initials }: { user: User; initials: string }) {
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
}

export function AppSidebar() {
  const { t } = useTranslation()
  const { url, props } = usePage<SharedProps>()
  const { auth, features, unreadNotificationsCount } = props
  const user = auth.user

  // Super admin gets 4 domain-oriented groups; other roles get the flat layout
  const isSuperAdmin = features.canAccessAdmin

  const navGroups: NavGroup[] = isSuperAdmin
    ? [
        {
          label: t("nav.homologation"),
          items: [
            {
              show: true,
              href: routes.root,
              icon: LayoutDashboard,
              label: t("nav.dashboard"),
            },
            {
              show: true,
              href: routes.requests,
              icon: FileText,
              label: t("nav.all_requests"),
              exact: true,
            },
            {
              show: true,
              href: routes.chats,
              icon: MessagesSquare,
              label: t("nav.chats"),
            },
          ],
        },
        {
          label: t("nav.teaching"),
          items: [
            {
              show: true,
              href: routes.teachers,
              icon: GraduationCap,
              label: t("nav.teachers"),
            },
            {
              show: true,
              href: routes.admin.lessons,
              icon: BookOpen,
              label: t("nav.all_lessons"),
            },
            {
              show: true,
              href: routes.calendar,
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
              show: features.canSeeDashboard,
              href: routes.root,
              icon: LayoutDashboard,
              label: t("nav.dashboard"),
            },
            {
              show: features.canSeeMyRequests,
              href: routes.requests,
              icon: FileText,
              label: t("nav.my_requests"),
              exact: true,
            },
            {
              show: features.canCreateRequest,
              href: routes.newRequest,
              icon: FilePlus,
              label: t("nav.new_request"),
            },
            {
              show: features.canSeeChat,
              href: routes.conversations,
              icon: MessageCircle,
              label: t("nav.chat"),
            },
            {
              show: features.canSeeMyLessons,
              href: routes.lessons,
              icon: BookOpen,
              label: t("nav.my_lessons"),
            },
            {
              show: features.canSeeCalendar,
              href: routes.lessons,
              icon: Calendar,
              label: t("nav.calendar"),
            },
          ],
        },
        {
          label: t("nav.management"),
          items: [
            {
              show: features.canManageTeachers,
              href: routes.teachers,
              icon: GraduationCap,
              label: t("nav.teachers"),
            },
            {
              show: features.canSeeAllLessons,
              href: routes.admin.lessons,
              icon: BookOpen,
              label: t("nav.all_lessons"),
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

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.show),
    }))
    .filter((group) => group.items.length > 0)

  const initials = user?.name ? getInitials(user.name) : "?"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={routes.root}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SpaceForEdu</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Homologación España
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

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
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
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
