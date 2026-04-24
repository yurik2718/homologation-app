import { useState } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, FileText, Download } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { FormattedDate } from "@/components/common/FormattedDate"
import { LongText } from "@/components/common/LongText"
import { SearchInput } from "@/components/common/SearchInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { routes } from "@/lib/routes"
import { STATUSES } from "@/lib/colors"
import type { SharedProps } from "@/types/index"
import type { RequestsIndexProps, RequestListItem } from "@/types/pages"

export default function RequestsIndex() {
  const { t } = useTranslation()
  const { requests, features } = usePage<SharedProps & RequestsIndexProps>().props

  const pageUrl = usePage<SharedProps & RequestsIndexProps>().url
  const [search, setSearch] = useState("")
  const initialStatus = (() => {
    const qIdx = pageUrl.indexOf("?")
    if (qIdx === -1) return "all"
    return new URLSearchParams(pageUrl.slice(qIdx)).get("status") ?? "all"
  })()
  const [statusFilter, setStatusFilter] = useState(initialStatus)

  const filtered = requests.filter((r) => {
    const matchSearch = r.subject.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const showDownload = features.canSeeAllRequests

  const columns: ColumnDef<RequestListItem>[] = [
    {
      accessorKey: "subject",
      header: t("requests.table.subject"),
      cell: ({ row }) => (
        <LongText className="max-w-[300px] font-medium">
          {row.original.subject}
        </LongText>
      ),
    },
    {
      accessorKey: "id",
      header: t("requests.table.id"),
      cell: ({ row }) => <span className="text-muted-foreground">#{row.original.id}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: t("requests.table.created"),
      cell: ({ row }) => <FormattedDate date={row.original.createdAt} mode="date" />,
    },
    {
      accessorKey: "updatedAt",
      header: t("requests.table.last_activity"),
      cell: ({ row }) => <FormattedDate date={row.original.updatedAt} />,
    },
    {
      accessorKey: "status",
      header: t("requests.table.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      enableSorting: false,
    },
    ...(showDownload
      ? [ {
          id: "download",
          header: "",
          cell: ({ row }) => <DownloadCell request={row.original} />,
          enableSorting: false,
        } as ColumnDef<RequestListItem> ]
      : []),
  ]

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("nav.my_requests") }]}
    >
      <Main>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl font-bold">{t("requests.title")}</h1>
          {features.canCreateRequest && (
            <Link href={routes.newRequest}>
              <Button className="w-full sm:w-auto min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                {t("requests.new_request")}
              </Button>
            </Link>
          )}
        </div>

        {requests.length === 0 ? (
          <EmptyState canCreate={features.canCreateRequest ?? false} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(r) => router.visit(routes.request(r.id))}
            searchColumn="subject"
            searchValue={search}
            renderMobileCard={(r) => <RequestCard request={r} showDownload={showDownload} />}
            toolbarContent={
              <div className="flex flex-col gap-2 sm:flex-row">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t("common.search")}
                  className="sm:max-w-xs"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder={t("requests.table.status_filter")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.filter")}</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`requests.status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        )}
      </Main>
    </AuthenticatedLayout>
  )
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-1">{t("requests.no_requests")}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t("requests.empty_hint")}</p>
      {canCreate && (
        <Link href={routes.newRequest}>
          <Button className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            {t("requests.new_request")}
          </Button>
        </Link>
      )}
    </div>
  )
}

function RequestCard({ request, showDownload }: { request: RequestListItem; showDownload: boolean }) {
  const { t } = useTranslation()
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.visit(routes.request(request.id))}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-tight">{request.subject}</p>
          <StatusBadge status={request.status} />
        </div>
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span>#{request.id}</span>
            <span>
              {t("requests.table.last_activity")}:{" "}
              <FormattedDate date={request.updatedAt} />
            </span>
          </div>
          {showDownload && <DownloadCell request={request} />}
        </div>
      </CardContent>
    </Card>
  )
}

function DownloadCell({ request }: { request: RequestListItem }) {
  const { t } = useTranslation()
  if (!request.filesCount) return null
  return (
    <a
      href={routes.downloadAll(request.id)}
      download
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px] whitespace-nowrap cursor-pointer"
      aria-label={t("requests.files.download_all")}
    >
      <Download className="h-4 w-4" />
      <span>{t("requests.files.download_all")}</span>
      <span className="text-xs text-muted-foreground">({request.filesCount})</span>
    </a>
  )
}
