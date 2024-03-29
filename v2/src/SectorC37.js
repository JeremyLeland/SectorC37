import { Entity } from './Entity.js';
import { Actor } from './Actor.js';
import { Gun } from './Gun.js';
import { Trail } from './Trail.js';
import { BoundingLines } from './BoundingLines.js';
import { World } from './World.js';

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
    this.drawPath = linePath( points );

    this.color = values.color ?? `hsl( 
      ${ 20 + Math.random() * 10 }deg, 
      ${ 100 }%, 
      ${ 20 + Math.random() * 10 }%
    )`;

    this.life = this.size * 1000;
    this.damage = this.size;
    this.mass = this.size;
  }

  getBleedParticle() {
    return new Entity( {
      size: 1 + 2 * Math.random(),
      color: this.color,
      drawPath: linePath( randPoints( 5 + 5 * Math.random() ) ),
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

function linePath( points ) {
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
  drawPath = new Path2D( `
    M 1.0 0.2 L -0.25 0.5 L -0.25 1.0 L -1.0 0.75 
    L -1.0 -0.75 L -0.25 -1.0 L -0.25 -0.5 L 1.0 -0.2 Z
  ` );

  turnSpeed = 0.005;
  moveSpeed = 0.2;
  sprintSpeed = 0.3;

  wanders = false;

  maxLife = 50;
  life = this.maxLife;
  maxEnergy = 100;
  moveEnergy = 0.01;
  sprintEnergy = 0.04;
  energyRechargeRate = 0.03;
  energy = this.maxEnergy;

  damage = 100;
  mass = 1;

  isShootingPrimary = false;
  isShootingSecondary = false;

  primaryGuns = [
    new PlayerGun( { offsets: [ 
      { front: 0, side: -1, angle: -0.1 },
      { front: 0.5, side: -0.5, angle:  0.0 },
      { front: 0.5, side:  0.5, angle:  0.0 },
      { front: 0, side:  1, angle:  0.1 },
    ] } ),
  ];
  
  secondaryGuns = [
    new MissleGun( { offsets: [ { front: 2, side:  0, angle: 0 } ] } ),
  ];

  trailLength = 20;
  trails = [
    new Trail( { 
      offset: { front: -1, side: 0, angle: 0 }, 
      maxWidth: this.size / 3, 
      goalLength: this.trailLength,
      color: 'seagreen',
    } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );

  update( dt, world ) {
    super.update( dt, world );

    this.primaryGuns?.forEach( gun => gun.update( dt, this, this.isShootingPrimary ) );
    this.secondaryGuns?.forEach( gun => gun.update( dt, this, this.isShootingSecondary ) );
  }

  getBleedParticle() {
    return new Entity( {
      size: 1 + 3 * Math.random(),
      color: this.color,
      drawPath: linePath( randPoints( 3 ) ),
    } ); 
  }

  getDieParticle() {
    return new Fire( {
      size: 10 * Math.random(),
      dSize: 0.03,
      drawPath: linePath( randPoints( 5 ) ),
    } ); 
  }
}

export class Scout extends Actor {
  type = 'scout';
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
  avoids = [ 'rock', 'player', 'frigate' ];
  aligns = [ 'scout' ];

  maxLife = 10;
  life = this.maxLife;

  maxEnergy = 50;
  energy = this.maxEnergy;
  moveEnergy = 0.1;
  energyRechargeRate = 0.2;

  damage = 50;
  mass = 1;

  guns = [
    new ScoutGun( { offsets: [ 
      { front: 0, side: -1, angle:  0.0 },
      { front: 0, side:  1, angle:  0.0 },
    ] } ),
  ];

  trailLength = 20;
  trails = [
    new Trail( { 
      offset: { front: -1, side: 0, angle: 0 }, 
      maxWidth: this.size / 3, 
      goalLength: this.trailLength,
      color: 'lightblue',
    } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );

  getBleedParticle() {
    return new Entity( {
      size: 1 + 3 * Math.random(),
      color: this.color,
      drawPath: linePath( randPoints( 3 ) ),
    } ); 
  }

  getDieParticle() {
    return new Fire( {
      size: 10 * Math.random(),
      dSize: 0.03,
      drawPath: linePath( randPoints( 5 ) ),
    } ); 
  }
}

export class Frigate extends Actor {
  type = 'frigate';
  size = 20;

  color = 'cyan';
  drawPath = shipPath();

  turnSpeed = 0.002;
  moveSpeed = 0.1;

  targets = [ 'player' ];
  avoids = [ 'rock' ];
  aligns = [ 'frigate' ];

  maxLife = 100;
  life = this.maxLife;

  maxEnergy = 50;
  energy = this.maxEnergy;
  moveEnergy = 0.1;
  energyRechargeRate = 0.2;

  damage = 100;
  mass = 2;

  guns = [
    new FrigateGun( { offsets: [ 
      { front: 0, side: -1, angle: 0 },
      { front: 0.5, side: -0.5, angle: 0 },
      { front: 0.5, side:  0.5, angle: 0 },
      { front: 0, side:  1, angle: 0 },
    ] } ),
  ];

  trailLength = 20;
  trails = [
    new Trail( { 
      offset: { front: -0.7, side: -0.5, angle: 0 }, 
      maxWidth: this.size / 4, 
      goalLength: this.trailLength,
      color: 'rgba( 200, 255, 255, 0.7 )',
    } ),
    new Trail( { 
      offset: { front: -0.7, side: 0.5, angle: 0 }, 
      maxWidth: this.size / 4, 
      goalLength: this.trailLength,
      color: 'rgba( 200, 255, 255, 0.7 )',
    } ),
  ];

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );

  getBleedParticle() {
    return new Entity( {
      size: 1 + 3 * Math.random(),
      color: this.color,
      drawPath: linePath( randPoints( 3 ) ),
    } ); 
  }

  getDieParticle() {
    return new Fire( {
      size: 10 * Math.random(),
      dSize: 0.03,
      drawPath: linePath( randPoints( 5 ) ),
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

class Bullet extends Entity {
  type = 'bullet';
  size = 1;
  mass = 0.05;
  damage = 2;
  lifeSpan = 5000;

  boundingLines = new BoundingLines( [
    [ -1, 0 ], [ 1, -1 ], [ 1, 1 ],
  ] );
  nohit = [ 'bullet' ];
}

class PlayerBullet extends Bullet {
  trails = [ 
    new Trail( { maxWidth: this.size, goalLength: 40, dLength: 0.6, color: 'seagreen' } ) 
  ];
}

class ScoutBullet extends Bullet {
  trails = [
    new Trail( { maxWidth: this.size, goalLength: 40, dLength: 0.6, color: 'lightblue' } )
  ];
}

class FrigateBullet extends Bullet {
  trails = [
    new Trail( { maxWidth: this.size, goalLength: 40, dLength: 0.6, color: 'rgba( 200, 255, 255, 0.7 )' } )
  ];
}

class Missle extends Actor {
  type = 'missle';
  size = 7;
  trailLength = 25;
  trails = [
    new Trail( { 
      offset: { front: -1, side: 0, angle: 0 }, 
      maxWidth: this.size / 3, 
      goalLength: this.trailLength, 
      dLength: 0.6, 
      color: 'orange' 
    } )
  ];
  mass = 0.5;
  damage = 20;
  lifeSpan = 10000;

  color = 'gray';
  drawPath = shipPath();

  boundingLines = new BoundingLines( [
    [ 1, 0 ], [ -1, 1 ], [ -1, -1 ],
  ] );
  nohit = [ 'bullet' ];

  targets = [ 'scout', 'frigate' ];
  turnSpeed = 0.004;
  moveSpeed = 0.3;

  // TODO: Limited energy? (so they eventually stop navigating and just crash)

  getBleedParticle() {
    return new Entity( {
      size: 3 + 3 * Math.random(),
      color: this.color,
      drawPath: linePath( randPoints( 3 ) ),
    } ); 
  }

  getDieParticle() {
    return new Fire( {
      size: 10 * Math.random(),
      dSize: 0.03,
      drawPath: linePath( randPoints( 5 ) ),
    } ); 
  }
}

class PlayerGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;
  energyCost = 5;

  getBullet( values ) {
    return new PlayerBullet( values );
  }
}

class ScoutGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;
  energyCost = 5;

  getBullet( values ) {
    return new ScoutBullet( values );
  }
}

class FrigateGun extends Gun {
  timeBetweenShots = 200;
  bulletSpeed = 0.6;
  energyCost = 5;

  getBullet( values ) {
    return new FrigateBullet( values );
  }
}

class MissleGun extends Gun {
  timeBetweenShots = 2000;
  bulletSpeed = 0.2;
  energyCost = 5;

  getBullet( values ) {
    return new Missle( values );
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
    // ctx.filter = 'blur( 8px )'; // NOTE: 8px is faster than other values?!?
    ctx.globalCompositeOperation = 'screen';
    // ctx.globalAlpha = 0.1;
    super.draw( ctx );
    ctx.globalCompositeOperation = 'source-over';
    // ctx.globalAlpha = 1;
    ctx.filter = 'none';
  }
}


//
// Level
//

export class Level {
  world;

  playableRadius = 1000;
  spawnRadius = 500;
  startingRocks = 10;
  startingScouts = 5;
  startingFrigates = 1;
  
  rockSpawnDelay = 3000;
  rockSpawnTimer = this.rockSpawnDelay;

  scoutSpawnDelay = 5000;
  scoutSpawnTimer = this.scoutSpawnDelay;

  frigateSpawnDelay = 10000;
  frigateSpawnTimer = this.frigateSpawnDelay;

  constructor( values ) {
    Object.assign( this, values );

    this.world = new World( this.playableRadius + this.spawnRadius );

    for ( let i = 0; i < this.startingRocks; i ++ ) {
      this.spawnRock();
    }

    for ( let i = 0; i < this.startingScouts; i ++ ) {
      this.spawnShip( new Scout() );
    }

    for ( let i = 0; i < this.startingFrigates; i ++ ) {
      this.spawnShip( new Frigate() );
    }
  }

  update( dt ) {
    this.world.update( dt );

    if ( ( this.rockSpawnTimer -= dt ) < 0 ) {
      this.rockSpawnTimer += this.rockSpawnDelay;
      this.spawnRock( this.playableRadius );
    }

    if ( ( this.scoutSpawnTimer -= dt ) < 0 ) {
      this.scoutSpawnTimer += this.scoutSpawnDelay;
      this.spawnShip( new Scout(), this.playableRadius );
    }

    if ( ( this.frigateSpawnTimer -= dt ) < 0 ) {
      this.frigateSpawnTimer += this.frigateSpawnDelay;
      this.spawnShip( new Frigate(), this.playableRadius );
    }
  }

  draw( ctx ) {
    this.world.draw( ctx );
  }

  spawnRock( minRadius = 0 ) {
    const rockSize = 10 + 50 * Math.random();

    const spawn = this.world.getSpawnPoint( rockSize * 2, { minRadius: minRadius } );
    if ( spawn ) {
      const moveAngle = minRadius == 0 ? 
        Math.random() * Math.PI * 2 : 
        Math.atan2( -spawn.y, -spawn.x ) + 0.5 * ( -0.5 + Math.random() );
      const moveSpeed = 0.05 + 0.05 * ( -0.5 + Math.random() );

      this.world.entities.push( new Rock( { 
        x: spawn.x,
        y: spawn.y,
        dx: Math.cos( moveAngle ) * moveSpeed,
        dy: Math.sin( moveAngle ) * moveSpeed,
        angle: Math.random() * Math.PI * 2,
        dAngle: 0.004 * ( -0.5 + Math.random() ),
        size: rockSize,
      } ) );
    }
  }

  spawnShip( ship, minRadius = 0 ) {
    const spawn = this.world.getSpawnPoint( ship.size * 2, { minRadius: minRadius } );
    if ( spawn ) {
      ship.x = spawn.x;
      ship.y = spawn.y;
      ship.angle = Math.atan2( -spawn.y, -spawn.x );

      this.world.entities.push( ship );
    }
  }
}