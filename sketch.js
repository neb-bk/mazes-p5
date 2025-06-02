let cols, rows;
let w = 50 //width of the cells. change for bigger/smaller maze.
let grid = [];

let current;
let stack = [];

let algorithmSelector;
let speedSlider;
let selectedAlgorithm = 'Recursive Backtracker';


function setup() {
  //setup canvas for drawing
  createCanvas(600, 600);
  cols = floor(width / w);
  rows = floor(height / w);

  // dropdown for generation algo selection
  algorithmSelector = createSelect();
  algorithmSelector.option('DFS');
  algorithmSelector.option('Kruskal');
  algorithmSelector.option('Wilson');
  algorithmSelector.changed(onAlgorithmChange);
  algorithmSelector.position(10, height + 10);

  // slider for speed (1–60 FPS, default is 5)
  speedSlider = createSlider(1, 60, 5);
  speedSlider.position(200, height + 10);

  // Initialize grid
  initGrid();
  
  //insta call dfs to run without input
  onAlgorithmChange();
}

//initializes the grid, stack and sets current cell to upper left
function initGrid() {
  grid = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push(new Cell(i, j));
    }
  }
  stack = [];
  current = grid[0];
}
//gets called upon startup and when generation algo changes
function onAlgorithmChange() {
  selectedAlgorithm = algorithmSelector.value();
  initGrid();
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
  if (selectedAlgorithm === 'DFS') {
      runDfs();
  } else if (selectedAlgorithm === 'Kruskal') {
    // TODO: Call Kruskal algorithm
  } else if (selectedAlgorithm === 'Wilson') {
    // TODO: Call Wilson algorithm
  }
}

//the randomized depth first search algorithm
function runDfs() {
  //mark the current cell as visited and highlight it (starts at upper left corner)
  current.visited = true;
  current.highlight();
  
  //find a random neighbor cell
  let next = current.getRandomNeighbor();

  //if there is any random unvisited neighbor cell, mark it as visited, remove the walls towards it and move there
  if (next) {
    next.visited = true;
    stack.push(current);
    removeWalls(current, next);
    current = next;
  } else {
    //if there is none, a dead-end was reached. current cell can be colored as "finalized", this is just for visual purposes.
    if (!current.finalized) {
      current.finalized = true;
    }
    //as long as the stack is not empty aka. we are back at the start, pop a cell from stack
    if (stack.length > 0) {
      let popped = stack.pop();
      current = popped;
    } else {
      // if the stack is empty, we are done. mark the start cell as finalized.
      if (!current.finalized) {
        current.finalized = true;
      }
    }
  }
}

function runKruskal(){
  
}
function runWilson(){
  
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
