/**
 * WebGL setup utilities for creating contexts, shaders, and programs.
 */

/**
 * Create a WebGL 2 rendering context from a canvas.
 * @param canvas - Canvas element to create context from.
 * @returns WebGL 2 rendering context.
 * @throws Error if WebGL 2 is not supported.
 */
export function createWebGLContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    throw new Error('WebGL 2 is not supported in this browser')
  }
  return gl
}

/**
 * Compile a shader from source code.
 * @param gl - WebGL 2 rendering context.
 * @param type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param source - Shader source code.
 * @returns Compiled shader.
 * @throws Error if compilation fails.
 */
export function compileShader(
  gl: WebGL2RenderingContext,
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
 * @param gl - WebGL 2 rendering context.
 * @param vertexSource - Vertex shader source code.
 * @param fragmentSource - Fragment shader source code.
 * @returns WebGL program.
 * @throws Error if program creation or linking fails.
 */
export function createProgram(
  gl: WebGL2RenderingContext,
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
