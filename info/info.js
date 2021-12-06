export const Info = {
  Player: {
    speed: 0.3,
    turnSpeed: 0.005,
    size: 10,
    life: 100,
    damage: 100,
    bodyFill: 'green',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
  },
  Enemy: {
    speed: 0.15,
    turnSpeed: 0.005,
    size: 10,
    life: 50,
    damage: 50,
    bodyFill: 'blue',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
  },
  Rock: {
    size: 50,
    life: 150,
    damage: 10,
    bodyFill: 'brown',
  },
  Bullet: {
    speed: 0.6,
    size: 2,
    life: 1,
    decay: 1 / 5000,
    damage: 10,
    bodyFill: 'yellow',
    bodyPath: new Path2D( `M 1,0 L 0,1 L -5,0 L 0,-1 Z` ),
  },
  Flame: {
    size: 10,
    life: 1,
    decay: 1 / 1000,
    damage: 10,
    bodyFill: 'orange',
    bodyPath: new Path2D( `M 1,0 L -1,1 L -1,-1 Z` ),
  }
}