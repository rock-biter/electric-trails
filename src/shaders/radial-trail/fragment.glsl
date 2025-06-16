#include ../random.glsl;
varying vec2 vUv;

void main() {

  float t = abs(vUv.y - 0.5) * 2.;
  float a = smoothstep(1. - vUv.x, 0.0, t);
  float m = pow(a, 32.);

  a = pow(a, 10.0);
  vec3 color = vec3(0.2,0.4,0.95);
  vec3 colorB = vec3(0.1,0.8, 0.98);
  color = mix(color, colorB, vUv.x);
  color = mix(color,colorB, m);
  color = mix(color,vec3(1.), pow(m,3.));

  color -= random(gl_FragCoord.xy) * 0.3;
  a *= smoothstep(1., 0.2, vUv.x);

  // a = max(a,0.2);
  // a *= 1. - t;
  gl_FragColor = vec4(color,a);

}