import type { ValueNoiseConfig } from '@/types/algorithms'
import type { UttrNoiseGenerator } from '@/types/shared'
import { mergeSharedConfig } from '@/config'
import {
  createProgram,
  createWebGLContext,
  renderToImageData,
} from '@/webgl/utils'
import fragmentSource from './fragment.glsl'
import vertexSource from './vertex.glsl'

/**
 * Default configuration values specific to value noise.
 */
const DEFAULT_VALUE_CONFIG = {
  frequency: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2,
} as const

/**
 * Create a value noise generator.
 * @returns Value noise generator instance.
 */
export function value(): UttrNoiseGenerator<ValueNoiseConfig> {
  // Create offscreen canvas for WebGL rendering
  const canvas = new OffscreenCanvas(1, 1)
  const gl = createWebGLContext(canvas)

  // Compile shader program only once
  const program = createProgram(gl, vertexSource, fragmentSource)

  return {
    async imageData(config: Partial<ValueNoiseConfig>): Promise<ImageData> {
      // Resolve config with defaults
      const shared = mergeSharedConfig(config)
      const frequency = config.frequency ?? DEFAULT_VALUE_CONFIG.frequency
      const octaves = config.octaves ?? DEFAULT_VALUE_CONFIG.octaves
      const persistence = config.persistence ?? DEFAULT_VALUE_CONFIG.persistence
      const lacunarity = config.lacunarity ?? DEFAULT_VALUE_CONFIG.lacunarity

      canvas.width = shared.width
      canvas.height = shared.height

      gl.useProgram(program)

      const widthLocation = gl.getUniformLocation(program, 'u_width')
      const heightLocation = gl.getUniformLocation(program, 'u_height')
      const seedLocation = gl.getUniformLocation(program, 'u_seed')
      const frequencyLocation = gl.getUniformLocation(program, 'u_frequency')
      const octavesLocation = gl.getUniformLocation(program, 'u_octaves')
      const persistenceLocation = gl.getUniformLocation(program, 'u_persistence')
      const lacunarityLocation = gl.getUniformLocation(program, 'u_lacunarity')

      if (widthLocation)
        gl.uniform1f(widthLocation, shared.width)
      if (heightLocation)
        gl.uniform1f(heightLocation, shared.height)
      if (seedLocation)
        gl.uniform1f(seedLocation, shared.seed)
      if (frequencyLocation)
        gl.uniform1f(frequencyLocation, frequency)
      if (octavesLocation)
        gl.uniform1i(octavesLocation, octaves)
      if (persistenceLocation)
        gl.uniform1f(persistenceLocation, persistence)
      if (lacunarityLocation)
        gl.uniform1f(lacunarityLocation, lacunarity)

      return renderToImageData(gl, program, shared.width, shared.height)
    },
  }
}
