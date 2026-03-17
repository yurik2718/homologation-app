import { useState } from "react"
import { usePage, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, Trash2, X } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { DataTable } from "@/components/data-table"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { routes } from "@/lib/routes"
import { ROLE_COLORS } from "@/lib/colors"
import { ALL_ROLES } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { SharedProps } from "@/types"
import type { AdminUsersProps, AdminUser } from "@/types/pages"

export default function AdminUsers() {
  const { t, i18n } = useTranslation()
  const { users } = usePage<SharedProps & AdminUsersProps>().props
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deactivatingUser, setDeactivatingUser] = useState<AdminUser | null>(null)

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: t("common.name"),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: t("auth.email"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: "roles",
      header: t("admin.user_management.roles"),
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div>
            <div className="flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <RoleBadge key={role} role={role} userId={user.id} />
              ))}
            </div>
            {!user.discarded && <AssignRoleButtons user={user} />}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("common.created_at"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt, "date", i18n.language)}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original
        if (user.discarded) {
          return <Badge variant="secondary">{t("admin.user_management.deactivated")}</Badge>
        }
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingUser(user)} className="min-h-[44px]">
              {t("admin.user_management.edit_user")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeactivatingUser(user)}
              className="min-h-[44px] text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
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
          data={users}
          searchColumn="name"
          renderMobileCard={(user) => (
            <UserCard
              user={user}
              onEdit={() => setEditingUser(user)}
              onDeactivate={() => setDeactivatingUser(user)}
            />
          )}
        />

        <AddUserDialog open={showAddUser} onClose={() => setShowAddUser(false)} />

        {editingUser && (
          <EditUserDialog user={editingUser} onClose={() => setEditingUser(null)} />
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
      </div>
      </Main>
    </AuthenticatedLayout>
  )
}

function RoleBadge({ role, userId }: { role: string; userId: number }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600"}`}>
      {t(`auth.roles.${role}`, { defaultValue: role })}
      <button
        className="ml-0.5 hover:opacity-70 min-w-[20px] min-h-[20px] flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation()
          router.delete(routes.admin.removeRole(userId), {
            data: { role_name: role },
            preserveScroll: true,
          })
        }}
        aria-label={`Remove ${role} role`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function AssignRoleButtons({ user }: { user: AdminUser }) {
  const { t } = useTranslation()
  const unassigned = ALL_ROLES.filter((r) => !user.roles.includes(r))
  if (unassigned.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {unassigned.map((role) => (
        <button
          key={role}
          className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 hover:bg-muted min-h-[28px]"
          onClick={(e) => {
            e.stopPropagation()
            router.post(routes.admin.assignRole(user.id), { role_name: role }, { preserveScroll: true })
          }}
        >
          + {t(`auth.roles.${role}`, { defaultValue: role })}
        </button>
      ))}
    </div>
  )
}

function UserCard({
  user,
  onEdit,
  onDeactivate,
}: {
  user: AdminUser
  onEdit: () => void
  onDeactivate: () => void
}) {
  const { t, i18n } = useTranslation()
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${user.discarded ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        {user.discarded && (
          <Badge variant="secondary">{t("admin.user_management.deactivated")}</Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {user.roles.map((role) => (
          <RoleBadge key={role} role={role} userId={user.id} />
        ))}
      </div>
      {!user.discarded && <AssignRoleButtons user={user} />}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {formatDate(user.createdAt, "date", i18n.language)}
        </p>
        {!user.discarded && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="min-h-[44px]">
              {t("admin.user_management.edit_user")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeactivate}
              className="min-h-[44px] text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
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
          <div>
            <Label htmlFor="add-name">{t("common.name")}</Label>
            <Input
              id="add-name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="mt-1"
              required
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="add-email">{t("auth.email")}</Label>
            <Input
              id="add-email"
              type="email"
              value={data.email_address}
              onChange={(e) => setData("email_address", e.target.value)}
              className="mt-1"
              required
            />
            {errors.email_address && (
              <p className="text-sm text-destructive mt-1">{errors.email_address}</p>
            )}
          </div>
          <div>
            <Label htmlFor="add-password">{t("auth.password")}</Label>
            <Input
              id="add-password"
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              className="mt-1"
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

function EditUserDialog({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data, setData, patch, processing, errors } = useForm({
    name: user.name,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(routes.admin.user(user.id), {
      onSuccess: onClose,
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.user_management.edit_user")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">{t("common.name")}</Label>
            <Input
              id="edit-name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="mt-1"
              required
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
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
