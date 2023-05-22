import { Entity } from './Entity.js';
import { Actor } from './Actor.js';
import { Gun } from './Gun.js';
import { Trail } from './Trail.js';
import { BoundingLines } from './BoundingLines.js';

//
// Rocks
//
export class Rock extends Entity {
  
  constructor( values ) {
    super( values );

    this.type = 'rock';
    this.size = values.size ?? 20;

    const points = randPoints( 10 + 5 * Math.random() );
    this.boundingLines = new BoundingLines( points );
    this.drawPath = rockPath( points );

    this.color = values.color ?? `hsl( 
      ${ 20 + Math.random() * 10 }deg, 
      ${ 100 }%, 
      ${ 20 + Math.random() * 10 }%
    )`;

    this.life = this.size;
    this.damage = this.size;
    this.mass = this.size;
  }

  getBleedParticle() {
    return new Entity( {
      size: 2 + 2 * Math.random(),
      color: this.color,
      drawPath: rockPath( randPoints( 5 + 5 * Math.random() ) ),
    } );
  }

  die( hit ) {
    if ( this.size > 20 ) {
      const numChildren = 4;
      const angleOffset = Math.PI * Math.random();
      for ( let i = 0; i < numChildren; i ++ ) {
        const angle = angleOffset + Math.PI * 2 * ( i /*+ 0.25 + 0.5 * Math.random()*/ ) / numChildren;
        const dist = this.size / 2;
        
        this.createdEntities.push( 
          new Rock( {
            size: this.size / 3,
            color: this.color,
            x: this.x + Math.cos( angle ) * dist,
            y: this.y + Math.sin( angle ) * dist,
            dx: 0.5 * this.dx + ( 0.01 + 0.01 * Math.random() ) * Math.cos( angle ),
            dy: 0.5 * this.dy + ( 0.01 + 0.01 * Math.random() ) * Math.sin( angle ),
            dAngle: 0.01 * ( -0.5 + Math.random() ),
        } )
        );
      }
    }

    super.die( hit );
  }
}

function randPoints( sides ) {
  const points = [];
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

//
// Ships
//
export class Player extends Actor {
  type = 'player';
  size = 12;

  color = 'green';
  drawPath = shipPath();

  turnSpeed = 0.005;
  moveSpeed = 0.2;

  wanders = false;

  life = 50;
  damage = 100;
  mass = 1;

  guns = [
    new PlayerGun( { offset: { front: 0, side: -1, angle: 0 } } ),
    new PlayerGun( { offset: { front: 0, side:  1, angle: 0 } } ),
  ];

  trails = [
    new Trail( { 
      offset: { front: -1, side: 0, angle: 0 }, 
      maxWidth: this.size / 3, 
      maxLength: 20,
      color: 'seagreen',
    } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );

  getBleedParticle() {
    return new Entity( {
      size: 3 + 3 * Math.random(),
      color: this.color,
      drawPath: rockPath( randPoints( 3 ) ),
    } ); 
  }

  getDieParticle() {
    return new Fire( {
      size: 10 * Math.random(),
      dSize: 0.03,
      drawPath: rockPath( randPoints( 5 ) ),
    } ); 
  }
}

export class Ship extends Actor {
  type = 'ship';
  size = 12;

  color = `hsl( 
    ${ 205 + Math.random() * 10 }deg, 
    ${ 90 + Math.random() * 10 }%, 
    ${ 50 + Math.random() * 10 }%
  )`;
  drawPath = shipPath();

  turnSpeed = 0.004;
  moveSpeed = 0.15;

  targets = [ 'player' ];
  avoids = [ 'rock', 'player' ];
  aligns = [ 'ship' ];

  life = 10;
  damage = 50;
  mass = 1;

  guns = [
    new ShipGun( { offset: { front: 0, side: -1, angle: 0 } } ),
    new ShipGun( { offset: { front: 0, side:  1, angle: 0 } } ),
  ];

  trails = [
    new Trail( { 
      offset: { front: -1, side: 0, angle: 0 }, 
      maxWidth: this.size / 3, 
      maxLength: 20,
      color: 'lightblue',
    } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );

  getBleedParticle() {
    return new Entity( {
      size: 3 + 3 * Math.random(),
      color: this.color,
      drawPath: rockPath( randPoints( 3 ) ),
    } ); 
  }

  getDieParticle() {
    return new Fire( {
      size: 10 * Math.random(),
      dSize: 0.03,
      drawPath: rockPath( randPoints( 5 ) ),
    } ); 
  }
}

function shipPath() {
  const path = new Path2D();
  path.moveTo( 1, 0 );
  path.arc( 0, 0, 1, 2.2, -2.2 );
  path.closePath();
  return path;
}

//
// Bullets
//

class PlayerBullet extends Entity {
  size = 1;
  trail = new Trail( { maxWidth: this.size, maxLength: 40, color: 'orange' } );
  mass = 0.05;
  damage = 2;
  lifeSpan = 5000;

  boundingLines = new BoundingLines( [
    [ -1, 0 ], [ 1, -1 ], [ 1, 1 ],
  ] );

  update( dt, entities ) {
    super.update( dt, entities );

    this.trail.update( this );
  }

  draw( ctx ) {
    this.trail.draw( ctx );
    super.draw( ctx );  // for debug visuals
  }
}

class ShipBullet extends Entity {
  size = 1;
  trail = new Trail( { maxWidth: this.size, maxLength: 40, color: 'yellow' } );
  mass = 0.05;
  damage = 2;
  lifeSpan = 5000;

  boundingLines = new BoundingLines( [
    [ -1, 0 ], [ 1, -1 ], [ 1, 1 ],
  ] );

  update( dt, entities ) {
    super.update( dt, entities );

    this.trail.update( this );
  }

  draw( ctx ) {
    this.trail.draw( ctx );
    super.draw( ctx );  // for debug visuals
  }
}

class PlayerGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;

  getBullet( values ) {
    return new PlayerBullet( values );
  }
}

class ShipGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;

  getBullet( values ) {
    return new ShipBullet( values );
  }
}

//
// Particles
//

class Fire extends Entity {
  color = `hsl(
    ${ 16 + 48 * Math.random() }deg,
    ${ 50 + 50 * Math.random() }%,
    ${ 15 + 50 * Math.random() }%
  )`;

  draw( ctx ) {
    ctx.filter = 'blur( 8px )'; // NOTE: 8px is faster than other values?!?
    ctx.globalCompositeOperation = 'screen';
    // ctx.globalAlpha = 0.1;
    super.draw( ctx );
    ctx.globalCompositeOperation = 'source-over';
    // ctx.globalAlpha = 1;
    ctx.filter = 'none';
  }
}


