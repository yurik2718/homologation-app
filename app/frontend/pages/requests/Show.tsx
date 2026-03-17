import { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Paperclip, Download } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { StatusBadge } from "@/components/common/StatusBadge"
import { FormattedDate } from "@/components/common/FormattedDate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { formatBytes } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"
import type { RequestsShowProps, FileInfo } from "@/types/pages"

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
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.my_requests"), href: routes.requests },
        { label: request.subject },
      ]}
    >
      <Main fixed>
        <h1 className="text-xl font-bold mb-4 lg:hidden">{request.subject}</h1>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_320px] gap-6 min-h-0 flex-1">
          {/* Left: Chat thread */}
          <Card className="flex flex-col min-h-[400px] lg:min-h-0 order-2 lg:order-1">
            <CardHeader className="shrink-0 pb-3">
              <CardTitle className="text-base">{request.subject}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
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

          {/* Right: Metadata sidebar */}
          <div className="order-1 lg:order-2 space-y-4 overflow-y-auto">
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
                    <div className="space-y-1">
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
                      {request.amoCrmSyncError && (
                        <div className="space-y-1">
                          <p className="text-xs text-destructive">{request.amoCrmSyncError}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-[44px]"
                            onClick={() => router.post(routes.retrySync(request.id))}
                          >
                            {t("coordinator.crm_retry")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Request details card */}
            <Card>
              <CardContent className="pt-4 space-y-2.5 text-sm">
                <DetailRow label={t("requests.detail.requester")} value={request.user.name} />
                <DetailRow label={t("requests.table.created")} value={<FormattedDate date={request.createdAt} mode="datetime" />} />
                <DetailRow label={t("requests.table.last_activity")} value={<FormattedDate date={request.updatedAt} mode="datetime" />} />

                <Separator />

                <DetailRow label={t("requests.table.status")}>
                  <StatusBadge status={request.status} />
                </DetailRow>

                {request.user.name && (
                  <DetailRow label={t("requests.form.name")} value={request.user.name} />
                )}
                <DetailRow label={t("requests.form.service_type")} value={request.serviceType} />
                {request.identityCard && (
                  <DetailRow label={t("requests.form.identity_card")} value={request.identityCard} />
                )}
                {request.educationSystem && (
                  <DetailRow label={t("requests.form.education_system")} value={request.educationSystem} />
                )}
                {request.studiesFinished && (
                  <DetailRow label={t("requests.form.studies_finished")} value={request.studiesFinished} />
                )}
                {request.studyTypeSpain && (
                  <DetailRow label={t("requests.form.study_type_spain")} value={request.studyTypeSpain} />
                )}
                {request.studiesSpain && (
                  <DetailRow label={t("requests.form.studies_spain")} value={request.studiesSpain} />
                )}
                {request.university && (
                  <DetailRow label={t("requests.form.university")} value={request.university} />
                )}
                {request.paymentAmount && (
                  <DetailRow
                    label={t("coordinator.payment_amount")}
                    value={`\u20AC${request.paymentAmount}`}
                  />
                )}
              </CardContent>
            </Card>

            {/* Attachments card */}
            {request.files.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t("requests.form.section_documents")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {request.files.map((file) => (
                    <FileRow key={file.id} file={file} requestId={request.id} />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Main>

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
  children,
}: {
  label: string
  value?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{children ?? value}</span>
    </div>
  )
}

function FileRow({ file, requestId }: { file: FileInfo; requestId: number }) {
  return (
    <a
      href={routes.downloadDocument(requestId, file.id)}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors group"
    >
      <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="truncate flex-1 text-primary group-hover:underline">{file.filename}</span>
      <span className="text-xs text-muted-foreground shrink-0">{formatBytes(file.byteSize)}</span>
      <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </a>
  )
}
