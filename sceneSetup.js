const nearView = 0.1
const farView = 1500
const fieldOfView = 75

const init = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('skyblue')
  scene.fog = new THREE.Fog(0xd8eddd, 100, 950)
  const camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, nearView, farView)
  camera.rotation.order = 'YXZ'

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.physicallyCorrectLights = true
  renderer.gammaOutput = true
  renderer.gammaFactor = 2.2
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // const light = new THREE.DirectionalLight(0xFF99A6, 5.0)
  const light = new THREE.DirectionalLight(0xffffff, 5.0)
  light.position.set(0, 700, 10)
  // light.castShadow = true
  scene.add(light)
  // light.shadow.mapSize.width = 4096
  // light.shadow.mapSize.height = 1024
  // light.shadow.camera.near = 0.5
  // light.shadow.camera.far = 800
  // light.shadow.left = - 500
  // light.shadow.right = 500
  // light.shadow.top = 500
  // light.shadow.bottom = - 500

  // let helper = new THREE.DirectionalLightHelper(light, 5)
  // scene.add(helper)
  // var helpeer = new THREE.CameraHelper( light.shadow.camera );
  // scene.add( helpeer );
  let ambientLight = new THREE.AmbientLight(0xf09c89, 0)
  scene.add(ambientLight)
  return {scene, camera, renderer, light, ambientLight}
}

export default init
