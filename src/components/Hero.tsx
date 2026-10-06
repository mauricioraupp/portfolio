import { useState } from 'react'
import PortraitCanvas from './PortraitCanvas'
import VariantCard, { type Variant } from './VariantCard'

function Hero() {
  const [variant, setVariant] = useState<Variant>('selfie')

  return (
    <section id="topo" className="relative h-screen overflow-hidden bg-ink">
      <PortraitCanvas />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30" />

      <a href="/" className="absolute left-4 top-4 flex flex-col md:left-6 md:top-6">
        <span className="text-3xl md:text-[37px] font-bold text-taupe-800 cormorant">MAURICIO</span>
        <span className="text-5xl md:text-6xl font-bold text-taupe-800 spacegrotesk leading-none -mt-2 md:-mt-3">RAUPP</span>
      </a>

      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <a href="#sobre" className="transition-opacity hover:opacity-60">Sobre</a>
          <a href="#trabalhos" className="transition-opacity hover:opacity-60">Trabalhos</a>
          <a href="#contato" className="transition-opacity hover:opacity-60">Contato</a>
        </nav>

        <button type="button" className="text-sm font-medium md:hidden">
          Menu
        </button>
      </div>

      <div className="absolute bottom-0 left-0 md:bottom-2 md:left-2">
        <VariantCard
        value={variant}
        onChange={setVariant}
        className="absolute bottom-4 left-4 md:bottom-6 md:left-6"
      />
      </div>

      <div className="absolute bottom-4 right-4 text-right md:bottom-6 md:right-6">
        <div className="flex gap-3">
          <a href="#trabalhos" className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-105">
            Ver trabalhos
          </a>

          <a href="#contato" className="rounded-full border border-paper/40 px-5 py-3 text-sm font-semibold transition-colors hover:bg-paper hover:text-ink">
            Fale comigo
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero