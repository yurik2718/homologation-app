/**
 * Premium hero illustration for the Spanish courses page.
 * Stylized Spain map + pulsing city markers + floating speech bubbles.
 */

const SPAIN_PATH =
  "M280,52 L295,48 310,55 320,50 335,58 340,65 350,62 360,70 365,80 370,95 " +
  "368,110 372,125 365,140 370,155 368,170 360,180 355,195 350,205 340,215 " +
  "335,230 325,240 315,248 300,255 285,260 275,270 260,278 245,282 230,280 " +
  "215,285 200,290 185,285 170,280 155,278 145,270 135,260 125,252 118,240 " +
  "110,225 105,210 100,195 95,180 90,165 88,150 85,135 82,120 80,105 " +
  "82,90 88,78 95,68 105,60 115,55 128,50 140,48 155,52 170,50 " +
  "185,48 200,50 215,48 230,50 245,48 260,50 280,52Z"

const CITIES = [
  { x: 210, y: 155, label: "Madrid", delay: 0 },
  { x: 305, y: 105, label: "Barcelona", delay: 0.5 },
  { x: 290, y: 185, label: "Valencia", delay: 1 },
] as const

const BUBBLES = [
  { text: "¡Hola!", x: "8%", y: "8%", delay: 0, size: "lg" },
  { text: "¿Cómo estás?", x: "62%", y: "2%", delay: 1.5, size: "md" },
  { text: "DELE B2 ✓", x: "72%", y: "72%", delay: 3, size: "sm" },
  { text: "Me encanta", x: "2%", y: "68%", delay: 2.2, size: "md" },
  { text: "Gracias", x: "58%", y: "42%", delay: 4, size: "sm" },
] as const

const ARCS = [
  { d: "M5,60 Q80,20 140,80", delay: 0.3 },
  { d: "M10,200 Q60,160 120,170", delay: 0.8 },
  { d: "M390,30 Q340,50 320,90", delay: 1.2 },
] as const

const bubbleSize = { lg: "text-sm px-4 py-2", md: "text-xs px-3 py-1.5", sm: "text-[11px] px-2.5 py-1" } as const

export function SpainIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto select-none">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-[#2D7FF9]/8 blur-[80px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-2/5 h-2/5 rounded-full bg-[#E8453C]/6 blur-[60px] animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        />
      </div>

      {/* Spain SVG */}
      <svg viewBox="0 0 420 320" className="relative w-full h-full" fill="none">
        <defs>
          <linearGradient id="spain-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D7FF9" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#E8453C" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="spain-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D7FF9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8453C" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D7FF9" stopOpacity="0" />
            <stop offset="50%" stopColor="#2D7FF9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E8453C" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Travel arcs */}
        {ARCS.map(({ d, delay }, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#arc-grad)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            fill="none"
            opacity="0"
            className="animate-arc"
            style={{
              animation: `arcIn 2s ease-out ${delay}s forwards`,
            }}
          />
        ))}

        {/* Spain outline */}
        <path
          d={SPAIN_PATH}
          fill="url(#spain-fill)"
          stroke="url(#spain-stroke)"
          strokeWidth="1.5"
        />

        {/* City markers */}
        {CITIES.map(({ x, y, label, delay }) => (
          <g key={label}>
            {/* Pulse rings */}
            <circle cx={x} cy={y} r="16" fill="none" stroke="#2D7FF9" strokeWidth="0.5" opacity="0.2">
              <animate attributeName="r" from="6" to="22" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.4" to="0" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="10" fill="none" stroke="#2D7FF9" strokeWidth="0.5" opacity="0.3">
              <animate attributeName="r" from="6" to="16" dur="3s" begin={`${delay + 0.5}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="3s" begin={`${delay + 0.5}s`} repeatCount="indefinite" />
            </circle>
            {/* Core dot */}
            <circle cx={x} cy={y} r="4" fill="#2D7FF9" filter="url(#glow)" />
            <circle cx={x} cy={y} r="2" fill="white" />
            {/* Label */}
            <text
              x={x}
              y={y + 18}
              textAnchor="middle"
              className="fill-slate-400 text-[9px] font-medium"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating speech bubbles */}
      {BUBBLES.map(({ text, x, y, delay, size }) => (
        <div
          key={text}
          className={`absolute rounded-full bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2D7FF9]/5 border border-white/60 font-semibold text-slate-700 whitespace-nowrap ${bubbleSize[size]}`}
          style={{
            left: x,
            top: y,
            animation: `bubbleFloat 6s ease-in-out ${delay}s infinite, bubbleFadeIn 0.8s ease-out ${delay}s both`,
          }}
        >
          {text}
        </div>
      ))}

      {/* Inline keyframes */}
      <style>{`
        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes arcIn {
          from { opacity: 0; stroke-dashoffset: 100; }
          to { opacity: 1; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
