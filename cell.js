//cell object, has coordinates, wall on each side and finalized/visited status for visualization
class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true]; //top, right, bottom, left
    this.visited = false;
    this.finalized = false;
    this.solution = false;
  }

  //get a random existing neighbor of the cell
  getRandomNeighbor() {
    let neighbors = [];

    let top    = grid[index(this.i, this.j - 1)];
    let right  = grid[index(this.i + 1, this.j)];
    let bottom = grid[index(this.i, this.j + 1)];
    let left   = grid[index(this.i - 1, this.j)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
      let r = floor(random(neighbors.length));
      return neighbors[r];
    }
    return undefined;
  }
//draw the cell and add style parameters if applicable (finalized/visited)
  show() {
    let x = this.i * w;
    let y = this.j * w;
    stroke(255); //white

    if (this.walls[0]) line(x, y, x + w, y);         // top
    if (this.walls[1]) line(x + w, y, x + w, y + w); // right
    if (this.walls[2]) line(x + w, y + w, x, y + w); // bottom
    if (this.walls[3]) line(x, y + w, x, y);         // left
    
    if (this.solution) {
      noStroke();
      fill(180, 110, 30, 150) //brown
      rect(x, y, w, w);
      
    }
    else if (this.finalized) {
      noStroke();
      fill(30, 30, 30, 150); // dark grey, near black
      rect(x, y, w, w);
      
    } else if (this.visited) {
      noStroke();
      fill(255, 0, 255, 100); // purple
      rect(x, y, w, w);
    }
  }
//highlight the cell green (used for current)
  highlight() {
    let x = this.i * w;
    let y = this.j * w;
    noStroke();
    fill(0, 255, 0, 100); // green
    rect(x, y, w, w);
  }
}
