import init from './sceneSetup.js'
import {World, Plane} from './object.js'
import {initControls, cameraMover, cameraTilter} from './cameraControls.js'
import {loadPoseNet, startCamera, estimatePoseOnImage} from './poseDetector.js'

let {scene, camera, renderer, light, ambientLight} = init()
// let controls = initControls(camera, renderer)
let moveCamera = cameraMover(camera)
let tiltCamera = cameraTilter(camera)
const player = {
  gameOn: false,
  score: 0,
}
let divScore = document.getElementById("scoreValue")
let divFuel = document.getElementById("fuelValue")

let rightHand = {x: 0, y: 0}
let leftHand = {x: 0, y: 0}


let targetRightHandX = 0
let targetRightHandY = 0
let targetLeftHandX = 0
let targetLeftHandY = 0

const clock = new THREE.Clock()

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

const updateMenuInfos = () => {
  player.score += 1
  plane.fuel -= 1
  divScore.innerHTML = player.score
  divFuel.innerHTML = plane.fuel
}

let rollAngle = 0 // TODO: a mettre dans classe plane ?
let pitchAngle = 0
const update = async () => {
  let deltaTime = clock.getDelta()

  updateMenuInfos()
  world.moveWaves()
  world.rotate(plane, scene)
  ambientLight.intensity += - ambientLight.intensity * 0.5
  moveCamera()
  tiltCamera(rollAngle)
  plane.roll(rollAngle)
  plane.pitch(pitchAngle)
  plane.terrainCollisions(scene)
  plane.debrisCollisions(world, scene, ambientLight)
  world.refillListDebris()
  plane.fuelCollisions(world, scene, ambientLight)
  world.refillListFuel()
  world.moveParticules(scene)
  if (cpt % 1 === 0) {
    let pose = await estimatePoseOnImage()

    let threshold = 0.4
    if (pose.keypoints[10].score > threshold) {
      targetRightHandX = pose.keypoints[10].position.x
      targetRightHandY = - pose.keypoints[10].position.y
    }
    if (pose.keypoints[9].score > threshold) {
      targetLeftHandX = pose.keypoints[9].position.x
      targetLeftHandY = - pose.keypoints[9].position.y
    }
  }
  let coil = 0.1

  rightHand.x += (targetRightHandX - rightHand.x) * coil
  rightHand.y += (targetRightHandY - rightHand.y) * coil
  leftHand.x += (targetLeftHandX - leftHand.x) * coil
  leftHand.y += (targetLeftHandY - leftHand.y) * coil
  pitchAngle = (rightHand.y + leftHand.y) / 2
  let dst = Math.sqrt((rightHand.x - leftHand.x)*(rightHand.x - leftHand.x) + (rightHand.y - leftHand.y)*(rightHand.y - leftHand.y))
  let dst2 = rightHand.x - leftHand.x
  if (dst > dst2) {
    rollAngle = - Math.acos(dst2 / dst)
  } else {
    rollAngle = 0
  }
  if (rightHand.y < leftHand.y) rollAngle = - rollAngle
}

startCamera()
loadPoseNet(start)


window.onresize = event => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

document.onclick = e => {
  let elem = document.body
  elem.requestPointerLock = elem.requestPointerLock || elem.mozRequestPointerLock
  elem.requestPointerLock()
}
