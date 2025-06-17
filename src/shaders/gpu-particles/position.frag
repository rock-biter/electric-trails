uniform float uDt;
uniform sampler2D uTrailTexture;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 vel = texture(uVelocity, uv);
  vec4 pos = texture(uPosition, uv);
  vec4 initialPos = texture(uTrailTexture, vec2(0.0,0.5));

  pos.xyz += vel.xyz * uDt;
  // pos.y = 2.;

  if(pos.y > 5. || pos.y < 0.) {
    pos.xyz = initialPos.xyz;
    pos.y = 2.;
  }

  gl_FragColor = vec4(pos.xyz,1.0);
  
}