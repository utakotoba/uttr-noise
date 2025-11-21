import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import { createNoiseGenerator } from '@/webgl/render'
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
  const resources = setupWebGL(vertexSource, fragmentSource)
  return createNoiseGenerator<PerlinNoiseConfig>(resources)
}
