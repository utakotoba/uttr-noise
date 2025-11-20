import type { ValueNoiseConfig } from '@/types/algorithms'
import type { UttrNoiseGenerator } from '@/types/shared'
import {
  createProgram,
  createWebGLContext,
  renderToImageData,
} from '@/webgl/utils'
import fragmentSource from './fragment.glsl'
import vertexSource from './vertex.glsl'

/**
 * Default configuration values for value noise.
 */
const DEFAULT_CONFIG: Required<ValueNoiseConfig> = {
  width: 512,
  height: 512,
  seed: 37,
  frequency: 1,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2,
}

/**
 * Create a value noise generator.
 * @returns Value noise generator instance.
 */
export function value(): UttrNoiseGenerator<ValueNoiseConfig> {
  // Create offscreen canvas for WebGL rendering
  const canvas = document.createElement('canvas')
  const gl = createWebGLContext(canvas)

  // Compile shader program once
  const program = createProgram(gl, vertexSource, fragmentSource)

  return {
    async imageData(config: Partial<ValueNoiseConfig>): Promise<ImageData> {
      // Merge with defaults
      const width = config.width ?? DEFAULT_CONFIG.width
      const height = config.height ?? DEFAULT_CONFIG.height
      const seed: number = config.seed === false
        ? Date.now()
        : (config.seed ?? (DEFAULT_CONFIG.seed === false ? Date.now() : DEFAULT_CONFIG.seed))
      const frequency = config.frequency ?? DEFAULT_CONFIG.frequency
      const octaves = config.octaves ?? DEFAULT_CONFIG.octaves
      const persistence = config.persistence ?? DEFAULT_CONFIG.persistence
      const lacunarity = config.lacunarity ?? DEFAULT_CONFIG.lacunarity

      // Resize canvas
      canvas.width = width
      canvas.height = height

      // Set uniforms
      gl.useProgram(program)

      const widthLocation = gl.getUniformLocation(program, 'u_width')
      const heightLocation = gl.getUniformLocation(program, 'u_height')
      const seedLocation = gl.getUniformLocation(program, 'u_seed')
      const frequencyLocation = gl.getUniformLocation(program, 'u_frequency')
      const octavesLocation = gl.getUniformLocation(program, 'u_octaves')
      const persistenceLocation = gl.getUniformLocation(program, 'u_persistence')
      const lacunarityLocation = gl.getUniformLocation(program, 'u_lacunarity')

      if (widthLocation)
        gl.uniform1f(widthLocation, width)
      if (heightLocation)
        gl.uniform1f(heightLocation, height)
      if (seedLocation)
        gl.uniform1f(seedLocation, seed)
      if (frequencyLocation)
        gl.uniform1f(frequencyLocation, frequency)
      if (octavesLocation)
        gl.uniform1i(octavesLocation, octaves)
      if (persistenceLocation)
        gl.uniform1f(persistenceLocation, persistence)
      if (lacunarityLocation)
        gl.uniform1f(lacunarityLocation, lacunarity)

      // Render to ImageData
      return renderToImageData(gl, program, width, height)
    },
  }
}
