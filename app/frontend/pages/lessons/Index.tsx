import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { Main } from "@/components/layout/Main"
import { LessonList } from "@/components/lessons/LessonList"
import type { SharedProps } from "@/types"
import type { LessonsIndexProps } from "@/types/pages"

export default function LessonsIndex() {
  const { t } = useTranslation()
  const { upcoming, past } = usePage<SharedProps & LessonsIndexProps>().props

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t("nav.my_lessons") }]}
    >
      <Main>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight mb-6">{t("lessons.title")}</h1>
          <LessonList upcoming={upcoming} past={past} />
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
