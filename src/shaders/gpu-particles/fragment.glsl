#include ../perlin.glsl;

uniform float uSubdivision;
uniform float uTime;
uniform sampler2D uTrailTexture;

varying float vAlpha;
varying vec3 vWPos;

void main() {

  vec2 uv = gl_PointCoord.xy;
  float t = distance(uv, vec2(0.5)) * 2.;

  vec2 uv2 = gl_PointCoord.xy;
  uv2.y = 1. - uv2.y;
  uv2 -= 0.5;
  uv2 *= 2.;
  vec3 n = vec3(uv2,0.);
  n.z = sqrt(1. - uv2.x * uv2.x - uv2.y * uv2.y);

  vec4 lightPos = texture(uTrailTexture, vec2(0.0,0.5));
  lightPos.x += cnoise(vec4(vWPos, uTime * 10.)) * 3.;
  lightPos.y += cnoise(vec4(vWPos, uTime * 10. + 200.)) * 3.;
  lightPos.z += cnoise(vec4(vWPos, uTime * 10. + 500.)) * 3.;

  lightPos.y += 2.;
  vec3 diff = lightPos.xyz - vWPos; 
  vec3 lightDir = normalize(lightPos.xyz - vWPos);
  n = (transpose(viewMatrix) * vec4(n, 0.0)).xyz;
  n = normalize(n);
  // vec4 mvLightPos = viewMatrix * lightPos;
  vec3 viewDir = normalize(cameraPosition - vWPos);
  vec3 reflectDir = normalize(reflect(viewDir, n));

  // float phong = max(0.0, dot(viewDir, lightDir));
  // phong = pow(phong, 1.);

  float fresnel = 1. - max(0.0,dot(viewDir, n));

  float d = max(0.0, dot(lightDir, n) + 1.);
  float d2 = max(0.0, dot(lightDir, -n) + 1.);
  d /= 2.;
  d2 /= 2.;
  float d3 = smoothstep(0.95, 1., d);
  d = smoothstep(0.7, 0.99, d);
  d2 = pow(d2,5.);
  vec3 color = mix(vec3(0.1,0.1,0.9), vec3(0.2,0.99,0.9), smoothstep(30.,0., length(diff)));
  vec3 light = color * (d) * 0.2;
  light += vec3(1.,0.0,0.4) * (d2) * pow(fresnel,2.) * 1.;
  light += vec3(1.) * d3 * 5. * pow(fresnel,2.);
  // light *= 1. + cnoise(vec3(uTime * 100.));
  // light *= pow(fresnel,2.);
  // light += phong * vec3(0.0,0.3,0.99);
  // light += 0.05;

  float a = smoothstep(1.0,0.99,t);
  // color = mix(vec3(0.0,0.0,1.),color,pow(vAlpha, 5.));
  a = pow(a, 2.0);
  a *= pow(vAlpha, 4.0);
  a *= smoothstep(0.,0.2, vAlpha);
  a *= smoothstep(0.9,0.8, vAlpha);
  a *= smoothstep(50., 30., distance(vWPos, cameraPosition) );
  color *= light * 3.;
  // color = vec3(1.-fresnel);
  gl_FragColor = vec4(color,a * 2.);
}