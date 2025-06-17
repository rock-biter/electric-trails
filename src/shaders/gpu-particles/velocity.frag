uniform float uDt;

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 vel = texture(uVelocity, uv);
  // vel.xyz += vec3(0.,-0.2,0.0) * uDt;
  // vel.xyz *= 1. - uDt;
  gl_FragColor = vel;
}