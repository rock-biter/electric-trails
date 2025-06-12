float inverseLerp(float currentValue, float minValue, float maxValue) {
  return (currentValue - minValue) / (maxValue - minValue);
}

float linearstep(float edge1, float edge2, float currentValue) {
  return clamp((currentValue - edge1) / (edge2 - edge1), 0.0, 1.0); // percentage
}

float remap(float currentValue, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(currentValue, inMin, inMax);
  return mix(outMin, outMax, t);
}