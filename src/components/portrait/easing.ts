export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

export function smootherstep(x: number): number {
  x = Math.max(0, Math.min(1, x))
  return x * x * x * (x * (x * 6 - 15) + 10)
}