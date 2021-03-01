const { width, height } = dimensions;

const BALL_SIZE = Math.floor(width * .02);
const ballSettings = {
  inertia: 0,
  friction: 0,
  frictionStatic: 0,
  frictionAir: 0,
  restitution: 0,
  density: 1
};
export default _createBall = (startPoint, name) => {
  const ball = Matter.Bodies.circle(
    startPoint.x,
    startPoint.y,
    BALL_SIZE,
    {
      ...ballSettings,
      label: name
    }
  );
  return ball;
}