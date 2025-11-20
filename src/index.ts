import type { NoiseAlgorithm, NoiseConfigMap } from '@/types/registry'
import type { UttrNoiseGenerator } from '@/types/shared'
import { value } from './algorithms/value'

/**
 * Helper function to create a noise generator.
 */
export function create<K extends NoiseAlgorithm>(
  algorithm: K,
): UttrNoiseGenerator<NoiseConfigMap[K]> {
  switch (algorithm) {
    case 'value':
      return value()
  }
}
