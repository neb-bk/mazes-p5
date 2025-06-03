//general variables
let cols, rows;
let w = 100 //width of the cells. change for bigger/smaller maze.
let grid = [];


let speedSlider;
let selectedGenAlgo = 'DFS';
let selectedSolveAlgo = 'Right-Hand-Rule';
let genSelect, solveSelect;

//right hand rule variables
let rightHandCurrent;
let rightHandDone = false;
let rightHandDir; // 0 = up, 1 = right, 2 = down, 3 = left

//pledge variables
let pledgeCurrent;
let pledgePath = [];
let pledgeDone = false;
let pledgeDir; // 0 = up, 1 = right, 2 = down, 3 = left
let pledgeTurnCounter = 0;
let followingWall = false;


//dfs variables
let dfsCurrent;
let dfsStack = [];
let dfsDone = false;

//kruskal variables
let walls = [];
let uf;
let wallsIndex = 0;
let kruskalDone = false;

//wilson variables
let inMaze = new Set();
let wilsonPath = [];
let wilsonCurrent = null;
let wilsonDone = false;


function initRightHand() {
  rightHandCurrent = grid[0]; // Start at top-left
  rightHandDone = false;
  rightHandDir = 1; // start facing right
}
function initPledge() {
  pledgeCurrent = grid[0]; // start top-left
  pledgePath = [pledgeCurrent];
  pledgeDone = false;
  pledgeDir = 1; // start facing right
  pledgeTurnCounter = 0;
  followingWall = false;
}



//init dfs stack and random start cell
function initDFS() {
  dfsStack = [];
  dfsCurrent = grid[floor(random(cols * rows))];
}

//init kruskal with empty walls array, then fill it up and shuffle
function initKruskal() {
  walls = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let idx = index(i, j);
      // right neighbor wall
      if (i < cols - 1) walls.push({a: idx, b: index(i + 1, j)});
      // bottom neighbor wall
      if (j < rows - 1) walls.push({a: idx, b: index(i, j + 1)});
    }
  }
  // shuffle walls array randomly
  shuffleArray(walls);
  //initialize unionfind data structure with with number of cells
  uf = new UnionFind(cols * rows);
  
  //index used for iterating over all walls
  wallsIndex = 0;
}

//init wilson with random cell added to final maze, empty path and no current cell
function initWilson() {
  inMaze = new Set();
  wilsonDone = false;

  // Add one random cell to the maze
  let randomStart = floor(random(cols * rows));
  inMaze.add(randomStart);
  grid[randomStart].finalized = true;

  wilsonPath = [];
  wilsonCurrent = null;
}

//initializes the grid, stack and sets current cell to upper left
function initGrid() {
  grid = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push(new Cell(i, j));
    }
  }
}
//gets called upon startup and when generation algo changes
function onGenChange() {
  selectedGenAlgo = genSelect.value();
  initGrid();
  if( selectedGenAlgo === 'DFS') {
    initDFS();
  }
  else if (selectedGenAlgo === 'Kruskal') {
    initKruskal();
  } else if (selectedGenAlgo === 'Wilson') {
    initWilson();
  }
}
//gets called upon startup and when generation algo changes
function onSolveChange() {
  selectedSolveAlgo = solveSelect.value();
  if( selectedSolveAlgo === 'Right-Hand-Rule') {
    initRightHand();
  }
  else if (selectedSolveAlgo === 'Pledge') {
    initPledge();
  }
}


//setup the scene
function setup() {
  //setup canvas for drawing
  createCanvas(600, 600);
  cols = floor(width / w);
  rows = floor(height / w);

  // dropdowns for generation and solving algos
  genSelect = createSelect();
  genSelect.option('DFS');
  genSelect.option('Kruskal');
  genSelect.option('Wilson');
  genSelect.changed(onGenChange);
  genSelect.position(10, height + 10);
  
  solveSelect = createSelect();
  solveSelect.option('Right-Hand-Rule');
  solveSelect.option('Pledge');
  solveSelect.changed(onSolveChange);
  solveSelect.position(10, height + 50);
  
  // slider for speed (1–60 FPS, default is 5)
  speedSlider = createSlider(1, 60, 5);
  speedSlider.position(200, height + 10);

  // Initialize grid
  initGrid();
  
  //insta call dfs to run without user input
  onGenChange();
  onSolveChange();
}

//gets called every frame
function draw() {
  //grey background
  background(81);

  //draw all cells of the grid
  for (let cell of grid) {
    cell.show();
  }

  //check the speed slider value and adjust framerate accordingly
  let fps = speedSlider.value();
  frameRate(fps);
  
  // apply the selected algorithmn
  if (selectedGenAlgo === 'DFS' && !dfsDone) {
      runDfs();
  } else if (selectedGenAlgo === 'Kruskal' && !kruskalDone) {
    runKruskal();
  } else if (selectedGenAlgo === 'Wilson' && !wilsonDone) {
    runWilson();
  }
  else if(dfsDone || kruskalDone || wilsonDone) {
    if(selectedSolveAlgo === 'Right-Hand-Rule' && !rightHandDone) {
       runRightHandRule();
       }
    else if(selectedSolveAlgo === 'Pledge' && !pledgeDone) {
      runPledge();
    }
  }
}

//the randomized depth first search algorithm
function runDfs() {
  //mark the current cell as visited and highlight it
  dfsCurrent.visited = true;
  dfsCurrent.highlight();
  
  //find a random neighbor cell
  let next = dfsCurrent.getRandomNeighbor();

  //if there is any random unvisited neighbor cell, mark it as visited, remove the walls towards it and move there
  if (next) {
    next.visited = true;
    dfsStack.push(dfsCurrent);
    removeWalls(dfsCurrent, next);
    dfsCurrent = next;
  } else {
    //if there is none, a dead-end was reached. current cell can be colored as "finalized", this is just for visual purposes.
    if (!dfsCurrent.finalized) {
      dfsCurrent.finalized = true;
    }
    //as long as the stack is not empty aka. we are back at the start, pop a cell from stack
    if (dfsStack.length > 0) {
      let popped = dfsStack.pop();
      dfsCurrent = popped;
    } else {
      // if the stack is empty, we are done. mark the start cell as finalized.
      if (!dfsCurrent.finalized) {
        dfsCurrent.finalized = true;
        
      }
      dfsDone = true;
    }
  }
}

//the kruskal algorithm
function runKruskal() {
  //done when all walls have been checked
  if (wallsIndex >= walls.length) {
    kruskalDone = true;
    return;
  }

  //get current wall
  let wall = walls[wallsIndex];
  wallsIndex++;
  
  //cells corresponding to the wall
  let a = wall.a;
  let b = wall.b;
  
  //try to union a and b, if it works remove the walls and highlight. else neglect the wall
  if (uf.union(a, b)) {
    removeWalls(grid[a], grid[b]);
    grid[wall.a].finalized = true;
    grid[wall.b].finalized = true;
  }
}

//the wilson algorithm
function runWilson() {
  if (wilsonCurrent === null) {
    // Pick a cell NOT in the maze to start random walk, so add all non-maze cells as candidates
    let candidates = [];
    for (let i = 0; i < cols * rows; i++) {
      if (!inMaze.has(i)) candidates.push(i);
    }
    if (candidates.length === 0) {
      wilsonDone = true;
      return;
    }
    wilsonCurrent = candidates[floor(random(candidates.length))];
    wilsonPath = [wilsonCurrent];
  } else {
    // Walk randomly
    let currentCell = grid[wilsonCurrent];
    currentCell.visited = true;
    currentCell.highlight();
    let neighbors = [];

    // Collect neighbors that are inside grid (ignore walls for walk)
    let i = currentCell.i;
    let j = currentCell.j;
    let potential = [index(i - 1, j), index(i + 1, j), index(i, j - 1), index(i, j + 1)];
    for (let n of potential) {
      if (n >= 0 && n < cols * rows) neighbors.push(n);
    }

    // safe guard, in case of no neighbors - abort the walk
    if (neighbors.length === 0) { //shouldnt happen
      wilsonCurrent = null;
      wilsonPath = [];
      return;
    }

    // Choose a random neighbor
    let next = neighbors[floor(random(neighbors.length))];

    // Loop erasure: if next already in path, remove loop
    let loopIndex = wilsonPath.indexOf(next);
    if (loopIndex !== -1) {
      //cuts out the loop from path
      wilsonPath = wilsonPath.slice(0, loopIndex + 1);
    } else {
      wilsonPath.push(next);
    }

    wilsonCurrent = next;

    // If next is already in the maze, add path to maze and remove walls
    if (inMaze.has(next)) {
      for (let k = 0; k < wilsonPath.length - 1; k++) {
        removeWalls(grid[wilsonPath[k]], grid[wilsonPath[k + 1]]);
        grid[wilsonPath[k]].finalized = true;
        resetVisited();
        inMaze.add(wilsonPath[k]);
      }
      //delete path for new walk
      wilsonPath = [];
      wilsonCurrent = null;
    }
  }
}
//right hand rule
function runRightHandRule() {
  
  //starting cell is visited and highlighted
  rightHandCurrent.visited = true;
  rightHandCurrent.highlight();

  //cell on the bottom right is defined as end
  if (rightHandCurrent === grid[cols * rows - 1]) {
    rightHandCurrent.solution = true;
    rightHandDone = true;
    return;
  }

  //first try to turn right, then forward, then left and then back
  let directionsToTry = [
  turnRight(rightHandDir),
  rightHandDir,
  turnLeft(rightHandDir),
  (rightHandDir + 2) % 4 //back
];
//actual moving
for (let tryDir of directionsToTry) {
  let neighbor = getNeighborInDirection(rightHandCurrent, tryDir);
  if (neighbor && !rightHandCurrent.walls[tryDir]) {
    rightHandDir = tryDir;
    rightHandCurrent.solution = true;
    rightHandCurrent = neighbor;
    return;
  }
}

}

//pledge algorithm
function runPledge() {
  pledgeCurrent.visited = true;
  pledgeCurrent.highlight();

  //bottom right cell marks the exit
  if (pledgeCurrent === grid[cols * rows - 1]) {
    pledgeCurrent.solution = true;
    pledgeDone = true;
    return;
  }

  if (!followingWall) {
    // Try to move forward in the pre-declared direction
    let forwardNeighbor = getNeighborInDirection(pledgeCurrent, pledgeDir);
    if (forwardNeighbor && !pledgeCurrent.walls[pledgeDir]) {
      pledgeCurrent.solution = true;
      pledgeCurrent = forwardNeighbor;
      return;
    } else {
      // Hit a wall, start (right) wall-following
      followingWall = true;
      pledgeTurnCounter = 0;
      pledgeDir = turnLeft(pledgeDir);
      pledgeTurnCounter -= 90;
    }
  }

  // Wall-following mode
  for (let attempt = 0; attempt < 4; attempt++) { //4 times execution, to not get stuck
    let rightDir = turnRight(pledgeDir);
    let rightNeighbor = getNeighborInDirection(pledgeCurrent, rightDir);

    //turn right if possible
    if (rightNeighbor && !pledgeCurrent.walls[rightDir]) {
      pledgeDir = rightDir;
      pledgeTurnCounter += 90;
    }
    //move forward if you can then
    let forwardNeighbor = getNeighborInDirection(pledgeCurrent, pledgeDir);
    if (forwardNeighbor && !pledgeCurrent.walls[pledgeDir]) {
      pledgeCurrent.solution = true;
      pledgeCurrent = forwardNeighbor;

      // Exit wall-following if turn counter is 0 and facing initial direction (right)
      if (pledgeTurnCounter === 0 && pledgeDir === 1) {
        followingWall = false;
      }
      return;
    } else {
      pledgeDir = turnLeft(pledgeDir);
      pledgeTurnCounter -= 90;
    }
  }
}





//helper function to get neighbor cell from direction
function getNeighborInDirection(cell, dir) {
  let i = cell.i;
  let j = cell.j;

  if (dir === 0 && j > 0) return grid[index(i, j - 1)]; // Up
  if (dir === 1 && i < cols - 1) return grid[index(i + 1, j)]; // Right
  if (dir === 2 && j < rows - 1) return grid[index(i, j + 1)]; // Down
  if (dir === 3 && i > 0) return grid[index(i - 1, j)]; // Left
  return null;
}


// get the index of a cell in grid. if its invalid, return -1.
function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) {
    //array[-1] will be undefined, so we will check that for error handling.
    return -1;
  }
  //return the index for the one-dimensional array
  return i + j * cols;
}

//remove the wall between two adjacent cells
function removeWalls(a, b) {
  let x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false; // left
    b.walls[1] = false; // right
  } else if (x === -1) {
    a.walls[1] = false; // right
    b.walls[3] = false; // left
  }

  let y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false; // top
    b.walls[2] = false; // bottom
  } else if (y === -1) {
    a.walls[2] = false; // bottom
    b.walls[0] = false; // top
  }
}
//helper function for shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
//helper function to set whole grid to unvisited
function resetVisited() {
  for (let cell of grid) {
    cell.visited = false;
  }
}

//helper functions for turning directions
function turnRight(dir) {
  return (dir + 1) % 4;
}
function turnLeft(dir) {
  return (dir + 3) % 4;
}

