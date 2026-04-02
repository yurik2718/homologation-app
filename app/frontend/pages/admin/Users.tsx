import { useState } from "react"
import { usePage, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, ShieldAlert, Settings2, Trash2, X } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { DataTable } from "@/components/data-table/DataTable"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { routes } from "@/lib/routes"
import { ROLE_COLORS } from "@/lib/colors"
import { ALL_ROLES } from "@/lib/constants"
import { formatDate, getInitials, cn } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { AdminUsersProps, AdminUser } from "@/types/pages"

type FilterTab = "active" | "gdpr" | "archived"

export default function AdminUsers() {
  const { t, i18n } = useTranslation()
  const { users, editUser } = usePage<SharedProps & AdminUsersProps>().props
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(editUser?.id ?? null)
  const [deactivatingUser, setDeactivatingUser] = useState<AdminUser | null>(null)
  const [gdprDeletingUser, setGdprDeletingUser] = useState<AdminUser | null>(null)
  const [filter, setFilter] = useState<FilterTab>("active")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const activeCount = users.filter((u) => !u.discarded).length
  const gdprCount = users.filter((u) => u.deletionRequestedAt !== null && !u.discarded).length
  const archivedCount = users.filter((u) => u.discarded).length

  // Count per role within current status filter (before role filter)
  const usersInStatusFilter = users.filter((u) => {
    if (filter === "active") return !u.discarded
    if (filter === "gdpr") return u.deletionRequestedAt !== null && !u.discarded
    if (filter === "archived") return u.discarded
    return true
  })
  const roleCountMap = Object.fromEntries(
    ALL_ROLES.map((role) => [role, usersInStatusFilter.filter((u) => u.roles.includes(role)).length])
  )

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const filteredUsers = usersInStatusFilter
    .filter((u) => {
      if (selectedRoles.length === 0) return true
      return selectedRoles.some((r) => u.roles.includes(r))
    })
    .filter((u) => {
      if (!search) return true
      const q = search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })

  // Always show live data from page props (roles update on assign/remove)
  const editingUser = editingUserId ? (users.find((u) => u.id === editingUserId) ?? null) : null

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: t("common.name"),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className={cn("font-medium truncate", user.discarded && "text-muted-foreground line-through")}>
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "roles",
      header: t("admin.user_management.roles"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.length === 0 ? (
            <span className="text-xs text-muted-foreground">{t("admin.user_management.no_roles")}</span>
          ) : (
            row.original.roles.map((role) => (
              <span
                key={role}
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"}`}
              >
                {t(`auth.roles.${role}`, { defaultValue: role })}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: t("admin.user_management.user_status"),
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original
        if (user.discarded) {
          return <Badge variant="secondary">{t("admin.user_management.deactivated")}</Badge>
        }
        if (user.deletionRequestedAt) {
          return (
            <Badge variant="destructive" className="gap-1">
              <ShieldAlert className="h-3 w-3" />
              {t("admin.user_management.status_gdpr")}
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            {t("admin.user_management.status_active")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("common.created_at"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt, "date", i18n.language)}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] gap-1.5"
          onClick={() => setEditingUserId(row.original.id)}
        >
          <Settings2 className="h-4 w-4" />
          {t("admin.user_management.manage_user")}
        </Button>
      ),
    },
  ]

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "active", label: t("admin.user_management.filter_active"), count: activeCount },
    ...(gdprCount > 0 ? [{ key: "gdpr" as FilterTab, label: "GDPR", count: gdprCount }] : []),
    ...(archivedCount > 0 ? [{ key: "archived" as FilterTab, label: t("admin.user_management.filter_archived"), count: archivedCount }] : []),
  ]

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.admin"), href: routes.admin.root },
        { label: t("admin.users") },
      ]}
    >
      <Main>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{t("admin.users")}</h1>
            <Button onClick={() => setShowAddUser(true)} className="min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.user_management.add_user")}
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            toolbarContent={
              <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {filterTabs.map(({ key, label, count }) => (
                    <Button
                      key={key}
                      variant={filter === key ? (key === "gdpr" ? "destructive" : "default") : "outline"}
                      size="sm"
                      className={cn(
                        "min-h-[44px] gap-1.5 shrink-0",
                        filter !== key && key === "gdpr" && "text-destructive border-destructive/30"
                      )}
                      onClick={() => { setFilter(key); setSelectedRoles([]) }}
                    >
                      {key === "gdpr" && <ShieldAlert className="h-3.5 w-3.5" />}
                      {label}
                      <span className={cn(
                        "text-xs rounded px-1.5 py-0.5",
                        filter === key
                          ? (key === "gdpr" ? "bg-white/20" : "bg-primary-foreground/20")
                          : "bg-muted"
                      )}>
                        {count}
                      </span>
                    </Button>
                  ))}
                </div>
                <Input
                  placeholder={t("admin.user_management.search_placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sm:max-w-xs min-h-[44px]"
                />
              </div>
              {/* Role filter chips */}
              <div className="flex gap-1.5 flex-wrap">
                {ALL_ROLES.map((role) => {
                  const active = selectedRoles.includes(role)
                  const count = roleCountMap[role] ?? 0
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors min-h-[32px]",
                        active
                          ? (ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600") + " border-transparent"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t(`auth.roles.${role}`, { defaultValue: role })}
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        active ? "bg-black/10" : "bg-muted"
                      )}>
                        {count}
                      </span>
                    </button>
                  )
                })}
                {selectedRoles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedRoles([])}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground border border-dashed border-border hover:bg-muted transition-colors min-h-[32px]"
                  >
                    <X className="h-3 w-3" />
                    {t("common.clear")}
                  </button>
                )}
              </div>
              </div>
            }
            renderMobileCard={(user) => (
              <UserMobileCard
                user={user}
                onManage={() => setEditingUserId(user.id)}
              />
            )}
          />

          <AddUserDialog open={showAddUser} onClose={() => setShowAddUser(false)} />

          {editingUser && (
            <EditUserSheet
              user={editingUser}
              onClose={() => setEditingUserId(null)}
              onDeactivate={() => {
                const u = editingUser
                setEditingUserId(null)
                setDeactivatingUser(u)
              }}
              onGdprDelete={() => {
                const u = editingUser
                setEditingUserId(null)
                setGdprDeletingUser(u)
              }}
            />
          )}

          <ConfirmDialog
            open={!!deactivatingUser}
            onOpenChange={(open) => !open && setDeactivatingUser(null)}
            title={t("admin.user_management.deactivate")}
            description={t("admin.user_management.deactivate_confirm", { name: deactivatingUser?.name })}
            onConfirm={() => {
              if (deactivatingUser) {
                router.delete(routes.admin.user(deactivatingUser.id), {
                  onSuccess: () => setDeactivatingUser(null),
                })
              }
            }}
            destructive
          />

          <ConfirmDialog
            open={!!gdprDeletingUser}
            onOpenChange={(open) => !open && setGdprDeletingUser(null)}
            title={t("admin.user_management.gdpr_delete")}
            description={t("admin.user_management.gdpr_delete_confirm", { name: gdprDeletingUser?.name })}
            onConfirm={() => {
              if (gdprDeletingUser) {
                router.delete(routes.admin.gdprDelete(gdprDeletingUser.id), {
                  onSuccess: () => setGdprDeletingUser(null),
                })
              }
            }}
            destructive
          />
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}

function EditUserSheet({
  user,
  onClose,
  onDeactivate,
  onGdprDelete,
}: {
  user: AdminUser
  onClose: () => void
  onDeactivate: () => void
  onGdprDelete: () => void
}) {
  const { t, i18n } = useTranslation()
  const { data, setData, patch, processing, errors } = useForm({
    name: user.name,
    has_homologation: user.hasHomologation,
    has_education: user.hasEducation,
  })
  const [removingRole, setRemovingRole] = useState<string | null>(null)
  const unassignedRoles = ALL_ROLES.filter((r) => !user.roles.includes(r))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(routes.admin.user(user.id), { onSuccess: onClose })
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto flex flex-col gap-0">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="truncate">{user.name}</SheetTitle>
              <SheetDescription className="truncate">{user.email}</SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {t("common.created_at")}: {formatDate(user.createdAt, "date", i18n.language)}
            </span>
            {user.discarded && <Badge variant="secondary" className="text-xs">{t("admin.user_management.deactivated")}</Badge>}
            {!user.discarded && user.deletionRequestedAt && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <ShieldAlert className="h-3 w-3" />
                GDPR
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 px-4 py-4 space-y-6">
          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sheet-name">{t("common.name")}</Label>
              <Input
                id="sheet-name"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Cabinets */}
            <div className="space-y-3">
              <p className="text-sm font-medium">{t("admin.user_management.cabinets")}</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                  <Checkbox
                    checked={data.has_homologation}
                    onCheckedChange={(checked) => setData("has_homologation", !!checked)}
                    disabled={user.discarded}
                  />
                  <div>
                    <span className="text-sm font-medium">{t("admin.user_management.cabinet_homologation")}</span>
                    <p className="text-xs text-muted-foreground">{t("admin.user_management.cabinet_homologation_hint")}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                  <Checkbox
                    checked={data.has_education}
                    onCheckedChange={(checked) => setData("has_education", !!checked)}
                    disabled={user.discarded}
                  />
                  <div>
                    <span className="text-sm font-medium">{t("admin.user_management.cabinet_education")}</span>
                    <p className="text-xs text-muted-foreground">{t("admin.user_management.cabinet_education_hint")}</p>
                  </div>
                </label>
              </div>
              {(errors as Record<string, string>).base && (
                <p className="text-sm text-destructive">{(errors as Record<string, string>).base}</p>
              )}
            </div>

            <Button type="submit" disabled={processing} className="min-h-[44px]">
              {t("common.save")}
            </Button>
          </form>

          <Separator />

          {/* Roles */}
          <div className="space-y-3">
            <p className="text-sm font-medium">{t("admin.user_management.roles")}</p>

            {user.roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.user_management.no_roles")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {t(`auth.roles.${role}`, { defaultValue: role })}
                    {!user.discarded && (
                      <button
                        type="button"
                        className="hover:opacity-70 flex items-center justify-center min-w-[20px] min-h-[20px]"
                        onClick={() => setRemovingRole(role)}
                        aria-label={`Remove ${role}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {!user.discarded && unassignedRoles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {unassignedRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="text-xs text-muted-foreground border rounded px-2.5 py-1 hover:bg-muted min-h-[32px] transition-colors"
                    onClick={() =>
                      router.post(routes.admin.assignRole(user.id), { role_name: role }, { preserveScroll: true })
                    }
                  >
                    + {t(`auth.roles.${role}`, { defaultValue: role })}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!user.discarded && (
            <>
              <Separator />

              {/* Danger zone */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-destructive">{t("admin.user_management.danger_zone")}</p>

                {user.deletionRequestedAt ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {t("admin.user_management.deletion_requested_on", {
                        date: formatDate(user.deletionRequestedAt, "date", i18n.language),
                      })}
                    </p>
                    <Button
                      variant="destructive"
                      className="min-h-[44px] gap-2 w-full"
                      onClick={onGdprDelete}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      {t("admin.user_management.gdpr_delete")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="min-h-[44px] gap-2 w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={onDeactivate}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("admin.user_management.deactivate")}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <ConfirmDialog
          open={removingRole !== null}
          onOpenChange={(open) => !open && setRemovingRole(null)}
          title={t("admin.user_management.remove_role")}
          description={t("admin.user_management.remove_role_confirm", {
            role: t(`auth.roles.${removingRole ?? ""}`, { defaultValue: removingRole ?? "" }),
            name: user.name,
          })}
          onConfirm={() => {
            if (removingRole) {
              router.delete(routes.admin.removeRole(user.id), {
                data: { role_name: removingRole },
                preserveScroll: true,
                onSuccess: () => setRemovingRole(null),
              })
            }
          }}
          destructive
        />
      </SheetContent>
    </Sheet>
  )
}

function UserMobileCard({ user, onManage }: { user: AdminUser; onManage: () => void }) {
  const { t, i18n } = useTranslation()
  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-3",
        user.deletionRequestedAt && !user.discarded && "border-destructive/30 bg-destructive/5",
        user.discarded && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-9 shrink-0 mt-0.5">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("font-medium truncate", user.discarded && "line-through text-muted-foreground")}>
              {user.name}
            </p>
            {user.discarded ? (
              <Badge variant="secondary" className="text-xs shrink-0">{t("admin.user_management.deactivated")}</Badge>
            ) : user.deletionRequestedAt ? (
              <Badge variant="destructive" className="gap-1 text-xs shrink-0">
                <ShieldAlert className="h-3 w-3" />
                GDPR
              </Badge>
            ) : (
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 text-xs shrink-0">
                {t("admin.user_management.status_active")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {user.roles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"}`}
            >
              {t(`auth.roles.${role}`, { defaultValue: role })}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {formatDate(user.createdAt, "date", i18n.language)}
        </p>
        <Button variant="outline" size="sm" className="min-h-[44px] gap-1.5" onClick={onManage}>
          <Settings2 className="h-4 w-4" />
          {t("admin.user_management.manage_user")}
        </Button>
      </div>
    </div>
  )
}

function AddUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email_address: "",
    password: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(routes.admin.users, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.user_management.add_user")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-name">{t("common.name")}</Label>
            <Input
              id="add-name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-email">{t("auth.email")}</Label>
            <Input
              id="add-email"
              type="email"
              value={data.email_address}
              onChange={(e) => setData("email_address", e.target.value)}
              required
            />
            {errors.email_address && (
              <p className="text-sm text-destructive">{errors.email_address}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-password">{t("auth.password")}</Label>
            <Input
              id="add-password"
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              required
              minLength={8}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={processing} className="min-h-[44px]">
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
