import type { ValueNoiseConfig } from './algorithms/value'

/**
 * Shared configuration used all kinds of noise generators.
 */
export interface SharedConfig {
  /**
   * Output width of image data in pixel.
   * @default 512
   */
  width?: number

  /**
   * Output height of image data in pixel.
   * @default 512
   */
  height?: number

  /**
   * Randomness factor for the noise.
   *
   * If `false`, seed will be generated automatically by timestamp.
   * @default 37
   */
  seed?: number | false
}

/**
 * Reusable Uttr noise generator held the compiled WebGL code.
 */
export interface UttrNoiseGenerator<T extends SharedConfig> {
  /**
   * Generate noise image data according to the specified configuration.
   * @param config - Configuration to use for the noise generation.
   * @returns The generated noise image data.
   */
  imageData: (config: Partial<T>) => Promise<ImageData>
}

/**
 * Internally used map of noise configuration.
 * Config types are co-located with their algorithms.
 * @private
 */
export interface NoiseConfigMap {
  value: ValueNoiseConfig
}

/**
 * Type of noise algorithm.
 */
export type NoiseAlgorithm = keyof NoiseConfigMap

/**
 * Re-export algorithm config types for convenience.
 */
export type { ValueNoiseConfig } from './algorithms/value'
