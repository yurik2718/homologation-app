import { useTranslation } from "react-i18next"
import { formatDate, type DateMode } from "@/lib/utils"

interface FormattedDateProps {
  date: string
  mode?: DateMode
}

export function FormattedDate({ date, mode = "relative" }: FormattedDateProps) {
  const { i18n } = useTranslation()

  return <span>{formatDate(date, mode, i18n.language)}</span>
}
