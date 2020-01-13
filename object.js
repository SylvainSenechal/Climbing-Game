import {HEIGHT_VIDEO} from './poseDetector.js'

const SIZE_WORLD = 300
const DETAILS_WORLD = 5
const NB_CLOUDS = 200
const OCTAVES = 3
const NB_DEBRIS = 50
const COLLISION_DAMAGE = 19
const NB_FUEL = 50
const NB_PARTICULES_ON_EXPLOSION = 10
const PARTICULES_LIFESPAN = 20

class World {
  constructor(scene) {
    this.terrain = new THREE.Group()
    this.sea = new Sea()
    this.ground = new Ground()
    this.sky = new Sky()
    this.listDebris = new THREE.Group()
    this.refillListDebris()
    this.listParticules = []
    this.listFuel = new THREE.Group()
    this.refillListFuel()

    this.terrain.add(this.sea.mesh)
    this.terrain.add(this.ground.mesh)

    scene.add(this.sky.clouds)
    scene.add(this.listDebris)
    scene.add(this.listFuel)
    scene.add(this.terrain)
    this.terrain.name = "terrain"
  }

  refillListDebris = () => Debris.fillListDebris(this.listDebris, NB_DEBRIS)
  refillListFuel = () => Fuel.fillListFuel(this.listFuel, NB_FUEL)

  moveParticules = scene => {
    this.listParticules = this.listParticules.filter(particule => !particule.lifeCycle(scene))
  }

  moveWaves = () => this.sea.moveWaves()

  rotate = (plane, scene) => {
    let angle = - plane.plane.rotation.z * 0.01
    let speed = 0.005
    this.terrain.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), speed)
    this.terrain.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle)

    this.sky.clouds.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), speed)
    this.sky.clouds.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle)

    this.listDebris.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), speed)
    this.listDebris.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle)

    this.listFuel.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), speed)
    this.listFuel.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle)

    for (let particule of this.listParticules) {
      particule.pivot.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), speed)
      particule.pivot.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle)
    }
    for (let fuel of this.listFuel.children) {
      fuel.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.random() * 0.02)
      fuel.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.random() * 0.02)
      fuel.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), Math.random() * 0.02)
    }
  }
}

class Sea {
  constructor() {
    let geometry = new THREE.IcosahedronGeometry(SIZE_WORLD, DETAILS_WORLD)
    let material = new THREE.MeshStandardMaterial({
      color: 0x42e3f5,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.8
      // wireframe: true
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.name = "sea"
    this.center = this.mesh.position
    this.waves = new Array(this.mesh.geometry.vertices.length).fill(0).map( (val, index) => {
      let vertex = this.mesh.geometry.vertices[index]
      return {
        x: vertex.x,
        y: vertex.y,
        z: vertex.z,
        angle: Math.random() * Math.PI * 2,
        amplitude: 0.5 + Math.random() * 2.5,
        speed: 0.02 + Math.random() * 0.06
      }
    })
  }

  moveWaves = () => {
    for (let i = 0; i < this.waves.length; i++) {
      this.mesh.geometry.vertices[i].x = this.waves[i].x + Math.cos(this.waves[i].angle) * this.waves[i].amplitude
      this.mesh.geometry.vertices[i].y = this.waves[i].y + Math.sin(this.waves[i].angle) * this.waves[i].amplitude
      this.waves[i].angle += this.waves[i].speed
    }
    this.mesh.geometry.verticesNeedUpdate = true
  }
}
let seed = Math.random()
class Ground {
  constructor() {
    this.amplitude = SIZE_WORLD / 1.5
    this.factor = 15
    this.seed = Math.random()
    this.seededVector = new THREE.Vector3(12.9898, 78.233 + this.seed, 32.87)
    // this.noise = new Float32Array(100000000).fill().map( () => - 1 + 2 * Math.random())
    let geometry = new THREE.IcosahedronGeometry(SIZE_WORLD, DETAILS_WORLD)
    let material = new THREE.MeshStandardMaterial({
      vertexColors: THREE.FaceColors,
      // color: new THREE.Color('aliceblue'),
      // color: new THREE.Color(0xff0000),
      // color: new THREE.Color(0x000000),
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
      // wireframe: true
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.name = "ground"
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.center = this.mesh.position
    this.genereateTerrain()
  }

  genereateTerrain = () => {
    console.log(this.mesh.geometry.vertices.length)
    for (let i = 0; i < this.mesh.geometry.vertices.length; i++) {
      let pointOnTerrain = this.mesh.geometry.vertices[i]
      let direction = new THREE.Vector3()
      // let distance = this.getInterpolatedNoise(pointOnTerrain.x / this.factor, pointOnTerrain.y / this.factor, pointOnTerrain.z / this.factor)
      let distance = this.generateHeight(pointOnTerrain.x, pointOnTerrain.y, pointOnTerrain.z)
      let result = new THREE.Vector3()
      direction.subVectors(pointOnTerrain, this.center).normalize()
      direction.addScaledVector(direction, distance)
      this.mesh.geometry.vertices[i].add(direction)
      // this.mesh.geometry.vertices[i].x += - 3 + Math.random() * 6
      // this.mesh.geometry.vertices[i].y += - 3 + Math.random() * 6
      // this.mesh.geometry.vertices[i].z += - 3 + Math.random() * 6
    }
    for (let i = 0; i < this.mesh.geometry.faces.length; i++) {
      let v1 = this.mesh.geometry.faces[i].a
      let v2 = this.mesh.geometry.faces[i].b
      let v3 = this.mesh.geometry.faces[i].c
      let altitude1 = this.mesh.geometry.vertices[v1].distanceTo(new THREE.Vector3(0, 0, 0))
      let altitude2 = this.mesh.geometry.vertices[v2].distanceTo(new THREE.Vector3(0, 0, 0))
      let altitude3 = this.mesh.geometry.vertices[v3].distanceTo(new THREE.Vector3(0, 0, 0))
      let altitude = (altitude1 + altitude2 + altitude3) / 3
      if (altitude > 335) {
        this.mesh.geometry.faces[i].color.set(new THREE.Color('snow')) // https://en.wikipedia.org/wiki/X11_color_names
      } else if (altitude > 310) {
        this.mesh.geometry.faces[i].color.set(new THREE.Color('sienna'))
      } else if (altitude > 300) {
        this.mesh.geometry.faces[i].color.set(new THREE.Color('yellowgreen'))
      } else {
        this.mesh.geometry.faces[i].color.set(new THREE.Color('khaki'))
      }
      // this.mesh.geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random())
    }
    this.mesh.geometry.colorsNeedUpdate = true
  }

  generateHeight = (x, y, z) => {
    let height = 0
    for (let i = 0; i < OCTAVES; i++) {
      let divider = SIZE_WORLD / 8 / (i + 1)
      height += this.getInterpolatedNoise(x / divider, y / divider, z / divider) / (i + 1.5)
    }
    return height
  }

  // getNoise = (x, y, z) => this.noise[Math.floor(x + SIZE_WORLD / this.factor) + Math.floor(y + SIZE_WORLD / this.factor) * SIZE_WORLD + Math.floor(z + SIZE_WORLD / this.factor) * SIZE_WORLD * SIZE_WORLD] * this.amplitude
  getNoise = (x, y, z) => {
    let vector = new THREE.Vector3(x, y, z)
    let noise = vector.dot(this.seededVector)
    noise = Math.sin(noise) * 43758.5453123
    return (- 1 + 2 * (noise - Math.floor(noise))) * this.amplitude
  }
  getSmoothNoise = (x, y, z) => { // Cubic smoothing
    let mid = this.getNoise(x, y, z)
    let coinHaut = this.getNoise(x + 1, y + 1, z + 1) + this.getNoise(x - 1, y + 1, z - 1) + this.getNoise(x + 1, y + 1, z - 1) + this.getNoise(x - 1, y + 1, z + 1)
    let coinBas  = this.getNoise(x + 1, y - 1, z + 1) + this.getNoise(x - 1, y - 1, z - 1) + this.getNoise(x + 1, y - 1, z - 1) + this.getNoise(x - 1, y - 1, z + 1)
    let adjacentUn = this.getNoise(x + 1, y, z) + this.getNoise(x - 1, y, z) + this.getNoise(x, y + 1, z) + this.getNoise(x, y - 1, z) + this.getNoise(x, y, z + 1) + this.getNoise(x, y, z - 1)
    let adjacentDeux = this.getNoise(x + 1, y + 1, z) + this.getNoise(x + 1, y - 1, z) + this.getNoise(x + 1, y, z + 1) + this.getNoise(x + 1, y, z - 1)
    let adjacentDeuxBis = this.getNoise(x - 1, y + 1, z) + this.getNoise(x - 1, y - 1, z) + this.getNoise(x - 1, y, z + 1) + this.getNoise(x - 1, y, z - 1)
    let adjacentDeuxBisBis = this.getNoise(x, y + 1, z + 1) + this.getNoise(x, y + 1, z - 1) + this.getNoise(x, y - 1, z + 1) + this.getNoise(x, y - 1, z - 1)
    return (mid/8 + coinHaut/32 + coinBas/32 + adjacentUn/16 + adjacentDeux/24 + adjacentDeuxBis/24 + adjacentDeuxBisBis/24)
  }

  getInterpolatedNoise = (x, y, z) => { // trilinear interpolation
    let intX = Math.floor(x)
    let intY = Math.floor(y)
    let intZ = Math.floor(z)
    let floatX = x - intX
    let floatY = y - intY
    let floatZ = z - intZ

    let height1 = this.getSmoothNoise(intX, intY, intZ)
    let height2 = this.getSmoothNoise(intX + 1, intY, intZ)
    let height3 = this.getSmoothNoise(intX, intY + 1, intZ)
    let height4 = this.getSmoothNoise(intX + 1, intY + 1, intZ)
    let i1 = this.interpolate(height1, height2, floatX)
    let i2 = this.interpolate(height3, height4, floatX)
    let i3 = this.interpolate(i1, i2, floatY)

    let height5 = this.getSmoothNoise(intX, intY, intZ + 1)
    let height6 = this.getSmoothNoise(intX + 1, intY, intZ + 1)
    let height7 = this.getSmoothNoise(intX, intY + 1, intZ + 1)
    let height8 = this.getSmoothNoise(intX + 1, intY + 1, intZ + 1)
    let i4 = this.interpolate(height1, height2, floatX)
    let i5 = this.interpolate(height3, height4, floatX)
    let i6 = this.interpolate(i1, i2, floatY)

    return this.interpolate(i3, i6, floatZ)
  }

  interpolate = (a, b, blend) => {
    let theta = blend * Math.PI
    let f = (1 - Math.cos(theta)) * 0.5
    return a * (1 - f) + b * f
  }
}

class Sky {
  constructor() {
    this.clouds = this.createSky()
    // this.cloud = this.createCloud()
    // this.cloud = this.createCloud()
  }
  createSky = () => {
    let sky = new THREE.Group()
    for (let i = 0; i < NB_CLOUDS; i++) {
      let cloud = this.createCloud()
      sky.add(cloud)
    }
    return sky
  }
  createCloud = () => {
    let cloud = new THREE.Group()
    let nbSubClouds = 2 + Math.floor(Math.random() * 4)
    let materialCloud = new THREE.MeshStandardMaterial({
      color: 0xe1f7f7,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.5 + Math.random() * 0.4
    })
    for (let i = 0; i < nbSubClouds; i++) {
      let geometryCloud = new THREE.BoxGeometry(
        SIZE_WORLD / 25 + Math.random() * SIZE_WORLD / 15,
        SIZE_WORLD / 25 + Math.random() * SIZE_WORLD / 15,
        SIZE_WORLD / 25 + Math.random() * SIZE_WORLD / 15
      )
      let subCloud = new THREE.Mesh(geometryCloud, materialCloud)
      subCloud.castShadow = true
      // subCloud.receiveShadow = true
      subCloud.position.set(
        SIZE_WORLD / 25 + Math.random() * SIZE_WORLD / 10,
        SIZE_WORLD / 25 + Math.random() * SIZE_WORLD / 10,
        SIZE_WORLD / 25 + Math.random() * SIZE_WORLD / 10
      )
      subCloud.rotateX(Math.random() * 360 * Math.PI / 180)
      subCloud.rotateY(Math.random() * 360 * Math.PI / 180)
      subCloud.rotateZ(Math.random() * 360 * Math.PI / 180)
      cloud.add(subCloud)
    }
    let altitude = SIZE_WORLD * 1.5 + (2 * Math.random()) * SIZE_WORLD / 5
    // cloud.position.y = altitude
    cloud.translateOnAxis(new THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2).normalize(), altitude)

    return cloud
  }
}

class Plane {
  constructor(scene) {
    this.condition = 100
    this.fuel = 1000
    this.targetRollAngle = 0
    this.targetPitchAngle = 0
    this.raycaster = new THREE.Raycaster()
    this.raycaster.near = 10
    this.raycaster.far = 50
    let gPlane = new THREE.BoxGeometry(10, 10, 50)
    let mPlane = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
      // wireframe: true
    })
    let plane = new THREE.Mesh(gPlane, mPlane)
    plane.position.z = 250 // SIZE_WORLD + 50
    plane.position.y = 250
    let mWings = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
      // wireframe: true
    })
    let gWings = new THREE.BoxGeometry(60, 2, 12)
    let wings = new THREE.Mesh(gWings, mWings)
    // wings.rotateY(90 * Math.PI / 180)
    scene.add(plane)
    plane.add(wings)
    // plane.rotateY(90 * Math.PI / 180)repartition
    this.plane = plane
    this.plane.name = "plane"

    this.raycaster.set(this.plane.position, new THREE.Vector3(0, -1, 0))
  }

  roll = angle => {
    this.targetRollAngle = - angle
    // this.plane.rotateX(angle * Math.PI / 180)
    // this.plane.rotation.x += angle * 0.01
    this.plane.rotation.z += (this.targetRollAngle - this.plane.rotation.z) * 0.05
    // console.log(this.plane.rotation.x)
  }

  pitch = angle => {
    this.targetPitchAngle = - ((HEIGHT_VIDEO - Math.abs(angle)) / HEIGHT_VIDEO - 0.5) // Normalize in [-0.5, 0.5]
    // console.log(this.targetPitchAngle)
    this.plane.rotation.x += (this.targetPitchAngle - this.plane.rotation.x) * 0.15
    let minAltitude = 50
    let maxAltitude = 150
    this.plane.position.y += this.plane.rotation.x
    this.plane.position.y = Math.max(Math.min(this.plane.position.y, 150), 50)
    // console.log(this.plane.position.y)
  }

  terrainCollisions = scene => {
    let intersected = this.raycaster.intersectObjects(scene.children, true)
    for (let i = 0; i < intersected.length; i++) {
      if (intersected[i].object.name === "ground" || intersected[i].object.name === "sea") {
        // console.log(intersected[i].object)
      }
      // intersected[i].object.position.y += 0.1
    }
    // console.log(scene.children)
    // scene.children[4].geometry.elementsNeedUpdate = true;
    // scene.children[5].geometry.elementsNeedUpdate = true;
  }

  debrisCollisions = (world, scene, ambientLight) => {
    for (let debris of world.listDebris.children) {
      let debrisPosition = new THREE.Vector3()
      debris.getWorldPosition(debrisPosition)
      let distance = debrisPosition.distanceTo(this.plane.position)
      if (distance < 150) {
        this.condition = Math.max(this.condition - COLLISION_DAMAGE, 1)
        for (let i = 0; i < NB_PARTICULES_ON_EXPLOSION; i++) {
          world.listParticules.push(new Particule(scene, debrisPosition, "debris"))
        }
        ambientLight.intensity = 2
        world.listDebris.remove(debris)
      }
    }
  }

  fuelCollisions = (world, scene, ambientLight) => {
    for (let fuel of world.listFuel.children) {
      let fuelPosition = new THREE.Vector3()
      fuel.getWorldPosition(fuelPosition)
      let distance = fuelPosition.distanceTo(this.plane.position)
      if (distance < 150) {
        this.fuel += 300
        for (let i = 0; i < NB_PARTICULES_ON_EXPLOSION; i++) {
          world.listParticules.push(new Particule(scene, fuelPosition, "fuel"))
        }
        world.listFuel.remove(fuel)
      }
    }
  }
}

class Debris {
  constructor() {
    let materialDebris = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
    })
    let geometryDebris = new THREE.IcosahedronGeometry(SIZE_WORLD / 25, 1)
    let altitude = SIZE_WORLD * 1.5 + (- 0.5 + 2 * Math.random()) * SIZE_WORLD / 2
    this.mesh = new THREE.Mesh(geometryDebris, materialDebris)
    this.mesh.translateOnAxis(new THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2).normalize(), altitude)
  }

  static fillListDebris(listDebris, nbDebris) {
    let nbNewDebris = nbDebris - listDebris.children.length
    for (let i = 0; i < nbNewDebris; i++) {
      listDebris.add(new Debris().mesh)
    }
  }
}

class Fuel {
  constructor() {
    let materalFuel = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
    })
    let geometryFuel = new THREE.TorusGeometry(SIZE_WORLD / 35, 2, 8, 12, Math.PI * 2)//(SIZE_WORLD / 35, 0)
    let altitude = SIZE_WORLD * 1.5 + (- 0.5 + 2 * Math.random()) * SIZE_WORLD / 2
    this.mesh = new THREE.Mesh(geometryFuel, materalFuel)
    this.mesh.translateOnAxis(new THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2).normalize(), altitude)
    this.rotationDirection = new THREE.Vector3(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random())
  }
  static fillListFuel(listFuel, nbFuel) {
    let nbNewFuel = nbFuel - listFuel.children.length
    for (let i = 0; i < nbNewFuel; i++) {
      listFuel.add(new Fuel().mesh)
    }
  }
}

class Particule {
  constructor(scene, position, type) {
    let color = type === "debris" ? 0xff0000 : 0x00ff00
    let materialParticules = new THREE.MeshStandardMaterial({
      color: color,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
    })
    let geometryParticules
    if (type === "debris") {
      geometryParticules = new THREE.IcosahedronGeometry(SIZE_WORLD / 50, 1)
    } else {
      geometryParticules = new THREE.OctahedronGeometry(SIZE_WORLD / 75, 0)
    }

    this.mesh = new THREE.Mesh(geometryParticules, materialParticules)
    this.mesh.position.set(position.x + Math.random() * 15, position.y + Math.random() * 15, position.z + Math.random() * 15)
    this.direction = new THREE.Vector3(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random())
    this.life = 0
    this.pivot = new THREE.Group()
    this.pivot.add(this.mesh)
    scene.add(this.pivot)
  }

  lifeCycle = scene => {
    this.life += 1
    this.mesh.geometry.scale(0.93, 0.93, 0.93)
    this.mesh.position.x += this.direction.x * 3
    this.mesh.position.y += this.direction.y * 3
    this.mesh.position.z += this.direction.z * 3
    if (this.life === PARTICULES_LIFESPAN) {
      scene.remove(this.pivot)
      return true
    }
  }
}

export {World, Plane}
