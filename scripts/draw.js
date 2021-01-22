const TIP_RADIUS = 5;

class Position {
  constructor(x = null, y = null) {
    this.x = x;
    this.y = y
  }
}

class Path {
  constructor(
    start = new Position,
    end = new Position,
    color = "#FFFFFF"
  ) {
    this.start = start;
    this.end = end;
    this.color = color;
  }
}

const ACTIONS = {
  none        : 0,
  drawing     : 1,
  movingPath  : 2,
  movingTip   : 3,
  movingMiddle: 4
}

let currentAction = ACTIONS.none;

let changingPath = new Path();
let changingTip = new Position();
let lastCursorPosition = new Position();
let canvas;
let ctx;

let paths = [];

window.onload = this.main;

function main () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#f0f0f0";

  canvas.addEventListener("click",  handleClick);
  canvas.addEventListener("mousemove", handleCursorMove);
  canvas.addEventListener("contextmenu", handleRightClick);
}

const handleClick = (event) => {
  const currentPosition = new Position(event.offsetX, event.offsetY);

  switch (currentAction) {
    case (ACTIONS.none):
      const currentPath = getPathFromPoint(currentPosition);

      if (currentPath) {
        const currentPathTip = getPathTipFromPoint(currentPosition, currentPath)

        if (currentPathTip) {
          console.log('Started moving Tip');
          changingPath = currentPath
          changingTip = currentPathTip;
          currentAction = ACTIONS.movingTip;
        } else {
          console.log('Started moving path');
          changingPath = currentPath;
          currentAction = ACTIONS.movingPath
        }
        
      } else {
        console.log('Starting path');
        paths.push(new Path(currentPosition, currentPosition));
        currentAction = ACTIONS.drawing
      };
      break;
    
    case (ACTIONS.drawing):
      console.log('Finished Path');
      let path = { ...paths.pop(), end: currentPosition };
      paths.push(path);
      currentAction = ACTIONS.none;
      break;

    case (ACTIONS.movingPath):
      console.log('Stopped moving path');
      currentAction = ACTIONS.none;
      break;

    case(ACTIONS.movingTip):
      console.log('Stopped moving Tip');
      currentAction = ACTIONS.none;
      break;
  }
}

const handleCursorMove = (event) => {
  let currentPosition = new Position(event.offsetX, event.offsetY);
  reRender(paths);
  switch (currentAction) {
    case(ACTIONS.none):
      const currentPath = getPathFromPoint(currentPosition);
      if (currentPath) {
        const currentTip = getPathTipFromPoint(currentPosition, currentPath);
        if (currentTip) {
          document.body.style.cursor = 'pointer';
          ctx.arc(
            currentPath[currentTip].x,
            currentPath[currentTip].y,
            TIP_RADIUS, 0, 2 * Math.PI
          );
          currentPath.color = "#FFFFFF";
          ctx.fillStyle = "#FFFFFF"
          ctx.fill()
        } else {
          document.body.style.cursor = 'move';
          currentPath.color = "#67c94d";
        }
      } else {
        document.body.style.cursor = 'default';
        paths = paths.map((path) => {
          return { ...path, color: "#FFFFFF"}
        });
      }
      break;

    case (ACTIONS.drawing):
      let path = paths.pop();
      path.end = currentPosition;
      paths.push(path);
      break;

    case(ACTIONS.movingPath):
      const deltaX = currentPosition.x - lastCursorPosition.x;
      const deltaY = currentPosition.y - lastCursorPosition.y;
      changingPath.start.x += deltaX;
      changingPath.start.y += deltaY;
      changingPath.end.x += deltaX;
      changingPath.end.y += deltaY;
      break;

    case(ACTIONS.movingTip):
      changingPath[changingTip].x = currentPosition.x;
      changingPath[changingTip].y = currentPosition.y;
      break;

    // case(ACTIONS.movingMiddle):
      
  }
  lastCursorPosition = currentPosition;
}

const handleRightClick = (event) => {
  console.log(event)
  const currentPosition = new Position(event.offsetX, event.offsetY);
  switch (currentAction) {
    case (ACTIONS.none):
      const currentPath = getPathFromPoint(currentPosition);
      if (currentPath) {
        const { start, end } = currentPath;
        paths = paths.filter((path) => path != currentPath);
        paths.push(new Path(currentPath.start, currentPosition));
        // const deltaX = end.x - start.x;
        // const deltaY = end.y - start.y;
        // // console.log(deltaX, deltaY)
        // const hyp = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // const angle = Math.atan(Math.abs(deltaY) / Math.abs(deltaX));
        // console.log(angle)
        // const x = currentPosition.x + Math.round((deltaX < 0 ? -10 : 10) * Math.sin(angle));
        // const y = currentPosition.y + Math.round((deltaY < 0 ? -10 : 10) * Math.cos(angle));
        // console.log((deltaX < 0 ? -10 : -10) * Math.sin(angle))
        // console.log((deltaY < 0 ? -10 : 10) * Math.cos(angle))
        // currentPath.start = { x, y };
        paths.push(new Path(currentPosition, currentPath.end));
        reRender(paths);
      }
      break;
  }
  event.preventDefault();
  return false;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function reRender(paths = []) {
  clearCanvas();
  paths.forEach(({ start, end, color }) => {
    ctx.beginPath()
    ctx.strokeStyle = color;
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

function getPathTipFromPoint(point = new Position(), path) {
  if (path.start.x - TIP_RADIUS < point.x && point.x < path.start.x + TIP_RADIUS) {
    if (path.start.y - TIP_RADIUS < point.y && point.y < path.start.y + TIP_RADIUS) {
      return 'start';
    }
  }
  if (path.end.x - TIP_RADIUS < point.x && point.x < path.end.x + TIP_RADIUS) {
    if (path.end.y - TIP_RADIUS < point.y && point.y < path.end.y + TIP_RADIUS) {
      return 'end';
    }
  }
  return null;
}