#include ../random.glsl;

uniform sampler2D tDiffuse;
uniform sampler2D uCrackScene;
uniform sampler2D uCursorTrail;
uniform vec2 uResolution;
uniform vec3 uColor;
// uniform vec2 uCenter;
uniform float uColorDistance;
uniform float uReduce;
uniform float uTime;
uniform int uSampler;

varying vec2 vUv;
varying vec2 vCenter;

void main() {

  ivec2 size = textureSize(tDiffuse,0);
  vec2 texel = 1.0 / vec2(size);
  vec3 diffuse = texture(tDiffuse, vUv).rgb;
  vec3 diffuse2 = texture(tDiffuse, vUv).rgb;

  vec2 from = vCenter * 0.5 + 0.5;
  vec3 color = uColor;

  float div = 1.;
  vec2 difference = from - vUv;
  difference.xy *= uResolution.xy / uResolution.xx;
	vec2 dir = normalize(difference);

  vec3 rays = vec3(0.0);

  for(int i = 0; i < uSampler; i++) {

    vec2 shift = vec2(i) * texel * dir * 2.;

    if(length(shift) < length(difference)) {
      vec2 uvMap = vUv + shift;
      vec3 colorMap = texture(tDiffuse,uvMap).rgb;
      vec3 crackColor = texture(uCrackScene, uvMap).rgb;
      // float f = max(0.0,0.6 - distance(uColor,colorMap) - float(i) / float(uSampler));
      // float f = distance(color,crackColor);
      // f = 1. - smoothstep(0.0, uColorDistance, f);
      float f = 1.;
      float reduce = smoothstep(0.0, float(uSampler),float(i));
      reduce = pow(reduce,uReduce);
      f -= reduce;

      // float f = 1.0 - smoothstep(0.0, uColorDistance,distance(uColor,colorMap));
      // f -= float(i) / float(uSampler);
      // f = max(f, 0.0);
      // f = 1. - smoothstep(0.,uColorDistance,f);
      f = smoothstep(0.,1.,f);
      f *= crackColor.r;
      rays += colorMap * f;
      div += f;
    }
   
  }

	rays /= div;

  float dith = sin(gl_FragCoord.x * 1.2) * 0.06 + cos(gl_FragCoord.y * 1.2) * 0.06;
  // float noise = cnoise(vec3(vUv * 5.,uTime )) * 0.5 + 0.5;
  // noise = pow(noise,5.);

  // diffuse -= noise * 0.1;

  float random = random(vUv + uTime) * 0.05;

  // diffuse *= 1.0 + noise;
  // dith = mix(dith,0.0,noise);
  // dith = max(dith,0.0);
  dith += 0.08;
  // diffuse -= dith;
  rays -= random;
  rays = clamp(rays,0.,1.);
  diffuse += rays;
  // diffuse -= random;


  // vec3 crackColor = texture(uCrackScene, vUv).rgb;
  // diffuse = crackColor;
  gl_FragColor = vec4(diffuse, 1.0);
  // gl_FragColor = vec4(vec3(noise ), 1.0);

  // float d = distance(color,diffuse);
  // gl_FragColor = vec4(vec3(d),1.0);

  // debug
  // vec3 trailColor = texture(uCursorTrail,vUv).rgb;
  // gl_FragColor = vec4(trailColor,1.0);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>
}