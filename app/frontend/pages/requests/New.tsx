import { useState } from "react"
import { Link, useForm, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Loader2, ChevronDown } from "lucide-react"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { FileDropZone } from "@/components/documents/FileDropZone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn, getOptionLabel } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"

export default function RequestsNew() {
  const { t } = useTranslation()
  const { auth, selectOptions } = usePage<SharedProps>().props
  const locale = auth.user?.locale ?? "es"

  const [showEducation, setShowEducation] = useState(false)
  const [showAdditional, setShowAdditional] = useState(false)
  const [submitting, setSubmitting] = useState<"submit" | "draft" | null>(null)

  const { data, setData, transform, post, processing, errors } = useForm({
    subject: "",
    service_type: "",
    description: "",
    identity_card: "",
    passport: "",
    education_system: "",
    studies_finished: "",
    study_type_spain: "",
    studies_spain: "",
    university: "",
    language_knowledge: "",
    language_certificate: "",
    referral_source: "",
    privacy_accepted: false,
    application: [] as string[],
    originals: [] as string[],
    documents: [] as string[],
  })

  const handleSubmit = (commitValue: "submit" | "draft") => {
    setSubmitting(commitValue)
    transform((data) => ({ ...data, commit: commitValue }))
    post(routes.requests, {
      onFinish: () => setSubmitting(null),
    })
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.my_requests"), href: routes.requests },
        { label: t("requests.new_request") },
      ]}
    >
      <Main>
        <div className="max-w-2xl mx-auto pb-24">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("requests.new_request")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t("requests.form.intro")}
            </p>
          </div>

          <form
            id="request-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit("submit")
            }}
            className="space-y-6"
          >
            {/* Section 1: Your Request (required) */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StepNumber n={1} />
                  <CardTitle className="text-base">
                    {t("requests.form.section_request")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label={t("requests.form.service_type")}
                  required
                  error={errors.service_type}
                >
                  <Select
                    value={data.service_type}
                    onValueChange={(v) => setData("service_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("requests.form.placeholder_service_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectOptions.service_types ?? []).map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {getOptionLabel(opt, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label={t("requests.form.subject")}
                  required
                  hint={t("requests.form.subject_hint")}
                  error={errors.subject}
                >
                  <Input
                    value={data.subject}
                    onChange={(e) => setData("subject", e.target.value)}
                  />
                </FormField>

                <FormField
                  label={t("requests.form.description")}
                  hint={t("requests.form.description_hint")}
                >
                  <Textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    rows={3}
                  />
                </FormField>

                <FormField
                  label={t("requests.form.identity_card")}
                  hint={t("requests.form.identity_card_hint")}
                >
                  <Input
                    value={data.identity_card}
                    onChange={(e) => setData("identity_card", e.target.value)}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Section 2: Education (collapsible, optional) */}
            <Card>
              <button
                type="button"
                onClick={() => setShowEducation(!showEducation)}
                className="w-full text-left min-h-[44px]"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <StepNumber n={2} />
                    <CardTitle className="text-base flex-1">
                      {t("requests.form.section_education")}
                    </CardTitle>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                      showEducation && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
              </button>
              {showEducation && (
                <CardContent className="space-y-4 pt-0">
                  <FormField
                    label={t("requests.form.education_system")}
                    hint={t("requests.form.education_system_hint")}
                  >
                    <Select
                      value={data.education_system}
                      onValueChange={(v) => setData("education_system", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_education_system")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.education_systems ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label={t("requests.form.studies_finished")}>
                    <Select
                      value={data.studies_finished}
                      onValueChange={(v) => setData("studies_finished", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_studies_finished")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.studies_finished ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label={t("requests.form.study_type_spain")}>
                    <Select
                      value={data.study_type_spain}
                      onValueChange={(v) => setData("study_type_spain", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_study_type_spain")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.study_types_spain ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label={t("requests.form.studies_spain")}
                    hint={t("requests.form.studies_spain_hint")}
                  >
                    <Input
                      value={data.studies_spain}
                      onChange={(e) => setData("studies_spain", e.target.value)}
                    />
                  </FormField>

                  <FormField label={t("requests.form.university")}>
                    <Select
                      value={data.university}
                      onValueChange={(v) => setData("university", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_university")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.universities ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </CardContent>
              )}
            </Card>

            {/* Section 3: Additional Info (collapsible, optional) */}
            <Card>
              <button
                type="button"
                onClick={() => setShowAdditional(!showAdditional)}
                className="w-full text-left min-h-[44px]"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <StepNumber n={3} />
                    <CardTitle className="text-base flex-1">
                      {t("requests.form.section_optional")}
                    </CardTitle>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                      showAdditional && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
              </button>
              {showAdditional && (
                <CardContent className="space-y-4 pt-0">
                  <FormField
                    label={t("requests.form.language_level")}
                    hint={t("requests.form.language_level_hint")}
                  >
                    <Select
                      value={data.language_knowledge}
                      onValueChange={(v) => setData("language_knowledge", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_language_level")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.language_levels ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label={t("requests.form.language_certificate")}>
                    <Select
                      value={data.language_certificate}
                      onValueChange={(v) => setData("language_certificate", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_language_certificate")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.language_certificates ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label={t("requests.form.referral_source")}>
                    <Select
                      value={data.referral_source}
                      onValueChange={(v) => setData("referral_source", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("requests.form.placeholder_referral_source")} />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectOptions.referral_sources ?? []).map((opt) => (
                          <SelectItem key={opt.key} value={opt.key}>
                            {getOptionLabel(opt, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </CardContent>
              )}
            </Card>

            {/* Section 4: Documents */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StepNumber n={4} />
                  <div>
                    <CardTitle className="text-base">
                      {t("requests.form.section_documents")}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t("requests.form.section_documents_description")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField hint={t("requests.form.documents_hint")}>
                  <FileDropZone
                    name="homologation_request[documents][]"
                    multiple={true}
                    onUpload={(ids) => setData("documents", ids)}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Privacy checkbox */}
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy_accepted"
                  checked={data.privacy_accepted}
                  onCheckedChange={(checked) =>
                    setData("privacy_accepted", checked === true)
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="privacy_accepted"
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  {t("requests.form.privacy_policy_prefix")}{" "}
                  <Link
                    href={routes.privacyPolicy}
                    className="underline underline-offset-4 hover:text-foreground"
                    target="_blank"
                  >
                    {t("requests.form.privacy_policy_link")}
                  </Link>
                </Label>
              </div>
              {errors.privacy_accepted && (
                <p className="text-sm text-destructive">{errors.privacy_accepted}</p>
              )}
            </div>
          </form>
        </div>

        {/* Sticky submit footer */}
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-2xl mx-auto flex gap-3 px-4 py-3">
            <Button
              type="submit"
              form="request-form"
              disabled={processing}
              className="min-h-[44px] flex-1"
            >
              {submitting === "submit" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitting === "submit"
                ? t("requests.submitting")
                : t("requests.submit_request")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={processing}
              className="min-h-[44px]"
              onClick={() => handleSubmit("draft")}
            >
              {submitting === "draft" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitting === "draft"
                ? t("requests.saving_draft")
                : t("requests.save_draft")}
            </Button>
          </div>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}

/* ─── Helper components ───────────────────────────────────────────────────── */

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
      {n}
    </span>
  )
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label?: string
  required?: boolean
  hint?: string
  error?: string | string[]
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-sm text-destructive">
          {Array.isArray(error) ? error[0] : error}
        </p>
      )}
    </div>
  )
}
