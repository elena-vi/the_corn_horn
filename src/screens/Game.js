import React, { PureComponent } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import Rectangle from '../components/Rectangle';

import Matter from "matter-js";
import { GameEngine } from "react-native-game-engine"
import CreateMaze from '../helpers/CreateMaze';
import Circle from '../components/Circle';

import _createBall from '../components/Ball'
import _createWall from '../components/Wall'
import GetRandomPoint from '../helpers/GetRandomPoint';

import dimensions from '../data/constants';
const { width, height } = dimensions;


const GOAL_SIZE = Math.floor(width * .04);

const GRID_X = 15;
const GRID_Y = 18;

const maze = CreateMaze(GRID_X, GRID_Y);

export default class Game extends PureComponent {

  static navigationOptions = {
    header: null
  };

  state = {
    isMazeReady: false,
    isGameFinished: false
  }

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.pusher = navigation.getParam('pusher');
    this.myUsername = navigation.getParam('myUsername');
    this.opponentUsername = navigation.getParam('opponentUsername');

    this.myChannel = navigation.getParam('myChannel');
    this.opponentChannel = navigation.getParam('opponentChannel');
    this.isPlayerOne = navigation.getParam('isPlayerOne');

    this.entities = {};

    if (this.isPlayerOne) {
      const ballOneStartPoint = GetRandomPoint(GRID_X, GRID_Y);
      const ballTwoStartPoint = GetRandomPoint(GRID_X, GRID_Y);

      const ballOne = _createBall(ballOneStartPoint, 'ballOne');
      const ballTwo = _createBall(ballTwoStartPoint, 'ballTwo');

      this.myBall = ballOne;
      this.myBallName = 'ballOne';
      this.opponentBall = ballTwo;
      this.opponentBallName = 'ballTwo';

      const goalPoint = GetRandomPoint(GRID_X, GRID_Y);
      const goal = this._createGoal(goalPoint);

      const { engine, world } = this._addObjectsToWorld(maze, ballOne, ballTwo, goal);

      this.entities = this._getEntities(engine, world, maze, ballOne, ballTwo, goal);

      this._setupPositionUpdater();
      this._setupGoalListener(engine);

      this.opponentChannel.trigger('client-generated-objects', {
        ballOneStartPoint,
        ballTwoStartPoint,
        goalPoint
      });
    }


    this.myChannel.bind('client-generated-objects', ({ ballOneStartPoint, ballTwoStartPoint, goalPoint }) => {

      const ballOne = _createBall(ballOneStartPoint, 'ballOne');
      const ballTwo = _createBall(ballTwoStartPoint, 'ballTwo');
      const goal = this._createGoal(goalPoint);

      this.myBall = ballTwo;
      this.myBallName = 'ballTwo';
      this.opponentBall = ballOne;
      this.opponentBallName = 'ballOne';

      const { engine, world } = this._addObjectsToWorld(maze, ballOne, ballTwo, goal);

      this.entities = this._getEntities(engine, world, maze, ballOne, ballTwo, goal);

      this._setupPositionUpdater();
      this._setupGoalListener(engine);
    });


    this.physics = (entities, { time }) => {
      let engine = entities["physics"].engine;
      engine.world.gravity = {
        x: 0,
        y: 0
      };
      Matter.Engine.update(engine, time.delta);
      return entities;
    };

    this.moveBall = (entities, { touches }) => {
      let move = touches.find(x => x.type === "move");
      if (move) {
        const newPosition = {
          x: this.myBall.position.x + move.delta.pageX,
          y: this.myBall.position.y + move.delta.pageY
        };
        Matter.Body.setPosition(this.myBall, newPosition);
      }

      return entities;
    };


    this.myChannel.bind('start-game', () => {
      Alert.alert('Game Start!', 'You may now navigate towards the black square.');
      this.setState({
        isMazeReady: true
      });
    });

    this.myChannel.bind('client-moved-ball', ({ positionX, positionY }) => {
      Matter.Body.setPosition(this.opponentBall, {
        x: positionX,
        y: positionY
      });
    });
  }


  componentDidMount() {
    this.setState({
      isMazeReady: true
    });
  }


  _createGoal = (goalPoint) => {
    const goal = Matter.Bodies.rectangle(goalPoint.x, goalPoint.y, GOAL_SIZE, GOAL_SIZE, {
      isStatic: true,
      isSensor: true,
      label: 'goal'
    });
    return goal;
  }


  _addObjectsToWorld = (maze, ballOne, ballTwo, goal) => {
    const engine = Matter.Engine.create({ enableSleeping: false });
    const world = engine.world;

    Matter.World.add(world, [
      maze, ballOne, ballTwo, goal
    ]);

    return {
      engine,
      world
    }
  }


  _setupPositionUpdater = () => {
    setInterval(() => {
      if (!this.state.isGameFinished) {
        this.opponentChannel.trigger('client-moved-ball', {
          positionX: this.myBall.position.x,
          positionY: this.myBall.position.y
        });
      }
    }, 1000);
  }


  _setupGoalListener = (engine) => {
    Matter.Events.on(engine, "collisionStart", event => {
      var pairs = event.pairs;

      var objA = pairs[0].bodyA.label;
      var objB = pairs[0].bodyB.label;

      if (objA == this.myBallName && objB == 'goal') {
        Alert.alert("You won", "And that's awesome!");
      } else if (objA == this.opponentBallName && objB == 'goal') {
        Alert.alert("You lose", "And that sucks!");
      }
    });
  }


  _getEntities = (engine, world, maze, ballOne, ballTwo, goal) => {
    const entities = {
      physics: {
        engine,
        world
      },
      playerOneBall: {
        body: ballOne,
        bgColor: '#FF5877',
        borderColor: '#FFC1C1',
        renderer: Circle
      },
      playerTwoBall: {
        body: ballTwo,
        bgColor: '#458ad0',
        borderColor: '#56a4f3',
        renderer: Circle
      },
      goalBox: {
        body: goal,
        size: [GOAL_SIZE, GOAL_SIZE],
        color: '#414448',
        renderer: Rectangle
      }
    };
    const walls = Matter.Composite.allBodies(maze);
    _createWall(body, index, entities)

    return entities;
  }


  render() {
    if (this.state.isMazeReady) {
      return (
        <GameEngine
          systems={[this.physics, this.moveBall]}
          entities={this.entities}
        >
        </GameEngine>
      );
    }

    return <ActivityIndicator size="large" color="#0064e1" />;
  }

}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
};