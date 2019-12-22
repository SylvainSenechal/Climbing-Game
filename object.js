class Wall {
  constructor(scene) {
    let geometry = new THREE.PlaneGeometry(5, 5, 10, 10)
    let material = new THREE.MeshStandardMaterial({
      color: 0x687282,
      side: THREE.DoubleSide,
      flatShading: true,
      roughness: 0.5,
      metalness: 0.1
    })

    this.mesh = new THREE.Mesh(geometry, material)
    scene.add(this.mesh)
  }

  randomize() {
    this.mesh.geometry.vertices = this.mesh.geometry.vertices.map(vertex => ({
      'x': vertex.x,
      'y': vertex.y,
      'z': Math.random()
    }))
    // this.mesh.geometry.vertices = this.mesh.geometry.vertices.map(vertex => vertex)
    for (let vertex of this.mesh.geometry.vertices) {
      console.log(vertex)
    }
  }
}

export {Wall}
