import type { NoiseAlgorithm, NoiseConfigMap, UttrNoiseGenerator } from '@/types'
import { value } from './value'

/**
 * Algorithm factory functions registry.
 */
export const algorithms: {
  readonly [K in NoiseAlgorithm]: () => UttrNoiseGenerator<NoiseConfigMap[K]>
} = {
  value,
} as const
