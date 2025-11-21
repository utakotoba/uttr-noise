import type { NoiseAlgorithm, NoiseConfigMap, UttrNoiseGenerator } from '@/types'
import { perlin } from './perlin'
import { simplex } from './simplex'
import { value } from './value'

/**
 * Algorithm factory functions registry.
 */
export const algorithms: {
  readonly [K in NoiseAlgorithm]: () => UttrNoiseGenerator<NoiseConfigMap[K]>
} = {
  value,
  simplex,
  perlin,
} as const
