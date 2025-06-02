#include ../functions.glsl;
#include ../noise.glsl;
#include ../perlin.glsl;
#include ../curl.glsl;
#include ../fbm.glsl;

uniform float uTime;
uniform float uProgress;
uniform sampler2D uMap;
uniform sampler2D uBacksideMap;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uAlphaOffset;
uniform float uAlphaMargin;

uniform vec3 uBurnColor;
uniform float uBurnOffset;
uniform float uBurnMargin;
uniform float uBurnExp;

uniform vec3 uFireColor;
uniform float uFireOffset;
uniform float uFireMargin;
uniform float uFireScale;
uniform float uFireExp;
uniform float uFireMixExp;


varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {

  vec2 uv = vec2(vUv);
  vec4 mapColor = texture(uMap, uv);
  vec4 backsideMapColor = texture(uBacksideMap, uv);
  vec3 color = mapColor.rgb;
  float alpha = mapColor.a;

  if(gl_FrontFacing == false) {
    color = backsideMapColor.rgb;
  }

  // distance
  float d = length(vWorldPosition);
  d -= cnoise(vec4(vWorldPosition * uFrequency, uTime * 0.2)) * uAmplitude;
  d += fbm(vWorldPosition * uFrequency * 4. + uTime * 0.1, 2) * uAmplitude;

  // alpha
  float alphaFalloff = 1. - falloff(d + uAlphaOffset,2. + uAmplitude,0. - uAmplitude,uAlphaMargin,uProgress);
  
  // burn
  float burnFalloff = falloff(d + uBurnOffset,2. + uAmplitude,0. - uAmplitude,uBurnMargin,uProgress);

  color = mix(color, uBurnColor, pow(burnFalloff, uBurnExp));

  // fire
  float fireOffset = domainWarpingFBM(vWorldPosition * uFrequency * 2. + vec3(0.0, -uTime, uTime * 0.6),2) * uAmplitude;
  fireOffset = pow(fireOffset, 3.) * 0.15;
  
  float fireFalloff = falloff(d + uFireOffset - fireOffset,2. + uAmplitude,0. - uAmplitude,uFireMargin,uProgress);

  float sparkle = cnoise(vec4(vWorldPosition * uFrequency * 4., uTime * 4.));
  sparkle = pow(sparkle,4.);
  fireFalloff += sparkle * fireFalloff;

  vec3 fire = uFireColor * pow(fireFalloff,uFireExp) * uFireScale;

  color = mix(color, fire, pow(fireFalloff, uFireMixExp));

  // color =vec3(fireOffset);

  alpha *= alphaFalloff;
  gl_FragColor = vec4(color,alpha);
}