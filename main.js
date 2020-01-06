import init from './sceneSetup.js'
import {World, Debris, Plane} from './object.js'
import {initControls, cameraMover, cameraTilter} from './cameraControls.js'
import {loadPoseNet, startCamera, estimatePoseOnImage} from './poseDetector.js'

document.onclick = e => {
  let elem = document.getElementById("a"); // virer id a sur html
  elem.requestPointerLock = elem.requestPointerLock    ||
                           elem.mozRequestPointerLock
  elem.requestPointerLock();
}



let {scene, camera, renderer, light, ambientLight} = init()
// let controls = initControls(camera, renderer)
let moveCamera = cameraMover(camera)
let tiltCamera = cameraTilter(camera)

let g = new THREE.BoxGeometry(2, 2, 2)
let mat = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
  flatShading: true,
  roughness: 0.5,
  metalness: 0.1
})
let mat2 = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: true,
  roughness: 0.5,
  metalness: 0.1
})

let m1 = new THREE.Mesh(g, mat)
scene.add(m1)
let m2 = new THREE.Mesh(g, mat2)
scene.add(m2)

let targetRightHandX = 0
let targetRightHandY = 0
let targetLeftHandX = 0
let targetLeftHandY = 0

let mixers = []
let loader = new THREE.GLTFLoader();
const clock = new THREE.Clock();

window.camera = camera

let world = new World(scene)
let plane = new Plane(scene)

camera.position.z = 500
camera.position.y = 200
let cpt = 0
const start = () => {
  renderer.setAnimationLoop( () => {
    update()
    cpt ++
    renderer.render(scene, camera)
  })
}

let rollAngle = 0 // TODO: a mettre dans classe plane ?
let pitchAngle = 0
const update = async () => {
  const delta = clock.getDelta()
  world.moveWaves()
  world.rotate(plane, scene)
  for (let mixer of mixers) {
    mixer.update(delta)
  }
  ambientLight.intensity += - ambientLight.intensity * 0.5
  moveCamera()
  tiltCamera(rollAngle)
  plane.roll(rollAngle)
  plane.pitch(pitchAngle)
  plane.terrainCollisions(scene)
  plane.debrisCollisions(world, scene, ambientLight)
  world.refillListDebris()
  world.moveParticules(scene)
  if (cpt % 1 === 0) {
    let pose = await estimatePoseOnImage()

    let threshold = 0.4
    if (pose.keypoints[10].score > threshold) {
      targetRightHandX = pose.keypoints[10].position.x //* 0.1 -20
      targetRightHandY = -pose.keypoints[10].position.y //* 0.1 +30
    }
    if (pose.keypoints[9].score > threshold) {
      targetLeftHandX = pose.keypoints[9].position.x //* 0.1 -20
      targetLeftHandY = -pose.keypoints[9].position.y //* 0.1 +30
    }
  }
  let coil = 0.1

  m1.position.x += (targetRightHandX - m1.position.x) * coil
  m1.position.y += (targetRightHandY - m1.position.y) * coil
  m2.position.x += (targetLeftHandX - m2.position.x) * coil
  m2.position.y += (targetLeftHandY - m2.position.y) * coil
  pitchAngle = (m1.position.y + m2.position.y) / 2
  let dst = Math.sqrt((m1.position.x - m2.position.x)*(m1.position.x - m2.position.x) + (m1.position.y - m2.position.y)*(m1.position.y - m2.position.y))
  let dst2 = m1.position.x - m2.position.x
  if (dst > dst2) {
    // console.log('oui')
    // console.log(dst)
    // console.log(dst2)
    rollAngle = - Math.acos(dst2 / dst)
  } else {
    // console.log('non')
    rollAngle = 0
  }
  if (m1.position.y < m2.position.y) rollAngle = - rollAngle
  // console.log(tiltAngle)

  // controls.update()
  // light.position.x -= 0.01
}

startCamera()
loadPoseNet(start)






window.onresize = event => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
