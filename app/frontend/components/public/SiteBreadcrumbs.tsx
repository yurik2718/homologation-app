import { Fragment } from "react"
import { Link } from "@inertiajs/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Container } from "@/components/public/shared"

export interface BreadcrumbItemData {
  name: string
  href: string | null
}

// Visible breadcrumbs for sub-pages. Mirrors the BreadcrumbList Schema.org
// emitted server-side by StructuredDataHelper — same strings, same order —
// so what the user sees matches what search engines index.
export function SiteBreadcrumbs({ items }: { items: BreadcrumbItemData[] }) {
  if (!items || items.length === 0) return null

  return (
    <div className="border-b bg-white/60 backdrop-blur-sm">
      <Container className="py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, i) => {
              const last = i === items.length - 1
              return (
                <Fragment key={`${item.name}-${i}`}>
                  <BreadcrumbItem>
                    {last || !item.href ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.name}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </Container>
    </div>
  )
}
