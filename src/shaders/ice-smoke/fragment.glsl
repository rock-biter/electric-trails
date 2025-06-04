#include ../simplex.glsl;

uniform sampler2D uTrailSmokeMap;
uniform sampler2D uPerlin;
uniform float uTime;

varying vec2 vUv;

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {

  float perlin = texture(uPerlin, vUv * 2. + uTime * 0.05).r;
  float perlin2 = texture(uPerlin, vUv * 0.5 + uTime * 0.05).r;
  vec3 trail = texture(uTrailSmokeMap, vUv).rgb;

  vec3 colorBlue = vec3(0.0,0.2,0.25);
  vec3 colorDeepBlue = vec3(0.0,0.01,0.03);
  vec3 colorGreen = vec3(0.1,0.2,0.35);
  

  float t = perlin * 0.3 + perlin2 * 0.3;// vec3(0.1,0.7,0.7) * 8.;
  vec3 frosted = vec3(0.03,0.4,0.7) + t;
  // frosted = mix(frosted, vec3(0.1,0.7,0.7), 1. - trail.r);
  // frosted *= perlin;
  // frosted *= perlin2;

  float glitter = snoise(vec3(vUv * 400. , uTime * 1.)) * 0.5 + 0.5;
  glitter = pow(glitter,32.);

  float a = pow(trail.r,0.3);

  vec3 color = frosted;
  float g = smoothstep(0.01,0.06,glitter) * 3.;
  color += g;//* smoothstep(0., 0.3,trail.r);

  // a += g * a;

  gl_FragColor = vec4(color,clamp(a * 1., 0., 0.3));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

