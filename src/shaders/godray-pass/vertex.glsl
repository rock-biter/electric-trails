uniform vec3 uCenter;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec2 vUv;
varying vec2 vCenter;

void main() {

  vUv = uv;

  vec4 cPosition = uProjectionMatrix * uViewMatrix * vec4(uCenter, 1.0);
  vCenter.xy = cPosition.xy / cPosition.w;

  gl_Position = vec4(position,1.0);

}