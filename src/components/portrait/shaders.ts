import { SHADER } from './config'

export const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

export function buildFragmentShader(): string {
  return [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uColorA; uniform sampler2D uDepthA;',
    'uniform sampler2D uColorB; uniform sampler2D uDepthB;',
    'uniform sampler2D uMask;',
    'uniform float uAspectA; uniform float uAspectB; uniform float uContainerAspect;',
    'uniform vec2 uMouse; uniform vec2 uDrift; uniform float uStrength;',
    'uniform float uZoom;',
    'uniform vec3 uBgInner; uniform vec3 uBgOuter;',

    'vec2 coverUV(vec2 uv, float texAspect, float containerAspect){',
    '  vec2 scale = vec2(',
    '    (containerAspect / texAspect) * uZoom,',
    '    uZoom',
    '  );',
    '  return vec2(',
    '    (uv.x - 0.5) * scale.x + 0.5,',
    `    uv.y * scale.y + ${SHADER.bottomMargin.toFixed(3)}`,
    '  );',
    '}',

    'float softDepth(sampler2D tex, vec2 uv){',
    `  vec2 r = vec2(${SHADER.depthBlur.toFixed(4)});`,
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
    `  float cap = ${SHADER.depthCap.toFixed(3)};`,
    '  d -= smoothstep(cap - 0.15, 1.0, d) * max(d - cap, 0.0);',
    '  return d;',
    '}',

    'vec3 legoBackground(vec2 uv){',
    `  vec2 q = uv + uDrift + uMouse * uStrength * ${SHADER.bgParallax.toFixed(3)};`,
    '  vec2 c = (q - vec2(0.5, 0.45)) * vec2(uContainerAspect, 1.0);',
    '  vec3 col = mix(uBgInner, uBgOuter, smoothstep(0.0, 0.85, length(c)));',
    `  float studs = ${SHADER.bgStuds.toFixed(1)};`,
    '  if (studs > 0.5) {',
    '    vec2 p = q * vec2(uContainerAspect, 1.0) * studs;',
    '    float r = length(fract(p) - 0.5);',
    '    float top = 1.0 - smoothstep(0.30, 0.34, r);',
    '    float rim = smoothstep(0.34, 0.40, r) * (1.0 - smoothstep(0.40, 0.46, r));',
    '    col += top * 0.07 - rim * 0.10;',
    '  }',
    '  return col;',
    '}',

    'void main(){',
    '  float field = texture2D(uMask, vUv).r;',
    `  float m = smoothstep(${SHADER.maskEdgeLo.toFixed(3)}, ${SHADER.maskEdgeHi.toFixed(3)}, field);`,

    '  vec2 uvA = coverUV(vUv, uAspectA, uContainerAspect);',
    '  vec2 baseA = uvA + uDrift;',
    '  float dA = softDepth(uDepthA, baseA);',
    '  float depthMaskA = smoothstep(0.30, 1.0, dA);',
    '  float depthOffsetA = (dA - 0.5) * depthMaskA;',
    '  vec2 uvAp = baseA - uMouse * uStrength * depthOffsetA;',
    '  vec4 colA = texture2D(uColorA, clamp(uvAp, 0.001, 0.999));',

    '  vec4 colB = vec4(0.0);',
    '  if (m > 0.0) {',
    '    vec2 uvB = coverUV(vUv, uAspectB, uContainerAspect);',
    '    vec2 baseB = uvB + uDrift;',
    '    float dB = softDepth(uDepthB, baseB);',
    '    float depthMaskB = smoothstep(0.30, 1.0, dB);',
    '    float depthOffsetB = (dB - 0.5) * depthMaskB;',
    '    vec2 uvBp = baseB - uMouse * uStrength * depthOffsetB;',
    '    colB = texture2D(uColorB, clamp(uvBp, 0.001, 0.999));',
    '    colB = vec4(mix(legoBackground(vUv), colB.rgb, colB.a), 1.0);',
    '  }',

    '  gl_FragColor = mix(colA, colB, m);',
    '}'
  ].join('\n')
}