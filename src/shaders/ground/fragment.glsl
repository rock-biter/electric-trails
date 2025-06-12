#include ../noise.glsl;
#include ../perlin.glsl;
#include ../simplex.glsl;
#include ../fbm.glsl;

uniform sampler2D uCracksMap;
uniform sampler2D uTrailMap;
uniform sampler2D uPerlin;
uniform float uTime;

varying vec2 vParallax;
varying vec2 vUv;

void main() {

  float perlin = texture(uPerlin, vUv * 2.).r;
  float perlinAnim = texture(uPerlin, vUv * 2. + uTime * 0.02).r * 2. - 1.;
  float perlin2 = texture(uPerlin, vUv * 8.).r;
  vec3 trail = texture(uTrailMap, vUv).rgb;
  float cracksMap = texture(uCracksMap, vUv * 3.).r;

  float nomalization = 1.0;

  vec3 dark = vec3(0.07,0.07,0.07);
  vec3 colorGreen = vec3(1.);

  float accumulateTurb = 0.;

  // float turb = turbulenceFBM(vec3(vUv * 15.,uTime * 0.1), 5);


  int steps = 2;
  for (int i = 0; i < steps; i++) {
    float amplitude = float(steps - i) / 1.;
    vec2 uv = vUv * 4. + vParallax * 0.002 * float(i);

    float currTrail = texture(uTrailMap, vUv + vParallax * 0.005 * float(i + 1)).r;

    nomalization += amplitude;
    float turb = 0.0;

    if(currTrail > 0.0) {
      turb = turbulenceFBM(vec4(vUv * 15. + vParallax * 0.005 * float(i + 1), 0.02 * float(i + 1) ,uTime * 0.1), 3) * currTrail;
      turb += turbulenceFBM(vec4(vUv * 5. + vParallax * 0.005 * float(i + 1), 0.02 * float(i + 1) ,uTime * 0.2), 2) * currTrail;
      turb /= 1.;
    }

    accumulateTurb += turb * amplitude;
  }

  // accumulateTurb /= nomalization;

  float trailValue = pow(trail.r,0.8);
  // trailValue = floor(trailValue * 5.) / 5.;
  float cracks = pow(1. - cracksMap, 7. - trailValue * 4. - perlinAnim * 4. ) * 3. * trailValue;

  vec3 frosted = vec3(1.0,0.1,0.1) * 0.4;
  vec3 cracksColor = dark;
  cracksColor += pow(cracks,0.6) * 10. * vec3(1.0,0.1,0.0);
  cracksColor *= perlin * 10. * dark;
  cracksColor *= perlin2 * 20. * dark;
  cracksColor += pow(cracks,1.) * 10. * vec3(1.,0.8,0.2);
  cracksColor += pow(cracks,2.) * 10.;

  // vec3 deepColor = mix(vec3(1.0,0.1,0.1),vec3(1.0,0.1,0.1) * 0.1, 1. - pow(accumulateTurb,1.5)) * perlin2 * perlin * 1.;
  vec3 turbulence = vec3(1.,0.1,0.1) * pow(accumulateTurb,0.75) * 0.25;
  turbulence += vec3(1.0,0.1,0.1) * pow(accumulateTurb,1.5) * 1.;
  turbulence += vec3(1.0,0.3,0.1) * pow(accumulateTurb,4.) * 3.;
  turbulence *= perlin * 2.;
  turbulence *= perlin2 * 2.;
  
  vec3 color = cracksColor + turbulence * 0.25;//+ pow(deepColor,vec3(2.));
  // color = mix(color, turbulence * 0.5, pow(accumulateFrosted,1.));

  vec2 uv = vUv - 0.5;
  uv *= 2.0;
  color = mix(color, vec3(0.03, 0.01, 0.01), smoothstep(0.2,1.,length(pow(abs(uv), vec2(1.)))));

  // turbulence
  // color = vec3(pow(turb,2.)) * vec3(1.0,0.1,0.1) * trail.r;

  gl_FragColor = vec4(color,1.);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

