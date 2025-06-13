mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c,-s,s,c);
}

mat3 rotationMatrix(float angle, vec3 axis) {
    // Normalizza l'asse di rotazione
    axis = normalize(axis);
    
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    // Formula di Rodrigues per la rotazione
    return mat3(
        oc * axis.x * axis.x + c,          oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
    );
}

vec3 rotateAroundAxis(vec3 v, vec3 axis, float angle) {
    axis = normalize(axis);
    float cosA = cos(angle);
    float sinA = sin(angle);
    
    return v * cosA 
           + cross(axis, v) * sinA 
           + axis * dot(axis, v) * (1.0 - cosA);
}