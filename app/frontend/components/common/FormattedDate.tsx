import { useTranslation } from "react-i18next"
import { formatDistanceToNow } from "date-fns"
import { es, enUS, ru } from "date-fns/locale"

const DATE_LOCALES = { es, en: enUS, ru }

interface FormattedDateProps {
  date: string
}

export function FormattedDate({ date }: FormattedDateProps) {
  const { i18n } = useTranslation()
  const locale =
    DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] ?? es

  return (
    <span>
      {formatDistanceToNow(new Date(date), { addSuffix: true, locale })}
    </span>
  )
}
