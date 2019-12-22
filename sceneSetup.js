const nearView = 0.1
const farView = 100
const fieldOfView = 75

const init = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('skyblue')

  const camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, nearView, farView)

  const renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.physicallyCorrectLights = true
  renderer.gammaOutput = true
  renderer.gammaFactor = 2.2
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const light = new THREE.DirectionalLight(0xffffff, 5.0)
  // const light = new THREE.DirectionalLight(0xFF99A6, 5.0)

  light.position.x = 0
  light.position.y = 10
  light.position.z = 10
  scene.add(light)
  let helper = new THREE.DirectionalLightHelper(light, 5)
  scene.add(helper)

  return {scene, camera, renderer, light}
}

export default init
