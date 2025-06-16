#include ../random.glsl;
#include ../noise.glsl;
#include ../perlin.glsl;
#include ../cellular.glsl;

uniform sampler2D uTrailTexture;
uniform float uTime;
uniform float uSubdivision;
uniform vec3 uCellOffset;
uniform float uStartIndex;
uniform vec3 uCellScale;

varying vec2 vUv;

void main() {

  // vec2 prevTrailUV = vec2(uv.x - fragSize * 1.5, 0.5);
  float index = uStartIndex * 1.0 / 128.;
  vec3 c = texture(uTrailTexture,vec2(index,0.5)).xyz;
  vec3 start = c;
  
  // start.y += 2. * (cnoise(c * 0.1 ));

  
  // vec3 uCellScale = vec3(0.1,0.2,0.1);
  vec3 cell = cellularCenter(vec4((start.xyz + uCellOffset) * uCellScale, uTime * 0.5));
  cell /= uCellScale;
  cell -= uCellOffset;
  cell.y = max(cell.y, 0.);
  vec3 end = cell;

  start.y += position.y;
  // vec3 prevPos = texture(uTrailTexture,prevTrailUV).xyz;
  vec3 diff = end - start;

  // start.y += 1. * (cnoise(c * 0.1 ));
  // start.y += 0.5 * (cnoise(c * 1. + 50. + uTime * 1.));
  // start.x += length(diff) * (random(c * 1. + 100.) * 2. -1.);
  // start.z += length(diff) * (random(c * 1.  + 200.) * 2. + -1.);

  vec3 pos = mix(start, end, uv.x);

  vUv = uv;

  pos.y += 1. * (cnoise(pos));
  pos.y += 0.2 * (cnoise(pos * 10. + 50. + uTime * 1.));
  pos.x += length(diff) * cnoise(pos * 5. + 100.) * 0.1;
  pos.z += length(diff) * cnoise(pos * 5.  + 200.) * 0.1;

  // pos.y += position.y;
  vec4 wPosition = modelMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * viewMatrix * wPosition;

}