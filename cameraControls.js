const initControls = (camera, renderer) => new THREE.OrbitControls(camera, renderer.domElement)

let up, down, right, left
const MAX_SPEED = 3
const ACCELERATION = 0.8
let speedX = 0
let speedY = 0
document.onkeydown = event => {
	if (event.keyCode == 90) up 	 = true
	if (event.keyCode == 68) right = true
	if (event.keyCode == 83) down  = true
	if (event.keyCode == 81) left  = true
}
document.onkeyup = event => {
	if (event.keyCode == 90) up 	 = false
	if (event.keyCode == 68) right = false
	if (event.keyCode == 83) down  = false
	if (event.keyCode == 81) left  = false
}

const cameraMover = camera => {
  return () => {
    if (up    == true && speedY > - MAX_SPEED) speedY -= ACCELERATION
  	if (right == true && speedX < + MAX_SPEED) speedX += ACCELERATION
  	if (down  == true && speedY < + MAX_SPEED) speedY += ACCELERATION
  	if (left  == true && speedX > - MAX_SPEED) speedX -= ACCELERATION

  	if (-0.5 < speedX && speedX < 0.5) { speedX = 0 }
  	else {
  		if (speedX > 0)     { speedX -= 0.5 }
  		else if(speedX < 0) { speedX += 0.5 }
  	}

  	if ( -0.5 < speedY && speedY < 0.5)	{ speedY = 0 }
  	else {
  		if (speedY > 0)      { speedY -= 0.5 }
  		else if (speedY < 0) { speedY += 0.5 }
  	}

  	let VectResGetWDir = new THREE.Vector3()
  	let componentX = - speedY * camera.getWorldDirection(VectResGetWDir).x - speedX * camera.getWorldDirection(VectResGetWDir).z
  	let componentY = - speedY * camera.getWorldDirection(VectResGetWDir).z + speedX * camera.getWorldDirection(VectResGetWDir).x

  	camera.position.x += componentX // left right   speedX
  	camera.position.z += componentY // devant derrière speedY 	// A noter : ici composante Y actionne l'axe Z
  	camera.position.y -= speedY * camera.getWorldDirection(VectResGetWDir).y
    camera.updateProjectionMatrix()
  }
}

export {initControls, cameraMover}
