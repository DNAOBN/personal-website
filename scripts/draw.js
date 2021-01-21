const ACTIONS = {
  none    : 0,
  drawing : 1,
  moving  : 2
}

class Position {
  constructor(x = null, y = null) {
    this.x = x;
    this.y = y
  }
}
class Path {
  constructor(
    start = new Position,
    end = new Position
  ) {
    this.start = start;
    this.end = end;
  }
}

let currentAction = ACTIONS.none;

let changingPath = new Path();
let lastCursorPosition = new Position();
let canvas;
let ctx;

let paths = [];

window.onload = this.main;

function main () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#f0f0f0";

  canvas.addEventListener("click",  handleClick);
  canvas.addEventListener("mousemove", handleCursorMove);
}

const handleClick = (event) => {
  const currentPosition = new Position(event.offsetX, event.offsetY);
  const currentPath = getPathFromPoint(currentPosition);

  switch (currentAction) {
    case (ACTIONS.none):
      if (currentPath) {
        changingPath = currentPath;
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
  let currentPosition = new Position(event.offsetX, event.offsetY);
  reRender(paths);
  switch (currentAction) {
    case (ACTIONS.drawing):
      let path = paths.pop();
      path.end = currentPosition;
      paths.push(path);
      break;

    case(ACTIONS.moving):
      const deltaX = currentPosition.x - lastCursorPosition.x;
      const deltaY = currentPosition.y - lastCursorPosition.y;
      changingPath.start.x += deltaX;
      changingPath.start.y += deltaY;
      changingPath.end.x += deltaX;
      changingPath.end.y += deltaY;
      break;
  }
  lastCursorPosition = currentPosition;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function reRender(paths = []) {
  clearCanvas();
  paths.forEach(({ start, end }) => {
    ctx.beginPath()
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  })
}

function isPointInPath(point = new Position(), path) {
  let path2d = new Path2D();
  path2d.moveTo(path.start.x, path.start.y);
  path2d.lineTo(path.end.x, path.end.y);
  path2d.closePath();
  return ctx.isPointInStroke(path2d, point.x, point.y);
}

function getPathFromPoint(point = new Position()) {
  return paths.find((path) => isPointInPath(point, path));
}