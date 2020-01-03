const SIZE_WORLD = 200
const DETAILS_WORLD = 4
const NB_CLOUDS = 30
class World {
  constructor(scene) {
    this.terrain = new THREE.Group()
    this.sea = new Sea()
    this.ground = new Ground()
    this.sky = new Sky()
    // this.spreadClouds()

    this.terrain.add(this.sea.mesh)
    this.terrain.add(this.ground.mesh)
    // this.terrain.add(this.sky.clouds)
    scene.add(this.sky.clouds)
    scene.add(this.terrain)
  }
  moveWaves = () => this.sea.moveWaves()

  rotate = () => {
    this.terrain.rotateX(0.01)
    this.sky.clouds.rotateX(0.01)
  }

  // spreadClouds = () => {
  //   this.sky.clouds.children.forEach( cloud => {
  //     cloud.rotateX(Math.random() * 360 * Math.PI / 180)
  //   })
  // }
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
    this.center = this.mesh.position
    this.waves = new Array(this.mesh.geometry.vertices.length).fill(0).map( (val, index) => {
      let vertex = this.mesh.geometry.vertices[index]
      return {
        x: vertex.x,
        y: vertex.y,
        z: vertex.z,
        angle: Math.random() * Math.PI * 2,
        amplitude: 0.5 + Math.random() * 1.5,
        speed: 0.016 + Math.random() * 0.032
      }
    })
  }

  moveWaves = () => {
    for (let i = 0; i < this.waves.length; i++) {
      this.mesh.geometry.vertices[i].x = this.waves[i].x + Math.cos(this.waves[i].angle) * this.waves[i].amplitude
      this.mesh.geometry.vertices[i].y = this.waves[i].y + Math.sin(this.waves[i].angle) * this.waves[i].amplitude
      this.waves[i].angle += this.waves[i].speed
    }
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}
let seed = Math.random()
class Ground {
  constructor() {
    this.amplitude = SIZE_WORLD / 2
    this.factor = 30
    this.seed = Math.random()
    this.seededVector = new THREE.Vector3(12.9898, 78.233 + this.seed, 32.87)
    // this.noise = new Float32Array(100000000).fill().map( () => - 1 + 2 * Math.random())
    let geometry = new THREE.IcosahedronGeometry(SIZE_WORLD, DETAILS_WORLD)
    let material = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
      // wireframe: true
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.center = this.mesh.position
    this.genereateTerrain()
  }

  genereateTerrain = () => {
    for (let i = 0; i < this.mesh.geometry.vertices.length; i++) {
      let pointOnTerrain = this.mesh.geometry.vertices[i]
      let direction = new THREE.Vector3()
      console.log(pointOnTerrain.x)
      let distance = this.getInterpolatedNoise(pointOnTerrain.x / this.factor, pointOnTerrain.y / this.factor, pointOnTerrain.z / this.factor)
      let result = new THREE.Vector3()
      direction.subVectors(pointOnTerrain, this.center).normalize()
      direction.addScaledVector(direction, distance)
      this.mesh.geometry.vertices[i].add(direction)
    }
  }

  // getNoise = (x, y, z) => this.noise[Math.floor(x + SIZE_WORLD / this.factor) + Math.floor(y + SIZE_WORLD / this.factor) * SIZE_WORLD + Math.floor(z + SIZE_WORLD / this.factor) * SIZE_WORLD * SIZE_WORLD] * this.amplitude
  getNoise = (x, y, z) => {
    let vector = new THREE.Vector3(x, y, z)
    let noise = vector.dot(this.seededVector)
    noise = Math.sin(noise) * 43758.5453123
    return (- 1 + 2 * (noise - Math.floor(noise))) * this.amplitude
  }
  getSmoothNoise = (x, y, z) => {
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

var xSun = 0
var ySun = 0
var	angXsun = 0
var	angYsun = 0
var amplitude = 4000
function moveSun(){
	shadowLight.position.x = ySun + Math.cos(angXsun) * amplitude
	sun.mesh.position.x    = ySun + Math.cos(angXsun) * amplitude
	shadowLight.position.y = xSun + Math.sin(angYsun) * amplitude
	sun.mesh.position.y    = xSun + Math.sin(angYsun) * amplitude

	angXsun += 0.009
	angYsun += 0.009
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
      color: 0xe6eaf5,
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
    let altitude = SIZE_WORLD * 1.5 + (- 0.5 + 2 * Math.random()) * SIZE_WORLD / 2
    // cloud.position.y = altitude
    cloud.translateOnAxis(new THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2).normalize(), altitude)

    return cloud
  }
}

class Plane {
  constructor(scene) {
    let gPlane = new THREE.BoxGeometry(50, 10, 10)
    let mPlane = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.2,
      // wireframe: true
    })
    let plane = new THREE.Mesh(gPlane, mPlane)
    plane.position.z = 300
    let gWings = new THREE.BoxGeometry(60, 2, 12)
    let wings = new THREE.Mesh(gWings, mPlane)
    wings.rotateY(90 * Math.PI / 180)
    plane.rotateY(90 * Math.PI / 180)
    scene.add(plane)
    plane.add(wings)
    console.log(plane)
    this.plane = plane
  }

  tilt = angle => {
    // this.plane.rotateX(angle * Math.PI / 180)
    this.plane.rotateX(angle)
  }
}

export {World, Plane}
