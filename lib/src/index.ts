import type { NoiseAlgorithm, NoiseConfigMap, UttrNoiseGenerator } from '@/types'
import { algorithms } from './algorithms'

/**
 * Helper function to create a noise generator.
 */
export function create<K extends NoiseAlgorithm>(
  algorithm: K,
): UttrNoiseGenerator<NoiseConfigMap[K]> {
  const factory = algorithms[algorithm]
  return factory()
}
