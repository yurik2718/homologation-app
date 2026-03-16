import { useState } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/common/StatusBadge"
import { FormattedDate } from "@/components/common/FormattedDate"
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

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = requests.filter((r) => {
    const matchSearch = r.subject.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const columns: ColumnDef<RequestListItem>[] = [
    {
      accessorKey: "subject",
      header: t("requests.table.subject"),
      cell: ({ row }) => <span className="font-medium">{row.original.subject}</span>,
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
      cell: ({ row }) => <FormattedDate date={row.original.createdAt} />,
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
  ]

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("nav.requests") }]}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(r) => router.visit(routes.request(r.id))}
          searchColumn="subject"
          searchValue={search}
          renderMobileCard={(r) => <RequestCard request={r} />}
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
      </div>
    </AuthenticatedLayout>
  )
}

function RequestCard({ request }: { request: RequestListItem }) {
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
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>#{request.id}</span>
          <span>
            {t("requests.table.last_activity")}:{" "}
            <FormattedDate date={request.updatedAt} />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
