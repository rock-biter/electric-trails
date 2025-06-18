#include ../random.glsl;

uniform float uDt;
uniform float uSubdivision;
uniform sampler2D uTrailTexture;
uniform sampler2D uOriginalPositionTexture;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 vel = texture(uVelocity, uv);
  vec4 pos = texture(uPosition, uv);
  vec4 lightPos = texture(uTrailTexture, vec2(0.0,0.5));
  vec4 initialPos = texture(uOriginalPositionTexture, uv);
  // float fragSize = 1.0 / uSubdivision;
  // vec4 secondPos = texture(uTrailTexture, vec2(fragSize * 1.5,0.5));

  vec3 dir = pos.xyz - lightPos.xyz;
  
  // pos.y = 2.;
  if(pos.w <= 0.) {
    pos.xyz = initialPos.xyz;
    pos.w = 1.;
  } else {
    pos.w -= uDt * 0.05;
    pos.xyz += vel.xyz * uDt;

  }

  if(pos.y <= 0.2) {
    pos.w = 0.;
  }

  if(length(dir) < 5.) {
    pos.w = 0.;
  }

  gl_FragColor = pos;
  
}