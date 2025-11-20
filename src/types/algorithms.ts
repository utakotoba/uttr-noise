import type { SharedConfig } from './shared'

/**
 * Configuration for Value noise generator.
 */
export interface ValueNoiseConfig extends SharedConfig {
  /**
   * Frequency of the noise.
   *
   * How rapidly the noise value changes across the input domain.
   * Higher frequency (smaller scale) means smaller, more dense features.
   * @default 1
   */
  frequency?: number

  /**
   * Octaves of the noise.
   *
   * How many levels of detail to include in the noise.
   * Higher octaves (larger multiplier) means more detailed noise.
   * @default 1
   */
  octaves?: number

  /**
   * Persistence of the noise.
   *
   * How much each octave contributes to the final noise value.
   * Higher persistence (larger multiplier) means more contribution from higher octaves.
   * @default 0.5
   */
  persistence?: number

  /**
   * Lacunarity of the noise.
   *
   * How quickly the frequency increases as we move to higher octaves.
   * Higher lacunarity (larger multiplier) means more frequent changes in frequency.
   * @default 2
   */
  lacunarity?: number

  // TODO: add interpolation method
}
