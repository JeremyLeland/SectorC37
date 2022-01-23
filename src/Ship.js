import { Entity } from './Entity.js';
import { Info } from '../info/info.js';
import * as Util from './Util.js';

const ATTACK_RANGE = 250;
const ATTACK_AIM = 0.5;

const AVOID_TIME = 500;

// const debugDiv = document.getElementById( 'debug' );

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

  #cones;

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

  #getBestCone( goalAngle, entities ) {
    const edges = [], cones = [];

    entities.forEach( other => {
      const r = other.size + this.size * 2;
      
      const lefts = [], rights = [], weights = [];

      // TODO: This kind of works with a low-ish AVOID_TIME, but it doesn't
      // seem to work as well if other is travelling faster. Maybe some
      // sort of "sweep" test here rather than look at two separate times?
      [ 0, AVOID_TIME ].forEach( time => {
        const cx = other.x + other.dx * time - this.x;
        const cy = other.y + other.dy * time - this.y;
        const h = Math.hypot( cx, cy );
        const angle = Math.atan2( cy, cx );
        const spread = Math.asin( r / h );

        // TODO: Add to list of lefts, take min of list
        
        lefts.push( angle - spread );
        rights.push( angle + spread );
        weights.push( 150 / h );
      } );

      const left = Math.min( ...lefts );
      const right = Math.max( ...rights );
      const weight = Math.max( ...weights );
      
      edges.push( { value: weight, angle: left } );
      edges.push( { value: -weight, angle: right } );
    } );

    // debugDiv.innerText = 'Edges:\n' + JSON.stringify( edges );

    edges.sort( ( a, b ) => a.angle - b.angle );

    for ( let i = 0, value = 0; i < edges.length; i ++ ) {
      const left = edges[ i ];
      const right = edges[ ( i + 1 ) % edges.length ];

      value += left.value;

      cones.push( { 
        left: left.angle, 
        right: right.angle,
        value: value
      } );
    }

    // debugDiv.innerText += '\n\nUnsorted:\n' + JSON.stringify( cones );

    cones.sort( ( a, b ) => a.value - b.value );

    // debugDiv.innerText += '\n\nSorted:\n' + JSON.stringify( cones );

    const bestCones = cones.filter( c => c.value == cones[ 0 ].value );

    this.#cones = cones;  // for debug drawing

    return bestCones.sort( ( a, b ) => Math.min(
      Math.abs( Util.deltaAngle( a.left, goalAngle ) ),
      Math.abs( Util.deltaAngle( a.right, goalAngle ) )
    ) - Math.min(
      Math.abs( Util.deltaAngle( b.left, goalAngle ) ),
      Math.abs( Util.deltaAngle( b.right, goalAngle ) )
    ) )[ 0 ];
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
    const goalAngle = Math.atan2( goalY - this.y, goalX - this.x );

    // TODO: Only nearby entities?
    const cone = this.#getBestCone( goalAngle, world.entities.filter( e => e != this ) );
    
    if ( Util.betweenAngles( goalAngle, cone.left, cone.right ) ) {
      this.goalAngle = goalAngle;
    }
    else {
      this.goalAngle = Math.abs( Util.deltaAngle( cone.left, goalAngle ) ) < Math.abs( Util.deltaAngle( cone.right, goalAngle ) ) ? 
        cone.left : cone.right;
    }

    if ( target ) {
      this.isShooting = Math.abs( Util.deltaAngle( goalAngle, this.angle ) ) < ATTACK_AIM && this.distanceTo( target ) < ATTACK_RANGE;
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

    // DEBUG
    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.goalX, this.goalY );
    ctx.strokeStyle = 'green';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.x + this.dx * AVOID_TIME, this.y + this.dy * AVOID_TIME );
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    this.#cones?.forEach( cone => {
      ctx.beginPath();
      ctx.moveTo( this.x, this.y );
      ctx.arc( this.x, this.y, 0.001 < cone.value ? 50 : 100, cone.left, cone.right );
      ctx.closePath();
      
      ctx.fillStyle = 0.001 < cone.value ? `rgba( 128, 0, 0, ${ cone.value * 0.1 } )` : 'rgba( 0, 128, 0, 0.5 )';    
      ctx.fill();
    } );

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
