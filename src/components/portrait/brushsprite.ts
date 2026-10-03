import { BRUSH } from './config'

export function createBrushSprite(): HTMLCanvasElement | null {
  const size = BRUSH.spriteSize
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const img = ctx.createImageData(size, size)
  const blob = BRUSH.blob
  const n = blob.length
  const half = size / 2
  const unit = half / BRUSH.spriteMargin
  const TAU = Math.PI * 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5 - half) / unit
      const py = (y + 0.5 - half) / unit
      const d = Math.sqrt(px * px + py * py)

      let ang = Math.atan2(py, px)
      if (ang < 0) ang += TAU

      const f = (ang / TAU) * n
      const i0 = Math.floor(f)

      let fr = f - i0
      fr = fr * fr * (3 - 2 * fr)

      const rr = blob[i0 % n] * (1 - fr) + blob[(i0 + 1) % n] * fr
      const t = d / rr
      const v = t >= 1 ? 0 : Math.pow(1 - t * t, 2)

      const idx = (y * size + x) * 4
      img.data[idx] = 255
      img.data[idx + 1] = 255
      img.data[idx + 2] = 255
      img.data[idx + 3] = Math.round(v * 255)
    }
  }

  ctx.putImageData(img, 0, 0)
  return canvas
}