var flipHorizontal = false;
console.log("OUI")
var imageElement = document.getElementById('img');
console.log(imageElement)

console.log("NOOOOOOOOON")
posenet.load().then(function(net) {
  console.log(imageElement)
  const pose = net.estimateSinglePose(imageElement, {
    flipHorizontal: true
  });
  return pose;
}).then(function(pose){
  console.log(pose);
  // pose.keypoints[0-16].(score, part, position(x,y))

  unityInstance.SendMessage("Cube","SetGameObjectPosition", 1.0);
  // let sentPos = JSON.stringify(pose.keypoints[0].position)
  // unityInstance.SendMessage("Cube", "SetGameObjectPosition2", JSON.stringify(b))
})


//
// async function estimate(net) {
//   // image = getimg();
//   image = document.getElementById('img');
//   const poses = await net.estimateSinglePose(image, {
//     flipHorizontal: true
//   })
//   predicted = poses
//   console.log(predicted)
// }
//
//
// async function loadNet() {
//   const net = await posenet.load()
//   return net
// }
//
// let net = loadNet()
// estimate(net)
