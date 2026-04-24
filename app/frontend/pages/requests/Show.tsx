import { useState, useMemo, useCallback } from "react"
import { router, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Paperclip, Download, MessageSquare, FileX, CreditCard, Copy, Check, Send } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { StatusBadge } from "@/components/common/StatusBadge"
import { FormattedDate } from "@/components/common/FormattedDate"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatBytes, getOptionLabel } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps, SelectOption } from "@/types/index"
import type { RequestsShowProps, FileInfo } from "@/types/pages"

const COORDINATOR_STATUS_OPTIONS: Record<string, string[]> = {
  submitted: ["in_review"],
  in_review: ["awaiting_reply", "awaiting_payment"],
  awaiting_reply: ["in_review"],
  awaiting_payment: ["payment_confirmed"],
  payment_confirmed: ["in_progress"],
  in_progress: ["resolved", "closed"],
}

const FILE_CATEGORIES = ["application", "originals", "documents"] as const

export default function RequestsShow() {
  const { t } = useTranslation()
  const { auth, request, features, selectOptions } =
    usePage<SharedProps & RequestsShowProps>().props
  const locale = auth.user?.locale ?? "es"
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [stripeUrl, setStripeUrl] = useState<string | null>(null)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeCopied, setStripeCopied] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [stripeSent, setStripeSent] = useState(false)

  const isCoordinator = features.canConfirmPayment
  const availableStatuses = COORDINATOR_STATUS_OPTIONS[request.status] ?? []

  const handleStatusConfirm = () => {
    if (!pendingStatus) return
    router.patch(routes.request(request.id), { status: pendingStatus })
    setPendingStatus(null)
  }

  const handleConfirmPayment = () => {
    router.post(
      routes.confirmPayment(request.id),
      { payment_amount: paymentAmount },
      { onSuccess: () => setPaymentDialogOpen(false) }
    )
  }

  const handleCreateCheckoutSession = useCallback(() => {
    if (!paymentAmount) return
    setStripeLoading(true)
    setStripeError(null)
    setStripeUrl(null)

    router.post(
      routes.createCheckoutSession(request.id),
      { payment_amount: paymentAmount },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          const props = page.props as SharedProps
          if (props.flash?.stripeUrl) {
            setStripeUrl(props.flash.stripeUrl)
          } else if (props.flash?.alert) {
            setStripeError(props.flash.alert)
          }
        },
        onError: () => setStripeError(t("stripe.error")),
        onFinish: () => setStripeLoading(false),
      }
    )
  }, [paymentAmount, request.id, t])

  const handleCopyStripeUrl = useCallback(() => {
    if (!stripeUrl) return
    navigator.clipboard.writeText(stripeUrl)
    setStripeCopied(true)
    setTimeout(() => setStripeCopied(false), 2000)
  }, [stripeUrl])

  const handleSendToChat = useCallback(() => {
    if (!stripeUrl || !request.conversation) return
    router.post(
      routes.requestMessages(request.id),
      { body: stripeUrl },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStripeSent(true)
          setTimeout(() => setStripeSent(false), 3000)
        },
      }
    )
  }, [stripeUrl, request.id, request.conversation])

  const crmStatus =
    request.amoCrmLeadId && request.amoCrmSyncedAt
      ? "synced"
      : request.amoCrmLeadId
        ? "syncing"
        : request.amoCrmSyncError
          ? "error"
          : "not_synced"

  const resolveOption = (
    key: string | null | undefined,
    optionsKey: string
  ): string | null => {
    if (!key) return null
    const options: SelectOption[] = selectOptions[optionsKey] ?? []
    const found = options.find((o) => o.key === key)
    return found ? getOptionLabel(found, locale) : key
  }

  const hasEducation =
    request.educationSystem ||
    request.studiesFinished ||
    request.studyTypeSpain ||
    request.studiesSpain ||
    request.university

  const hasAdditional =
    request.languageKnowledge ||
    request.languageCertificate

  const filesByCategory = useMemo(() => {
    const grouped: Record<string, FileInfo[]> = {}
    for (const cat of FILE_CATEGORIES) grouped[cat] = []
    for (const file of request.files) {
      const cat = file.category ?? "documents"
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(file)
    }
    return grouped
  }, [request.files])

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.my_requests"), href: routes.requests },
        { label: request.subject },
      ]}
    >
      <Main fixed>
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6 min-h-0 flex-1">
          {/* Left: Chat thread */}
          <Card className={cn(
            "flex flex-col min-h-[400px] lg:min-h-0",
            isCoordinator ? "order-2 lg:order-1" : "order-1 lg:order-1"
          )}>
            {/* Chat header — shows participant info */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {isCoordinator ? request.user.name : t("requests.detail.chat_with_coordinator")}
                </p>
                <p className="text-xs text-muted-foreground">{request.subject}</p>
              </div>
            </div>
            <CardContent className="flex-1 p-0 min-h-0">
              {request.conversation ? (
                <ChatWindow
                  conversationId={request.conversation.id}
                  messages={request.conversation.messages}
                  postUrl={routes.requestMessages(request.id)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("requests.detail.chat_not_available")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Sidebar */}
          <div className={cn(
            "lg:order-2 space-y-4 overflow-y-auto",
            isCoordinator ? "order-1" : "order-2"
          )}>
            {/* Status card with progress */}
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={request.status} />
                  {request.paymentAmount != null && (
                    <span className="text-lg font-bold tabular-nums">
                      &euro;{request.paymentAmount}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{request.user.name}</span>
                  <FormattedDate date={request.updatedAt} mode="relative" />
                </div>
              </CardContent>
            </Card>

            {/* Coordinator actions */}
            {isCoordinator && (availableStatuses.length > 0 || request.status === "awaiting_payment" || request.amoCrmSyncError) && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  {availableStatuses.length > 0 && (
                    <div className="space-y-2">
                      <Label>{t("coordinator.change_status")}</Label>
                      <Select onValueChange={(s) => setPendingStatus(s)}>
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

            {/* Collapsible details + files */}
            <Card>
              <CardContent className="pt-2 pb-2">
                <Accordion type="multiple" defaultValue={["details", "files"]}>
                  {/* Details section */}
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm font-medium py-3">
                      {t("requests.detail.section_details")}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2.5 pb-2">
                        <DetailRow
                          label={t("requests.detail.requester")}
                          value={request.user.name}
                          bold
                        />
                        <DetailRow
                          label={t("requests.form.service_type")}
                          value={resolveOption(request.serviceType, "service_types")}
                          bold
                        />
                        {request.description && (
                          <DetailRow
                            label={t("requests.form.description")}
                            value={request.description}
                          />
                        )}
                        {request.identityCard && (
                          <DetailRow
                            label={t("requests.form.identity_card")}
                            value={request.identityCard}
                            mono
                          />
                        )}
                        <DetailRow
                          label={t("requests.table.created")}
                          value={<FormattedDate date={request.createdAt} mode="datetime" />}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Education section */}
                  {hasEducation && (
                    <AccordionItem value="education">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        {t("requests.detail.section_education")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2.5 pb-2">
                          {request.educationSystem && (
                            <DetailRow
                              label={t("requests.form.education_system")}
                              value={resolveOption(request.educationSystem, "education_systems")}
                            />
                          )}
                          {request.studiesFinished && (
                            <DetailRow
                              label={t("requests.form.studies_finished")}
                              value={resolveOption(request.studiesFinished, "studies_finished")}
                            />
                          )}
                          {request.studyTypeSpain && (
                            <DetailRow
                              label={t("requests.form.study_type_spain")}
                              value={resolveOption(request.studyTypeSpain, "study_types_spain")}
                            />
                          )}
                          {request.studiesSpain && (
                            <DetailRow
                              label={t("requests.form.studies_spain")}
                              value={request.studiesSpain}
                            />
                          )}
                          {request.university && (
                            <DetailRow
                              label={t("requests.form.university")}
                              value={resolveOption(request.university, "universities")}
                            />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Additional info section */}
                  {hasAdditional && (
                    <AccordionItem value="additional">
                      <AccordionTrigger className="text-sm font-medium py-3">
                        {t("requests.detail.section_additional")}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2.5 pb-2">
                          {request.languageKnowledge && (
                            <DetailRow
                              label={t("requests.form.language_level")}
                              value={resolveOption(request.languageKnowledge, "language_levels")}
                            />
                          )}
                          {request.languageCertificate && (
                            <DetailRow
                              label={t("requests.form.language_certificate")}
                              value={resolveOption(request.languageCertificate, "language_certificates")}
                            />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Files section */}
                  <AccordionItem value="files" className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium py-3">
                      {t("requests.form.section_documents")}
                      {request.files.length > 0 && (
                        <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal">
                          {request.files.length}
                        </span>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      {request.files.length === 0 ? (
                        <div className="flex flex-col items-center py-6 text-center">
                          <FileX className="h-6 w-6 text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {t("requests.detail.no_documents")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 pb-2">
                          {FILE_CATEGORIES.map((cat) => {
                            const files = filesByCategory[cat]
                            if (!files || files.length === 0) return null
                            return (
                              <div key={cat}>
                                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                                  {t(`requests.detail.file_category_${cat}`)}
                                </p>
                                <div className="space-y-0.5">
                                  {files.map((file) => (
                                    <FileRow key={file.id} file={file} requestId={request.id} />
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>

      {/* Status change confirmation */}
      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => { if (!open) setPendingStatus(null) }}
        title={t("coordinator.confirm_status_title")}
        description={t("coordinator.confirm_status_description", {
          status: pendingStatus ? t(`requests.status.${pendingStatus}`) : "",
        })}
        onConfirm={handleStatusConfirm}
      />

      {/* Confirm payment dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
        setPaymentDialogOpen(open)
        if (!open) { setStripeUrl(null); setStripeError(null); setStripeCopied(false); setStripeSent(false) }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coordinator.confirm_dialog_title")}</DialogTitle>
            <DialogDescription>{t("coordinator.confirm_dialog_description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("coordinator.payment_amount")}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={paymentAmount}
              onChange={(e) => { setPaymentAmount(e.target.value); setStripeUrl(null); setStripeError(null) }}
              placeholder="0.00"
              className="min-h-[44px]"
            />
          </div>

          {/* Stripe payment link result */}
          {stripeUrl && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">{t("stripe.link_ready")}</p>
              <div className="flex items-center gap-2">
                <Input value={stripeUrl} readOnly className="text-xs min-h-[44px]" />
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] shrink-0"
                  onClick={handleCopyStripeUrl}
                  title={t("stripe.copy")}
                >
                  {stripeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                {request.conversation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] shrink-0"
                    onClick={handleSendToChat}
                    disabled={stripeSent}
                    title={t("stripe.send_to_chat")}
                  >
                    {stripeSent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t("stripe.link_hint")}</p>
            </div>
          )}
          {stripeError && (
            <p className="text-sm text-destructive">{stripeError}</p>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={() => setPaymentDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="outline"
              className="min-h-[44px]"
              onClick={handleCreateCheckoutSession}
              disabled={!paymentAmount || stripeLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {stripeLoading ? t("stripe.creating") : t("stripe.send_link")}
            </Button>
            <Button
              className="min-h-[44px]"
              onClick={handleConfirmPayment}
              disabled={!paymentAmount}
            >
              {t("coordinator.confirm_sync")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  )
}

/* ─── Helper components ───────────────────────────────────────────────────── */

function DetailRow({
  label,
  value,
  children,
  bold,
  mono,
}: {
  label: string
  value?: React.ReactNode
  children?: React.ReactNode
  bold?: boolean
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(
        "text-sm",
        bold && "font-semibold",
        mono && "font-mono",
      )}>
        {children ?? value}
      </span>
    </div>
  )
}

function FileRow({ file, requestId }: { file: FileInfo; requestId: number }) {
  return (
    <a
      href={routes.downloadDocument(requestId, file.id)}
      download
      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors group min-h-[44px]"
    >
      <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="truncate flex-1 text-primary group-hover:underline">
        {file.filename}
      </span>
      <span className="text-xs text-muted-foreground shrink-0">
        {formatBytes(file.byteSize)}
      </span>
      <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </a>
  )
}
