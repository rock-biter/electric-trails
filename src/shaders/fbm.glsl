// #define NUM_OCTAVES 5

float fbm(float x, int octaves) {
	float v = 0.0;
	float a = 1.;
  float normalization = 0.;
	float shift = float(100);
	for (int i = 0; i < octaves; ++i) {
    normalization += a;
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
  v /= normalization;
	return v;
}


float fbm(vec2 x, int octaves) {
	float v = 0.0;
	float a = 1.;
  float normalization = 0.;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < octaves; ++i) {
    normalization += a;
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
  v /= normalization;
	return v;
}


float fbm(vec3 x, int octaves) {
	float v = 0.0;
	float a = 1.;
  float normalization = 0.;
	vec3 shift = vec3(100);
	for (int i = 0; i < octaves; ++i) {
    normalization += a;
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
  v /= normalization;
	return v;
}

// Turbulence
float turbulenceFBM(vec3 x, int octaves) {
	float v = 0.0;
	float a = 1.;
  float normalization = 0.;
	vec3 shift = vec3(100);
	for (int i = 0; i < octaves; ++i) {
    normalization += a;
		float n = cnoise(x);
		n = abs(n);
		v += a * n;
		x = x * 2.0 + shift;
		a *= 0.5;
	}
  v /= normalization;
	return v;
}

// Turbulence
float turbulenceFBM(vec4 x, int octaves) {
	float v = 0.0;
	float a = 1.;
  float normalization = 0.;
	vec4 shift = vec4(100);
	for (int i = 0; i < octaves; ++i) {
    normalization += a;
		float n = snoise(x);
		n = abs(n);
		v += a * n;
		x = x * 2.0 + shift;
		a *= 0.5;
	}
  v /= normalization;
	return v;
}

// Ridged
float ridgedFBM(vec3 x, int octaves) {
	float v = 0.0;
	float a = 1.;
  float normalization = 0.;
	vec3 shift = vec3(100);
	for (int i = 0; i < octaves; ++i) {
    normalization += a;
		float n = cnoise(x);
		n = 1. - abs(n);
		v += a * n;
		x = x * 2.0 + shift;
		a *= 0.5;
	}
  v /= normalization;
	v = pow(v, 2.);
	return v;
}

float domainWarpFBM(vec3 x, int octaves) {
	
	vec3 offset = vec3(
		fbm(x, octaves),
		fbm(x + vec3(45.236, 22.458,0.0), octaves),
		0.0
	);

	vec3 offset2 = vec3(
		fbm(x + 4. * offset * vec3(4.561,1.256,3.156), octaves),
		fbm(x + 4. * offset * vec3(3.152, 0.459, 2.156), octaves),
		0.0
	);

	// vec3 offset3 = vec3(
	// 	fbm(x + 4. * offset2 * vec3(8.569,2.356,1.259), octaves),
	// 	fbm(x + 4. * offset2 * vec3(7.149,0.2485,3.154), octaves),
	// 	0.0
	// );

	float v = fbm(x + offset2, octaves);

	return v;
}