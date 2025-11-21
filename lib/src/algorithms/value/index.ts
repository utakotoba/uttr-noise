import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import type { UniformValue } from '@/webgl/render'
import { createNoiseGenerator } from '@/webgl/render'
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
 * Create a Value noise generator.
 * @returns Value noise generator instance.
 */
export function value(): UttrNoiseGenerator<ValueNoiseConfig> {
  const resources = setupWebGL(vertexSource, fragmentSource)
  return createNoiseGenerator<ValueNoiseConfig>(resources, (config) => {
    const interpolation = config?.interpolation ?? DEFAULT_VALUE_CONFIG.interpolation
    const interpolationValue = interpolation === 'linear' ? 0 : interpolation === 'smoothstep' ? 1 : 2

    return {
      u_interpolation: { type: '1i', value: interpolationValue },
    } satisfies Record<string, UniformValue>
  })
}
