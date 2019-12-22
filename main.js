import init from './sceneSetup.js'
import {Wall} from './object.js'
import {initControls, cameraMover} from './cameraControls.js'

let {scene, camera, renderer, light} = init()
let controls = initControls(camera, renderer)
let moveCamera = cameraMover(camera)

let loader = new THREE.GLTFLoader();
let mixers = []
const clock = new THREE.Clock();
const mouse = new THREE.Vector2();
window.camera = camera


let wall = new Wall(scene)
wall.randomize()
wall.mesh.position.y = 10
camera.position.z = 25
console.log(scene)
console.log(wall)


renderer.setAnimationLoop( () => {
  update()

  renderer.render(scene, camera)
})

const update = () => {
  const delta = clock.getDelta()
  for (let mixer of mixers) {
    mixer.update(delta)
  }
  moveCamera()
  controls.update()
  // light.position.x -= 0.01
}


loader.load( 'world.glb', gltf => {
  gltf.scene.children[0].scale.set(0.1,0.1,0.1)
  let animation = gltf.animations[0]
  let mixer = new THREE.AnimationMixer(gltf.scene.children[7])
  mixers.push(mixer)
  let action = mixer.clipAction(animation)
  action.play()
  scene.add( gltf.scene );
  // console.log(gltf)
}, undefined, error => {
	console.error(error)
}) // TODO: ADD LOADER



document.onmousemove = event => {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
}

window.onresize = event => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
