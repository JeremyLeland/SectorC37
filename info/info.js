export const Info = {
  Player: {
    speed: 0.2,
    turnSpeed: 0.005,
    size: 10,
    mass: 1,
    life: 200,
    damage: 100,
    bodyFill: 'green',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    gunInfo: [
      { offset: { front: 0, side: -10, angle: 0 } },
      { offset: { front: 0, side:  10, angle: 0 } }, 
    ],
    engineInfo: [
      { offset: { front: -10, side: 0, angle: 0 } },
    ]
  },
  Scout: {
    speed: 0.15,
    turnSpeed: 0.005,
    size: 10,
    mass: 1,
    life: 20,
    damage: 40,
    bodyFill: 'dodgerblue',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    gunInfo: [
      { offset: { front: 0, side: -10, angle: 0 } },
      { offset: { front: 0, side:  10, angle: 0 } }, 
    ],
    engineInfo: [
      { offset: { front: -10, side: 0, angle: 0 } },
    ]
  },
  Frigate: {
    speed: 0.1,
    turnSpeed: 0.002,
    size: 20,
    mass: 2,
    life: 100,
    damage: 100,
    bodyFill: 'cyan',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    gunInfo: [
      { offset: { front:  0, side: -20, angle: 0 } },
      { offset: { front: 10, side: -10, angle: 0 } },
      { offset: { front: 10, side:  10, angle: 0 } }, 
      { offset: { front:  0, side:  20, angle: 0 } }, 
    ],
    engineInfo: [
      { offset: { front: -20, side: -10, angle: 0 } },
      { offset: { front: -20, side:  10, angle: 0 } },
    ]
  },
  Destroyer: {
    speed: 0.05,
    turnSpeed: 0.001,
    size: 40,
    mass: 4,
    life: 300,
    damage: 300,
    bodyFill: 'powderblue',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    gunInfo: [
      { offset: { front: 10, side: -30, angle: 0 } },
      { offset: { front: 20, side: -20, angle: 0 } },
      { offset: { front: 30, side: -10, angle: 0 } },
      { offset: { front: 30, side:  10, angle: 0 } }, 
      { offset: { front: 20, side:  20, angle: 0 } }, 
      { offset: { front: 10, side:  30, angle: 0 } }, 
    ],
    engineInfo: [
      { offset: { front: -40, side: -20, angle: 0 } },
      { offset: { front: -40, side:   0, angle: 0 } },
      { offset: { front: -40, side:  20, angle: 0 } },
    ]
  },
  Rock: {
    size: 50,
    mass: 25,
    life: 250,
    damage: 350,
    bodyFill: 'brown',
  },
  Bullet: {
    speed: 0.9,
    size: 2,
    mass: 0.05,
    life: 1,
    decay: 1 / 5000,
    damage: 10,
    bodyFill: 'rgba( 255, 255, 0, 0.5 )',
    bodyPath: new Path2D( `M 1,0 L 0,1 L -10,0 L 0,-1 Z` ),
  },
  Flame: {
    size: 0,
    dSize: 20 / 1000,
    life: 1,
    decay: 1 / 1000,
    damage: 10,
    bodyFill: 'orange',
    bodyPath: new Path2D( `M -1,-1 L 1,-1 L 1,1 L -1,1 Z` ),
  },
  Trail: {
    size: 5,
    dSize: -5 / 500,
    life: 1,
    decay: 1 / 500,
    damage: 10,
    bodyFill: 'orange',
    bodyPath: new Path2D( `M -1,-1 L 1,-1 L 1,1 L -1,1 Z` ),
  },
}