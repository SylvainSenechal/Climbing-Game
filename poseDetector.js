navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
let target = 0

let poseNetModel
let video
const WIDTH_VIDEO = 1280
export const HEIGHT_VIDEO = 720

const startCamera = () => {
  navigator.mediaDevices.getUserMedia({audio: false, video: {width: WIDTH_VIDEO, height: HEIGHT_VIDEO, frameRate: { max: 60 }}}).then(
    stream => {
      video = document.getElementById('video')
      video.width = WIDTH_VIDEO
      video.height = HEIGHT_VIDEO
      video.srcObject = stream
      video.onloadedmetadata = e => {
        video.play()
      }
    }
  )
}

let argPoseNet = {
  algorithm: 'Single-pose',
  input: {
    // architecture: 'ResNet50',
    architecture: 'MobileNetV1',
    // outputStride: 16,
    outputStride: 32,
    inputResolution: {width: WIDTH_VIDEO, height: HEIGHT_VIDEO},
    // multiplier: 1.0,
    multiplier: 0.50,
    // quantBytes: 4
    quantBytes: 1
  },
  singlePosedetection: {
    minPoseConfidence: 0.01,
    minPartConfidence: 0.9
  }
}

const loadPoseNet = callback => {
  posenet.load(argPoseNet).then(model => {
    console.log(model)
    poseNetModel = model
    callback()
  })
}


const estimatePoseOnImage = async () => {
  let pose = await poseNetModel.estimateSinglePose(video, {
    flipHorizontal: true,
    decodingMethod: 'single-person'
  })
  // drawPose(pose.keypoints)

  return pose
}

let canvas = document.getElementById('canvas')
let context = canvas.getContext('2d')
context.canvas.width = WIDTH_VIDEO
context.canvas.height = HEIGHT_VIDEO
const drawPose = keypoints => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  // context.fillStyle = "#00ff00"
  // for (let i = 0; i < 16; i++) {
  //   if (keypoints[i].score > 0.3) {
  //     context.beginPath()
  //     context.arc(keypoints[i].position.x, keypoints[i].position.y, 6, 0, 2*Math.PI)
  //     context.fill()
  //   }
  // }
  context.fillStyle = "#ff0000"
  context.beginPath()
  context.arc(keypoints[9].position.x, keypoints[9].position.y, 6, 0, 2*Math.PI)
  context.fill()
  context.fillStyle = "#00ff00"
  context.beginPath()
  context.arc(keypoints[10].position.x, keypoints[10].position.y, 6, 0, 2*Math.PI)
  context.fill()
}

export {loadPoseNet, startCamera, estimatePoseOnImage}
