import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { PARALLAX, PERF, SHADER } from './portrait/config'
import { buildFragmentShader, vert } from './portrait/shaders'
import { createBrush, type Brush } from './portrait/brush'
import { loadTextures } from './portrait/textures'

function hexToVec3(hex: string) {
  const c = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function PortraitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    const cardElement = cardRef.current
    if (!canvasElement || !cardElement) return
    const canvas: HTMLCanvasElement = canvasElement
    const card: HTMLDivElement = cardElement

    const maskCanvas = document.createElement('canvas')
    const createdBrush = createBrush(maskCanvas)
    if (!createdBrush) return
    const brush: Brush = createdBrush

    const maskTex = new THREE.CanvasTexture(maskCanvas)
    maskTex.minFilter = THREE.LinearFilter
    maskTex.magFilter = THREE.LinearFilter
    maskTex.wrapS = maskTex.wrapT = THREE.ClampToEdgeWrapping

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    })
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const textures = loadTextures((which, aspect) => {
      if (which === 'selfie') uniforms.uAspectA.value = aspect
      else uniforms.uAspectB.value = aspect
    })

    const uniforms = {
      uColorA: { value: textures.selfie },
      uDepthA: { value: textures.selfieDepth },
      uColorB: { value: textures.lego },
      uDepthB: { value: textures.legoDepth },
      uMask: { value: maskTex },
      uAspectA: { value: 1 },
      uAspectB: { value: 1 },
      uContainerAspect: { value: 1 },
      uZoom: { value: SHADER.zoom },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uDrift: { value: new THREE.Vector2(0, 0) },
      uStrength: { value: SHADER.strength },
      uBgInner: { value: hexToVec3(SHADER.bgInner) },
      uBgOuter: { value: hexToVec3(SHADER.bgOuter) }
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: buildFragmentShader()
    })
    const geo = new THREE.PlaneGeometry(2, 2)
    scene.add(new THREE.Mesh(geo, material))

    function resize() {
      const w = card.clientWidth
      const h = card.clientHeight
      if (!w || !h) return

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, PERF.maxPixelRatio))
      renderer.setSize(w, h, false)
      uniforms.uContainerAspect.value = w / h

      const mw = Math.max(2, Math.round(w * PERF.maskScale))
      const mh = Math.max(2, Math.round(h * PERF.maskScale))
      if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
        maskCanvas.width = mw
        maskCanvas.height = mh
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const targetMouse = { x: 0, y: 0 }
    const currentMouse = { x: 0, y: 0 }
    const targetDrift = { x: 0, y: 0 }
    const currentDrift = { x: 0, y: 0 }

    function onPointer(clientX: number, clientY: number) {
      const r = card.getBoundingClientRect()
      const fx = (clientX - r.left) / r.width
      const fy = (clientY - r.top) / r.height

      const nx = fx * 2 - 1
      const ny = fy * 2 - 1

      targetMouse.x = clamp(nx, -1.4, 1.4)
      targetMouse.y = -clamp(ny, -1.4, 1.4)

      targetDrift.x = clamp(nx, -1, 1) * PARALLAX.driftX
      targetDrift.y = clamp(ny, -1, 1) * PARALLAX.driftY

      brush.move(fx, fy)
    }

    const handleMouseMove = (e: MouseEvent) => onPointer(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY)
    }
    const handleLeave = () => brush.reset()

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    window.addEventListener('touchend', handleLeave)

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let animationFrame = 0
    let maskDirty = true

    function animate() {
      animationFrame = requestAnimationFrame(animate)

      const ease = reduceMotion ? 1 : PARALLAX.mouseEase
      currentMouse.x += (targetMouse.x - currentMouse.x) * ease
      currentMouse.y += (targetMouse.y - currentMouse.y) * ease
      uniforms.uMouse.value.set(currentMouse.x, currentMouse.y)

      currentDrift.x += (targetDrift.x - currentDrift.x) * PARALLAX.driftEase
      currentDrift.y += (targetDrift.y - currentDrift.y) * PARALLAX.driftEase
      uniforms.uDrift.value.set(currentDrift.x, currentDrift.y)

      if (brush.isActive() || maskDirty) {
        brush.draw()
        maskTex.needsUpdate = true
        maskDirty = brush.isActive()
      }

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
      textures.dispose()
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