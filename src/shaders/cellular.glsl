float cellular(vec3 coords) {

  vec2 base = floor(coords.xy);
  vec2 cellOffset = fract(coords.xy);

  float closest = 1.0;

  for(int y = -1; y <= 1; y ++) {
    for(int x = -1; x <= 1; x ++) {
      vec2 neighbor = vec2(x,y);
      vec2 cellPos = base + neighbor;

      vec2 offset = vec2(
        noise(vec3(cellPos,coords.z)),
        noise(vec3(cellPos,coords.z) + vec3(3.126,1.459,6.459))
      );

      neighbor += offset;

      float d = length(neighbor - cellOffset); // distance(neighbor,cellOffset)
      closest = min(closest, d);
    }
  }

  return closest;

}

float cellular(vec4 coords) {

  vec3 base = floor(coords.xyz);
  vec3 cellOffset = fract(coords.xyz);

  float closest = 1.0;

  for(int z = -1; z <= 1; z ++) {
    for(int y = -1; y <= 1; y ++) {
      for(int x = -1; x <= 1; x ++) {
        vec3 neighbor = vec3(x,y,z);
        vec3 cellPos = base + neighbor;

        vec3 offset = vec3(
          noise(vec3(cellPos + coords.w)),
          noise(vec3(cellPos + coords.w) + vec3(3.126,1.459,6.459)),
          noise(vec3(cellPos + coords.w) + vec3(9.156,7.458,5.236))
        );

        neighbor += offset;

        float d = length(neighbor - cellOffset); // distance(neighbor,cellOffset)
        closest = min(closest, d);
      }
    }
  }

  return closest;

}