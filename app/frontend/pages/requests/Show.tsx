import { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { StatusBadge } from "@/components/common/StatusBadge"
import { FormattedDate } from "@/components/common/FormattedDate"
import { FileList } from "@/components/documents/FileList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { RequestsShowProps } from "@/types/pages"

const COORDINATOR_STATUS_OPTIONS: Record<string, string[]> = {
  submitted: ["in_review"],
  in_review: ["awaiting_reply", "awaiting_payment"],
  awaiting_reply: ["in_review"],
  awaiting_payment: ["payment_confirmed"],
  payment_confirmed: ["in_progress"],
  in_progress: ["resolved", "closed"],
}

export default function RequestsShow() {
  const { t } = useTranslation()
  const { request, features } = usePage<SharedProps & RequestsShowProps>().props
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")

  const availableStatuses = COORDINATOR_STATUS_OPTIONS[request.status] ?? []

  const handleStatusChange = (status: string) => {
    router.patch(routes.request(request.id), { status })
  }

  const handleConfirmPayment = () => {
    router.post(routes.confirmPayment(request.id), { payment_amount: paymentAmount }, {
      onSuccess: () => setPaymentDialogOpen(false),
    })
  }

  const crmStatus = request.amoCrmLeadId && request.amoCrmSyncedAt
    ? "synced"
    : request.amoCrmLeadId
      ? "syncing"
      : request.amoCrmSyncError
        ? "error"
        : "not_synced"

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        {/* Left: Chat */}
        <div className="order-2 lg:order-1">
          <Card className="min-h-[300px] lg:min-h-[500px] flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">{t("chat.title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {request.conversation ? (
                <ChatWindow
                  conversationId={request.conversation.id}
                  messages={request.conversation.messages}
                  postUrl={routes.requestMessages(request.id)}
                />
              ) : (
                <p className="p-4 text-sm text-muted-foreground">{t("chat.no_messages")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Request details */}
        <div className="order-1 lg:order-2 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold">{request.subject}</h1>
              <p className="text-sm text-muted-foreground">#{request.id}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {/* Coordinator actions */}
          {features.canConfirmPayment && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                {availableStatuses.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("coordinator.change_status")}</Label>
                    <Select onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("coordinator.change_status")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`requests.status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {request.status === "awaiting_payment" && (
                  <Button
                    className="w-full min-h-[44px]"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    {t("coordinator.confirm_payment")}
                  </Button>
                )}

                {/* CRM sync indicator */}
                {request.status !== "draft" && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {t(`coordinator.crm_${crmStatus}`)}
                    </Badge>
                    {request.amoCrmSyncedAt && (
                      <span className="text-xs text-muted-foreground">
                        <FormattedDate date={request.amoCrmSyncedAt} />
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Request details */}
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              <DetailRow label={t("requests.form.service_type")} value={request.serviceType} />
              <DetailRow label={t("requests.table.created")} value={<FormattedDate date={request.createdAt} />} />
              {request.description && (
                <DetailRow label={t("requests.form.description")} value={request.description} />
              )}
              {request.educationSystem && (
                <DetailRow label={t("requests.form.education_system")} value={request.educationSystem} />
              )}
              {request.studiesFinished && (
                <DetailRow label={t("requests.form.studies_finished")} value={request.studiesFinished} />
              )}
              {request.university && (
                <DetailRow label={t("requests.form.university")} value={request.university} />
              )}
              {request.paymentAmount && (
                <DetailRow
                  label={t("coordinator.payment_amount")}
                  value={`€${request.paymentAmount}`}
                />
              )}
            </CardContent>
          </Card>

          {/* Files */}
          {request.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("requests.form.section_documents")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FileList files={request.files} requestId={request.id} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirm payment dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coordinator.confirm_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("coordinator.confirm_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("coordinator.payment_amount")}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
              className="min-h-[44px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleConfirmPayment} disabled={!paymentAmount}>
              {t("coordinator.confirm_sync")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="font-medium text-muted-foreground min-w-[140px]">{label}</span>
      <span>{value}</span>
    </div>
  )
}
