import { Link, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import {
  FileText,
  Clock,
  CreditCard,
  CheckCircle,
  Users,
  Plus,
} from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { RecentRequests } from "@/components/dashboard/RecentRequests"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types"
import type {
  DashboardIndexProps,
  DashboardStudentStats,
  DashboardAdminStats,
  RequestListItem,
} from "@/types/pages"

export default function DashboardIndex() {
  const { stats, features, requestsByMonth, recentRequests } =
    usePage<SharedProps & DashboardIndexProps>().props

  const { t } = useTranslation()

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("nav.dashboard") }]}
    >
      <Main>
        {features.canCreateRequest ? (
          <StudentDashboard stats={stats as DashboardStudentStats} />
        ) : (
          <AdminDashboard
            stats={stats as DashboardAdminStats}
            requestsByMonth={requestsByMonth ?? {}}
            recentRequests={recentRequests ?? []}
          />
        )}
      </Main>
    </AuthenticatedLayout>
  )
}

/* ─── Student Dashboard (simple) ─── */

function StudentDashboard({ stats }: { stats: DashboardStudentStats }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h1>
        <Link href={routes.newRequest}>
          <Button className="w-full sm:w-auto min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            {t("requests.new_request")}
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          label={t("requests.title")}
          value={stats.myRequests}
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          label={t("admin.stats.open_requests")}
          value={stats.pendingRequests}
        />
      </div>
    </div>
  )
}

/* ─── Admin/Coordinator Dashboard (shadcn-admin style) ─── */

function AdminDashboard({
  stats,
  requestsByMonth,
  recentRequests,
}: {
  stats: DashboardAdminStats
  requestsByMonth: Record<string, number>
  recentRequests: RequestListItem[]
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="overview">{t("admin.overview")}</TabsTrigger>
            <TabsTrigger value="requests">{t("requests.title")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.total_requests")}
              value={stats.totalRequests}
              change={stats.requestsChange}
            />
            <StatCard
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.new_users")}
              value={`+${stats.newUsersThisMonth}`}
              change={stats.usersChange}
            />
            <StatCard
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.awaiting_payment")}
              value={stats.awaitingPayment}
            />
            <StatCard
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.resolved")}
              value={stats.resolved}
            />
          </div>

          {/* Charts + Recent */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>{t("admin.overview")}</CardTitle>
              </CardHeader>
              <CardContent className="ps-2">
                <OverviewChart data={requestsByMonth} />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>{t("admin.recent_requests")}</CardTitle>
                <CardDescription>
                  {t("admin.recent_requests_desc", { count: stats.requestsThisMonth })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentRequests requests={recentRequests} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.total_requests")}
              value={stats.totalRequests}
            />
            <StatCard
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.open_requests")}
              value={stats.openRequests}
            />
            <StatCard
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.awaiting_payment")}
              value={stats.awaitingPayment}
            />
            <StatCard
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              label={t("admin.stats.resolved")}
              value={stats.resolved}
            />
          </div>
          <div className="flex justify-center pt-4">
            <Link href={routes.requests}>
              <Button variant="outline" className="min-h-[44px]">{t("admin.view_all_requests")}</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ─── Stat Card (shadcn-admin style) ─── */

function StatCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  change?: number
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground">
            {change >= 0 ? "+" : ""}
            {change}% {t("admin.from_last_month")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
