precision mediump float;

uniform float u_width;
uniform float u_height;
uniform float u_seed;
uniform float u_frequency;
uniform int u_octaves;
uniform float u_persistence;
uniform float u_lacunarity;

// Simple hash function for pseudo-random values
float hash(vec2 p) {
  p = fract(p * vec2(443.8975, 397.2973));
  p += dot(p.xy, p.yx + 19.19);
  p += u_seed * 0.001;
  return fract(p.x * p.y);
}

// Value noise function
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  // Get corner values
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  // Smooth interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

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

  for (int i = 0; i < 8; i++) {
    if (i < u_octaves) {
      value += amplitude * valueNoise(p * frequency);
      amplitude *= u_persistence;
      frequency *= u_lacunarity;
    }
  }

  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(u_width, u_height);
  float noise = fbm(uv);
  
  // Normalize to 0-1 range and output as grayscale
  gl_FragColor = vec4(noise, noise, noise, 1.0);
}

