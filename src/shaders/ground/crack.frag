#include ../noise.glsl;
#include ../perlin.glsl;
#include ../simplex.glsl;
#include ../fbm.glsl;

uniform sampler2D uCracksMap;
uniform sampler2D uTrailMap;
uniform sampler2D uPerlin;
uniform float uTime;

varying vec2 vParallax;
varying vec2 vUv;

void main() {

  float perlinAnim = snoise(vec3(vUv * 20.,uTime * 0.4));

  vec3 trail = texture(uTrailMap, vUv).rgb;
  float cracksMap = texture(uCracksMap, vUv * 5. + floor(mod(uTime * 13.,200.)) * 265.34865).r;

  vec3 dark = vec3(0.0);

  float trailValue = trail.r;
  float cracks = pow(1. - cracksMap, 5. + perlinAnim * 4. ) * 3. * trailValue;

  vec3 cracksColor = dark;
  cracksColor += pow(cracks,0.7) * vec3(1.0);
  cracksColor += pow(cracks,1.);
  cracksColor *= 1.;
  // cracksColor -= cracks * perlinAnim * 5.;
  
  vec3 color = cracksColor;

  vec2 uv = vUv - 0.5;
  uv *= 2.0;
  color = mix(color, vec3(0.03, 0.01, 0.01), smoothstep(0.2,1.,length(pow(abs(uv), vec2(1.)))));

  gl_FragColor = vec4(color,1.);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

