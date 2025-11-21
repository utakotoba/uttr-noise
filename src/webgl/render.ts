import type { SharedConfig, UttrNoiseGenerator } from '@/types'
import type { WebGLResources } from '@/webgl/setup'
import { mergeSharedConfig } from '@/config'

/**
 * WebGL rendering utilities for setting uniforms and rendering to ImageData.
 */

/**
 * Uniform value specification.
 */
export type UniformValue
  = | { type: '1f', value: number }
    | { type: '1i', value: number }
    | { type: '2f', value: [number, number] }
    | { type: '3f', value: [number, number, number] }
    | { type: '4f', value: [number, number, number, number] }

/**
 * Set multiple uniforms on a WebGL program.
 * @param gl - WebGL 2 rendering context.
 * @param program - WebGL program to set uniforms on.
 * @param uniforms - Map of uniform names to their values.
 */
export function setUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  uniforms: Record<string, UniformValue>,
): void {
  for (const [name, spec] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name)
    if (!location)
      continue

    switch (spec.type) {
      case '1f':
        gl.uniform1f(location, spec.value)
        break
      case '1i':
        gl.uniform1i(location, spec.value)
        break
      case '2f':
        gl.uniform2f(location, spec.value[0], spec.value[1])
        break
      case '3f':
        gl.uniform3f(location, spec.value[0], spec.value[1], spec.value[2])
        break
      case '4f':
        gl.uniform4f(
          location,
          spec.value[0],
          spec.value[1],
          spec.value[2],
          spec.value[3],
        )
        break
    }
  }
}

/**
 * Create a full-screen quad for rendering.
 * @param gl - WebGL 2 rendering context.
 * @returns Buffer containing quad vertices.
 */
export function createQuad(gl: WebGL2RenderingContext): WebGLBuffer {
  const buffer = gl.createBuffer()
  if (!buffer) {
    throw new Error('Failed to create buffer')
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  )

  return buffer
}

/**
 * Render to ImageData using WebGL 2.
 * @param gl - WebGL 2 rendering context.
 * @param program - WebGL program to use.
 * @param width - Output width.
 * @param height - Output height.
 * @returns Generated ImageData.
 */
export function renderToImageData(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  width: number,
  height: number,
): ImageData {
  gl.viewport(0, 0, width, height)
  gl.useProgram(program)

  const quad = createQuad(gl)
  const positionLocation = gl.getAttribLocation(program, 'a_position')

  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

  // Flip vertically because WebGL reads from bottom-left
  const imageData = new ImageData(width, height)
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4
      const dstIdx = (y * width + x) * 4
      imageData.data[dstIdx] = pixels[srcIdx]
      imageData.data[dstIdx + 1] = pixels[srcIdx + 1]
      imageData.data[dstIdx + 2] = pixels[srcIdx + 2]
      imageData.data[dstIdx + 3] = pixels[srcIdx + 3]
    }
  }

  return imageData
}

/**
 * Render to raw noise data as Float32Array.
 * Returns normalized noise values (0-1 range) in row-major order.
 * @param gl - WebGL 2 rendering context.
 * @param program - WebGL program to use.
 * @param width - Output width.
 * @param height - Output height.
 * @returns Float32Array of noise values with length width * height.
 */
export function renderToRawData(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  width: number,
  height: number,
): Float32Array {
  gl.viewport(0, 0, width, height)
  gl.useProgram(program)

  const quad = createQuad(gl)
  const positionLocation = gl.getAttribLocation(program, 'a_position')

  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  // Read pixels as RGBA
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

  const rawData = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4
      const dstIdx = y * width + x
      // Normalize from 0-255 to 0-1
      rawData[dstIdx] = pixels[srcIdx] / 255.0
    }
  }

  return rawData
}

/**
 * Convert a Blob to a base64 data URL.
 * @param blob - Blob to convert.
 * @returns Base64 data URL string.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      }
      else {
        reject(new Error('Failed to convert blob to data URL'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Render directly to a base64 data URL using the existing OffscreenCanvas.
 * This is more efficient than rendering to ImageData and then converting,
 * as it avoids the pixel read and ImageData conversion steps.
 * @param canvas - OffscreenCanvas to render to.
 * @param gl - WebGL 2 rendering context.
 * @param program - WebGL program to use.
 * @param width - Output width.
 * @param height - Output height.
 * @returns Base64 data URL string.
 */
export async function renderToDataUrl(
  canvas: OffscreenCanvas,
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  width: number,
  height: number,
): Promise<string> {
  gl.viewport(0, 0, width, height)
  gl.useProgram(program)

  const quad = createQuad(gl)
  const positionLocation = gl.getAttribLocation(program, 'a_position')

  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  const blob = await canvas.convertToBlob({ type: 'image/png' })
  return blobToDataUrl(blob)
}

/**
 * Create a prepareRender function wrapper that handles common setup.
 * @param resources - WebGL resources (canvas, gl, program).
 * @param additionalUniforms - Optional function that returns noise-specific uniforms.
 * @returns A prepareRender function that can be used with createNoiseGenerator.
 */
export function createPrepareRender<T extends SharedConfig>(
  resources: WebGLResources,
  additionalUniforms?: (config: Partial<T>, shared: ReturnType<typeof mergeSharedConfig>) => Record<string, UniformValue>,
): (config?: Partial<T>) => { width: number, height: number } {
  const { canvas, gl, program } = resources
  return (config?: Partial<T>) => {
    const shared = mergeSharedConfig(config)

    canvas.width = shared.width
    canvas.height = shared.height

    gl.useProgram(program)

    const uniforms: Record<string, UniformValue> = {
      u_width: { type: '1f', value: shared.width },
      u_height: { type: '1f', value: shared.height },
      u_seed: { type: '1f', value: shared.seed },
      u_frequency: { type: '1f', value: shared.frequency },
      u_octaves: { type: '1i', value: shared.octaves },
      u_persistence: { type: '1f', value: shared.persistence },
      u_lacunarity: { type: '1f', value: shared.lacunarity },
      u_amplitude: { type: '1f', value: shared.amplitude },
    }

    if (additionalUniforms) {
      Object.assign(uniforms, additionalUniforms(config ?? {}, shared))
    }

    setUniforms(gl, program, uniforms)

    return shared
  }
}

/**
 * Create a noise generator with standard methods.
 * This function encapsulates the WebGL resources and prepareRender setup,
 * providing a cleaner API that doesn't require passing resources multiple times.
 * @param resources - WebGL resources (canvas, gl, program).
 * @param additionalUniforms - Optional function that returns noise-specific uniforms.
 * @returns Noise generator instance with imageData, dataUrl, and rawData methods.
 */
export function createNoiseGenerator<T extends SharedConfig>(
  resources: WebGLResources,
  additionalUniforms?: (config: Partial<T>, shared: ReturnType<typeof mergeSharedConfig>) => Record<string, UniformValue>,
): UttrNoiseGenerator<T> {
  const { canvas, gl, program } = resources
  const prepareRender = createPrepareRender(resources, additionalUniforms)

  return {
    imageData(config?: Partial<T>): ImageData {
      const shared = prepareRender(config)
      return renderToImageData(gl, program, shared.width, shared.height)
    },
    async dataUrl(config?: Partial<T>): Promise<string> {
      const shared = prepareRender(config)
      return renderToDataUrl(canvas, gl, program, shared.width, shared.height)
    },
    rawData(config?: Partial<T>): Float32Array {
      const shared = prepareRender(config)
      return renderToRawData(gl, program, shared.width, shared.height)
    },
  }
}
