import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import { createNoiseGenerator } from '@/webgl/render'
import { setupWebGL } from '@/webgl/setup'
import fragmentSource from './fragment.glsl'
import vertexSource from './vertex.glsl'

/**
 * Configuration for Simplex noise generator.
 */
export type SimplexNoiseConfig = SharedConfig

/**
 * Create a Simplex noise generator.
 * @returns Simplex noise generator instance.
 */
export function simplex(): UttrNoiseGenerator<SimplexNoiseConfig> {
  const resources = setupWebGL(vertexSource, fragmentSource)
  return createNoiseGenerator<SimplexNoiseConfig>(resources)
}
