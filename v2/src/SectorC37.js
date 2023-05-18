import { Entity } from './Entity.js';
import { Actor } from './Actor.js';
import { Gun } from './Gun.js';
import { Trail } from './Trail.js';
import { BoundingLines } from './BoundingLines.js';

export class Rock extends Entity {
  type = 'rock';
  size = 10 + Math.random() * 50;

  boundingLines = new BoundingLines( rockPoints() );

  color = `hsl( 
    ${ 20 + Math.random() * 10 }deg, 
    ${ 100 }%, 
    ${ 20 + Math.random() * 10 }%
  )`;
  drawPath = rockPath( this.boundingLines.points );

  // dx = 0.1 * ( Math.random() - 0.5 );
  // dy = 0.1 * ( Math.random() - 0.5 );
  // dAngle = 0.004 * ( Math.random() - 0.5 );

  life = this.size * 100;
  damage = this.size;

  mass = this.size;
}

function rockPoints() {
  const points = [];
  const sides = 10 + Math.random() * 5;
  for ( let i = 0; i < sides; i ++ ) {
    const angle = Math.PI * 2 * ( i + 0.35 + 0.3 * Math.random() ) / sides;
    const dist = 0.75 + 0.25 * Math.random();
    points.push( [ Math.cos( angle ) * dist, Math.sin( angle ) * dist ] );
  }
  return points;
}

function rockPath( points ) {
  const path = new Path2D();
  points.forEach( p => path.lineTo( p[ 0 ], p[ 1 ] ) );
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

  life = 200;
  damage = 100;
  mass = 1;

  guns = [
    new PlayerGun( { offset: { front: 1, side: -1, angle: 0 } } ),
    new PlayerGun( { offset: { front: 1, side:  1, angle: 0 } } ),
  ];

  trails = [
    new Trail( { offset: { front: -1, side: 0, angle: 0 }, maxWidth: this.size / 3, maxLength: 50 } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );
}

class PlayerBullet extends Entity {
  size = 3;
  trail = new Trail( { maxWidth: this.size, maxLength: 40 } );
  mass = 0.05;
  damage = 10;
  color = 'orange';
  lifeSpan = 1000;

  boundingLines = new BoundingLines( [
    [ -1, 0 ], [ 1, -1 ], [ 1, 1 ],
  ] );

  update( dt, entities ) {
    super.update( dt, entities );

    this.trail.update( this );
  }

  draw( ctx ) {
    ctx.fillStyle = this.color;
    ctx.fill( this.trail.getPath() );

    super.draw( ctx );
  }
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

  color = `hsl( 
    ${ 205 + Math.random() * 10 }deg, 
    ${ 90 + Math.random() * 10 }%, 
    ${ 50 + Math.random() * 10 }%
  )`;
  drawPath = shipPath();

  turnSpeed = 0.004;
  moveSpeed = 0.15;

  avoids = [ 'rock', 'player' ];
  aligns = [ 'ship' ];

  life = 20;
  damage = 50;
  mass = 1;

  guns = [
    new ShipGun( { offset: { front: 1, side: -1, angle: 0 } } ),
    new ShipGun( { offset: { front: 1, side:  1, angle: 0 } } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );
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

  boundingLines = new BoundingLines( [
    [ -1, 0 ], [ 1, -1 ], [ 1, 1 ],
  ] );
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



