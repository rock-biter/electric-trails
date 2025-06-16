#include ../math.glsl;
#include ../functions.glsl;
#include ../random.glsl;
#include ../noise.glsl;
#include ../perlin.glsl;

uniform sampler2D uTrailTexture;
uniform float uTime;
uniform float uSubdivision;

varying vec2 vUv;

void main() {
  vUv = uv;

  float fragSize = 1.0 / uSubdivision;
  vec2 trailUV = vec2(uv.x - fragSize * 0.5, 0.5);
  vec2 prevTrailUV = vec2(uv.x - fragSize * 1.5, 0.5);
  vec3 c = texture(uTrailTexture,trailUV).xyz;
  vec3 prevPos = texture(uTrailTexture,prevTrailUV).xyz;
  
  vec3 pos = c;
  pos.y = position.y;
  prevPos.y = position.y;

  vec3 diff = pos - prevPos;
  vec3 dir = normalize(diff);
  vec3 up = vec3(0.,1.,0.);

  float angle = 3.14159 * 0.5 + cnoise(c * 0.05) * 3.14159;

  pos = vec3(0.0,position.y,0.0);
  
  // pos -= vec3(position.x, 0., position.z);
  // pos = rotationMatrix(angle, dir) * pos;//rotateAroundAxis(pos, dir, angle); //;
  pos += c;
  // pos += vec3(position.x, 0., position.z);

  pos.y += 2. * (cnoise(c * 0.1 )) * smoothstep(0.,0.2,vUv.x);
  pos.y += 0.5 * (cnoise(c * 1. + 50. + uTime * 0.5)) * smoothstep(0.,0.2,vUv.x);
  pos.x += length(diff) * (random(c * 1. + 100.) * 2. -1.);
  pos.z += length(diff) * (random(c * 1.  + 200.) * 2. + -1.);
  // pos.y += 1. * (random(c * 1.  + 200.) * 0.5 + 0.5);


  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}

