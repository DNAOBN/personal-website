const ACTIONS = {
  none    : 0,
  drawing : 1,
  moving  : 2
}

let currentAction = ACTIONS.none;

let movingPath = {};
let lastCursorPosition = { x: null, y: null };
let canvas;
let ctx;

let paths = [];

window.onload = this.main;

class Path {
  constructor(
    start = { x: null, y: null },
    end = { x: null, y: null }
  ) {
    this.start = start;
    this.end = end;
  }
}

function main () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 10;

  canvas.addEventListener("click",  handleClick);
  canvas.addEventListener("mousemove", handleCursorMove);
}

const handleClick = (event) => {
  const currentPosition = { x: event.offsetX, y: event.offsetY };
  const currentPath = getPathFromPoint(currentPosition);

  switch (currentAction) {
    case (ACTIONS.none):
      if (currentPath) {
        movingPath = currentPath;
        currentAction = ACTIONS.moving
      } else {
        currentAction = ACTIONS.drawing
        let path = new Path(currentPosition, currentPosition);
        paths.push(path);
      };
      break;
    
    case (ACTIONS.drawing):
      let path = paths.pop();
      path.end = currentPosition;
      paths.push(path);
      currentAction = ACTIONS.none;
      break;

    case (ACTIONS.moving):
      currentAction = ACTIONS.none;
      break;
  }
}

function handleCursorMove(event) {
  let currentPosition = { x: event.offsetX, y: event.offsetY };
  re_render(paths);
  if (currentAction == ACTIONS.drawing) {
    let path = paths.pop();
    path.end = currentPosition;
    paths.push(path);
  }
  if (currentAction == ACTIONS.moving) {
    const deltaX = currentPosition.x - lastCursorPosition.x;
    const deltaY = currentPosition.y - lastCursorPosition.y;
    movingPath.start.x += deltaX;
    movingPath.start.y += deltaY;
    movingPath.end.x += deltaX;
    movingPath.end.y += deltaY;
  }
  lastCursorPosition = currentPosition;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function re_render(paths = []) {
  clearCanvas();
  paths.forEach(({ start, end }) => {
    ctx.beginPath()
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  })
}

function isPointInPath(point = { x: null, y: null }, path) {
  let path2d = new Path2D();
  path2d.moveTo(path.start.x, path.start.y);
  path2d.lineTo(path.end.x, path.end.y);
  path2d.closePath();
  return ctx.isPointInStroke(path2d, point.x, point.y);
}

function getPathFromPoint(point = { x: null, y: null }) {
  return paths.find((path) => isPointInPath(point, path));
}