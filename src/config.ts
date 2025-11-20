import type { SharedConfig } from './types'

/**
 * Default values for shared configuration.
 */
export const DEFAULT_SHARED_CONFIG: Required<SharedConfig> = {
  width: 512,
  height: 512,
  seed: 37,
}

/**
 * Hash a timestamp to distribute values more randomly.
 * This ensures that even consecutive timestamps produce very different seed values.
 * @param timestamp - Timestamp value to hash.
 * @returns Hashed seed value.
 */
function hashTimestamp(timestamp: number): number {
  const prime = 73_156_993_187
  let hash = timestamp
  hash = ((hash << 16) ^ hash) * prime
  hash = ((hash << 16) ^ hash) * prime
  hash = (hash << 16) ^ hash
  return hash >>> 0
}

/**
 * Resolve seed value from configuration.
 * @param seed - Seed value from config (can be number, false, or undefined).
 * @param defaultSeed - Default seed value.
 * @returns Resolved seed as a number.
 */
export function resolveSeed(
  seed: number | false | undefined,
  defaultSeed: number | false = DEFAULT_SHARED_CONFIG.seed,
): number {
  if (seed === false) {
    return hashTimestamp(Date.now())
  }
  if (seed !== undefined) {
    return seed
  }
  if (defaultSeed === false) {
    return hashTimestamp(Date.now())
  }
  return defaultSeed
}

/**
 * Merge partial shared config with defaults.
 * @param config - Partial configuration to merge.
 * @param sharedDefaults - Default values to use (defaults to DEFAULT_SHARED_CONFIG).
 * @returns Merged configuration with resolved values.
 */
export function mergeSharedConfig(
  config?: Partial<SharedConfig>,
  sharedDefaults: typeof DEFAULT_SHARED_CONFIG = DEFAULT_SHARED_CONFIG,
): {
  width: number
  height: number
  seed: number
} {
  return {
    width: config?.width ?? sharedDefaults.width,
    height: config?.height ?? sharedDefaults.height,
    seed: resolveSeed(config?.seed, sharedDefaults.seed),
  }
}
