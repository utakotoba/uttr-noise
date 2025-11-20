import type { ValueNoiseConfig } from './algorithms'

/**
 * Internally used map of noise configuration.
 * @private
 */
export interface NoiseConfigMap {
  value: ValueNoiseConfig
}

/**
 * Type of noise algorithm.
 */
export type NoiseAlgorithm = keyof NoiseConfigMap
