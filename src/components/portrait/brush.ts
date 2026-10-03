import { BRUSH } from './config'
import { easeOutCubic, smootherstep } from './easing'
import { createBrushSprite } from './brushsprite'

type BrushPoint = {
  x: number
  y: number
  lookX: number
  lookY: number
  time: number
  size: number
}

export function createBrush(maskCanvas: HTMLCanvasElement) {
  const ctx = maskCanvas.getContext('2d')
  const sprite = createBrushSprite()
  if (!ctx || !sprite) return null

  const maskCtx: CanvasRenderingContext2D = ctx
  const spriteImage: HTMLCanvasElement = sprite

  let trail: BrushPoint[] = []
  let lastX = -1000
  let lastY = -1000
  let lastTime = 0
  let velX = 0
  let velY = 0
  let smoothSize: number = BRUSH.minSize
  let carry = 0

  function addPoint(x: number, y: number, lookX: number, lookY: number, time: number, size: number) {
    trail.push({ x, y, lookX, lookY, time, size })
  }

  function move(fx: number, fy: number) {
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return

    const x = fx * maskCanvas.width
    const y = fy * maskCanvas.height
    const now = performance.now()

    if (lastX < -500) {
      lastX = x
      lastY = y
      lastTime = now
      velX = 0
      velY = 0
      carry = 0
      smoothSize = BRUSH.minSize
      addPoint(x, y, 0, 0, now, smoothSize)
      return
    }

    const dx = x - lastX
    const dy = y - lastY
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 0.3) return

    const dt = Math.max(1, now - lastTime)

    velX += (dx / dt - velX) * 0.35
    velY += (dy / dt - velY) * 0.35

    const big = Math.max(maskCanvas.width, maskCanvas.height)
    const speed = Math.sqrt(velX * velX + velY * velY)
    const speedNorm = Math.min(1, speed / ((BRUSH.speedRef * big) / 800))

    const prevSize = smoothSize
    const targetSize = BRUSH.minSize + (1 - BRUSH.minSize) * speedNorm
    smoothSize += (targetSize - smoothSize) * BRUSH.sizeSmooth

    let lookX = velX * BRUSH.lookahead
    let lookY = velY * BRUSH.lookahead
    const lookLen = Math.sqrt(lookX * lookX + lookY * lookY)
    const maxLook = big * BRUSH.maxLook
    if (lookLen > maxLook) {
      lookX *= maxLook / lookLen
      lookY *= maxLook / lookLen
    }

    const spacing = big * BRUSH.spacing
    let d = spacing - carry

    while (d <= distance) {
      const t = d / distance
      addPoint(lastX + dx * t, lastY + dy * t, lookX, lookY, now, prevSize + (smoothSize - prevSize) * t)
      d += spacing
    }

    carry = spacing - (d - distance)
    lastX = x
    lastY = y
    lastTime = now
  }

  function isActive() {
    return trail.length > 0
  }

  function reset() {
    lastX = -1000
    lastY = -1000
  }

  function draw() {
    const w = maskCanvas.width
    const h = maskCanvas.height
    const now = performance.now()

    trail = trail.filter((p) => now - p.time < BRUSH.lifetime)

    maskCtx.globalCompositeOperation = 'source-over'
    maskCtx.globalAlpha = 1
    maskCtx.fillStyle = '#000000'
    maskCtx.fillRect(0, 0, w, h)
    maskCtx.globalCompositeOperation = 'lighter'

    const maxRadius = Math.max(w, h) * BRUSH.radius
    const spacingPx = Math.max(w, h) * BRUSH.spacing

    trail.forEach((p) => {
      const age = now - p.time
      const life = age / BRUSH.lifetime
      if (life >= 1) return

      const move = easeOutCubic(Math.min(1, life / BRUSH.travel))
      const x = p.x + p.lookX * move
      const y = p.y + p.lookY * move

      const grow = easeOutCubic(Math.min(1, age / BRUSH.growTime))
      const shrink = 1 - smootherstep(life)
      const amp = grow * shrink
      if (amp < 0.01) return

      const radius = maxRadius * p.size * (0.7 + 0.3 * shrink)
      const weight = Math.min(1, (BRUSH.density * spacingPx) / (1.067 * radius))

      maskCtx.globalAlpha = weight * amp
      const side = radius * 2 * BRUSH.spriteMargin
      maskCtx.drawImage(spriteImage, x - side / 2, y - side / 2, side, side)
    })

    maskCtx.globalAlpha = 1
    maskCtx.globalCompositeOperation = 'source-over'
  }

  return { move, reset, draw, isActive }
}

export type Brush = NonNullable<ReturnType<typeof createBrush>>