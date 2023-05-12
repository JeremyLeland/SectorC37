import { Entity } from './Entity.js';
import { Actor } from './Actor.js';
import { Gun } from './Gun.js';
import { BoundingLines } from './BoundingLines.js';

export class Rock extends Entity {
  type = 'rock';
  size = 10 + Math.random() * 30;

  color = `hsl( 
    ${ 20 + Math.random() * 10 }deg, 
    ${ 100 }%, 
    ${ 20 + Math.random() * 10 }%
  )`;
  drawPath = rockPath();

  dx = 0.1 * ( Math.random() - 0.5 );
  dy = 0.1 * ( Math.random() - 0.5 );
  dAngle = 0.004 * ( Math.random() - 0.5 );
}

function rockPath() {
  const path = new Path2D();
  const sides = 10 + Math.random() * 5;
  for ( let i = 0; i < sides; i ++ ) {
    const angle = Math.PI * 2 * ( i + 0.25 + 0.5 * Math.random() ) / sides;
    const dist = 0.75 + 0.25 * Math.random();
    path.lineTo( Math.cos( angle ) * dist, Math.sin( angle ) * dist );
  }
  path.closePath();
  return path;
}

export class Player extends Actor {
  type = 'player';
  size = 16;

  color = 'green';
  drawPath = shipPath();

  turnSpeed = 0.005;
  moveSpeed = 0.2;

  guns = [
    new PlayerGun( { offset: { front: 1, side: -1, angle: 0 } } ),
    new PlayerGun( { offset: { front: 1, side:  1, angle: 0 } } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );
}

class PlayerBullet extends Entity {
  size = 4;
  trailLength = 40;
  mass = 0.05;
  damage = 10;
  color = 'orange';
  drawPath = bulletPath();
  lifeSpan = 1000;
}

class PlayerGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;

  getBullet( values ) {
    return new PlayerBullet( values );
  }
}


export class Ship extends Actor {
  type = 'ship';
  size = 16;

  color = 'dodgerblue';
  drawPath = shipPath();

  turnSpeed = 0.004;
  moveSpeed = 0.15;

  avoids = [ 'rock', 'player' ];
  aligns = [ 'ship' ];

  guns = [
    new ShipGun( { offset: { front: 1, side: -1, angle: 0 } } ),
    new ShipGun( { offset: { front: 1, side:  1, angle: 0 } } ),
  ];
}

function shipPath() {
  const path = new Path2D();
  path.moveTo( 1, 0 );
  path.arc( 0, 0, 1, 2.2, -2.2 );
  path.closePath();
  return path;
}

class ShipBullet extends Entity {
  size = 4;
  trailLength = 40;
  mass = 0.05;
  damage = 10;
  color = 'yellow';
  drawPath = bulletPath();
  lifeSpan = 1000;
}

class ShipGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;

  getBullet( values ) {
    return new ShipBullet( values );
  }
}

function bulletPath() {
  const path = new Path2D();
  path.moveTo( -1, 0 );
  path.arc( 0, 0, 1, -1, 1 );
  path.closePath();
  return path;
}



