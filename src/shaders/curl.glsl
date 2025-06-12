vec2 curlNoise(vec2 p) {
  float e = 0.0001;

  float n1 = cnoise(vec2(p.x, p.y + e));
  float n2 = cnoise(vec2(p.x, p.y - e));
  float a = (n1 - n2) / (2. * e);

  float n3 = cnoise(vec2(p.x + e, p.y));
  float n4 = cnoise(vec2(p.x - e, p.y));
  float b = (n3 - n4) / (2. * e);

  return normalize(vec2(a,-b));

}