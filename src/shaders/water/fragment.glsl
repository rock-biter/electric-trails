#include ../noise.glsl;

uniform sampler2D uReflectionMap;
uniform sampler2D uTrailMap;

varying vec2 vUv;

void main() {

  ivec2 iRes = textureSize(uReflectionMap, 0);
  vec2 uv = gl_FragCoord.xy / vec2(iRes);
  uv.y = 1.0 - uv.y;

  vec3 color = vec3(0.01);

  vec3 reflection = texture( uReflectionMap, uv ).rgb;
  reflection += texture( uReflectionMap, uv + vec2(0.,-0.002) ).rgb;
  reflection += texture( uReflectionMap, uv + vec2(0.,-0.004)).rgb;
  reflection += texture( uReflectionMap, uv + vec2(0.,-0.006)).rgb * 0.75;
  reflection += texture( uReflectionMap, uv + vec2(0.001,-0.006)).rgb * 0.25;
  reflection += texture( uReflectionMap, uv + vec2(0.000,-0.008)).rgb * 0.5;
  reflection += texture( uReflectionMap, uv + vec2(-0.001,-0.006)).rgb * 0.25;
  reflection += texture( uReflectionMap, uv + vec2(0.0015,-0.004)).rgb * 0.25;
  reflection += texture( uReflectionMap, uv + vec2(0.00,-0.010)).rgb * 0.25;
  reflection += texture( uReflectionMap, uv + vec2(-0.0015,-0.004)).rgb * 0.25;

  reflection /= 8.;
  float gray = dot(reflection, vec3(0.299, 0.587, 0.114));

  float t = texture(uTrailMap, vUv).r;
  color += vec3(smoothstep(0.,0.5,t)) * vec3(0.01,0.01,0.01);
  color += vec3(smoothstep(0.5,0.7,t)) * vec3(0.2,0.05,0.01);
  color += vec3(smoothstep(0.7,1.4,t)) * vec3(0.8,0.5,0.2);

  color = mix(vec3(gray) * 0.1 + reflection * 0.3, color, t);

  color *= 1.0 - random(uv) * 0.3;

  gl_FragColor = vec4(color,1.0);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>

}