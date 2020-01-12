const WIDTH_CANVAS = 1280
const HEIGHT_CANVAS = 720
const SIZE_CASE = 20
const NB_VERT = WIDTH_CANVAS / SIZE_CASE
const NB_HORI = HEIGHT_CANVAS / SIZE_CASE

let canvasData = document.getElementById('canvasData')
let ctxData = canvasData.getContext('2d')
ctxData.canvas.width = WIDTH_CANVAS
ctxData.canvas.height = HEIGHT_CANVAS

let data = []
let dataLeftHand = new Array(NB_VERT).fill().map(() => new Array(NB_HORI).fill(0))
let dataRightHand = new Array(NB_VERT).fill().map(() => new Array(NB_HORI).fill(0))
const recordData = (leftHand, rightHand) => {
  if (leftHand.x !== 0 && leftHand.y !==0 && rightHand.x !== 0 && rightHand.y !== 0) {
    data.push({
      leftHand: {x: leftHand.x, y: Math.abs(leftHand.y)},
      rightHand: {x: rightHand.x, y: Math.abs(rightHand.y)},
    })
  }
  dataLeftHand[Math.floor(leftHand.x / SIZE_CASE)][Math.floor(Math.abs(leftHand.y) / SIZE_CASE)] += 1
  dataRightHand[Math.floor(rightHand.x / SIZE_CASE)][Math.floor(Math.abs(rightHand.y) / SIZE_CASE)] += 1
}

const drawData = () => {
  ctxData.clearRect(0, 0, canvasData.width, canvasData.height)

  ctxData.strokeStyle = "rgba(0, 0, 0, 0.6)"
  for (let i = 0; i < NB_VERT; i++) {
    ctxData.beginPath()
    ctxData.moveTo(i * SIZE_CASE, 0)
    ctxData.lineTo(i * SIZE_CASE, HEIGHT_CANVAS)
    ctxData.stroke()
  }
  for (let i = 0; i < NB_HORI; i++) {
    ctxData.beginPath()
    ctxData.moveTo(0, i * SIZE_CASE)
    ctxData.lineTo(WIDTH_CANVAS, i * SIZE_CASE)
    ctxData.stroke()
  }

  let maxLeft = Math.max(...dataLeftHand.map(elem => Math.max(...elem)))
  let maxRight = Math.max(...dataRightHand.map(elem => Math.max(...elem)))
  for (let i = 0; i < NB_VERT; i++) {
    for (let j = 0; j < NB_HORI; j++) {
      ctxData.fillStyle = `rgba(${255 * dataLeftHand[i][j] / maxLeft}, ${255 * dataRightHand[i][j] / maxRight}, 0, ${(dataLeftHand[i][j] / maxLeft + dataRightHand[i][j] / maxRight)})`
      ctxData.fillRect(1 + i * SIZE_CASE, 1 + j * SIZE_CASE, SIZE_CASE - 1, SIZE_CASE - 1)
    }
  }
}

export {drawData, recordData}
