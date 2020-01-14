import init from './sceneSetup.js'
import {World, Plane} from './object.js'
import {initControls, cameraMover, cameraTilter} from './cameraControls.js'
import {loadPoseNet, startCamera, estimatePoseOnImage} from './poseDetector.js'
import {drawData, recordData} from './dataManager.js'

let {scene, camera, renderer, light, ambientLight} = init()
// let controls = initControls(camera, renderer)
let moveCamera = cameraMover(camera)
let tiltCamera = cameraTilter(camera)
const gameStatus = {
  gameRunning: false,
  dataMenuOpened: false,
  score: 0,
}

const CAMERA_Y_GAME_ON = 460
const CAMERA_Z_GAME_ON = 100
const CAMERA_Y_GAME_OFF = 300
const CAMERA_Z_GAME_OFF = 800
const CAMERA_ROTATION_GAME_OFF = - 0.27
const CAMERA_ROTATION_GAME_ON = - 0.7

let divScore = document.getElementById("scoreValue")
let divFuel = document.getElementById("fuelValue")
let divAirplaneCondition = document.getElementById("sliderFront")
let gameMenu = document.getElementById("gameMenu")
let buttonStart = document.getElementById("startGame")
let buttonPause = document.getElementById("pause")
let buttonData = document.getElementById("data")
let containerData = document.getElementById("containerData")
buttonStart.onclick = event => {
  console.log('start click')
  gameMenu.style.opacity = 0
  gameStatus.score = 0
  restartGame()
}
buttonData.onclick = event => {
  console.log('click data')
  if (gameStatus.dataMenuOpened === false) {
    gameStatus.gameRunning = false
    gameStatus.dataMenuOpened = true
    containerData.style.opacity = 1
    gameMenu.style.opacity = 0
  } else {
    gameStatus.gameRunning = true
    gameStatus.dataMenuOpened = false
    containerData.style.opacity = 0
    gameMenu.style.opacity = 1
  }
}
buttonPause.onclick = event => {
  if (gameStatus.gameRunning === true) {
    gameStatus.gameRunning = false
  } else {
    gameStatus.gameRunning = true
  }
}

let rightHand = {x: 0, y: 0}
let leftHand = {x: 0, y: 0}
let targetRightHandX = 0
let targetRightHandY = 0
let targetLeftHandX = 0
let targetLeftHandY = 0

const clock = new THREE.Clock()

window.camera = camera

let world = new World(scene)
let plane
// let plane = new Plane(scene)
console.log(scene)
// plane.plane.add(camera)

camera.position.y = CAMERA_Y_GAME_OFF
camera.position.z = CAMERA_Z_GAME_OFF
camera.rotation.x = CAMERA_ROTATION_GAME_ON

const start = () => {
  renderer.setAnimationLoop( () => {
    update()
    renderer.render(scene, camera)
  })
}
const updateMenuInfos = () => {
  gameStatus.score += 1
  plane.fuel -= 1
  divScore.innerHTML = gameStatus.score
  divFuel.innerHTML = plane.fuel
  divAirplaneCondition.style.width = `${plane.condition * 1.06}px` // condition lifebar is 106px wide
  divAirplaneCondition.style.background = `rgb(${255 - plane.condition * 2.55}, ${plane.condition * 2.55}, 0)`
}

const checkLost = () => {
  if (plane.condition <= 1 || plane.fuel < 0) {
    console.log("lost")
    gameStatus.gameRunning = false
    gameMenu.style.opacity = 1
  }
}

let rollAngle = 0 // TODO: a mettre dans classe plane ?
let pitchAngle = 0

const restartGame = () => {
  gameStatus.score = 0
  scene.remove(scene.getObjectByName( "plane" ))
  plane = new Plane(scene)
  gameStatus.gameRunning = true
}

const update = () => {
  ambientLight.intensity += - ambientLight.intensity * 0.5
  moveCamera()
  tiltCamera(rollAngle) // TODO: voir utilite
  if (gameStatus.gameRunning === true) {
    let deltaTime = clock.getDelta()

    updateMenuInfos()
    world.moveWaves()
    world.rotate(plane, scene)
    world.moveParticules(scene)
    plane.roll(rollAngle)
    plane.pitch(pitchAngle)
    plane.terrainCollisions(scene)
    plane.debrisCollisions(world, scene, ambientLight)
    world.refillListDebris()
    plane.fuelCollisions(world, scene, ambientLight)
    world.refillListFuel()
    checkLost()

    updateHandsPosition(deltaTime)
    recordData(leftHand, rightHand)
  }

  if (gameStatus.gameRunning === true) {
    camera.position.y += (CAMERA_Y_GAME_ON - camera.position.y) * 0.01
    camera.position.z += (CAMERA_Z_GAME_ON - camera.position.z) * 0.01
    camera.rotation.x += (CAMERA_ROTATION_GAME_ON - camera.rotation.x) * 0.01
  } else {
    camera.position.y += (CAMERA_Y_GAME_OFF - camera.position.y) * 0.01
    camera.position.z += (CAMERA_Z_GAME_OFF - camera.position.z) * 0.01
    camera.rotation.x += (CAMERA_ROTATION_GAME_OFF - camera.rotation.x) * 0.01
  }

  if (gameStatus.dataMenuOpened === true) {
    drawData()
  }
}
let timeLastUpdate = 0
const updateHandsPosition = async deltaTime => {
  timeLastUpdate += deltaTime
  if (timeLastUpdate > 0.1) {
    timeLastUpdate = 0
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

// document.onclick = e => {
//   let elem = document.body
//   elem.requestPointerLock = elem.requestPointerLock || elem.mozRequestPointerLock
//   elem.requestPointerLock()
// }
