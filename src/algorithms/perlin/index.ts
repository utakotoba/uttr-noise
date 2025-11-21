import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import { mergeSharedConfig } from '@/config'
import { createNoiseGenerator, setUniforms } from '@/webgl/render'
import { setupWebGL } from '@/webgl/setup'
import fragmentSource from './fragment.glsl'
import vertexSource from './vertex.glsl'

/**
 * Configuration for Perlin noise generator.
 */
export type PerlinNoiseConfig = SharedConfig

/**
 * Create a Perlin noise generator.
 * @returns Perlin noise generator instance.
 */
export function perlin(): UttrNoiseGenerator<PerlinNoiseConfig> {
  const { canvas, gl, program } = setupWebGL(vertexSource, fragmentSource)

  const prepareRender = (config?: Partial<PerlinNoiseConfig>) => {
    const shared = mergeSharedConfig(config)

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
    })

    return shared
  }

  return createNoiseGenerator(canvas, gl, program, prepareRender)
}
