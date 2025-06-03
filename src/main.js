import './style.css'
import * as THREE from 'three'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import trailFragment from './shaders/trail/fragment.glsl'
import iceVertex from './shaders/ice/vertex.glsl'
import iceFragment from './shaders/ice/fragment.glsl'

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
	example: 5,
}
const pane = new Pane()

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
camera.position.set(4, 8, 8)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

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

function createRenderTarget() {
	return new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
		type: THREE.HalfFloatType,
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		depthBuffer: false,
	})
}

const rt1 = createRenderTarget()
const rt2 = createRenderTarget()

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
		uUVPointer: new THREE.Uniform(new THREE.Vector2(0, 0)),
		uDt: new THREE.Uniform(0.0),
		uSpeed: new THREE.Uniform(0),
		uTime: new THREE.Uniform(0),
	},
})

const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial)
trailScene.add(trailMesh)

const pointer = new THREE.Vector2()
window.addEventListener('pointermove', (ev) => {
	pointer.x = (ev.clientX / sizes.width) * 2 - 1
	pointer.y = -(ev.clientY / sizes.height) * 2 + 1
})

// ice
// __floor__
/**
 * Plane
 */
const groundMaterial = new THREE.ShaderMaterial({
	vertexShader: iceVertex,
	fragmentShader: iceFragment,
	uniforms: {
		uTrailMap: new THREE.Uniform(outputRT.texture),
		uCracksMap: new THREE.Uniform(crackMap),
		uPerlin: new THREE.Uniform(perlinMap),
		uParallaxDistance: new THREE.Uniform(1),
	},
})
const groundGeometry = new THREE.PlaneGeometry(40, 40, 100, 100)
groundGeometry.rotateX(-Math.PI * 0.5)
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
scene.add(ground)

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

	trailMaterial.uniforms.uTime.value = time
	trailMaterial.uniforms.uDt.value = dt

	// __controls_update__
	controls.update(dt)

	renderer.setRenderTarget(outputRT)
	renderer.render(trailScene, camera)

	renderer.setRenderTarget(null)

	trailMaterial.uniforms.uMap.value = outputRT.texture
	groundMaterial.uniforms.uTrailMap.value = outputRT.texture

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
	trailMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height)

	// camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)
	rt1.setSize(sizes.width, sizes.height)
	rt2.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
