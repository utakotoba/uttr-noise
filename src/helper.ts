import type { NoiseAlgorithm, NoiseConfigMap } from '@/types/registry'
import type { UttrNoiseGenerator } from '@/types/shared'

export function create<K extends NoiseAlgorithm>(
  _algorithm: K,
): UttrNoiseGenerator<NoiseConfigMap[K]> {
  // TODO: complete helper function to create generator
  return {} as unknown as any
}
