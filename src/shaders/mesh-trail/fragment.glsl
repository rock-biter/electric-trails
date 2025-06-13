#include ../functions.glsl;

varying vec2 vUv;

void main() {

  float t = abs(vUv.y - 0.5) * 2.;
  float a = smoothstep(1. - vUv.x, 0.0, t);
  float m = pow(a, 24.);

  a = pow(a, 5.0);
  vec3 color = vec3(0.2,0.4,0.95);
  color = mix(color,vec3(1.), m);

  a *= 1. - vUv.x;
  gl_FragColor = vec4(color,a);

}