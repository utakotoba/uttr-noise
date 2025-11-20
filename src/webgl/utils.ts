/**
 * Shared WebGL utilities for noise generation.
 */

/**
 * Create a WebGL rendering context from a canvas.
 * @param canvas - Canvas element to create context from.
 * @returns WebGL rendering context.
 * @throws Error if WebGL is not supported.
 */
export function createWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = canvas.getContext('webgl')
  if (!gl) {
    throw new Error('WebGL is not supported in this browser')
  }
  return gl
}

/**
 * Compile a shader from source code.
 * @param gl - WebGL rendering context.
 * @param type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param source - Shader source code.
 * @returns Compiled shader.
 * @throws Error if compilation fails.
 */
export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('Failed to create shader')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compilation failed: ${info}`)
  }

  return shader
}

/**
 * Create a WebGL program from vertex and fragment shaders.
 * @param gl - WebGL rendering context.
 * @param vertexSource - Vertex shader source code.
 * @param fragmentSource - Fragment shader source code.
 * @returns WebGL program.
 * @throws Error if program creation or linking fails.
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  const program = gl.createProgram()
  if (!program) {
    throw new Error('Failed to create program')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    throw new Error(`Program linking failed: ${info}`)
  }

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  return program
}

/**
 * Create a full-screen quad for rendering.
 * @param gl - WebGL rendering context.
 * @returns Buffer containing quad vertices.
 */
export function createQuad(gl: WebGLRenderingContext): WebGLBuffer {
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
 * Render to ImageData using WebGL.
 * @param gl - WebGL rendering context.
 * @param program - WebGL program to use.
 * @param width - Output width.
 * @param height - Output height.
 * @returns Generated ImageData.
 */
export function renderToImageData(
  gl: WebGLRenderingContext,
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
