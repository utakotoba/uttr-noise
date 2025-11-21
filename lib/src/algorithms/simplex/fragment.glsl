#version 300 es
precision mediump float;

uniform float u_width;
uniform float u_height;
uniform float u_seed;
uniform float u_frequency;
uniform int u_octaves;
uniform float u_persistence;
uniform float u_lacunarity;
uniform float u_amplitude;

out vec4 frag_color;

// Modulo 289
float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

// Permutation function
vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

// 2D simplex noise
float simplex_noise(vec2 v) {
  const vec2 C = vec2(0.211324865405187, 0.366025403784439);
  const vec3 D = vec3(0.0, 0.5, 1.0);
  
  // First corner
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  
  // Other corners
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0.xy + C.xx - i1;
  vec2 x2 = x0.xy + C.yy;
  
  // Permutations with seed
  vec2 i_seeded = mod289(i + vec2(u_seed * 0.0001));
  vec4 p1 = permute(vec4(i_seeded.y) + vec4(0.0, i1.y, 1.0, 0.0));
  vec4 p = permute(p1 + vec4(i_seeded.x) + vec4(0.0, i1.x, 1.0, 0.0));
  
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  m = m * m;
  m = m * m;
  
  vec3 x = 2.0 * fract(p.xyz * D) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
  
  // Normalize from [-1, 1] to [0, 1]
  return (130.0 * dot(m, g)) * 0.5 + 0.5;
}

// Fractal Brownian Motion (fBm) for multiple octaves
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = u_frequency;
  float max_amplitude = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= u_octaves) break;
    
    value += amplitude * simplex_noise(p * frequency);
    max_amplitude += amplitude;
    amplitude *= u_persistence;
    frequency *= u_lacunarity;
  }

  return max_amplitude > 0.0 ? value / max_amplitude : 0.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(u_width, u_height);
  float noise = fbm(uv) * u_amplitude;
  
  frag_color = vec4(noise, noise, noise, 1.0);
}
