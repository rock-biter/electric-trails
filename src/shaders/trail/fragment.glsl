#include ../perlin.glsl;

uniform vec2 uResolution;
uniform sampler2D uMap;
uniform vec2 uUVPointer;
uniform float uDt;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 texel = vec2(1.0) / uResolution;

  float texelScale = 0.2;
  texel *= texelScale;

  vec3 mapColor = texture(uMap,uv).rgb;
  vec3 mapColor1 = texture(uMap,uv + texel).rgb;
  vec3 mapColor2 = texture(uMap,uv - texel).rgb;
  vec3 mapColor3 = texture(uMap,uv + texel * vec2(-1,1)).rgb;
  vec3 mapColor4 = texture(uMap,uv + texel * vec2(1,-1)).rgb;
  vec3 mapMix = (mapColor1 + mapColor2 + mapColor3 + mapColor4) / 4.0;
  vec3 mapMin = min(min(mapColor1,mapColor2), min(mapColor3, mapColor4));
  vec3 mapMax = max(max(mapColor1,mapColor2), max(mapColor3, mapColor4));

  // if(mapMix.r < mapColor.r) {
  //   mapColor = mapMix;
  // } else {
    mapColor = mapMin;
  // }
  mapColor *= 1.0 - uDt * 0.5;

  // uv -= 0.5;
  // uv *= 2.0;
  // uv.x *= uResolution.x / uResolution.y;

  float d = distance(uv, uUVPointer);
  d += cnoise(vec3(uv * 15., uTime * 0.3)) * 0.03;
  d += cnoise(vec3(uv * 30. + 100., uTime * 0.5)) * 0.02;

  float t = smoothstep(0.07,0.00,d);
  vec3 color = mix(mapColor, vec3(1.0), t);
  color = clamp(color,0.0,1.0);

  gl_FragColor = vec4(color, 1.0);

}