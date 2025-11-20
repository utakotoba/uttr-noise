import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import { mergeSharedConfig } from '@/config'
import { renderToDataUrl, renderToImageData, renderToRawData, setUniforms } from '@/webgl/render'
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
   * Frequency of the noise.
   *
   * How rapidly the noise value changes across the input domain.
   * Higher frequency (smaller scale) means smaller, more dense features.
   * @default 1
   */
  frequency?: number

  /**
   * Octaves of the noise.
   *
   * How many levels of detail to include in the noise.
   * Higher octaves (larger multiplier) means more detailed noise.
   * @default 1
   */
  octaves?: number

  /**
   * Persistence of the noise.
   *
   * How much each octave contributes to the final noise value.
   * Higher persistence (larger multiplier) means more contribution from higher octaves.
   * @default 0.5
   */
  persistence?: number

  /**
   * Lacunarity of the noise.
   *
   * How quickly the frequency increases as we move to higher octaves.
   * Higher lacunarity (larger multiplier) means more frequent changes in frequency.
   * @default 2
   */
  lacunarity?: number

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
  frequency: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2,
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
    const frequency = config?.frequency ?? DEFAULT_VALUE_CONFIG.frequency
    const octaves = config?.octaves ?? DEFAULT_VALUE_CONFIG.octaves
    const persistence = config?.persistence ?? DEFAULT_VALUE_CONFIG.persistence
    const lacunarity = config?.lacunarity ?? DEFAULT_VALUE_CONFIG.lacunarity
    const interpolation = config?.interpolation ?? DEFAULT_VALUE_CONFIG.interpolation
    const interpolationValue = interpolation === 'linear' ? 0 : interpolation === 'smoothstep' ? 1 : 2

    canvas.width = shared.width
    canvas.height = shared.height

    gl.useProgram(program)

    setUniforms(gl, program, {
      u_width: { type: '1f', value: shared.width },
      u_height: { type: '1f', value: shared.height },
      u_seed: { type: '1f', value: shared.seed },
      u_frequency: { type: '1f', value: frequency },
      u_octaves: { type: '1i', value: octaves },
      u_persistence: { type: '1f', value: persistence },
      u_lacunarity: { type: '1f', value: lacunarity },
      u_interpolation: { type: '1i', value: interpolationValue },
    })

    return shared
  }

  return {
    imageData(config?: Partial<ValueNoiseConfig>): ImageData {
      const shared = prepareRender(config)
      return renderToImageData(gl, program, shared.width, shared.height)
    },
    async dataUrl(config?: Partial<ValueNoiseConfig>): Promise<string> {
      const shared = prepareRender(config)
      return renderToDataUrl(canvas, gl, program, shared.width, shared.height)
    },
    rawData(config?: Partial<ValueNoiseConfig>): Float32Array {
      const shared = prepareRender(config)
      return renderToRawData(gl, program, shared.width, shared.height)
    },
  }
}
