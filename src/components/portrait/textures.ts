import * as THREE from 'three'

import selfie from '@/assets/selfie.png'
import selfieDepth from '@/assets/selfiedepth.png'
import lego from '@/assets/lego.png'
import legoDepth from '@/assets/legodepth.png'

type Which = 'selfie' | 'lego'

function aspectOf(t: THREE.Texture): number {
  const img = t.image as HTMLImageElement
  return (img.naturalWidth || img.width) / (img.naturalHeight || img.height)
}

export function loadTextures(onAspect: (which: Which, aspect: number) => void) {
  const loader = new THREE.TextureLoader()

  const texSelfie = loader.load(selfie, (t) => onAspect('selfie', aspectOf(t)))
  const texSelfieDepth = loader.load(selfieDepth)
  const texLego = loader.load(lego, (t) => onAspect('lego', aspectOf(t)))
  const texLegoDepth = loader.load(legoDepth)

  const all = [texSelfie, texSelfieDepth, texLego, texLegoDepth]

  all.forEach((t) => {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
  })

  return {
    selfie: texSelfie,
    selfieDepth: texSelfieDepth,
    lego: texLego,
    legoDepth: texLegoDepth,
    dispose() {
      all.forEach((t) => t.dispose())
    }
  }
}