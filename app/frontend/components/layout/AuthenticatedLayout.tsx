import { useEffect } from "react"
import { usePage } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header, type BreadcrumbItem } from "@/components/layout/Header"
import type { SharedProps } from "@/types"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function AuthenticatedLayout({ children, breadcrumbs }: AuthenticatedLayoutProps) {
  const { auth } = usePage<SharedProps>().props
  const { i18n } = useTranslation()

  useEffect(() => {
    const locale = auth.user?.locale
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
  }, [auth.user?.locale, i18n])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
