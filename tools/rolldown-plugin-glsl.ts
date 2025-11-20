import type { Plugin } from 'rolldown'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/**
 * Simple rolldown plugin to import GLSL shader files as raw strings.
 */
export function glslLoader(): Plugin {
  return {
    name: 'glsl',
    resolveId(source, importer) {
      if (source.endsWith('.glsl')) {
        if (importer) {
          return resolve(dirname(importer), source)
        }
        return source
      }
      return null
    },
    load(id) {
      if (id.endsWith('.glsl')) {
        const code = readFileSync(id, 'utf-8')
        return `export default ${JSON.stringify(code)};`
      }
      return null
    },
  }
}
