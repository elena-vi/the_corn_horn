const width = 1500;
const height = 900;
window.addEventListener('load', function () {

  //Fetch our canvas
  var canvas = document.getElementById('world');
  //Setup Matter JS
  var engine = Matter.Engine.create();
  var world = engine.world;
  world.gravity = {
    x: 0,
    y: 0
  }
  var render = Matter.Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: 1500,
      height: 900,
      background: 'blue',
      wireframes: false,
      showAngleIndicator: false
    }
  });

  //Add a ball
  var ball = Matter.Bodies.circle(250, 250, 25, {
    frictionStatic: 1,
    density: 1,
    inertia: 0,
    friction: 0,
    frictionAir: 0,
    restitution: 0,
    render: {
      fillStyle: '#F35e66',
      strokeStyle: 'black',
      lineWidth: 1
    }
  });
  // ball.addMovementToBall()
  function addMovementToBall() {
    document.addEventListener("keydown", event => {
      const { x, y } = this.ball.velocity;

      switch (event.keyCode) {
        case 87:
        case 38:
          Body.setVelocity(this.ball, { x, y: y - 5 });
          break;

        case 68:
        case 39:
          Body.setVelocity(this.ball, { x: x + 5, y });
          break;

        case 83:
        case 40:
          Body.setVelocity(this.ball, { x, y: y + 5 });
          break;

        case 65:
        case 37:
          Body.setVelocity(this.ball, { x: x - 5, y });
          break;
      }
    });
  }
  Matter.World.add(world, ball);

  // Create boundaries of the maze
  const boundaries = [
    Matter.Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true, render: { visible: false } }),
    Matter.Bodies.rectangle(width / 2, height, width, 2, { isStatic: true, render: { visible: false } }),
    Matter.Bodies.rectangle(0, height / 2, 2, height, { isStatic: true, render: { visible: false } }),
    Matter.Bodies.rectangle(width, height / 2, 2, height, { isStatic: true, render: { visible: false } })
  ]
  Matter.World.add(world, boundaries);

  //Make interactive
  var mouseConstraint = Matter.MouseConstraint.create(engine, { //Create Constraint
    element: canvas,
    constraint: {
      render: {
        visible: false
      },
      stiffness: 1
    }
  });
  Matter.World.add(world, mouseConstraint);

  //Start the engine
  Matter.Engine.run(engine);
  Matter.Render.run(render);


});
