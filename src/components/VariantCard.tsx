import head from '@/assets/svgs/head.svg'
import lego from '@/assets/svgs/lego.svg'

export type Variant = 'selfie' | 'lego'

type Props = {
  value: Variant
  onChange: (variant: Variant) => void
  className?: string
}

const options: { id: Variant; label: string; icon: string; iconClass: string }[] = [
  { id: 'selfie', label: 'Selfie', icon: head, iconClass: 'size-12 md:size-14' },
  { id: 'lego', label: 'Lego', icon: lego, iconClass: 'size-14 md:size-16' },
]

const OUTLINE =
  'M0,255 L0,28 Q0,21 7,21 L57,21 C71,21 73,0 87,0 L125,0 Q132,0 132,7 L132,255 Q132,262 125,262 L7,262 Q0,262 0,255 Z'

function VariantCard({ value, onChange, className = '' }: Props) {
  return (
    <div
      role="group"
      aria-label="Image version"
      className={`relative aspect-[132/262] w-24 text-taupe-800 md:w-34 ${className}`}
    >
      <svg
        viewBox="0 0 132 262"
        fill="oklch(81.8% 0.007 39.5)"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <path
          d={OUTLINE}
          className="stroke-taupe-800/60"
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span className="spacegrotesk pointer-events-none absolute left-0 top-0 flex h-4 items-center text-[10px] font-bold uppercase leading-none tracking-tight md:text-sm">
        Version
      </span>

      <div className="absolute inset-0 flex flex-col pb-1 pt-4">
        {options.map(({ id, label, icon, iconClass }, index) => {
          const active = value === id

          return (
            <div key={id} className="flex flex-1 flex-col">
              {index > 0 && <div className="mx-auto h-0.5 w-5/7 rounded-full bg-taupe-800/60" />}

              <button
                type="button"
                aria-label={`Mostrar versão ${label}`}
                aria-pressed={active}
                onClick={() => onChange(id)}
                className={`group flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 transition-opacity duration-300 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-taupe-800 md:gap-2 ${
                  active ? 'opacity-100' : 'opacity-45 hover:opacity-80'
                }`}
              >
                <img
                  src={icon}
                  alt=""
                  draggable={false}
                  className={`${iconClass} transition-transform duration-300 group-hover:scale-105`}
                />

                <span className="spacegrotesk flex items-center text-xs font-bold uppercase leading-none tracking-tight md:text-sm">
                  {label}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VariantCard