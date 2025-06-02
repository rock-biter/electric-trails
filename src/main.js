import './style.css'
import * as THREE from 'three'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import trailFragment from './shaders/trail/fragment.glsl'
import fireVertexShader from './shaders/fire/vertex.glsl'
import fireFragmentShader from './shaders/fire/fragment.glsl'
import vertexShader from './shaders/card/vertex.glsl'
import fragmentShader from './shaders/card/fragment.glsl'
import particlesVert from './shaders/particles/vertex.glsl'
import particlesFrag from './shaders/particles/fragment.glsl'
import groundVertex from './shaders/ground/vertex.glsl'
import groundFragment from './shaders/ground/fragment.glsl'

const raycaster = new THREE.Raycaster()

const globalUniforms = {
	uTime: { value: 0.0 },
}

/**
 * Debug
 */
// __gui__
const config = {
	progress: 0.3,
	burn: {
		frequency: 1.09,
		amplitude: 1.3,
		alphaOffset: 0.02,
		alphaMargin: 0.05,
		burnColor: new THREE.Color(0.02, 0.0, 0.0),
		burnOffset: 0.5,
		burnMargin: 0.46,
		burnExp: 32,
		fireColor: new THREE.Color(1.0, 0.44, 0.19),
		fireOffset: 0.39,
		fireMargin: 0.52,
		fireScale: 4.78,
		fireExp: 1.6,
		fireMixExp: 7.4,
	},
	fire: {
		wireframe: false,
		frequency: 1.2,
		amplitude: 3.2,
		expAmplitude: 3,
		fallinOffset: 0.3,
		fallinMargin: 0.5,
		falloffOffset: -0.1,
		falloffMargin: 0.2,
		baseFrequency: 1.5,
		baseAmplitude: 0.25,
		baseStart: -0.5,
		baseEnd: 2,
		topFrequency: 2,
		topAmplitude: 0.5,
	},
	particles: {
		size: 7,
		speed: 3.5,
		divergenceFreq: new THREE.Vector2(0.2, 0.2),
		divergenceAmp: 3,
	},
}
const pane = new Pane()

{
	const fire = pane.addFolder({ title: 'Fire', expanded: false })

	fire.addBinding(config.fire, 'wireframe').on('change', (ev) => {
		fireMaterial.wireframe = ev.value
	})

	fire
		.addBinding(config.fire, 'frequency', {
			min: 0.01,
			max: 3,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireFrequency.value = ev.value
		})

	fire
		.addBinding(config.fire, 'amplitude', {
			min: 0,
			max: 10,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireAmplitude.value = ev.value
		})

	fire
		.addBinding(config.fire, 'expAmplitude', {
			min: 0,
			max: 10,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireExpAmplitude.value = ev.value
		})

	fire
		.addBinding(config.fire, 'fallinOffset', {
			min: -1,
			max: 1,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireFallinOffset.value = ev.value
		})

	fire
		.addBinding(config.fire, 'fallinMargin', {
			min: 0,
			max: 1,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireFallinMargin.value = ev.value
		})

	fire
		.addBinding(config.fire, 'falloffOffset', {
			min: -1,
			max: 1,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireFalloffOffset.value = ev.value
		})

	fire
		.addBinding(config.fire, 'falloffMargin', {
			min: 0,
			max: 1,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uFireFalloffMargin.value = ev.value
		})

	fire
		.addBinding(config.fire, 'baseFrequency', {
			min: 0,
			max: 3,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uBaseFrequency.value = ev.value
		})

	fire
		.addBinding(config.fire, 'baseAmplitude', {
			min: 0,
			max: 10,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uBaseAmplitude.value = ev.value
		})

	fire
		.addBinding(config.fire, 'baseStart', {
			min: -2,
			max: 2,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uBaseStart.value = ev.value
		})

	fire
		.addBinding(config.fire, 'baseEnd', {
			min: -2,
			max: 5,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uBaseEnd.value = ev.value
		})

	fire
		.addBinding(config.fire, 'topFrequency', {
			min: 0,
			max: 5,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uTopFrequency.value = ev.value
		})

	fire
		.addBinding(config.fire, 'topAmplitude', {
			min: 0,
			max: 5,
			step: 0.01,
		})
		.on('change', (ev) => {
			fireMaterial.uniforms.uTopAmplitude.value = ev.value
		})
}

{
	const particles = pane.addFolder({
		title: 'Particles',
		expanded: true,
	})

	particles
		.addBinding(config.particles, 'size', {
			min: 1,
			max: 10,
			step: 0.01,
		})
		.on('change', (ev) => {
			particlesMat.uniforms.uSize.value = ev.value * renderer.getPixelRatio()
		})

	particles
		.addBinding(config.particles, 'speed', {
			min: 0,
			max: 10,
			step: 0.01,
		})
		.on('change', (ev) => {
			particlesMat.uniforms.uSpeed.value = ev.value
		})

	particles
		.addBinding(config.particles, 'divergenceAmp', {
			min: 0,
			max: 5,
			step: 0.01,
		})
		.on('change', (ev) => {
			particlesMat.uniforms.uDivergenceAmp.value = ev.value
		})

	particles
		.addBinding(config.particles, 'divergenceFreq', {
			x: {
				min: 0.01,
				max: 3,
				step: 0.01,
			},
			y: {
				min: 0.01,
				max: 3,
				step: 0.01,
			},
		})
		.on('change', (ev) => {
			// particlesMat.uniforms.uDivergenceF.value = ev.value
		})
}

/**
 * Scene
 */
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xdedede)

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
camera.position.set(20, 12, 20)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
const axesHelper = new THREE.AxesHelper(3)
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

function createRenderTarget(mipmap = false) {
	return new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
		type: THREE.HalfFloatType,
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		depthBuffer: false,
		generateMipmaps: mipmap,
		depthBuffer: false,
		stencilBuffer: false,
	})
}

const rt1 = createRenderTarget()
const rt2 = createRenderTarget()
const rt3 = createRenderTarget(true)

let inputRT = rt1
let outputRT = rt2

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
		uMap: new THREE.Uniform(outputRT.texture),
		uUVPointer: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
		uDt: new THREE.Uniform(0.0),
		uSpeed: new THREE.Uniform(0),
		uTime: globalUniforms.uTime,
	},
})

const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial)
trailScene.add(trailMesh)

const pointer = new THREE.Vector2()
window.addEventListener('pointermove', (ev) => {
	pointer.x = (ev.clientX / sizes.width) * 2 - 1
	pointer.y = -(ev.clientY / sizes.height) * 2 + 1
})

const cardMaterial = new THREE.ShaderMaterial({
	vertexShader,
	fragmentShader,
	side: THREE.DoubleSide,
	transparent: true,
	uniforms: {
		...globalUniforms,
		uFrequency: { value: config.burn.frequency },
		uAmplitude: { value: config.burn.amplitude },
		uAlphaOffset: { value: config.burn.alphaOffset },
		uAlphaMargin: { value: config.burn.alphaMargin },
		uBurnColor: { value: config.burn.burnColor },
		uBurnOffset: { value: config.burn.burnOffset },
		uBurnMargin: { value: config.burn.burnMargin },
		uBurnExp: { value: config.burn.burnExp },
		uFireColor: { value: config.burn.fireColor },
		uFireOffset: { value: config.burn.fireOffset },
		uFireMargin: { value: config.burn.fireMargin },
		uFireScale: { value: config.burn.fireScale },
		uFireExp: { value: config.burn.fireExp },
		uFireMixExp: { value: config.burn.fireMixExp },
	},
})

const fireMaterial = new THREE.ShaderMaterial({
	fragmentShader: fireFragmentShader,
	vertexShader: fireVertexShader,
	side: THREE.DoubleSide,
	transparent: true,
	depthWrite: false,
	blending: THREE.AdditiveBlending,
	wireframe: config.fire.wireframe,
	uniforms: {
		...globalUniforms,
		uFireColor: cardMaterial.uniforms.uFireColor,
		uFireScale: cardMaterial.uniforms.uFireScale,
		uAmplitude: cardMaterial.uniforms.uBurnColor,
		uFrequency: cardMaterial.uniforms.uFrequency,
		uAmplitude: cardMaterial.uniforms.uAmplitude,
		uFireFrequency: {
			value: config.fire.frequency,
		},
		uFireAmplitude: {
			value: config.fire.amplitude,
		},
		uFireExpAmplitude: {
			value: config.fire.expAmplitude,
		},
		uFireFallinOffset: { value: config.fire.fallinOffset },
		uFireFallinMargin: { value: config.fire.fallinMargin },
		uFireFalloffOffset: { value: config.fire.falloffOffset },
		uFireFalloffMargin: { value: config.fire.falloffMargin },
		uBaseFrequency: {
			value: config.fire.baseFrequency,
		},
		uBaseAmplitude: {
			value: config.fire.baseAmplitude,
		},
		uBaseStart: { value: config.fire.baseStart },
		uBaseEnd: { value: config.fire.baseEnd },
		uTopFrequency: {
			value: config.fire.topFrequency,
		},
		uTopAmplitude: {
			value: config.fire.topAmplitude,
		},
		uVelocity: {
			value: new THREE.Vector2(0),
		},
		uTrailMap: new THREE.Uniform(outputRT.texture),
	},
})

const particlesMat = new THREE.ShaderMaterial({
	vertexShader: particlesVert,
	fragmentShader: particlesFrag,
	uniforms: {
		...globalUniforms,
		uSize: { value: config.particles.size },
		uSpeed: { value: config.particles.speed },
		uDivergenceFreq: { value: config.particles.divergenceFreq },
		uDivergenceAmp: { value: config.particles.divergenceAmp },
		uVelocity: fireMaterial.uniforms.uVelocity,
		uResolution: {
			value: new THREE.Vector2(sizes.width, sizes.height),
		},
		uFireColor: cardMaterial.uniforms.uFireColor,
		uFireScale: cardMaterial.uniforms.uFireScale,
		uFrequency: cardMaterial.uniforms.uFrequency,
		uAmplitude: cardMaterial.uniforms.uAmplitude,
	},
	depthWrite: false,
	blending: THREE.AdditiveBlending,
	transparent: true,
})

// __floor__
/**
 * Plane
 */
const fireGeometry = new THREE.PlaneGeometry(50, 50, 600, 600)
fireGeometry.rotateX(-Math.PI * 0.5)
const fire = new THREE.Mesh(fireGeometry, fireMaterial)
scene.add(fire)
fire.renderOrder = 2

const groundMaterial = new THREE.ShaderMaterial({
	vertexShader: groundVertex,
	fragmentShader: groundFragment,
	transparent: true,
	uniforms: {
		uBurnColor: new THREE.Uniform(config.burn.burnColor),
		uReflectionMap: new THREE.Uniform(rt3.texture),
		uTrailMap: new THREE.Uniform(outputRT.texture),
	},
})

const groundGeometry = new THREE.PlaneGeometry(50, 50)
groundGeometry.rotateX(-Math.PI * 0.5)
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
scene.add(ground)

const particlesSamplerGeometry = new THREE.PlaneGeometry(50, 50, 60, 60)
particlesSamplerGeometry.rotateX(-Math.PI * 0.5)
const position = particlesSamplerGeometry.getAttribute('position').clone()
const uv = particlesSamplerGeometry.getAttribute('uv').clone()
const count = position.count
const random = new Float32Array(count)
const life = new Float32Array(count)

for (let i = 0; i < count; i++) {
	random[i] = Math.random()
	life[i] = 1 + Math.random() > 0.8 ? Math.random() * 4 : Math.random() * 2
}

const particlesGeom = new THREE.BufferGeometry()
particlesGeom.setAttribute('position', position)
particlesGeom.setAttribute('uv', uv)
particlesGeom.setAttribute('aRandom', new THREE.BufferAttribute(random, 1))
particlesGeom.setAttribute('aLife', new THREE.BufferAttribute(life, 1))

particlesMat.uniforms.uTrailMap = {
	value: outputRT.texture,
}

const particles = new THREE.Points(particlesGeom, particlesMat)
particles.renderOrder = 4
scene.add(particles)

const reflectionCamera = camera.clone()

handleResize()

/**
 * Three js Clock
 */
// __clock__
const clock = new THREE.Clock()
let time = 0

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	const dt = clock.getDelta()
	time += dt
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	raycaster.setFromCamera(pointer, camera)

	const [firstIntersection] = raycaster.intersectObject(ground)

	if (firstIntersection) {
		// console.log(firstIntersection)
		const { uv } = firstIntersection

		uv && trailMaterial.uniforms.uUVPointer.value.lerp(uv, dt * 10)
	}

	globalUniforms.uTime.value = time
	trailMaterial.uniforms.uDt.value = dt

	// __controls_update__
	controls.update(dt)

	// render trail
	renderer.setRenderTarget(outputRT)
	renderer.render(trailScene, camera)

	renderer.setRenderTarget(null)

	trailMaterial.uniforms.uMap.value = outputRT.texture
	groundMaterial.uniforms.uTrailMap.value = outputRT.texture
	fireMaterial.uniforms.uTrailMap.value = outputRT.texture
	particlesMat.uniforms.uTrailMap.value = outputRT.texture

	// render reflection
	reflectionCamera.position.copy(camera.position)
	reflectionCamera.position.y *= -1
	const target = controls.target.clone()
	target.y *= -1
	reflectionCamera.lookAt(target)

	ground.visible = false
	renderer.setRenderTarget(rt3)
	renderer.clear()

	renderer.render(scene, reflectionCamera)

	renderer.setRenderTarget(null)
	ground.visible = true

	renderer.render(scene, camera)

	const temp = inputRT
	inputRT = outputRT
	outputRT = temp

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	reflectionCamera.aspect = sizes.width / sizes.height
	trailMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height)
	particlesMat.uniforms.uResolution.value.set(sizes.width, sizes.height)

	// camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix()
	reflectionCamera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)
	rt1.setSize(sizes.width, sizes.height)
	rt2.setSize(sizes.width, sizes.height)
	rt3.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
