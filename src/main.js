import './style.css'
import * as THREE from 'three'
import {
	EffectComposer,
	EffectPass,
	RenderPass,
	ShaderPass,
	BloomEffect,
} from 'postprocessing'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import trailFragment from './shaders/trail/fragment.glsl'
import trailSmokeFragment from './shaders/smoke/fragment.glsl'
import groundVertex from './shaders/ground/vertex.glsl'
import groundFragment from './shaders/ground/fragment.glsl'
import groundCracksFragment from './shaders/ground/crack.frag'
// import smokeVertex from './shaders/ice-smoke/vertex.glsl'
// import smokeFragment from './shaders/ice-smoke/fragment.glsl'
import godrayFragment from './shaders/godray-pass/fragment.glsl'
import godrayVertex from './shaders/godray-pass/vertex.glsl'

import trailMeshVertex from './shaders/mesh-trail/vertex.glsl'
import trailMeshFragment from './shaders/mesh-trail/fragment.glsl'
import radialTrailMeshVertex from './shaders/radial-trail/vertex.glsl'
import radialTrailMeshFragment from './shaders/radial-trail/fragment.glsl'

import particlesPosition from './shaders/gpu-particles/position.frag'
import particlesVelocity from './shaders/gpu-particles/velocity.frag'
import { GPUComputationRenderer } from 'three/examples/jsm/Addons.js'

const textureLoader = new THREE.TextureLoader()
const crackMap = textureLoader.load('/textures/cracks-1.png')
crackMap.wrapS = THREE.RepeatWrapping
crackMap.wrapT = THREE.RepeatWrapping
const perlinMap = textureLoader.load('/textures/super-perlin-1.png')
perlinMap.wrapS = THREE.RepeatWrapping
perlinMap.wrapT = THREE.RepeatWrapping

const raycaster = new THREE.Raycaster()

/**
 * Debug
 */
// __gui__
const config = {
	color: new THREE.Color(0xff3300),
	colorDistance: 2,
	sampler: 30,
	reduce: 0.5,
	cursorSize: 1.2,
}
// const pane = new Pane()
// pane.addBinding(config, 'color', {
// 	color: { type: 'float' },
// })

// pane
// 	.addBinding(config, 'colorDistance', {
// 		min: 0,
// 		max: 10,
// 		step: 0.01,
// 	})
// 	.on('change', (ev) => {
// 		godrayPassMaterial.uniforms.uColorDistance.value = ev.value
// 	})

// pane
// 	.addBinding(config, 'reduce', {
// 		min: 0.01,
// 		max: 1,
// 		step: 0.001,
// 	})
// 	.on('change', (ev) => {
// 		godrayPassMaterial.uniforms.uReduce.value = ev.value
// 	})

// pane
// 	.addBinding(config, 'sampler', {
// 		min: 0,
// 		max: 160,
// 		step: 1,
// 	})
// 	.on('change', (ev) => {
// 		godrayPassMaterial.uniforms.uSampler.value = ev.value
// 	})

/**
 * Scene
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color(0.0, 0.0, 0.0)

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(8, 10, 14)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
})
document.body.appendChild(renderer.domElement)

/**
 * OrbitControls
 */
// __controls__
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5)
directionalLight.position.set(3, 10, 7)
scene.add(ambientLight, directionalLight)

function createRenderTarget(w, h, mipmap = false) {
	let minFilter, magFilter
	minFilter = THREE.LinearFilter
	magFilter = THREE.LinearFilter
	if (mipmap) {
		minFilter = THREE.LinearMipmapLinearFilter
	}

	return new THREE.WebGLRenderTarget(w, h, {
		type: THREE.HalfFloatType,
		minFilter,
		magFilter,
		depthBuffer: false,
		generateMipmaps: mipmap,
	})
}

const rt1 = createRenderTarget(sizes.width, sizes.height, false)
const rt2 = createRenderTarget(sizes.width, sizes.height, false)

let inputRT = rt1
let outputRT = rt2

// const rt3 = createRenderTarget(sizes.width * 0.25, sizes.height * 0.25)
// const rt4 = createRenderTarget(sizes.width * 0.25, sizes.height * 0.25)
const rt5 = createRenderTarget(sizes.width, sizes.height, false)

// let smokeInputRT = rt3
// let smokeOutputRT = rt4

const trailScene = new THREE.Scene()
const trailGeometry = new THREE.BufferGeometry()
trailGeometry.setAttribute(
	'position',
	new THREE.BufferAttribute(
		new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
		3
	)
)
trailGeometry.setAttribute(
	'uv',
	new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2)
)
const trailMaterial = new THREE.ShaderMaterial({
	vertexShader: /* glsl */ `
		varying vec2 vUv;	
		void main() {
			vUv = uv;
			gl_Position = vec4(position,1.0);
		}
	`,
	fragmentShader: trailFragment,
	uniforms: {
		uResolution: new THREE.Uniform(
			new THREE.Vector2(sizes.width, sizes.height)
		),
		uMap: new THREE.Uniform(),
		uUVPointer: new THREE.Uniform(new THREE.Vector2(0, 0)),
		uDt: new THREE.Uniform(0.0),
		uSpeed: new THREE.Uniform(0),
		uTime: new THREE.Uniform(0),
	},
})

const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial)
trailScene.add(trailMesh)

// const trailSmokeMaterial = new THREE.ShaderMaterial({
// 	vertexShader: /* glsl */ `
// 		varying vec2 vUv;
// 		void main() {
// 			vUv = uv;
// 			gl_Position = vec4(position,1.0);
// 		}
// 	`,
// 	fragmentShader: trailSmokeFragment,
// 	uniforms: {
// 		uResolution: {
// 			value: new THREE.Vector2(sizes.width * 0.25, sizes.height * 0.25),
// 		},
// 		uMap: new THREE.Uniform(),
// 		uUVPointer: trailMaterial.uniforms.uUVPointer,
// 		uDt: trailMaterial.uniforms.uDt,
// 		uSpeed: trailMaterial.uniforms.uSpeed,
// 		uTime: trailMaterial.uniforms.uTime,
// 	},
// })
// const trailSmokeMesh = new THREE.Mesh(trailGeometry, trailSmokeMaterial)
// const trailSmokeScene = new THREE.Scene()
// trailSmokeScene.add(trailSmokeMesh)

const pointer = new THREE.Vector2()
window.addEventListener('pointermove', (ev) => {
	pointer.x = (ev.clientX / sizes.width) * 2 - 1
	pointer.y = -(ev.clientY / sizes.height) * 2 + 1
})

const rt3 = createRenderTarget(sizes.width, sizes.height, true)
// rt3.generateMipMaps = true
const reflectionCamera = camera.clone()

// ice
// __floor__
/**
 * Plane
 */
const groundMaterial = new THREE.ShaderMaterial({
	vertexShader: groundVertex,
	fragmentShader: groundFragment,
	// fragmentShader: groundCracksFragment,
	transparent: true,
	uniforms: {
		uTrailMap: new THREE.Uniform(),
		uCracksMap: new THREE.Uniform(crackMap),
		uPerlin: new THREE.Uniform(perlinMap),
		uParallaxDistance: new THREE.Uniform(1),
		uTime: trailMaterial.uniforms.uTime,
		uReflectionMap: new THREE.Uniform(rt3.texture),
	},
})
const groundGeometry = new THREE.PlaneGeometry(10000, 10000)
groundGeometry.rotateX(-Math.PI * 0.5)
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
scene.add(ground)

const crackMaterial = new THREE.ShaderMaterial({
	vertexShader: groundVertex,
	// fragmentShader: groundFragment,
	fragmentShader: groundCracksFragment,
	transparent: true,
	uniforms: groundMaterial.uniforms,
})

const crack = new THREE.Mesh(groundGeometry, crackMaterial)
const crackScene = new THREE.Scene()
crackScene.add(crack)

// const iceSmokeGeometry = new THREE.PlaneGeometry(40, 40, 100, 100)
// const iceSmokeMaterial = new THREE.ShaderMaterial({
// 	vertexShader: smokeVertex,
// 	fragmentShader: smokeFragment,
// 	transparent: true,
// 	// wireframe: true,
// 	uniforms: {
// 		uTrailSmokeMap: new THREE.Uniform(),
// 		uPerlin: new THREE.Uniform(perlinMap),
// 		uTime: trailMaterial.uniforms.uTime,
// 	},
// })
// iceSmokeGeometry.rotateX(-Math.PI * 0.5)
// const smokeMesh = new THREE.Mesh(iceSmokeGeometry, iceSmokeMaterial)
// smokeMesh.position.y = 0.5
// scene.add(smokeMesh)

// function createRenderTarget(mipmap = false) {
// 	return new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
// 		type: THREE.HalfFloatType,
// 		minFilter: THREE.LinearFilter,
// 		magFilter: THREE.LinearFilter,
// 		depthBuffer: false,
// 		generateMipmaps: mipmap,
// 		depthBuffer: false,
// 		stencilBuffer: false,
// 	})
// }

const composer = new EffectComposer(renderer)

handleResize()

composer.addPass(new RenderPass(scene, camera))
const resolution = new THREE.Vector2()
renderer.getDrawingBufferSize(resolution)
const godrayPassMaterial = new THREE.ShaderMaterial({
	vertexShader: godrayVertex,
	fragmentShader: godrayFragment,
	defines: { LABEL: 'godray' },
	uniforms: {
		tDiffuse: new THREE.Uniform(null),
		uCrackScene: new THREE.Uniform(rt5.texture),
		uColor: { value: config.color },
		uColorDistance: { value: config.colorDistance },
		uSampler: { value: config.sampler },
		uReduce: { value: config.reduce },
		uCenter: { value: new THREE.Vector3(0, 0, 0) },
		uCursorTrail: { value: new THREE.Uniform() },
		uTime: { value: 0 },
		uResolution: { value: resolution },
		uProjectionMatrix: { value: new THREE.Matrix4() },
		uViewMatrix: { value: new THREE.Matrix4() },
	},
})

const godrayPass = new ShaderPass(godrayPassMaterial, 'tDiffuse')

composer.addPass(
	new EffectPass(
		camera,
		new BloomEffect({
			intensity: 1.5,
			radius: 0.1,
			luminanceThreshold: 0.005,
		})
	)
)

// composer.addPass(godrayPass)

/**
 * Three js Clock
 */
// __clock__
const clock = new THREE.Clock()
let time = 0

const trailSubdivision = 64
const data = new Float32Array(trailSubdivision * 4)

const dataTexture = new THREE.DataTexture(
	data,
	trailSubdivision,
	1,
	THREE.RGBAFormat,
	THREE.FloatType
)

// elettric trail mash
const trailGroup = new THREE.Object3D()

const globalUniforms = {
	uTime: new THREE.Uniform(0),
	uDt: new THREE.Uniform(0),
}

for (let i = 0; i < 2; i++) {
	const subdivision = trailSubdivision

	const trailGeom = new THREE.PlaneGeometry(1, 0.75, subdivision, 10)
	// trailGeom.rotateX(-Math.PI * 0.5)
	const trailMat = new THREE.ShaderMaterial({
		vertexShader: trailMeshVertex,
		fragmentShader: trailMeshFragment,
		transparent: true,
		wireframe: true,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		uniforms: {
			uTrailTexture: new THREE.Uniform(dataTexture),
			uTime: globalUniforms.uTime,
			uSubdivision: new THREE.Uniform(subdivision),
			uScale: new THREE.Uniform(1 - 0.2 * i),
			uOffset: new THREE.Uniform(
				new THREE.Vector3(i * 24.356, i * 24.356, i * 24.356)
			),
			uDt: globalUniforms.uDt,
		},
		// map: dataTexture,
	})
	const trail = new THREE.Mesh(trailGeom, trailMat)

	trailGroup.add(trail)
}

trailGroup.position.y = 2
trailGroup.frustumCulled = false
trailGroup.renderOrder = 2
scene.add(trailGroup)

const prevPoint = new THREE.Vector3(0)

// Radial electric mesh
const trailSubs = 12
const radialGeom = new THREE.PlaneGeometry(1, 3, trailSubs, 60)
for (let i = 0; i < 9; i++) {
	const radialMat = new THREE.ShaderMaterial({
		vertexShader: radialTrailMeshVertex,
		fragmentShader: radialTrailMeshFragment,
		uniforms: {
			uTrailTexture: new THREE.Uniform(dataTexture),
			uSubdivision: new THREE.Uniform(16),
			uTime: globalUniforms.uTime,
			uCellOffset: { value: new THREE.Vector3(i * 5, 0, i * 5) },
			uCellScale: new THREE.Uniform(new THREE.Vector3(0.1, 0.2, 0.1)),
			uStartIndex: new THREE.Uniform(0),
		},
		side: THREE.DoubleSide,
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		wireframe: true,
	})

	const radialMesh = new THREE.Mesh(radialGeom, radialMat)
	trailGroup.add(radialMesh)
}

// for (let i = 0; i < 8; i++) {
// 	const radialMat = new THREE.ShaderMaterial({
// 		vertexShader: radialTrailMeshVertex,
// 		fragmentShader: radialTrailMeshFragment,
// 		uniforms: {
// 			uTrailTexture: new THREE.Uniform(dataTexture),
// 			uSubdivision: new THREE.Uniform(16),
// 			uTime: trailMat.uniforms.uTime,
// 			uCellOffset: { value: new THREE.Vector3(i * 5, 0, i * 5) },
// 			uCellScale: new THREE.Uniform(new THREE.Vector3(0.2, 1, 0.2)),
// 			uStartIndex: new THREE.Uniform(((i + 1) * subdivision) / 8),
// 		},
// 		side: THREE.DoubleSide,
// 		transparent: true,
// 		blending: THREE.AdditiveBlending,
// 		depthWrite: false,
// 		// wireframe: true,
// 	})

// 	const radialMesh = new THREE.Mesh(radialGeom, radialMat)
// 	trail.add(radialMesh)
// }

// GPGPU particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 200
particlesGeometry.setDrawRange(0, count)
const particlesMaterial = new THREE.ShaderMaterial({
	vertexShader: /* glsl */ `

	uniform sampler2D uPosition;
	varying vec2 vUv;
	varying float vAlpha;

	void main() {

		vec4 pos = texture(uPosition, uv);
		vUv = uv;
		vAlpha = pos.w;
		vec4 wPos = modelMatrix * vec4(pos.xyz,1.0);
		vAlpha *= smoothstep(0.,1.,wPos.y);

		vec4 mvPos = viewMatrix * wPos;

		gl_Position = projectionMatrix * mvPos;
		gl_PointSize = 200. / -mvPos.z;
		gl_PointSize *= pow(pos.w, 5.);

	}
	`,
	fragmentShader: /* glsl */ `
	varying float vAlpha;
	void main() {

		vec2 uv = gl_PointCoord.xy;
		float t = distance(uv, vec2(0.5)) * 2.;
		float a = smoothstep(1.0,0.0,t);
		vec3 color = vec3(0.3,0.9, 0.8);
		color = mix(vec3(0.0,0.0,1.),color,pow(vAlpha, 5.));
		a = pow(a, 5.0);
		a *= pow(vAlpha, 4.0);
		gl_FragColor = vec4(color,a);
	}
	`,
	blending: THREE.AdditiveBlending,
	transparent: true,
	depthWrite: false,
	uniforms: {
		uPosition: new THREE.Uniform(),
	},
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const gpgpu = {}
gpgpu.count = count
gpgpu.size = Math.ceil(Math.sqrt(gpgpu.count))
gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, renderer)

const positionTexture = gpgpu.computation.createTexture()
const velocityTexture = gpgpu.computation.createTexture()

const uv = new Float32Array(count * 2)

for (let y = 0; y < gpgpu.size; y++) {
	for (let x = 0; x < gpgpu.size; x++) {
		const i = y * gpgpu.size + x
		const i2 = i * 2

		const uvX = (x + 0.5) / gpgpu.size
		const uvY = (y + 0.5) / gpgpu.size

		uv[i2 + 0] = uvX
		uv[i2 + 1] = uvY
	}
}
particlesGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))

for (let i = 0; i < gpgpu.count; i++) {
	const i4 = i * 4
	const i3 = i * 3

	const V = new THREE.Vector3()
	V.randomDirection()
	// V.multiplyScalar(Math.random())

	velocityTexture.image.data[i4 + 0] = 0 //V.x
	velocityTexture.image.data[i4 + 1] = 3 //V.y
	velocityTexture.image.data[i4 + 2] = 0 //V.z

	V.multiplyScalar(Math.random() * 5)

	positionTexture.image.data[i4 + 0] = V.x
	positionTexture.image.data[i4 + 1] = V.y
	positionTexture.image.data[i4 + 2] = V.z
	positionTexture.image.data[i4 + 3] = Math.random() * 1
}

// console.log(velocityTexture.image.data)

gpgpu.velVar = gpgpu.computation.addVariable(
	'uVelocity',
	particlesVelocity,
	velocityTexture
)
gpgpu.posVar = gpgpu.computation.addVariable(
	'uPosition',
	particlesPosition,
	positionTexture
)

gpgpu.computation.setVariableDependencies(gpgpu.velVar, [
	gpgpu.velVar,
	gpgpu.posVar,
])
gpgpu.computation.setVariableDependencies(gpgpu.posVar, [
	gpgpu.velVar,
	gpgpu.posVar,
])

gpgpu.velVar.material.uniforms.uDt = globalUniforms.uDt
gpgpu.velVar.material.uniforms.uSubdivision = trailSubdivision
gpgpu.velVar.material.uniforms.uTrailTexture = new THREE.Uniform(dataTexture)
gpgpu.posVar.material.uniforms.uDt = globalUniforms.uDt
gpgpu.posVar.material.uniforms.uTrailTexture = new THREE.Uniform(dataTexture)

gpgpu.computation.init()

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	const dt = clock.getDelta()
	time += dt
	globalUniforms.uDt.value = dt
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	gpgpu.computation.compute()
	particlesMaterial.uniforms.uPosition.value =
		gpgpu.computation.getCurrentRenderTarget(gpgpu.posVar).texture

	raycaster.setFromCamera(pointer, camera)

	const [firstIntersection] = raycaster.intersectObject(ground)

	globalUniforms.uTime.value = time

	if (firstIntersection) {
		// console.log(firstIntersection)
		const { uv, point } = firstIntersection

		uv && trailMaterial.uniforms.uUVPointer.value.lerp(uv, dt * 5)
		// godrayPassMaterial.uniforms.uCenter.value.lerp(
		// 	point.add(new THREE.Vector3(0, -2, 0)),
		// 	dt * 10
		// )

		const prevPoint = new THREE.Vector3(data[0], data[1], data[2])
		const newPoint = prevPoint.clone().lerp(point, dt * 5)

		// console.log(point.sub(prevPoint).length())
		//prevPoint.sub(newPoint).length() >= 0.3
		if (prevPoint.sub(newPoint).length() >= dt * 0) {
			// console.log('update')
			for (let i = trailSubdivision; i >= 0; i--) {
				let prevIndex = (i - 1) * 4

				const x = data[prevIndex]
				const y = data[prevIndex + 1]
				const z = data[prevIndex + 2]
				const w = data[prevIndex + 3]

				let index = i * 4

				data[index] = x
				data[index + 1] = y
				data[index + 2] = z
				data[index + 3] = w
			}

			data[0] = newPoint.x //+ Math.sin(time * 2) * 0.1
			data[0 + 1] = 0
			data[0 + 2] = newPoint.z //+ Math.cos(time * 2) * 0.1
			data[0 + 3] = 0

			dataTexture.needsUpdate = true

			// prevPoint.copy(newPoint)
		}
	}

	trailMaterial.uniforms.uTime.value = time
	godrayPassMaterial.uniforms.uTime.value = time
	trailMaterial.uniforms.uDt.value = dt

	// __controls_update__
	controls.update(dt)

	renderer.setRenderTarget(outputRT)
	renderer.render(trailScene, camera)

	// renderer.setRenderTarget(smokeOutputRT)
	// renderer.render(trailSmokeScene, camera)

	// renderer.setRenderTarget(rt5)
	// renderer.clear()
	// renderer.render(crackScene, camera)

	// renderer.setRenderTarget(null)

	trailMaterial.uniforms.uMap.value = outputRT.texture
	groundMaterial.uniforms.uTrailMap.value = inputRT.texture

	// trailSmokeMaterial.uniforms.uMap.value = smokeOutputRT.texture
	// iceSmokeMaterial.uniforms.uTrailSmokeMap.value = smokeOutputRT.texture
	godrayPassMaterial.uniforms.uProjectionMatrix.value.copy(
		camera.projectionMatrix
	)
	godrayPassMaterial.uniforms.uViewMatrix.value.copy(camera.matrixWorldInverse)

	reflectionCamera.position.copy(camera.position)
	reflectionCamera.position.y *= -1
	let target = controls && controls.target.clone()
	if (!target) {
		target = cameraTarget
	}
	target.y *= -1
	reflectionCamera.lookAt(target)

	ground.visible = false
	renderer.setRenderTarget(rt3)
	renderer.clear()

	renderer.render(scene, reflectionCamera)

	// rt3.texture.mi
	// const gl = renderer.getContext()
	// gl.bindTexture(gl.TEXTURE_2D, rt3.texture.__webglTexture)
	// gl.generateMipmap(gl.TEXTURE_2D)

	renderer.setRenderTarget(null)
	ground.visible = true

	// renderer.render(scene, camera)
	composer.render()

	let temp = inputRT
	inputRT = outputRT
	outputRT = temp

	// temp = smokeInputRT
	// smokeInputRT = smokeOutputRT
	// smokeOutputRT = temp

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	trailMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height)
	reflectionCamera.aspect = sizes.width / sizes.height

	// trailSmokeMaterial.uniforms.uResolution.value.set(
	// 	sizes.width * 0.25,
	// 	sizes.height * 0.25
	// )

	// camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix()
	reflectionCamera.updateProjectionMatrix()

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setSize(sizes.width, sizes.height)
	rt1.setSize(sizes.width, sizes.height)
	rt2.setSize(sizes.width, sizes.height)
	rt5.setSize(sizes.width, sizes.height)
	rt3.setSize(sizes.width * pixelRatio * 0.5, sizes.height * pixelRatio * 0.5)
	composer.setSize(sizes.width * pixelRatio, sizes.height * pixelRatio)
	// rt3.setSize(sizes.width * 0.25, sizes.height * 0.25)
	// rt4.setSize(sizes.width * 0.25, sizes.height * 0.25)

	renderer.setPixelRatio(pixelRatio)
}
