import { useTranslation } from "react-i18next"
import { Container } from "@/components/public/shared"

// maxW: per-logo max-width in px — prevents wide wordmarks from dominating seals
// opacity: 0–100, seals need ~75 to stay legible at small size in grayscale
// heightClass: seals need more height than wordmarks for equal visual weight
const UNIVERSITY_LOGOS = [
  { key: "ucm",  src: "/images/universities/ucm.png",  name: "Universidad Complutense de Madrid",     maxW: 80,  opacity: 75, heightClass: "h-10 sm:h-12" },
  { key: "usal", src: "/images/universities/usal.png", name: "Universidad de Salamanca",              maxW: 80,  opacity: 75, heightClass: "h-10 sm:h-12" },
  { key: "uam",  src: "/images/universities/uam.svg",  name: "Universidad Autónoma de Madrid",        maxW: 160, opacity: 60, heightClass: "h-7 sm:h-9"   },
  { key: "ugr",  src: "/images/universities/ugr.svg",  name: "Universidad de Granada",                maxW: 80,  opacity: 75, heightClass: "h-10 sm:h-12" },
  { key: "ub",   src: "/images/universities/ub.svg",   name: "Universitat de Barcelona",              maxW: 130, opacity: 60, heightClass: "h-7 sm:h-9"   },
  { key: "upm",  src: "/images/universities/upm.svg",  name: "Universidad Politécnica de Madrid",     maxW: 130, opacity: 60, heightClass: "h-8 sm:h-10"  },
  { key: "uc3m", src: "/images/universities/uc3m.svg", name: "Universidad Carlos III de Madrid",      maxW: 130, opacity: 60, heightClass: "h-8 sm:h-10"  },
  { key: "upv",  src: "/images/universities/upv.svg",  name: "Universitat Politècnica de València",   maxW: 130, opacity: 60, heightClass: "h-8 sm:h-10"  },
]

/**
 * Scrolling university logo bar for trust/social proof.
 * Used on Precios and Universidad pages.
 *
 * To add/replace logos: put SVG/PNG files in public/images/universities/
 * and update the UNIVERSITY_LOGOS array above.
 */
export function UniversityLogoBar() {
  const { t } = useTranslation()

  return (
    <section className="border-y border-slate-100 py-8 sm:py-10 bg-white/80 overflow-hidden">
      <Container>
        <p className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-8 py-1">
          {t("public.precios.trust_bar_title")}
        </p>
      </Container>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling track — duplicated for seamless infinite loop */}
        <div
          className="flex w-max animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]"
          aria-hidden="false"
        >
          {[...UNIVERSITY_LOGOS, ...UNIVERSITY_LOGOS].map(({ key, src, name, maxW, opacity, heightClass }, i) => (
            <div
              key={`${key}-${i}`}
              className="flex items-center justify-center px-6 sm:px-10 shrink-0"
            >
              <img
                src={src}
                alt={name}
                loading="lazy"
                className={`${heightClass} w-auto object-contain grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0`}
                style={{ maxWidth: maxW, opacity: opacity / 100 }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
