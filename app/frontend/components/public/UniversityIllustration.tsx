import { useTranslation } from "react-i18next"

/**
 * Premium hero illustration for the University admissions page.
 * Spain map SVG (loaded via <object> for internal CSS animation) +
 * floating glass-morphism stat bubbles + background glow orbs.
 *
 * The spain-universities.svg has an embedded <style> block that:
 * - Renders all regions in muted slate
 * - Highlights university regions with a wave animation from Madrid outward
 * - Pulses Madrid as the "heart"
 * - Shows animated connection lines between major university cities
 * - Displays city markers with university abbreviations
 */

const BUBBLES = [
  { key: "universities", x: "0%", y: "4%", delay: 0.5, size: "lg" as const },
  { key: "programs", x: "70%", y: "56%", delay: 2, size: "md" as const },
  { key: "ranking", x: "4%", y: "78%", delay: 3.5, size: "md" as const },
] as const

const BUBBLE_STYLES = {
  lg: "text-sm font-bold px-4 py-2.5",
  md: "text-xs font-semibold px-3.5 py-2",
} as const

export function UniversityIllustration() {
  const { t } = useTranslation()

  return (
    <div className="relative w-full mx-auto lg:-mr-8 lg:scale-110 origin-center select-none">
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-3/5 h-3/5 rounded-full bg-[#2D7FF9]/8 blur-[80px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-2/5 h-2/5 rounded-full bg-[#E8453C]/6 blur-[60px] animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1.5s" }}
        />
      </div>

      {/* Spain map — loaded as <object> so internal CSS styles work */}
      <object
        data="/images/spain-universities.svg"
        type="image/svg+xml"
        className="relative w-full h-auto pointer-events-none"
        aria-label="Map of Spain highlighting top university cities"
      >
        <img src="/images/spain-universities.svg" alt="Spain university map" className="w-full h-auto" />
      </object>

      {/* Floating glass stat bubbles */}
      {BUBBLES.map(({ key, x, y, delay, size }) => (
        <div
          key={key}
          className={`absolute rounded-xl bg-white/75 backdrop-blur-md shadow-lg shadow-black/5 border border-white/80 text-slate-700 whitespace-nowrap ${BUBBLE_STYLES[size]}`}
          style={{
            left: x,
            top: y,
            animation: `bubbleFloat 7s ease-in-out ${delay}s infinite, bubbleFadeIn 1s ease-out ${delay}s both`,
          }}
        >
          <span className="bg-gradient-to-r from-[#E8453C] to-[#2D7FF9] bg-clip-text text-transparent">
            {t(`public.universidad.map_${key}_value`)}
          </span>{" "}
          <span className="text-slate-500 font-normal">
            {t(`public.universidad.map_${key}_label`)}
          </span>
        </div>
      ))}

      {/* Keyframes for this component */}
      <style>{`
        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
