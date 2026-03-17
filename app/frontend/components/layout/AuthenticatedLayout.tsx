import { useEffect } from "react"
import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header, type BreadcrumbItem } from "@/components/layout/Header"
import { cn } from "@/lib/utils"
import type { SharedProps } from "@/types"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  fixedHeight?: boolean
}

export function AuthenticatedLayout({ children, breadcrumbs, fixedHeight }: AuthenticatedLayoutProps) {
  const { auth } = usePage<SharedProps>().props
  const { i18n } = useTranslation()

  useEffect(() => {
    const locale = auth.user?.locale
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [auth.user?.locale, i18n])

  return (
    <TooltipProvider>
      <SidebarProvider className={fixedHeight ? "max-h-svh" : undefined}>
        <AppSidebar />
        <SidebarInset className={fixedHeight ? "overflow-hidden" : undefined}>
          <Header breadcrumbs={breadcrumbs} />
          <div className={cn("flex flex-1 flex-col p-4 md:p-6", fixedHeight ? "overflow-hidden min-h-0" : "overflow-y-auto")}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
