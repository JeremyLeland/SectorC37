import { Entity } from './Entity.js';
import { Info } from '../info/info.js';

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

class Engine {
  offset = { front: 0, side: 0, angle: 0 };
  trail = new Trail();
  owner;

  constructor( engineInfo ) {
    Object.assign( this, engineInfo );
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

    this.trail.addPoint( x, y, angle, length );
  }

  draw( ctx ) {
    this.trail.draw( ctx );
  }
}

const TIME_BETWEEN_TRAILS = 10;
const TIME_BETWEEN_WANDERS = 5000;

export class Ship extends Entity {
  isShooting = false;
  guns = [];
  engines = [];

  goalAngle = 0;
  isSliding = false;
  accel = 0.002;

  wanderX = 0;
  wanderY = 0;

  constructor( shipInfo ) {
    super( shipInfo );

    this.guns.push(
      new Gun( { 
        offset: { front: shipInfo.size, side: -shipInfo.size, angle: 0 }, 
        owner: this 
      } )
    );
    this.guns.push(
      new Gun( { 
        offset: { front: shipInfo.size, side: shipInfo.size, angle: 0 }, 
        owner: this 
      } )
    );

    this.engines.push(
      new Engine( {
        offset: { front: -shipInfo.size, side: 0, angle: 0 },
        owner: this
      } )
    );

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

  createFire() {
    const flame = new Flame( Info.Flame );
    this.spawnFromCenter( flame, { spread: 0.5, moveSpeed: 0.01, turnSpeed: 0.01 } );
    this.createdParticles.push( flame );
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
      this.angle = approach( 
        fixAngleTo( this.angle, this.goalAngle ), this.goalAngle, this.turnSpeed, dt 
      );  
    }
    
    // Move forward
    if ( !this.isSliding ) {
      this.dx = approach( 
        this.dx, Math.cos( this.angle ) * this.speed, this.accel, dt 
      );
      this.dy = approach( 
        this.dy, Math.sin( this.angle ) * this.speed, this.accel, dt
      );
    }

    // TODO TODO: Figure out a smooth way to transition dx/dy after we stop sliding

    super.update( dt );

    this.guns.forEach( gun => gun.update( dt ) );
    this.engines.forEach( engine => engine.update( dt ) );
  }
  
  draw( ctx ) {
    if ( !this.isSliding ) {
      this.engines.forEach( engine => engine.draw( ctx ) );
    }
    
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

class Trail {
  size = 4;
  maxLength = 20;
  
  #points = [];
  #length = 0;

  addPoint( x, y, angle, length ) {
    this.#points.push( { x: x, y: y, angle: angle, length: length } );
    this.#length += length;

    while ( this.#length > this.maxLength && this.#points.length > 0 ) {
      this.#length -= this.#points.shift().length;
    }
  }

  draw( ctx ) { 
    if ( this.#points.length > 0 ) {
      ctx.beginPath();
      
      const last = this.#points[ 0 ];
      ctx.moveTo( last.x, last.y );
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
  
      ctx.fillStyle = 'orange';
      ctx.fill();
    }
  }
}
