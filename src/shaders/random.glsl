float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float random (vec3 st) {
    return fract(sin(dot(st.xyz,
                         vec3(12.9898,78.233, 96.236)))*
        43758.5453123);
}