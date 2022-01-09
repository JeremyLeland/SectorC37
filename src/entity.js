import { Info } from '../info/info.js';

export class Entity {
  x = 0;
  y = 0;
  angle = 0;

  dx = 0;
  dy = 0;
  dAngle = 0;
  dSize = 0;

  speed = 0;
  turnSpeed = 0;
  size = 0;
  life = 0;
  decay = 0;
  damage = 0;

  createdEntities = [];
  createdParticles = [];

  timers = [];
  
  constructor( info ) {
    Object.assign( this, info );
  }

  isAlive() {
    return this.life > 0;
  }

  distanceTo( other ) {
    return Math.hypot( this.x - other.x, this.y - other.y ) - this.size - other.size;
  }

  hitWith( other ) {
    if ( this.isAlive() ) {
      this.life -= other.damage;

      this.bleed();
  
      if ( this.life <= 0 ) {
        this.die();
      }
    }
  }

  bleed() {
    // children should override
  }

  die() {
    // children should override
  }

  spawnFromCenter( entity, { spread = 0.5, moveSpeed = 0.075, turnSpeed = 0.04 } = {} ) {
    const dir = randMid() * Math.PI * 2;
    const cos = Math.cos( dir );
    const sin = Math.sin( dir );
 
    Object.assign( entity, { 
      x: this.x + cos * Math.random() * spread * this.size,
      y: this.y + sin * Math.random() * spread * this.size,
      dx: cos * rand25() * moveSpeed,
      dy: sin * rand25() * moveSpeed,
      dAngle: randMid() * turnSpeed,
      dSize: entity.dSize * rand25(),
    } );
  }

  createFire() {
    const flame = new Flame( Info.Flame );
    this.spawnFromCenter( flame, { spread: 0.5, moveSpeed: 0.01, turnSpeed: 0.01 } );
    this.createdParticles.push( flame );
  }

  createTrail() {
    const flame = new Flame( Info.Trail );
    this.spawnFromCenter( flame, { spread: 0, moveSpeed: 0, turnSpeed: 0.01 } );
    this.createdParticles.push( flame );
  }

  createDebris() {
    const shard = new Entity( { 
      size: 3,
      life: 1,
      decay: 1 / 1000,
      bodyFill: this.bodyFill, 
      bodyPath: this.bodyPath
    } );

    this.spawnFromCenter( shard );
    this.createdParticles.push( shard );
  }

  update( dt ) {
    this.life -= this.decay * dt;   // TODO: Track life and decay separately? Maybe use a timer for decay?

    for ( const timer in this.timers ) {
      this.timers[ timer ] -= dt;
    }

    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.angle += this.dAngle * dt;
    this.size += this.dSize * dt;
  }

  draw( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( this.angle );
    ctx.scale( this.size, this.size );

    if ( this.decay > 0 ) {
      ctx.globalAlpha = this.life;
    }

    ctx.fillStyle = this.bodyFill;
    // ctx.strokeStyle = 'black';
    // ctx.lineWidth = 1 / this.size;
    ctx.fill( this.bodyPath );
    // ctx.stroke( this.bodyPath );

    ctx.restore();
  }
}

export const Settings = {
  GoalWeight: 0.5,
  AvoidWeight: 100,
  AvoidPower: 1,
  DrawForces: false,
};

class Gun {
  offset = { front: 0, side: 0, angle: 0 };
  timeUntilReady = 0;
  timeBetweenShots = 200;
  owner;

  constructor( gunInfo ) {
    Object.assign( this, gunInfo );
  }

  update( dt ) {
    this.timeUntilReady -= dt;

    if ( this.timeUntilReady < 0 && this.owner.isShooting ) {
      const bullet = new Bullet( Info.Bullet );
      bullet.angle = this.owner.angle + this.offset.angle;
      bullet.x = this.owner.x + 
        Math.cos( this.owner.angle ) * this.offset.front + 
        Math.cos( this.owner.angle + Math.PI / 2 ) * this.offset.side;
      bullet.y = this.owner.y + 
        Math.sin( this.owner.angle ) * this.offset.front + 
        Math.sin( this.owner.angle + Math.PI / 2 ) * this.offset.side;
      bullet.dx = this.owner.dx + Math.cos( bullet.angle ) * bullet.speed;
      bullet.dy = this.owner.dy + Math.sin( bullet.angle ) * bullet.speed;
  
      this.owner.createdEntities.push( bullet );

      this.timeUntilReady = this.timeBetweenShots;
    }
  }
}

const TIME_BETWEEN_TRAILS = 10;
const TIME_BETWEEN_WANDERS = 5000;

export class Ship extends Entity {
  isShooting = false;
  guns = [];

  goalAngle = 0;
  isSliding = false;

  wanderX = 0;
  wanderY = 0;

  constructor( shipInfo ) {
    super( shipInfo );

    this.guns.push(
      new Gun( { 
        offset: { front: shipInfo.size, side: -shipInfo.size, angle: 0.02 }, 
        owner: this 
      } )
    );
    this.guns.push(
      new Gun( { 
        offset: { front: shipInfo.size, side: shipInfo.size, angle: -0.02 }, 
        owner: this 
      } )
    );

    this.timers.trail = 0;
    this.timers.wander = 0;
  }

  bleed() {
    for ( let i = 0; i < 3; i ++ ) {
      this.createDebris();
    }
  }

  die() {
    for ( let i = 0; i < 20; i ++ ) {
      this.createFire();
    }
    for ( let i = 0; i < 30; i ++ ) {
      this.createDebris();
    }
  }

  #getAvoidVectors( entities ) {
    return entities.filter( e => e != this ).map( entity => {
      const cx = this.x - entity.x;
      const cy = this.y - entity.y;
      const angle = Math.atan2( cy, cx );
      const dist = Math.hypot( cx, cy ) - entity.size - this.size;
      
      return { 
        angle: angle,
        dist: dist,
      };
    } );
    // TODO: Filter out items we can't crash into (e.g. behind us)?
  }

  think( target, world ) {
    // TODO: Or if we get close
    if ( this.timers.wander < 0 ) {
      this.timers.wander = TIME_BETWEEN_WANDERS;
      [ this.wanderX, this.wanderY ] = world.getEmptyLocation( this.size );
    }

    // TODO: Only if we are close to target
    const goalX = target?.x ?? this.wanderX;
    const goalY = target?.y ?? this.wanderY;

    const avoidVectors = this.#getAvoidVectors( world.entities );
    const weighted = avoidVectors.map( vector => {
      const weightedDist = Math.abs( Settings.AvoidWeight / Math.pow( vector.dist, Settings.AvoidPower ) );
      return { 
        x: Math.cos( vector.angle ) * weightedDist / avoidVectors.length,
        y: Math.sin( vector.angle ) * weightedDist / avoidVectors.length,
      };
    } );

    const goalAngle = Math.atan2( goalY - this.y, goalX - this.x );
    const goalForce = {
      x: Settings.GoalWeight * Math.cos( goalAngle ), 
      y: Settings.GoalWeight * Math.sin( goalAngle ),
    }

    const finalForce = weighted.reduce(
      ( acc, wv ) => ( { x: acc.x + wv.x, y: acc.y + wv.y } ),
      goalForce
    );

    this.goalAngle = Math.atan2( finalForce.y, finalForce.x );    

    if ( target ) {
      const angleToTarget = Math.atan2( target.y - this.y, target.x - this.x );
      this.isShooting = Math.abs( angleToTarget - this.angle ) < 0.5 && this.distanceTo( target ) < 150;
    }
    else {
      this.isShooting = false;
    }
  }

  update( dt ) {

    // TODO: Move dx/dy changes based on angle to here -- entities shouldn't take angle into account when moving
    // Use isSlinding instead of speed > 0 for determining when to change dx/dy

    // Turn toward goal angle
    if ( this.goalAngle ) {
      this.angle = fixAngleTo( this.angle, this.goalAngle );
      if ( this.goalAngle < this.angle ) {
        this.angle = Math.max( this.goalAngle, this.angle - this.turnSpeed * dt );
      }
      else if ( this.angle < this.goalAngle ) {
        this.angle = Math.min( this.goalAngle, this.angle + this.turnSpeed * dt );
      }  
    }
    
    // Move forward
    if ( !this.isSliding ) {
      this.dx = Math.cos( this.angle ) * this.speed;
      this.dy = Math.sin( this.angle ) * this.speed;
    }

    // TODO TODO: Figure out a smooth way to transition dx/dy after we stop sliding

    super.update( dt );

    this.guns.forEach( gun => gun.update( dt ) );

    if ( this.timers.trail < 0 ) {
      this.createTrail();

      this.timers.trail = TIME_BETWEEN_TRAILS;
    }
  }
}

export class Rock extends Entity {
  constructor( info ) {
    super( info );

    this.angle = Math.random() * Math.PI * 2;
    this.dx = randMid() * 0.01;
    this.dy = randMid() * 0.01;
    this.dAngle = randMid() * 0.001;

    this.bodyPath = new Path2D( `M ${ getPoints().join( ' L ' ) } Z` );
  }

  bleed() {
    for ( let i = 0; i < 3; i ++ ) {
      this.createDebris();
    }
  }

  die() {
    // Make smaller rocks
    if ( this.size > 20 ) {
      [ -1, 1 ].forEach( xOffset => {
        [ -1, 1 ].forEach( yOffset => {
          const rock = new Rock( Info.Rock );
          
          rock.size = this.size / 2;
          rock.life = this.size / 2;
          rock.damage = this.damage / 2;

          rock.x = this.x + xOffset * this.size / 2;
          rock.y = this.y + yOffset * this.size / 2;
          rock.dx += this.dx + xOffset * 0.01;
          rock.dy += this.dy + yOffset * 0.01;
          rock.dAngle += this.dAngle;

          this.createdEntities.push( rock );
        } );
      } );
    }

    // Make particles
    for ( let i = 0; i < this.size / 4; i ++ ) {
      this.createDebris();
    }
  }
}

export class Bullet extends Entity {
  constructor( info ) {
    super( info );
  }

  // TODO: die() with sparks
}

export class Flame extends Entity {
  draw( ctx ) {
    ctx.save();

    // ctx.filter = 'blur( 8px )'; // NOTE: 8px is faster than other values?!?
    ctx.globalCompositeOperation = 'screen';

    // Inspired by http://codepen.io/davepvm/pen/Hhstl
    const r = 140 + 120 * this.life;
    const g = 170 - 120 * this.life;
    const b = 120 - 120 * this.life;
    // this.bodyFill = `rgb( ${ r }, ${ g }, ${ b } )`;

    const grad = ctx.createRadialGradient( 0, 0, 0.5, 0, 0, 1 );
    grad.addColorStop( 0, `rgba( ${ r }, ${ g }, ${ b }, 1 )` );
    grad.addColorStop( 1, `rgba( ${ r }, ${ g }, ${ b }, 0 )` );

    this.bodyFill = grad;
    
    super.draw( ctx );

    ctx.restore();
  }
}

function fixAngleTo( angle, otherAngle ) {
  if ( otherAngle - angle > Math.PI ) {
    return angle + Math.PI * 2;
  }
  else if ( angle - otherAngle > Math.PI ) {
    return angle - Math.PI * 2;
  }

  return angle;
}

function getPoints( numPoints = 12 ) {
  const spacing = Math.PI * 2 / numPoints;
  const angles = Array.from( Array( numPoints ), ( _, ndx ) => 
    spacing * ( ndx + randMid() * 0.5 ) 
  );
  return angles.map( angle => 
    [ Math.cos( angle ), Math.sin( angle ) ].map( e => 
      e + randMid() * 0.2 
    )
  );
}

function rand25()  { return Math.random() + 0.25; }
function randMid() { return Math.random() - 0.50; }