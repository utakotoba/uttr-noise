import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import { mergeSharedConfig } from '@/config'
import { createNoiseGenerator, setUniforms } from '@/webgl/render'
import { setupWebGL } from '@/webgl/setup'
import fragmentSource from './fragment.glsl'
import vertexSource from './vertex.glsl'

/**
 * Interpolation methods for value noise.
 * - `linear`: Simple linear interpolation (fastest, but can appear blocky)
 * - `smoothstep`: Cubic interpolation (smooth, balanced)
 * - `smootherstep`: Quintic interpolation (smoothest, most natural)
 */
export type ValueInterpolationMethod = 'linear' | 'smoothstep' | 'smootherstep'

/**
 * Configuration for Value noise generator.
 */
export interface ValueNoiseConfig extends SharedConfig {
  /**
   * Interpolation method used for blending between noise values.
   *
   * - `linear`: Simple linear interpolation (fastest, but can appear blocky)
   * - `smoothstep`: Cubic interpolation (smooth, balanced) - recommended
   * - `smootherstep`: Quintic interpolation (smoothest, most natural)
   * @default 'smoothstep'
   */
  interpolation?: ValueInterpolationMethod
}

/**
 * Default configuration values specific to value noise.
 */
const DEFAULT_VALUE_CONFIG = {
  interpolation: 'smoothstep' as const,
} as const

/**
 * Create a value noise generator.
 * @returns Value noise generator instance.
 */
export function value(): UttrNoiseGenerator<ValueNoiseConfig> {
  const { canvas, gl, program } = setupWebGL(vertexSource, fragmentSource)

  const prepareRender = (config?: Partial<ValueNoiseConfig>) => {
    const shared = mergeSharedConfig(config)
    const interpolation = config?.interpolation ?? DEFAULT_VALUE_CONFIG.interpolation
    const interpolationValue = interpolation === 'linear' ? 0 : interpolation === 'smoothstep' ? 1 : 2

    canvas.width = shared.width
    canvas.height = shared.height

    gl.useProgram(program)

    setUniforms(gl, program, {
      u_width: { type: '1f', value: shared.width },
      u_height: { type: '1f', value: shared.height },
      u_seed: { type: '1f', value: shared.seed },
      u_frequency: { type: '1f', value: shared.frequency },
      u_octaves: { type: '1i', value: shared.octaves },
      u_persistence: { type: '1f', value: shared.persistence },
      u_lacunarity: { type: '1f', value: shared.lacunarity },
      u_amplitude: { type: '1f', value: shared.amplitude },
      u_interpolation: { type: '1i', value: interpolationValue },
    })

    return shared
  }

  return createNoiseGenerator(canvas, gl, program, prepareRender)
}
