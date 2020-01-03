import init from './sceneSetup.js'
import {World, Plane} from './object.js'
import {initControls, cameraMover} from './cameraControls.js'
import {loadPoseNet, startCamera, estimatePoseOnImage} from './poseDetector.js'





let {scene, camera, renderer, light} = init()
// let controls = initControls(camera, renderer)
let moveCamera = cameraMover(camera)

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


// let sea = new Sea(scene)
// let terrain = new Terrain(scene)
let world = new World(scene)
let plane = new Plane(scene)
camera.position.z = 400

let cpt = 0
const start = () => {
  renderer.setAnimationLoop( () => {
    update()
    cpt ++
    renderer.render(scene, camera)
  })
}

let tiltAngle = 0

const update = async () => {
  const delta = clock.getDelta()
  world.moveWaves()
  world.rotate()
  for (let mixer of mixers) {
    mixer.update(delta)
  }
  // m.skeleton.bones[0].rotation.x += 0.02
  // m.skeleton.bones[0].rotation.y += 0.005
  // obj.getObjectByName('epauleD').rotation.x += 0.01
  // obj.getObjectByName('epauleD').getObjectByName('coudeD').rotation.x += 0.01
  moveCamera()
  plane.tilt(tiltAngle)
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
  let dst = Math.sqrt((m1.position.x - m2.position.x)*(m1.position.x - m2.position.x) + (m1.position.y - m2.position.y)*(m1.position.y - m2.position.y))
  let dst2 = m1.position.x - m2.position.x
  if (dst > dst2) {
    // console.log('oui')
    // console.log(dst)
    // console.log(dst2)
    tiltAngle = - Math.acos(dst2 / dst)
  } else {
    // console.log('non')
    tiltAngle = 0
  }
  if (m1.position.y < m2.position.y) tiltAngle = - tiltAngle
  // console.log(tiltAngle)

  // controls.update()
  // light.position.x -= 0.01
}

startCamera()
loadPoseNet(start)

var bones = [];

var shoulder = new THREE.Bone();
var elbow = new THREE.Bone();
var hand = new THREE.Bone();

shoulder.add( elbow );
elbow.add( hand );

bones.push( shoulder );
bones.push( elbow );
bones.push( hand );

shoulder.position.y = -5;
elbow.position.y = 0;
hand.position.y = 5;

let geometry = new THREE.PlaneBufferGeometry(5, 5, 10, 10)
let material = new THREE.MeshStandardMaterial({
  color: 0x687282,
  side: THREE.DoubleSide,
  flatShading: true,
  roughness: 0.5,
  metalness: 0.1
})

let m
let obj
// let claviculeG, claviculeD
// let brasG, brasD
// let avantBrasG, avantBrasD
let epauleG, coudeG, mainG
loader.load( 'person.glb', gltf => {

  obj = gltf.scene.getObjectByName("corps")
  console.log(obj)
  obj.rotation.y = -90
  // avantBrasG = obj.skeleton.bones[3]
  // brasG = obj.skeleton.bones[2]
  // claviculeG = obj.skeleton.bones[1]

  epauleG = obj.getObjectByName("epauleG")
  coudeG = obj.getObjectByName("coudeG")
  mainG = obj.getObjectByName("mainG")
  scene.add(obj);

  // m = obj.children[2]
  // console.log(m.bones)
  // console.log(m)
  // let helper = new THREE.SkeletonHelper(obj)
  // helper.material.linewidth = 3;
  // scene.add(helper)
}, undefined, error => {
	console.error(error)
}) // TODO: ADD LOADER %





window.onresize = event => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
