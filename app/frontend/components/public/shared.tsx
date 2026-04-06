import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Reveal,
  GradientOrbs,
  FloatingElements,
  Spotlight,
  DotGrid,
} from "@/components/public/animations"
import { cn } from "@/lib/utils"

// ─── Container ──────────────────────────────────────────────────────────────────
export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}

// ─── GradientButton — primary CTA with brand gradient ───────────────────────────
// When `href` is provided, wraps in an Inertia Link. Without `href`, renders a
// plain button (useful as a Dialog trigger, form submit, etc.).
export function GradientButton({
  children,
  href,
  className,
  ...rest
}: {
  children: React.ReactNode
  href?: string
  className?: string
} & Omit<React.ComponentProps<typeof Button>, "size">) {
  const btn = (
    <Button
      size="lg"
      className={cn(
        "group min-h-[44px] text-base bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] hover:opacity-90 border-0 shadow-lg shadow-[#2D7FF9]/20 hover:shadow-xl hover:shadow-[#2D7FF9]/30 transition-all duration-300",
        className,
      )}
      {...rest}
    >
      {children}
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  )
  return href ? <Link href={href}>{btn}</Link> : btn
}

// ─── PublicHero — shared hero section ────────────────────────────────────────────
export function PublicHero({
  title1,
  titleAccent,
  subtitle,
  actions,
  illustration,
}: {
  title1: string
  titleAccent: string
  subtitle: string
  actions?: React.ReactNode
  illustration?: React.ReactNode
}) {
  const hasIllustration = !!illustration

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 sm:py-32 overflow-hidden min-h-[80vh] flex items-center">
      <Spotlight />
      <FloatingElements />
      <DotGrid className="opacity-[0.25]" />
      <Container className="relative">
        <div
          className={
            hasIllustration
              ? "grid gap-12 lg:grid-cols-2 lg:items-center"
              : undefined
          }
        >
          <div className={hasIllustration ? undefined : "max-w-3xl"}>
            <Reveal direction="up">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                {title1}{" "}
                <span className="bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
                  {titleAccent}
                </span>
              </h1>
            </Reveal>
            <Reveal direction="up" delay={150}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                {subtitle}
              </p>
            </Reveal>
            {actions && (
              <Reveal direction="up" delay={300}>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  {actions}
                </div>
              </Reveal>
            )}
          </div>
          {illustration && (
            <Reveal direction="right" delay={200}>
              {illustration}
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  )
}

// ─── PublicCta — shared dark CTA section ─────────────────────────────────────────
export function PublicCta({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white overflow-hidden">
      <GradientOrbs />
      <DotGrid className="opacity-[0.08]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2D7FF9]/30 to-transparent" />
      <Container className="relative text-center">
        <Reveal direction="up">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h2>
        </Reveal>
        <Reveal direction="up" delay={100}>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </Reveal>
        <Reveal direction="up" delay={200}>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            {children}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

// ─── OutlineCtaButton — secondary CTA button for dark sections ───────────────────
export function OutlineCtaButton({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        size="lg"
        className="w-full sm:w-auto min-h-[44px] text-base border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300"
      >
        {children}
      </Button>
    </Link>
  )
}

// ─── PublicSection — standard content section ────────────────────────────────────
export function PublicSection({
  children,
  className,
  dots = false,
}: {
  children: React.ReactNode
  className?: string
  dots?: boolean
}) {
  return (
    <section className={cn("py-20 sm:py-32 relative", className)}>
      {dots && <DotGrid className="opacity-[0.2]" />}
      <Container className="relative">{children}</Container>
    </section>
  )
}

// ─── SectionHeading — centered section title + subtitle ──────────────────────────
export function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <Reveal direction="up">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  )
}
