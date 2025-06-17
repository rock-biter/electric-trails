#include ../random.glsl;

uniform float uDt;
uniform float uSubdivision;
uniform sampler2D uTrailTexture;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 vel = texture(uVelocity, uv);
  vec4 pos = texture(uPosition, uv);
  vec4 initialPos = texture(uTrailTexture, vec2(0.0,0.5));
  float fragSize = 1.0 / uSubdivision;
  vec4 secondPos = texture(uTrailTexture, vec2(fragSize * 1.5,0.5));

  pos.xyz += vel.xyz * uDt;

  
  
  // pos.y = 2.;
  if(pos.w <= 0.) {
    pos.xyz = initialPos.xyz;
    pos.y = 2.;

    float x = random(pos.xyz + vec3(uv, 0.0)) * 2. - 1.;
    float z = random(pos.xyz + 100. + vec3(uv, 0.0)) * 2. - 1.;
    float y = random(pos.xyz + 200. + vec3(uv, 0.0)) * 2. - 1.;

    vec3 offset = normalize(vec3(x,y,z)) * random(pos.xyz + 500. + vec3(uv, 0.0));
    pos.xyz += pow(abs(offset.xyz), vec3(3.5)) * sign(offset.xyz) * 5.;
    // pos.y += offset.y * 5.;
    pos.w = 1.;
  } else {
    pos.w -= uDt * 0.05;
  }

  if(pos.y <= 0.) {
    pos.w = 0.;
  }

  gl_FragColor = vec4(pos.xyz,pos.w);
  
}