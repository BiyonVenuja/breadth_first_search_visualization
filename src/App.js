import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
async function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}
class Node {
  constructor(x, y, obstacle) {
    this.x = x;
    this.y = y;
    this.obstacle = obstacle || false;
    this.parent = null;
    this.path = false
  }
}

function App() {
  const [rows, setRows] = useState(5)
  const [cols, setCols] = useState(6)
  const [grid, setGrid] = useState([])
  const [obstacles, setObstacles] = useState([[0, 1], [2, 1], [2, 3], [3, 1], [3, 4], [4, 4]])

  const mazeGrid = [
    [' ', '#', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' '],
    [' ', '#', ' ', '#', ' ', ' '],
    [' ', '#', ' ', ' ', '#', ' '],
    [' ', ' ', ' ', ' ', '#', ' ']
  ];
  const startNode = new Node(0, 0);
  const endNode = new Node(4, 5);

  // Define obstacle nodes
  const obstacleNodes = [[0, 1], [2, 1], [2, 3], [3, 1], [3, 4], [4, 4]];

  const drawGrid = () => {
    const tempGrid = []
    for (let i = 0; i < rows; i++) {
      const tempCol = []
      for (let y = 0; y < cols; y++) {
        if (obstacles.find((node) => {
          return (i == node[0] && y == node[1]);
        })) {
          tempCol.push(new Node(i, y, true))
        } else {

          tempCol.push(new Node(i, y))
        }
      }
      tempGrid.push(tempCol)
    }
    return tempGrid
  }
  useEffect(() => {
    setGrid(drawGrid())
    console.log((drawGrid()));



    // Find and print the optimal path

  }, [rows, cols, obstacles])

  function initializeMaze(maze, startNode, endNode, obstacleNodes) {
    const openSet = [];
    const closedSet = new Set();

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[0].length; j++) {
        const currentNode = new Node(i, j);
        if (currentNode.x === startNode.x && currentNode.y === startNode.y) {
          openSet.push(currentNode);
        } else if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
          continue;
        } else if (obstacleNodes.some(([x, y]) => x === currentNode.x && y === currentNode.y)) {
          maze[currentNode.x][currentNode.y] = '#';
        }
      }
    }

    return [openSet, closedSet];
  }

  function getNeighbors(node, maze) {
    const neighbors = [];
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (const [dx, dy] of directions) {
      const x = node.x + dx;
      const y = node.y + dy;

      if (x >= 0 && x < maze.length && y >= 0 && y < maze[0].length && maze[x][y] !== '#') {
        neighbors.push(new Node(x, y));
      }
    }

    return neighbors;
  }
  async function colorPath(path){
    setGrid(prev => {
      const newGrid = [...prev]; // Create a copy of the previous grid
      newGrid[4][5].path = true; // Update the desired value in the copy
      return newGrid; // Return the updated copy
  });
    for (let i = 0; i < path.length; i++) {
      const element = path[i];
      console.log(element);
      setGrid(prev => {
        const newGrid = [...prev]; // Create a copy of the previous grid
        newGrid[element[0]][element[1]].path = true; // Update the desired value in the copy
        return newGrid; // Return the updated copy
    });
      await sleep(100)
    }
  }
  async function reconstructPath(currentNode) {
    const path = [];
    while (currentNode !== null) {
      path.push([currentNode.x, currentNode.y]);
     
      currentNode = currentNode.parent;
      
    }
    colorPath(path.reverse())
    return path.reverse();
  }

  async function breadthFirstSearch(maze, startNode, endNode, obstacleNodes) {
    const [openSet, closedSet] = initializeMaze(maze, startNode, endNode, obstacleNodes);

    while (openSet.length > 0) {
      const currentIdx = openSet.findIndex(node => (node.x === endNode.x && node.y === endNode.y));
      if (currentIdx !== -1) {
        return reconstructPath(openSet[currentIdx]);
      }

      const currentNode = openSet.shift();
      setGrid(prev => {
        const newGrid = [...prev]; // Create a copy of the previous grid
        newGrid[currentNode.x][currentNode.y].active = true; // Update the desired value in the copy
        return newGrid; // Return the updated copy
      });

      await sleep(100)
      closedSet.add(`${currentNode.x},${currentNode.y}`);

      for (const neighbor of getNeighbors(currentNode, maze)) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }
        neighbor.parent = currentNode;
        setGrid(prev => {
          const newGrid = [...prev]; // Create a copy of the previous grid
          newGrid[neighbor.x][neighbor.y].neighbor = true; // Update the desired value in the copy
          return newGrid; // Return the updated copy
        });

        await sleep(100)
        openSet.push(neighbor);
      }
    }

    return null;
  }
  return (
    <>
      <h1>Breadth First Search (BFS) Algorithm Visualization 
        <br /> Biyon Venuja
        <br /> CS6053NM_A1</h1>
      <br />
      <div className="grid" style={{ width: `${(60 + 2) * cols}px` }} key={grid}>
        {grid.length > 0 &&
          grid.map((item, i) => {
            return (grid[0].map((item2, y) => {
              const currentNode = grid[i][y]
              // console.log(currentNode);
              if (currentNode.path) {
                return <Block path={true} key={`${i}${y}`}/>
              }
              if (currentNode.x == 0 && currentNode.y == 0) {
                return <Block start={true} key={`${i}${y}`}/>
              }
              if (currentNode.x == 4 && currentNode.y == 5) {
                return <Block end={true} key={`${i}${y}`}/>
              }
              if (currentNode.active) {
                return <Block active={true} key={`${i}${y}`}/>
              }
              if (currentNode.obstacle) {
                return <Block obs={true} key={`${i}${y}`}/>
              }
              if (currentNode.neighbor) {
                return <Block neighbor={true} key={`${i}${y}`}/>
              }
              
              return (<Block key={`${i}${y}`}/>)
            }))
          })
        }
      </div>
      <br />
      <button onClick={() => breadthFirstSearch(mazeGrid, startNode, endNode, obstacleNodes)}>START</button>
     <br /> <button onClick={() => window.location.reload()}>RESET</button>
    </>
  );
}

function Block({ start, end, obs, active, neighbor,path }) {
  // console.log(start,end);
  return (
    <div className="node" data-obs={obs} data-active={active} data-neighbor={neighbor} data-path={path}>
      {start && <p>START</p>}
      {end && <p>END</p>}
    </div>
  )
}

export default App;
