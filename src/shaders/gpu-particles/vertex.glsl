uniform sampler2D uPosition;
	varying vec2 vUv;
	varying float vAlpha;
	varying vec3 vWPos;

	void main() {

		vec4 pos = texture(uPosition, uv);
		vUv = uv;
		vAlpha = pos.w;
		vec4 wPos = modelMatrix * vec4(pos.xyz,1.0);
		vWPos = wPos.xyz;
		vAlpha *= smoothstep(0.3,1.,wPos.y);

		vec4 mvPos = viewMatrix * wPos;

		gl_Position = projectionMatrix * mvPos;
		gl_PointSize = 200. / -mvPos.z;
		gl_PointSize *= smoothstep(1.1,0.8,pos.w);
		gl_PointSize *= smoothstep(0.,0.2,pos.w);

	}