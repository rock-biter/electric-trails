float toonify( vec3 normal, vec3 lightDir, float g, float steps) {
  float d = max(0.0, dot(normal, lightDir));
  float t = floor(d * steps) / (steps - 1.0);
  float edge = floor(d * steps) / steps;
  float t2 = smoothstep(edge, edge + g, d) / (steps - 1.0);
  // float t = smoothstep(0.5,0.5 + g,d);
  t += t2;
  t -= 1. / (steps - 1.0);
  t = clamp(t, 0.0, 1.0);
  
  return t;
}

float hemiToonify( float d, float g, float steps) {
  float t = floor(d * steps) / (steps - 1.0);
  float edge = floor(d * steps) / steps;
  float t2 = smoothstep(edge, edge + g, d) / (steps - 1.0);
  // float t = smoothstep(0.5,0.5 + g,d);
  t += t2;
  t -= 1. / (steps - 1.0);
  t = clamp(t, 0.0, 1.0);
  
  return t;
}

float toonify( vec3 normal, vec3 lightDir, float g, float steps, float decay) {
  float d = max(0.0, dot(normal, lightDir)) * decay;
  float t = floor(d * steps) / (steps - 1.0);
  float edge = floor(d * steps) / steps;
  float t2 = smoothstep(edge, edge + g, d) / (steps - 1.0);
  // float t = smoothstep(0.5,0.5 + g,d);
  t += t2;
  t -= 1. / (steps - 1.0);
  t = clamp(t, 0.0, 1.0);
  
  return t;
}


float toonify(float specular, float g) {
  return smoothstep(0.5, 0.5 + g, specular);
}

float toonify(float specular, float g, float decay) {
  return smoothstep(0.5, 0.5 + g, specular * decay);
}

// AmbientLight

struct AmbientLight {
  vec3 color;
  float intensity;
};

vec3 ambientLight(vec3 color, float intensity) {
  return color * intensity;
}

// Hemi Light
struct HemiLight {
  vec3 skyColor;
  vec3 groundColor;
  float intensity;
};

vec3 hemiLight(vec3 skyColor, vec3 groundColor, float intensity, vec3 normal) {
  float hemiMix = remap(normal.y,-1.0,1.0,0.0,1.0);
  vec3 hemiColor = mix(groundColor, skyColor,hemiMix);

  #ifdef TOON
    hemiMix = hemiToonify(hemiMix,0.05, float(TOON));
    hemiColor = mix(groundColor, skyColor, hemiMix);
  #endif

  vec3 hemi = hemiColor * intensity;

  return hemi;
}

float phongSpecular(vec3 viewDir, vec3 lightDir, vec3 normal, float glossiness ) {
  vec3 reflectDir = normalize(reflect(lightDir, normal));
  float phongValue = max(0.0, dot(viewDir, reflectDir));
  phongValue = pow(phongValue, glossiness);

  return phongValue;
}

// Directional Light
struct DirectionalLight {
  vec3 color;
  float intensity;
  vec3 direction;
};

vec3 dirLight(vec3 lightColor, float intensity, vec3 lightDirection, vec3 normal, vec3 viewDir, float glossiness) {
  vec3 dir = normalize(lightDirection);
  float angle = max(0.0,dot(dir, normal));
  float diffuse = angle;
  float specular = phongSpecular(viewDir, dir, normal, glossiness);

  #ifdef TOON
    specular = toonify(specular, 0.05);
    diffuse = toonify(normal, dir, 0.05, float(TOON));
  #endif

  vec3 light = (diffuse + specular) * intensity * lightColor;
  
  return light;
}

// Point Light
struct PointLight {
  vec3 color;
  float intensity;
  vec3 position;
  float maxDistance;
};

vec3 pointLight(vec3 lightColor, float intensity, vec3 lightPosition, vec3 position, vec3 normal, float maxDistance, vec3 viewDir, float glossiness) {

  vec3 lightDirection = lightPosition - position;
  float d = length(lightDirection);

  float decay = 1. - linearstep(0.0,maxDistance,d);

  vec3 dir = normalize(lightDirection);
  float angle = max(0.0,dot(dir, normal));
  float diffuse =  angle;
  float specular = phongSpecular(viewDir, dir, normal, glossiness);

  #ifdef TOON
    specular = toonify(specular, 0.05, decay);
    diffuse = toonify(normal, dir, 0.05, float(TOON), decay);
    decay = 1.0;
  #endif

  vec3 light = (diffuse + specular * 1.) * intensity * lightColor * decay;

  return light;

}

// Spot Light
struct SpotLight {
  vec3 color;
  float intensity;
  vec3 position;
  vec3 target;
  float angle;
  float maxDistance;
  float penumbra;
};

vec3 spotLight(vec3 lightColor, float intensity, vec3 lightPosition, vec3 targetPosition, float angle, float penumbra, vec3 position, vec3 normal, float maxDistance, vec3 viewDir, float glossiness) {

  vec3 fragDirection = lightPosition - position;
  float d = length(fragDirection);
  vec3 lightDirection = lightPosition - targetPosition;
  lightDirection = normalize(lightDirection);

  float decay = 1. - linearstep(0.0,maxDistance,d);

  fragDirection = normalize(fragDirection);
  float shading = max(0.0,dot(fragDirection, normal));
  float diffuse =  shading;
  float specular = phongSpecular(viewDir, fragDirection, normal, glossiness);

  float maxAngle = cos(angle * 0.5);
  float lightAngle = max(0.0, dot(fragDirection, lightDirection));
  float edge = smoothstep(maxAngle - penumbra, maxAngle, lightAngle);

  #ifdef TOON
    specular = toonify(specular, 0.05, decay * edge);
    diffuse = toonify(normal, fragDirection, 0.05, float(TOON), decay * edge);
  #endif

  vec3 light = (diffuse + specular) * intensity * lightColor;

  return light;

}