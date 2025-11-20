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
  imageData: (config?: Partial<T>) => ImageData

  /**
   * Generate noise as a base64 data URL that can be directly used in img elements.
   * @param config - Configuration to use for the noise generation.
   * @returns The generated noise as a base64 data URL string.
   */
  dataUrl: (config?: Partial<T>) => Promise<string>

  /**
   * Generate raw noise data as a Float32Array.
   * Returns normalized noise values (0-1 range) in row-major order.
   * Useful for custom processing, calculations, or custom color mapping.
   * @param config - Configuration to use for the noise generation.
   * @returns Float32Array of noise values with length width * height.
   */
  rawData: (config?: Partial<T>) => Float32Array
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
