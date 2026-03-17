import { useForm, usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
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
import { Separator } from "@/components/ui/separator"
import { getOptionLabel } from "@/lib/utils"
import { routes } from "@/lib/routes"
import type { SharedProps } from "@/types/index"

export default function RequestsNew() {
  const { t } = useTranslation()
  const { auth, selectOptions } = usePage<SharedProps>().props
  const locale = auth.user?.locale ?? "es"

  const { data, setData, post, processing, errors } = useForm({
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
    commit: "",
  })

  const handleSubmit = (commitValue: "submit" | "draft") => {
    setData("commit", commitValue)
    post(routes.requests)
  }

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("nav.my_requests"), href: routes.requests },
        { label: t("requests.new_request") },
      ]}
    >
      <Main>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t("requests.new_request")}</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit("submit")
            }}
            className="space-y-5"
          >
            {/* Name (read-only from profile) */}
            <FormField label={t("requests.form.name")}>
              <Input value={auth.user?.name ?? ""} disabled />
            </FormField>

            {/* Service Requested */}
            <FormField label={t("requests.form.service_type")} required error={errors.service_type}>
              <Select
                value={data.service_type}
                onValueChange={(v) => setData("service_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-" />
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

            {/* Subject */}
            <FormField label={t("requests.form.subject")} required error={errors.subject}>
              <Input
                value={data.subject}
                onChange={(e) => setData("subject", e.target.value)}
              />
            </FormField>

            {/* Description */}
            <FormField label={t("requests.form.description")} hint={t("requests.form.description_hint")}>
              <Textarea
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                rows={5}
              />
            </FormField>

            <Separator />

            {/* Identity Card */}
            <FormField label={t("requests.form.identity_card")} hint={t("requests.form.passport")}>
              <Input
                value={data.identity_card}
                onChange={(e) => setData("identity_card", e.target.value)}
              />
            </FormField>

            {/* Education System */}
            <FormField label={t("requests.form.education_system")}>
              <Select
                value={data.education_system}
                onValueChange={(v) => setData("education_system", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-" />
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

            {/* Studies Finished */}
            <FormField label={t("requests.form.studies_finished")}>
              <Select
                value={data.studies_finished}
                onValueChange={(v) => setData("studies_finished", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-" />
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

            {/* Type of studies in Spain */}
            <FormField label={t("requests.form.study_type_spain")}>
              <Select
                value={data.study_type_spain}
                onValueChange={(v) => setData("study_type_spain", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-" />
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

            {/* Studies to be carried out in Spain */}
            <FormField label={t("requests.form.studies_spain")}>
              <Input
                value={data.studies_spain}
                onChange={(e) => setData("studies_spain", e.target.value)}
              />
            </FormField>

            {/* University */}
            <FormField label={t("requests.form.university")}>
              <Select
                value={data.university}
                onValueChange={(v) => setData("university", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-" />
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

            <Separator />

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
                <Label htmlFor="privacy_accepted" className="text-sm leading-relaxed cursor-pointer">
                  {t("requests.form.privacy_policy")}
                </Label>
              </div>
              {errors.privacy_accepted && (
                <p className="text-sm text-destructive">{errors.privacy_accepted}</p>
              )}
            </div>

            {/* Attachments */}
            <FormField label={t("requests.form.section_documents")} hint={t("common.optional")}>
              <FileDropZone
                name="homologation_request[documents][]"
                multiple={true}
                onUpload={(ids) => setData("documents", ids)}
              />
            </FormField>

            {/* Submit buttons */}
            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <Button
                type="submit"
                disabled={processing}
                className="min-h-[44px] flex-1 sm:flex-none"
              >
                {t("requests.submit_request")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={processing}
                className="min-h-[44px] flex-1 sm:flex-none"
                onClick={() => handleSubmit("draft")}
              >
                {t("requests.save_draft")}
              </Button>
            </div>
          </form>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string | string[]
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  )
}
