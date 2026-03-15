import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher"
import { NotificationBell } from "@/components/common/NotificationBell"

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <NotificationBell />
      </div>
    </header>
  )
}
