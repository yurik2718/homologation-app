import { useState } from "react"
import { useForm, router, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { InboxConversationDetail } from "@/types/pages"

interface ContextPanelProps {
  conversation: InboxConversationDetail
}

function RequestContext({ context }: {
  context: Extract<InboxConversationDetail["context"], { type: "request" }>
}) {
  const { t } = useTranslation()
  const { features, selectOptions } = usePage<SharedProps>().props

  const paymentForm = useForm({ payment_amount: "" })
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)

  const statusOptions = selectOptions?.request_statuses ?? []

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus)
  }

  const confirmStatusChange = () => {
    if (pendingStatus) {
      router.patch(routes.request(context.requestId), { status: pendingStatus }, { preserveScroll: true })
      setPendingStatus(null)
    }
  }

  const handlePaymentConfirm = () => {
    paymentForm.post(routes.confirmPayment(context.requestId))
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-xs text-muted-foreground">{t("requests.table.status")}</p>
        {features.canConfirmPayment ? (
          <Select value={context.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="mt-1 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {t(`requests.status.${opt.key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="mt-1">
            <StatusBadge status={context.status} />
          </div>
        )}
      </div>

      {context.serviceType && (
        <div>
          <p className="text-xs text-muted-foreground">{t("requests.form.service_type")}</p>
          <p className="text-sm">{context.serviceType}</p>
        </div>
      )}

      {context.university && (
        <div>
          <p className="text-xs text-muted-foreground">{t("requests.form.university")}</p>
          <p className="text-sm">{context.university}</p>
        </div>
      )}

      {features.canConfirmPayment && context.status === "awaiting_payment" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full min-h-[44px]">
              {t("coordinator.confirm_payment")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("coordinator.confirm_dialog_title")}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{t("coordinator.confirm_dialog_description")}</p>
            <div className="space-y-2">
              <Label htmlFor="payment_amount">{t("coordinator.payment_amount")}</Label>
              <Input
                id="payment_amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.data.payment_amount}
                onChange={(e) => paymentForm.setData("payment_amount", e.target.value)}
              />
            </div>
            <Button
              onClick={handlePaymentConfirm}
              disabled={!paymentForm.data.payment_amount || paymentForm.processing}
              className="min-h-[44px]"
            >
              {t("coordinator.confirm_sync")}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("coordinator.confirm_status_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("coordinator.confirm_status_description", {
                status: pendingStatus ? t(`requests.status.${pendingStatus}`) : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>{t("common.confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">AmoCRM</p>
        {context.amoCrmLeadId ? (
          <Badge variant="secondary" className="mt-1 text-xs">{t("coordinator.crm_synced")}</Badge>
        ) : context.amoCrmSyncError ? (
          <>
            <Badge variant="destructive" className="mt-1 text-xs">{t("coordinator.crm_error")}</Badge>
            <p className="text-xs text-destructive">{context.amoCrmSyncError}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full min-h-[44px]"
              onClick={() => router.post(routes.retrySync(context.requestId))}
            >
              {t("coordinator.crm_retry")}
            </Button>
          </>
        ) : (
          <Badge variant="outline" className="mt-1 text-xs">{t("coordinator.crm_not_synced")}</Badge>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full min-h-[44px]" asChild>
        <Link href={routes.request(context.requestId)}>{t("common.back")}</Link>
      </Button>
    </div>
  )
}

function TeacherStudentContext({ context }: {
  context: Extract<InboxConversationDetail["context"], { type: "teacher_student" }>
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 p-4">
      {context.teacherName && (
        <div>
          <p className="text-xs text-muted-foreground">{t("lessons.teacher")}</p>
          <p className="text-sm font-medium">{context.teacherName}</p>
        </div>
      )}
      {context.studentName && (
        <div>
          <p className="text-xs text-muted-foreground">{t("lessons.student")}</p>
          <p className="text-sm font-medium">{context.studentName}</p>
        </div>
      )}
    </div>
  )
}

export function ContextPanel({ conversation }: ContextPanelProps) {
  const ctx = conversation.context

  return (
    <div className="overflow-y-auto">
      {ctx.type === "request" ? (
        <RequestContext context={ctx} />
      ) : (
        <TeacherStudentContext context={ctx} />
      )}
    </div>
  )
}
