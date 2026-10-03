export const SHADER = {
  maskEdgeLo: 0.99,
  maskEdgeHi: 1.0,
  depthBlur: 0.02,
  depthCap: 0.82,
  zoom: 1.1,
  strength: 0.035,
  bottomMargin: 0.03,

  bgInner: '#ffffff',
  bgOuter: '#e9e9e9',
  bgStuds: 14,
  bgParallax: 0.35
} as const

export const PARALLAX = {
  driftX: 0.02,
  driftY: 0.03,
  mouseEase: 0.09,
  driftEase: 0.035
} as const

export const BRUSH = {
  lifetime: 900,
  radius: 0.14,
  lookahead: 100,
  maxLook: 0.1,
  travel: 0.6,
  growTime: 90,
  spacing: 0.004,
  speedRef: 2.5,
  minSize: 0.45,
  sizeSmooth: 0.25,
  density: 8.0,

  blob: [1.0, 0.92, 0.8, 0.92, 1.03, 1.12, 1.05, 0.96, 0.84, 0.93, 1.1, 1.02],

  spriteSize: 128,
  spriteMargin: 0.9
} as const

export const PERF = {
  maxPixelRatio: 1.5,
  maskScale: 0.7
} as const