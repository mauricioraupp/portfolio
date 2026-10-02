import PortraitCanvas from './PortraitCanvas'

function Hero() {
  return (
    <section id="topo" className="relative h-screen overflow-hidden bg-ink">
      <PortraitCanvas />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30" />

      <div className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm font-semibold tracking-wide md:left-10 md:top-10">
        <span className="h-2.5 w-2.5 rounded-full bg-lime" />
        SEU NOME
      </div>

      <div className="absolute right-6 top-6 z-10 md:right-10 md:top-10">
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          <a href="#sobre" className="transition-opacity hover:opacity-60">Sobre</a>
          <a href="#trabalhos" className="transition-opacity hover:opacity-60">Trabalhos</a>
          <a href="#contato" className="transition-opacity hover:opacity-60">Contato</a>
        </nav>

        <button type="button" className="text-sm font-medium md:hidden">
          Menu
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-10 max-w-xs md:bottom-10 md:left-10">
        <p className="font-display text-sm uppercase tracking-widest text-lime">Portfólio pessoal — edição 2026</p>
        <p className="mt-2 text-sm text-paper/70">Desenvolvedor de software e criador de experiências digitais.</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 text-right md:bottom-10 md:right-10">
        <p className="mb-4 hidden max-w-xs text-sm text-paper/70 md:block">
          Arraste o mouse pela foto para revelar a versão LEGO
        </p>

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