
import Rectangle from './components/Rectangle';

function _createWall(walls, entities) {
  walls.forEach((body, index) => {
    const { min, max } = body.bounds;
    const width = max.x - min.x;
    const height = max.y - min.y;

    Object.assign(entities, {
      ['wall_' + index]: {
        body: body,
        size: [width, height],
        color: '#fbb050',
        renderer: Rectangle
      }
    });
  });
}
exports.default = _createWall(walls, entities)