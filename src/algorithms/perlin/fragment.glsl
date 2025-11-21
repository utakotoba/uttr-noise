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

// Hash function for pseudo-random gradient vectors with seed support
vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1875));
  p3 += dot(p3, p3.yzx + 19.19);
  // Incorporate seed into hash
  p3 += u_seed * 0.0001;
  vec2 h = fract((p3.xx + p3.yz) * p3.zy);
  return normalize(h * 2.0 - 1.0);
}

// Smooth interpolation function (5th order polynomial)
float smooth(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Classic Perlin noise function
float perlin_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  // Get gradient vectors for the four corners
  vec2 g00 = hash2(i + vec2(0.0, 0.0));
  vec2 g10 = hash2(i + vec2(1.0, 0.0));
  vec2 g01 = hash2(i + vec2(0.0, 1.0));
  vec2 g11 = hash2(i + vec2(1.0, 1.0));
  
  // Distance vectors from corners to point
  vec2 d00 = f - vec2(0.0, 0.0);
  vec2 d10 = f - vec2(1.0, 0.0);
  vec2 d01 = f - vec2(0.0, 1.0);
  vec2 d11 = f - vec2(1.0, 1.0);
  
  // Dot products (gradient dot distance)
  float n00 = dot(g00, d00);
  float n10 = dot(g10, d10);
  float n01 = dot(g01, d01);
  float n11 = dot(g11, d11);
  
  // Smooth interpolation
  vec2 u = vec2(smooth(f.x), smooth(f.y));
  
  // Bilinear interpolation
  // Normalize from [-1, 1] to [0, 1]
  float noise = mix(
    mix(n00, n10, u.x),
    mix(n01, n11, u.x),
    u.y
  );
  return noise * 0.5 + 0.5;
}

// Fractal Brownian Motion (fBm) for multiple octaves
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = u_frequency;
  float max_amplitude = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= u_octaves) break;
    
    value += amplitude * perlin_noise(p * frequency);
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
