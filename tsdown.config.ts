import { defineConfig } from 'tsdown'
import { glslLoader } from './tools/rolldown-plugin-glsl'

export default defineConfig({
  entry: 'src/index.ts',
  dts: true,
  exports: true,
  plugins: [glslLoader()],
})
