import { Head } from "@inertiajs/react"
import type { BreadcrumbItemData } from "@/components/public/SiteBreadcrumbs"

export interface SeoProps {
  title: string
  description: string
  locale: string
  alternates: { locale: string; url: string }[]
  canonicalUrl?: string
  structuredData?: Record<string, unknown>[]
  ogImage?: string
  breadcrumbs?: BreadcrumbItemData[]
}

export function SeoHead({
  title,
  description,
  locale,
  alternates,
  canonicalUrl,
  structuredData,
  ogImage,
}: SeoProps) {
  const xDefault = alternates.find((a) => a.locale === "en")?.url ?? alternates[0]?.url

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <html lang={locale} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {alternates.map(({ locale: l, url }) => (
        <link key={l} rel="alternate" hrefLang={l} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefault} />
      {structuredData?.map((data, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  )
}
