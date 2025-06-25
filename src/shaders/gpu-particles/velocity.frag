#include ../random.glsl;
#include ../perlin.glsl;
#include ../simplex.glsl;
#include ../curl.glsl;

uniform float uDt;
uniform float uSubdivision;
uniform sampler2D uTrailTexture;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 initialPos = texture(uTrailTexture, vec2(0.0,0.5));
  initialPos.y += 2.;
  float fragSize = 1.0 / uSubdivision;
  vec4 secondPos = texture(uTrailTexture, vec2(fragSize * 1.5,0.5));

  vec4 vel = texture(uVelocity, uv);
  vec4 pos = texture(uPosition, uv);

  float d = distance(initialPos.xyz, pos.xyz);
  vec3 dir = pos.xyz - initialPos.xyz;
  vec3 diff = initialPos.xyz - secondPos.xyz;

  if(pos.w <= 0.) {
    // vel.xyz = dir * uDt * 10.;

    float x = random(pos.xyz + vec3(uv, 0.0)) * 2. - 1.;
    float z = random(pos.xyz + 100. + vec3(uv, 0.0)) * 2. - 1.;
    float y = random(pos.xyz + 200. + vec3(uv, 0.0)) * 2. - 1.;

    vel.xyz += normalize(vec3(x,y,z)) * 0.1;
    // vel.xyz = vec3(0);
    // vel.y = 1.0;
  } else {

    vec3 flowField = vec3(
        snoise(vec4(pos.xyz * 0.05 + 0.0, 0.)),
        snoise(vec4(pos.xyz * 0.05 + 1.0, 0.)),
        snoise(vec4(pos.xyz * 0.05 + 2.0, 0.))
    );
    flowField = normalize(flowField);
    vel.xyz += flowField * uDt * vec3(4.,1.,4.);

  }
  vel.xyz += dir * uDt * 2. * smoothstep(10.0,0.0, d) * length(diff);
  vel.xyz *= 1. - uDt * 2.;
  vel.xyz += vec3(0.,-1.,0.0) * uDt;
  vel.y *= 1. - uDt;
  // vel.xyz = vec3(0.);
  gl_FragColor = vel;
}