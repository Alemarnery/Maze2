const { Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 4;
const cellsVertical = 5;
const width = window.innerWidth;
const height = window.innerHeight;
const widthHeightVariable = 40;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
     element: document.body,
     engine: engine,
     options:{
          wireframes: false,
          //showAxes: true,
          //showPositions: true,
          width,
          height
     }
});

Render.run( render );
Runner.run( Runner.create(), engine );

//x,y,width,height
const walls = [
     Bodies.rectangle(width/2, 0, width, widthHeightVariable, { isStatic: true }), //arriba
     Bodies.rectangle(width/2, height, width, widthHeightVariable, { isStatic: true}),//abajo
     Bodies.rectangle(0,height/2, widthHeightVariable, height, { isStatic: true}), //izquierda
     Bodies.rectangle(width, height/2, widthHeightVariable, height, { isStatic: true}) //derecha
];

World.add(world, walls);

//Maze generation
const shuffle = (arr) => {
     let counter = arr.length;

     while( counter > 0 ){
          const index = Math.floor(Math.random() * counter);

          counter--;

          const temp = arr[counter];
          arr[counter] = arr[index];
          arr[index] = temp;
     }

     return arr;
}

const grid = Array(cellsVertical).fill(null).map( () => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map( () => Array(cellsHorizontal -1).fill(false));
const horizontals = Array(cellsVertical -1).fill(null).map( () => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row,column) => {
     
     //If i have visited the cell at [row, colum], then return
     if(grid[row][column]){
          return;
     }

     //Mark this cell as being visited
     grid[row][column]= true;     

     //Assemble randomlu-ordered list of neighbors
     const neighbors = shuffle([
          [row -1, column, 'up'],
          [row, column + 1, 'right'],
          [row + 1, column, 'down'], 
          [row, column - 1, 'left']
     ]);
     

     //for each neighbot..
     for(let neighbor of neighbors) {
          const [nextRow, nextColumn, direction] = neighbor; 
          
          //See if that neighboor is out of bounds
          if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
               continue;
          }

          // If we have visited that neighboor, continue to next neighbor
          if(grid[nextRow][nextColumn]){
               continue;
          }     

          //remove a wall from either horizontals or verticals
          if(direction === 'left'){
               verticals[row][column -1] = true;
          }else if(direction === 'right'){
               verticals[row][column] = true;
          }else if(direction === 'up'){
               horizontals[row-1][column] = true;
          }else if (direction === 'down'){
               horizontals[row][column] = true;
          }

          stepThroughCell( nextRow, nextColumn);
     }

     //Visit the next cells
};

stepThroughCell( startRow, startColumn);

horizontals.forEach( (row,rowIndex) => {
     row.forEach((open,columnIndex) => {
          if(open === true){
               return;
          }

          const wall = Bodies.rectangle(
               columnIndex * unitLengthX + unitLengthX/2,
               rowIndex * unitLengthY + unitLengthY,
               unitLengthX,
               5,
               {
                    label:'wall',
                    isStatic:true,
                    render:{
                         fillStyle: 'purple'
                    }
               }
          );

          World.add(world, wall);
     });
});

verticals.forEach((row, rowIndex) => {
     row.forEach((open, columnIndex) => {
          if(open){
               return;               
          }

          const wall = Bodies.rectangle(
               columnIndex * unitLengthX + unitLengthX,
               rowIndex * unitLengthY + unitLengthY/2,
               5,
               unitLengthY,
               {
                    label:'wall',
                    isStatic:true,
                    render:{
                         fillStyle: 'purple'
                    }
               }
          );     

          World.add(world, wall);
     });
});

//Goal
const goal = Bodies.rectangle(
     width - unitLengthX/2,
     height - unitLengthY/2,
     unitLengthX * 0.7,
     unitLengthY * 0.7,
     {
          label: 'goal',
          isStatic: true,
          render:{
               fillStyle: 'orange'
          }
     }
);

World.add(world, goal);

//Ball
const ballRadius = Math.min( unitLengthY, unitLengthX) / 4;
const ball = Bodies.circle(
     unitLengthX/2,
     unitLengthY/2,
     ballRadius,
     {
          label: 'ball',
          render:{
               fillStyle: 'blue'
          }          
     }
);

World.add(world,ball);
document.addEventListener('keydown', event => {

     const {x,y} = ball.velocity;
     switch(event.keyCode){
          case 87:
               Body.setVelocity(ball, {x, y: y - 5 });
               break;

          case 68:
               Body.setVelocity(ball, {x: x+5,y: y});
               break;

          case 83:
               Body.setVelocity(ball, {x, y: y + 5});
               break;

          case 65:
               Body.setVelocity(ball, {x: x - 5, y});
               break;
          
          default:
               alert('Utilice las teclas wsd');
     }
});

//Win Condition
Events.on(engine, 'collisionStart', event => {
     event.pairs.forEach((collision) => {
          const labels = ['ball', 'goal'];
                    
          if(
               labels.includes(collision.bodyA.label) && 
               labels.includes(collision.bodyB.label)
            ){
                 document.querySelector('.winner').classList.remove('hidden');
                 world.gravity.y = 1;
                 world.bodies.forEach(body => {
                      if(body.label === 'wall'){
                           Body.setStatic(body,false);
                      }
                 });
            }
     });
});






