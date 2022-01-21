import { Entity } from './Entity.js';
import { Info } from '../info/info.js';

const ATTACK_RANGE = 250;
const ATTACK_AIM = 0.5;

export const Settings = {
  GoalWeight: 0.5,
  AvoidWeight: 100,
  AvoidPower: 1,
  DrawForces: false,
};

// TODO: Combine Gun and Engine somehow? Very similar code...

class Gun {
  offset = { front: 0, side: 0, angle: 0 };
  timeUntilReady = 0;
  timeBetweenShots = 200;
  owner;

  constructor( gunInfo, owner ) {
    Object.assign( this, gunInfo );
    this.owner = owner;
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
      bullet.owner = this.owner;
  
      this.owner.createdEntities.push( bullet );

      this.timeUntilReady = this.timeBetweenShots;
    }
  }
}

class Engine {
  offset = { front: 0, side: 0, angle: 0 };
  trails = [ 
    new Trail( 4, 20, `rgba( 255, 128, 0, 0.7 )` ),
    //new Trail( 2, 10, `rgba( 255, 255, 0, 0.8 )` ),
    //new Trail( 1, 5, `rgba( 255, 255, 255, 0.9 )` )
  ];
  owner;

  constructor( engineInfo, owner ) {
    Object.assign( this, engineInfo );
    this.owner = owner;
  }

  update( dt ) {
    const x = this.owner.x + 
      Math.cos( this.owner.angle ) * this.offset.front + 
      Math.cos( this.owner.angle + Math.PI / 2 ) * this.offset.side;
    const y = this.owner.y + 
      Math.sin( this.owner.angle ) * this.offset.front + 
      Math.sin( this.owner.angle + Math.PI / 2 ) * this.offset.side;
    const angle = this.owner.angle + this.offset.angle;
    const length = this.owner.speed * dt;

    this.trails.forEach( trail => trail.addPoint( x, y, angle, length ) );
  }

  draw( ctx ) {
    this.trails.forEach( trail => trail.draw( ctx ) );
  }
}

const TIME_BETWEEN_TRAILS = 10;
const TIME_BETWEEN_WANDERS = 5000;

export class Ship extends Entity {
  isShooting = false;
  isSprinting = false;
  guns = [];
  engines = [];

  goalAngle = 0;
  isSliding = false;
  accel = 0.002;

  goalX = 0;
  goalY = 0;

  #avoidDebug = new Path2D();

  constructor( shipInfo ) {
    super( shipInfo );

    shipInfo.gunInfo.forEach( info => this.guns.push( new Gun( info, this ) ) );
    shipInfo.engineInfo.forEach( info => this.engines.push( new Engine( info, this ) ) );
    
    this.timers.wander = 0;
  }

  bleed( hit ) {
    for ( let i = 0; i < 3; i ++ ) {
      this.createDebris( hit );
    }
  }

  die( hit ) {
    for ( let i = 0; i < 2 * this.size; i ++ ) {
      this.createFire();
    }
    for ( let i = 0; i < 3 * this.size; i ++ ) {
      this.createDebris();
    }
  }

  createFire() {
    const flame = new Flame( Info.Flame );
    this.spawnFromCenter( flame, { spread: 0.5, moveSpeed: 0.01, turnSpeed: 0.01 } );
    this.createdParticles.push( flame );
  }

  createDebris( hit ) {
    const shard = new Entity( { 
      size: 3,
      life: 1,
      decay: 1 / 1000,
      bodyFill: this.bodyFill, 
      bodyPath: this.bodyPath
    } );

    hit ? this.spawnFromHit( shard, hit ) : this.spawnFromCenter( shard );
    this.createdParticles.push( shard );
  }

  #getAvoidVectors( entities ) {
    return entities.filter( e => e != this ).map( entity => {
      const cx = this.x - entity.x;
      const cy = this.y - entity.y;
      const angle = Math.atan2( cy, cx );
      const dist = Math.hypot( cx, cy ) - entity.size - this.size;

      // TODO: Make avoid vector perpendicular to their direction of movement?
      // It's ok to be close to something as long as we're not going to hit it.
  
      return { 
        angle: angle,
        dist: dist,
      };
    } );
    // TODO: Filter out items we can't crash into (e.g. behind us)?
  }

  think( target, world ) {
    // TODO: Or if we get close
    // if ( this.timers.wander < 0 ) {
    //   this.timers.wander = TIME_BETWEEN_WANDERS;
    //   [ this.wanderX, this.wanderY ] = world.getEmptyLocation( this.size );
    // }

    // Remove ourselves if we reached our goal
    if ( Math.hypot( this.goalX - this.x, this.goalY - this.y ) < this.size * 2 ) {
      this.life = 0;
    }

    // TODO: Only if we are close to target
    const goalX = target?.x ?? this.goalX;
    const goalY = target?.y ?? this.goalY;

    const avoidVectors = this.#getAvoidVectors( world.entities.filter( e => !( e instanceof Bullet ) ) );
    const weighted = avoidVectors.map( vector => {

      // TODO: Weight based on time until collision instead of distance?

      const weightedDist = Math.abs( Settings.AvoidWeight / Math.pow( vector.dist, Settings.AvoidPower ) );
      return { 
        x: Math.cos( vector.angle ) * weightedDist / avoidVectors.length,
        y: Math.sin( vector.angle ) * weightedDist / avoidVectors.length,
      };
    } );

    const DEBUG_SCALE = 200;
    this.#avoidDebug = new Path2D();
    weighted.forEach( vector => {
      this.#avoidDebug.moveTo( this.x, this.y );
      this.#avoidDebug.lineTo( this.x + vector.x * DEBUG_SCALE, this.y + vector.y * DEBUG_SCALE );
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
      this.isShooting = Math.abs( angleToTarget - this.angle ) < ATTACK_AIM && this.distanceTo( target ) < ATTACK_RANGE;
    }
    else {
      this.isShooting = false;
    }
  }

  update( dt ) {
    // Turn toward goal angle
    if ( this.goalAngle ) {
      this.angle = approach( 
        fixAngleTo( this.angle, this.goalAngle ), 
        this.goalAngle, 
        ( this.isSliding ? 1.5 : 1 ) * this.turnSpeed, 
        dt 
      );  
    }
    
    // Move forward
    if ( !this.isSliding ) {
      const speed = ( this.isSprinting ? 2 : 1 ) * this.speed;
      this.dx = approach( 
        this.dx, Math.cos( this.angle ) * speed, this.accel, dt 
      );
      this.dy = approach( 
        this.dy, Math.sin( this.angle ) * speed, this.accel, dt
      );
    }

    super.update( dt );

    this.guns.forEach( gun => gun.update( dt ) );
    this.engines.forEach( engine => engine.update( dt ) );
  }
  
  draw( ctx ) {
    if ( !this.isSliding ) {
      this.engines.forEach( engine => engine.draw( ctx ) );
    }

    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.goalX, this.goalY );
    ctx.stroke();

    ctx.stroke( this.#avoidDebug );

    super.draw( ctx );
  }
}

function approach( current, goal, speed, dt ) {
  if ( goal < current ) {
    return Math.max( goal, current - speed * dt );
  }
  else if ( current < goal ) {
    return Math.min( goal, current + speed * dt );
  }
  else {
    return current;
  }
}



export class Bullet extends Entity {
  trail = new Trail( this.size, 40, `rgba( 255, 255, 0, 0.5 )` );
  
  constructor( info ) {
    super( info );
  }

  die( hit ) {
    for ( let i = 0; i < 1; i ++ ) {
      const shard = new Entity( { 
        size: 1,
        life: 1,
        decay: 1 / 1000,
        bodyFill: this.bodyFill, 
        bodyPath: this.bodyPath
      } );

      this.spawnFromHit( shard, hit, { moveSpeed: this.speed * 0.2, turnSpeed: 0 } );
      this.createdParticles.push( shard );
    }
  }

  update( dt ) {
    super.update( dt );

    this.trail.addPoint( this.x, this.y, this.angle, this.speed * dt );
  }

  draw( ctx ) {
    this.trail.draw( ctx );
  }
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

class Trail {
  size;
  maxLength;
  fillStyle;
  
  #points = [];
  #length = 0;

  constructor( size, maxLength, fillStyle ) {
    this.size = size;
    this.maxLength = maxLength;
    this.fillStyle = fillStyle;
  }

  addPoint( x, y, angle, length ) {
    this.#points.push( { x: x, y: y, angle: angle, length: length } );
    this.#length += length;

    while ( this.#length > this.maxLength && this.#points.length > 0 ) {
      const excess = this.#length - this.maxLength;
      const tail = this.#points[ 0 ];

      if ( excess > tail.length ) {
        this.#points.shift();
        this.#length -= tail.length;
      }
      else {
        tail.length -= excess;
        this.#length -= excess;
      }
    }
  }

  draw( ctx ) { 
    if ( this.#points.length > 0 ) {
      ctx.beginPath();
      
      const last = this.#points[ 0 ];
      ctx.moveTo( 
        last.x - Math.cos( last.angle ) * last.length, 
        last.y - Math.sin( last.angle ) * last.length,
      );
      for ( let i = 1; i < this.#points.length - 1; i ++ ) {
        const width = this.size * i / this.#points.length;
        const segment = this.#points[ i ];
  
        const leftAng = segment.angle - Math.PI / 2;
        const leftX = segment.x + Math.cos( leftAng ) * width;
        const leftY = segment.y + Math.sin( leftAng ) * width;
  
        ctx.lineTo( leftX, leftY );
      }
  
      const first = this.#points[ this.#points.length - 1 ];
      ctx.arc( first.x, first.y, this.size, first.angle - Math.PI / 2, first.angle + Math.PI / 2 );
  
      for ( let i = this.#points.length - 2; i > 0; i -- ) {
        const width = this.size * i / this.#points.length;
        const segment = this.#points[ i ];
  
        const rightAng = segment.angle + Math.PI / 2;
        const rightX = segment.x + Math.cos( rightAng ) * width;
        const rightY = segment.y + Math.sin( rightAng ) * width;
  
        ctx.lineTo( rightX, rightY );
      }
  
      ctx.closePath();
  
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }
  }
}
