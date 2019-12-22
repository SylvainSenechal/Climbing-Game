function rayMouse() {
	var raycasterMouse = new THREE.Raycaster();
	raycasterMouse.near = 0
	raycasterMouse.far  = 10000
	raycasterMouse.setFromCamera( mouse, camera );
	var intersectsMouse = raycasterMouse.intersectObjects( scene.children, true );
	for (let i=0; i<intersectsMouse.length; i++) {
		if(i == 0){
      console.log('non')
      // intersectsMouse[0].object.position.x += 1
      // intersectsMouse[0].object.position.y += 1
      // intersectsMouse[0].object.position.z += 1
      intersectsMouse[0].object.verticesNeedUpdate = true
      console.log(intersectsMouse[0])
      // intersectsMouse[0].object.geometry.vertices[0] += 0.001
			// var ee = mesh.geometry.vertices;
			// ee[intersectsMouse[i].face.a].y += 0.5
			// ee[intersectsMouse[i].face.b].y += 0.5
			// ee[intersectsMouse[i].face.c].y += 0.5
			//console.log("x : " + intersectsMouse[i].point.x + "y : " + intersectsMouse[i].point.y + "z : " + intersectsMouse[i].point.z)
			// poser.x = intersectsMouse[i].point.x
			// poser.y = intersectsMouse[i].point.y
			// poser.z = intersectsMouse[i].point.z
			/*
			sea.mesh.geometry.vertices[intersectsMouse[i].face.a].y += 0.5
			sea.mesh.geometry.vertices[intersectsMouse[i].face.b].y += 0.5
			sea.mesh.geometry.vertices[intersectsMouse[i].face.c].y += 0.5
			*/
			//sea.mesh.geometry.verticesNeedUpdate = true;
			// couleur en rouge face
			// intersectsMouse[0].face.color.setRGB(255,0,0);
			// intersectsMouse[0].object.geometry.elementsNeedUpdate = true;
		}
	}
}
