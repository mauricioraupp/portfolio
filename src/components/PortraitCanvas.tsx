import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import selfie from '../assets/selfie.png'
import selfieDepth from '../assets/selfiedepth.png'
import lego from '../assets/lego.png'
import legoDepth from '../assets/legodepth.png'

function PortraitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    const cardElement = cardRef.current
    if (!canvasElement || !cardElement) return
    const canvas = canvasElement
    const card: HTMLDivElement = cardElement

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const loader = new THREE.TextureLoader()

    const aspectOf = (t: THREE.Texture) => {
      const img = t.image as HTMLImageElement
      return (img.naturalWidth || img.width) / (img.naturalHeight || img.height)
    }
    const texSelfie = loader.load(selfie, (t) => {
      uniforms.uAspectA.value = aspectOf(t)
    })
    const texSelfieDepth = loader.load(selfieDepth)
    const texLego = loader.load(lego, (t) => {
      uniforms.uAspectB.value = aspectOf(t)
    })
    const texLegoDepth = loader.load(legoDepth)

    ;[texSelfie, texSelfieDepth, texLego, texLegoDepth].forEach((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
      t.minFilter = THREE.LinearFilter
      t.magFilter = THREE.LinearFilter
    })

    const maskCanvas = document.createElement('canvas')
    const maskCtxResult = maskCanvas.getContext('2d')
    if (!maskCtxResult) {
      renderer.dispose()
      return
    }
    const maskCtx: CanvasRenderingContext2D = maskCtxResult

    const maskTex = new THREE.CanvasTexture(maskCanvas)
    maskTex.minFilter = THREE.LinearFilter
    maskTex.magFilter = THREE.LinearFilter
    maskTex.wrapS = maskTex.wrapT = THREE.ClampToEdgeWrapping

    function resizeMask() {
      const w = card.clientWidth
      const h = card.clientHeight
      if (!w || !h) return

      const scale = 1.0
      const nw = Math.max(2, Math.round(w * scale))
      const nh = Math.max(2, Math.round(h * scale))

      if (maskCanvas.width === nw && maskCanvas.height === nh) return

      maskCanvas.width = nw
      maskCanvas.height = nh
    }

    const MASK_EDGE_LO = 0.99
    const MASK_EDGE_HI = 1.00
    const DEPTH_BLUR = 0.02
    const DEPTH_CAP = 0.90
    const BOTTOM_MARGIN = 0.03
    const BG_INNER = '#ffffff'
    const BG_OUTER = '#e9e9e9'
    const BG_STUDS = 14
    const BG_PARALLAX = 0.35

    const hexToVec3 = (hex: string) => {
      const c = parseInt(hex.slice(1), 16)
      return new THREE.Vector3(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255)
    }

    const uniforms = {
      uColorA: { value: texSelfie },
      uDepthA: { value: texSelfieDepth },
      uColorB: { value: texLego },
      uDepthB: { value: texLegoDepth },
      uMask: { value: maskTex },
      uAspectA: { value: 1 },
      uAspectB: { value: 1 },
      uContainerAspect: { value: 1 },
      uZoom: { value: 1.1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uDrift: { value: new THREE.Vector2(0, 0) },
      uBgInner: { value: hexToVec3(BG_INNER) },
      uBgOuter: { value: hexToVec3(BG_OUTER) },
      uStrength: { value: 0.035 }
    }

    const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `

    const frag = [
      'precision highp float;',
      'varying vec2 vUv;',
      'uniform sampler2D uColorA; uniform sampler2D uDepthA;',
      'uniform sampler2D uColorB; uniform sampler2D uDepthB;',
      'uniform sampler2D uMask;',
      'uniform float uAspectA; uniform float uAspectB; uniform float uContainerAspect;',
      'uniform vec2 uMouse; uniform vec2 uDrift; uniform float uStrength;',

      'uniform float uZoom;',

      'uniform vec3 uBgInner; uniform vec3 uBgOuter;',

      'vec3 legoBackground(vec2 uv){',
      `  vec2 q = uv + uDrift + uMouse * uStrength * ${BG_PARALLAX.toFixed(3)};`,
      '  vec2 c = (q - vec2(0.5, 0.45)) * vec2(uContainerAspect, 1.0);',
      '  vec3 col = mix(uBgInner, uBgOuter, smoothstep(0.0, 0.85, length(c)));',
      `  float studs = ${BG_STUDS.toFixed(1)};`,
      '  if (studs > 0.5) {',
      '    vec2 p = q * vec2(uContainerAspect, 1.0) * studs;',
      '    float r = length(fract(p) - 0.5);',
      '    float top = 1.0 - smoothstep(0.30, 0.34, r);',
      '    float rim = smoothstep(0.34, 0.40, r) * (1.0 - smoothstep(0.40, 0.46, r));',
      '    col += top * 0.07 - rim * 0.10;',
      '  }',
      '  return col;',
      '}',

      'vec2 coverUV(vec2 uv, float texAspect, float containerAspect){',
      '  vec2 scale = vec2(',
      '    (containerAspect / texAspect) * uZoom,',
      '    uZoom',
      '  );',
      '  return vec2(',
      '    (uv.x - 0.5) * scale.x + 0.5,',
      `    uv.y * scale.y + ${BOTTOM_MARGIN.toFixed(3)}`,
      '  );',
      '}',

      'float softDepth(sampler2D tex, vec2 uv){',
      `  vec2 r = vec2(${DEPTH_BLUR.toFixed(4)});`,
      '  float s = 0.0;',
      '  s += texture2D(tex, clamp(uv, 0.001, 0.999)).r * 4.0;',
      '  s += texture2D(tex, clamp(uv + vec2(r.x, 0.0), 0.001, 0.999)).r * 2.0;',
      '  s += texture2D(tex, clamp(uv + vec2(-r.x, 0.0), 0.001, 0.999)).r * 2.0;',
      '  s += texture2D(tex, clamp(uv + vec2(0.0, r.y), 0.001, 0.999)).r * 2.0;',
      '  s += texture2D(tex, clamp(uv + vec2(0.0, -r.y), 0.001, 0.999)).r * 2.0;',
      '  s += texture2D(tex, clamp(uv + vec2(r.x, r.y), 0.001, 0.999)).r;',
      '  s += texture2D(tex, clamp(uv + vec2(-r.x, r.y), 0.001, 0.999)).r;',
      '  s += texture2D(tex, clamp(uv + vec2(r.x, -r.y), 0.001, 0.999)).r;',
      '  s += texture2D(tex, clamp(uv + vec2(-r.x, -r.y), 0.001, 0.999)).r;',
      '  float d = s / 16.0;',
      `  float cap = ${DEPTH_CAP.toFixed(3)};`,
      '  d -= smoothstep(cap - 0.15, 1.0, d) * max(d - cap, 0.0);',
      '  return d;',
      '}',

      'void main(){',
      '  vec2 uvA = coverUV(vUv, uAspectA, uContainerAspect);',
      '  vec2 baseA = uvA + uDrift;',
      '  float dA = softDepth(uDepthA, baseA);',
      '  float depthMaskA = smoothstep(0.30, 1.0, dA);',
      '  float depthOffsetA = (dA - 0.5) * depthMaskA;',
      '  vec2 uvAp = baseA - uMouse * uStrength * depthOffsetA;',
      '  vec4 colA = texture2D(uColorA, clamp(uvAp, 0.001, 0.999));',

      '  vec2 uvB = coverUV(vUv, uAspectB, uContainerAspect);',
      '  vec2 baseB = uvB + uDrift;',
      '  float dB = softDepth(uDepthB, baseB);',
      '  float depthMaskB = smoothstep(0.30, 1.0, dB);',
      '  float depthOffsetB = (dB - 0.5) * depthMaskB;',
      '  vec2 uvBp = baseB - uMouse * uStrength * depthOffsetB;',
      '  vec4 colB = texture2D(uColorB, clamp(uvBp, 0.001, 0.999));',
      '  colB = vec4(mix(legoBackground(vUv), colB.rgb, colB.a), 1.0);',

      '  float field = texture2D(uMask, vUv).r;',
      `  float m = smoothstep(${MASK_EDGE_LO.toFixed(3)}, ${MASK_EDGE_HI.toFixed(3)}, field);`,
      '  gl_FragColor = mix(colA, colB, m);',
      '}'
    ].join('\n')

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag })
    const geo = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geo, material)
    scene.add(mesh)

    function resize() {
      const w = card.clientWidth
      const h = card.clientHeight
      if (!w || !h) return

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h, false)
      uniforms.uContainerAspect.value = w / h
      resizeMask()
    }
    resize()
    window.addEventListener('resize', resize)

    const targetMouse = { x: 0, y: 0 }
    const currentMouse = { x: 0, y: 0 }
    const targetDrift = { x: 0, y: 0 }
    const currentDrift = { x: 0, y: 0 }

    const BRUSH_LIFETIME = 900
    const BRUSH_RADIUS = 0.150
    const LOOKAHEAD = 260
    const MAX_LOOK = 0.10
    const TRAVEL = 0.6
    const GROW_TIME = 90
    const SPACING = 0.004
    const SPEED_REF = 2.5
    const MIN_SIZE = 0.45
    const SIZE_SMOOTH = 0.25
    const DENSITY = 8.0

    const BLOB = [1.00, 0.92, 0.80, 0.92, 1.03, 1.12, 1.05, 0.96, 0.84, 0.93, 1.10, 1.02]

    const SPRITE_SIZE = 128
    const SPRITE_MARGIN = 0.90

    const spriteCanvas = document.createElement('canvas')
    spriteCanvas.width = spriteCanvas.height = SPRITE_SIZE

    const spriteCtx = spriteCanvas.getContext('2d')

    if (!spriteCtx) {
      renderer.dispose()
      return
    }

    const img = spriteCtx.createImageData(SPRITE_SIZE, SPRITE_SIZE)
    const n = BLOB.length
    const half = SPRITE_SIZE / 2
    const unit = half / SPRITE_MARGIN
    const TAU = Math.PI * 2

    for (let y = 0; y < SPRITE_SIZE; y++) {
      for (let x = 0; x < SPRITE_SIZE; x++) {
        const px = (x + 0.5 - half) / unit
        const py = (y + 0.5 - half) / unit
        const d = Math.sqrt(px * px + py * py)

        let ang = Math.atan2(py, px)
        if (ang < 0) ang += TAU

        const f = (ang / TAU) * n
        const i0 = Math.floor(f)

        let fr = f - i0
        fr = fr * fr * (3 - 2 * fr)

        const rr = BLOB[i0 % n] * (1 - fr) + BLOB[(i0 + 1) % n] * fr
        const t = d / rr
        const v = t >= 1 ? 0 : Math.pow(1 - t * t, 2)

        const idx = (y * SPRITE_SIZE + x) * 4

        img.data[idx] = 255
        img.data[idx + 1] = 255
        img.data[idx + 2] = 255
        img.data[idx + 3] = Math.round(v * 255)
      }
    }

    spriteCtx.putImageData(img, 0, 0)

    let brushX = -1000
    let brushY = -1000
    let brushActive = false

    type BrushPoint = {
      x: number
      y: number
      lookX: number
      lookY: number
      time: number
      size: number
    }

    let brushTrail: BrushPoint[] = []
    let lastBrushX = -1000
    let lastBrushY = -1000
    let lastMoveTime = 0
    let velX = 0
    let velY = 0
    let smoothSize = MIN_SIZE
    let carry = 0

    function easeOutCubic(x: number) {
      return 1 - Math.pow(1 - x, 3)
    }

    function smootherstep(x: number) {
      x = Math.max(0, Math.min(1, x))
      return x * x * x * (x * (x * 6 - 15) + 10)
    }

    function addPoint(x: number, y: number, lookX: number, lookY: number, time: number, size: number) {
      brushTrail.push({ x, y, lookX, lookY, time, size })
    }

    function onMove(clientX: number, clientY: number) {
      const r = card.getBoundingClientRect()
      const fx = (clientX - r.left) / r.width
      const fy = (clientY - r.top) / r.height

      const nx = fx * 2 - 1
      const ny = fy * 2 - 1

      targetMouse.x = Math.max(-1.4, Math.min(1.4, nx))
      targetMouse.y = -Math.max(-1.4, Math.min(1.4, ny))

      targetDrift.x = nx * 0.020
      targetDrift.y = ny * 0.030

      brushActive = fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1
      brushX = fx * maskCanvas.width
      brushY = fy * maskCanvas.height

      if (!brushActive) return

      const now = performance.now()

      if (lastBrushX < -500) {
        lastBrushX = brushX
        lastBrushY = brushY
        lastMoveTime = now
        velX = 0
        velY = 0
        carry = 0
        smoothSize = MIN_SIZE
        addPoint(brushX, brushY, 0, 0, now, smoothSize)
        return
      }

      const dx = brushX - lastBrushX
      const dy = brushY - lastBrushY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 0.3) return

      const dt = Math.max(1, now - lastMoveTime)

      velX += (dx / dt - velX) * 0.35
      velY += (dy / dt - velY) * 0.35

      const big = Math.max(maskCanvas.width, maskCanvas.height)
      const speed = Math.sqrt(velX * velX + velY * velY)
      const speedNorm = Math.min(1, speed / (SPEED_REF * big / 800))

      const prevSize = smoothSize
      const targetSize = MIN_SIZE + (1 - MIN_SIZE) * speedNorm

      smoothSize += (targetSize - smoothSize) * SIZE_SMOOTH

      let lookX = velX * LOOKAHEAD
      let lookY = velY * LOOKAHEAD

      const lookLen = Math.sqrt(lookX * lookX + lookY * lookY)
      const maxLook = big * MAX_LOOK

      if (lookLen > maxLook) {
        lookX *= maxLook / lookLen
        lookY *= maxLook / lookLen
      }

      const spacing = big * SPACING
      let d = spacing - carry

      while (d <= distance) {
        const t = d / distance

        addPoint(
          lastBrushX + dx * t,
          lastBrushY + dy * t,
          lookX,
          lookY,
          now,
          prevSize + (smoothSize - prevSize) * t
        )

        d += spacing
      }

      carry = spacing - (d - distance)
      lastBrushX = brushX
      lastBrushY = brushY
      lastMoveTime = now
    }

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleLeave = () => {
      brushActive = false
      lastBrushX = -1000
      lastBrushY = -1000
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('touchend', handleLeave)

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    function drawMask() {
      const w = maskCanvas.width
      const h = maskCanvas.height
      const now = performance.now()

      brushTrail = brushTrail.filter((point) => now - point.time < BRUSH_LIFETIME)

      maskCtx.globalCompositeOperation = 'source-over'
      maskCtx.globalAlpha = 1
      maskCtx.fillStyle = '#000000'
      maskCtx.fillRect(0, 0, w, h)

      maskCtx.globalCompositeOperation = 'lighter'

      const maxRadius = Math.max(w, h) * BRUSH_RADIUS
      const spacingPx = Math.max(w, h) * SPACING

      brushTrail.forEach((point) => {
        const age = now - point.time
        const life = age / BRUSH_LIFETIME

        if (life >= 1) return

        const move = easeOutCubic(Math.min(1, life / TRAVEL))
        const x = point.x + point.lookX * move
        const y = point.y + point.lookY * move

        const grow = easeOutCubic(Math.min(1, age / GROW_TIME))
        const shrink = 1 - smootherstep(life)
        const amp = grow * shrink

        if (amp < 0.01) return

        const radius = maxRadius * point.size * (0.7 + 0.3 * shrink)
        const weight = Math.min(1, DENSITY * spacingPx / (1.067 * radius))

        maskCtx.globalAlpha = weight * amp

        const side = radius * 2 * SPRITE_MARGIN

        maskCtx.drawImage(
          spriteCanvas,
          x - side / 2,
          y - side / 2,
          side,
          side
        )
      })

      maskCtx.globalAlpha = 1
      maskCtx.globalCompositeOperation = 'source-over'
      maskTex.needsUpdate = true
    }

    let animationFrame = 0

    function animate() {
      animationFrame = requestAnimationFrame(animate)

      const ease = reduceMotion ? 1 : 0.09

      currentMouse.x += (targetMouse.x - currentMouse.x) * ease
      currentMouse.y += (targetMouse.y - currentMouse.y) * ease

      uniforms.uMouse.value.set(currentMouse.x, currentMouse.y)

      currentDrift.x += (targetDrift.x - currentDrift.x) * 0.025
      currentDrift.y += (targetDrift.y - currentDrift.y) * 0.025

      uniforms.uDrift.value.set(currentDrift.x, currentDrift.y)

      drawMask()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)

      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('touchend', handleLeave)

      geo.dispose()
      material.dispose()
      maskTex.dispose()
      texSelfie.dispose()
      texSelfieDepth.dispose()
      texLego.dispose()
      texLegoDepth.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={cardRef} className="relative h-screen w-screen">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  )
}

export default PortraitCanvas