export const ShipInfo = {
  Player: {
    speed: 0.2,
    turnSpeed: 0.005,
    size: 10,
    mass: 1,
    life: 200,
    energy: 100,
    energyRechargeRate: 100 / 5000,
    damage: 100,
    bodyFill: 'green',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    bulletColor: 'rgba( 200, 255, 200, 0.7 )',
    engineColor: 'rgba( 200, 255, 200, 0.7 )',
    gunInfo: [
      { offset: { front: 0, side: -10, angle: 0 } },
      { offset: { front: 0, side:  10, angle: 0 } }, 
    ],
    engineInfo: [
      {
        size: 4,
        maxLength: 20,
        offset: { front: -10, side: 0, angle: 0 },
      },
    ]
  },
  Scout: {
    speed: 0.15,
    turnSpeed: 0.005,
    size: 10,
    mass: 1,
    life: 20,
    energy: 50,
    energyRechargeRate: 50 / 1000,
    damage: 40,
    bodyFill: 'dodgerblue',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    bulletColor: 'rgba( 200, 200, 255, 0.7 )',
    engineColor: 'rgba( 200, 200, 255, 0.7 )',
    gunInfo: [
      { offset: { front: 0, side: -10, angle: 0 } },
      { offset: { front: 0, side:  10, angle: 0 } }, 
    ],
    engineInfo: [
      {
        size: 4,
        maxLength: 20,
        offset: { front: -10, side: 0, angle: 0 },
      },
    ]
  },
  Frigate: {
    speed: 0.1,
    turnSpeed: 0.002,
    size: 20,
    mass: 2,
    life: 100,
    energy: 100,
    energyRechargeRate: 100 / 1000,
    damage: 100,
    bodyFill: 'cyan',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    bulletColor: 'rgba( 200, 255, 255, 0.7 )',
    engineColor: 'rgba( 200, 200, 255, 0.7 )',
    gunInfo: [
      { offset: { front:  0, side: -20, angle: 0 } },
      { offset: { front: 10, side: -10, angle: 0 } },
      { offset: { front: 10, side:  10, angle: 0 } }, 
      { offset: { front:  0, side:  20, angle: 0 } }, 
    ],
    engineInfo: [
      {
        size: 5,
        maxLength: 20,
        offset: { front: -20, side: -10, angle: 0 },
      },
      {
        size: 5,
        maxLength: 20,
        offset: { front: -20, side: 10, angle: 0 },
      },
    ]
  },
  Destroyer: {
    speed: 0.05,
    turnSpeed: 0.001,
    size: 40,
    mass: 4,
    life: 300,
    energy: 100,
    energyRechargeRate: 100 / 1000,
    damage: 300,
    bodyFill: 'powderblue',
    bodyPath: new Path2D( 'M 1,0 L -1 1 L -1 -1 Z' ),
    bulletColor: 'rgba( 200, 200, 200, 0.7 )',
    engineColor: 'rgba( 200, 200, 255, 0.7 )',
    gunInfo: [
      { offset: { front: 10, side: -30, angle: 0.2 } },
      { offset: { front: 20, side: -20, angle: 0.1 } },
      { offset: { front: 30, side: -10, angle: 0 } },
      { offset: { front: 30, side:  10, angle: -0 } }, 
      { offset: { front: 20, side:  20, angle: -0.1 } }, 
      { offset: { front: 10, side:  30, angle: -0.2 } }, 
    ],
    engineInfo: [
      {
        size: 5,
        maxLength: 20,
        offset: { front: -40, side: -20, angle: 0 },
      },
      {
        size: 6,
        maxLength: 20,
        offset: { front: -40, side: 0, angle: 0 },
      },
      {
        size: 5,
        maxLength: 20,
        offset: { front: -40, side: 20, angle: 0 },
      },
    ]
  },
};

export const WeaponInfo = {
  Bullet: {
    speed: 0.9,
    size: 2,
    mass: 0.05,
    life: 1,
    decay: 1 / 5000,
    damage: 10,
  },
};

export const RockInfo = {
  size: 50,
  mass: 25,
  life: 250,
  damage: 350,
  bodyFill: 'brown',
};

export const ParticleInfo = {
  Flame: {
    size: 0,
    dSize: 20 / 1000,
    life: 1,
    decay: 1 / 1000,
    damage: 10,
    bodyFill: 'orange',
    bodyPath: new Path2D( `M -1,-1 L 1,-1 L 1,1 L -1,1 Z` ),
  },
};