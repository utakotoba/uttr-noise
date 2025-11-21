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
uniform int u_interpolation;

out vec4 frag_color;

// Hash function for pseudo-random values
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(443.8975, 397.2973, 491.1875));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z + u_seed * 0.0001);
}

// Apply interpolation method to fractional value
vec2 apply_interpolation(vec2 f) {
  if (u_interpolation == 0) {
    // Linear interpolation
    return f;
  } else if (u_interpolation == 1) {
    // Smoothstep interpolation (cubic)
    return f * f * (3.0 - 2.0 * f);
  } else {
    // Smootherstep interpolation (quintic)
    return f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  }
}

// Value noise function with configurable interpolation
float value_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0));

  // Apply selected interpolation method
  vec2 u = apply_interpolation(f);

  // Bilinear interpolation
  return mix(
    mix(a, b, u.x),
    mix(c, d, u.x),
    u.y
  );
}

// Fractal Brownian Motion (fBm) for multiple octaves
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = u_frequency;
  float max_amplitude = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= u_octaves) break;
    
    value += amplitude * value_noise(p * frequency);
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
