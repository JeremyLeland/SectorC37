import { Entity } from './Entity.js';
import { Bullet } from './Weapons.js';
import { ParticleInfo } from '../info/info.js';
import { Trail } from './Trail.js';
import * as Util from './Util.js';

const PURSUE_RANGE = 500;
const ATTACK_RANGE = 250;
const ATTACK_AIM = 0.5;

const AVOID_TIME = 500;

// const debugDiv = document.getElementById( 'debug' );

// TODO: Combine Gun and Engine somehow? Very similar code...

class Gun {
  energyCost;
  timeBetweenShots;
  bulletInfo;
  offsets;
  owner;
  
  #timeUntilReady = 0;

  constructor( gunInfo, owner ) {
    Object.assign( this, gunInfo );
    this.owner = owner;
  }

  update( dt ) {
    this.#timeUntilReady -= dt;

    if ( this.#timeUntilReady < 0 && this.owner.isShooting && 
         this.energyCost < this.owner.energy ) {
      this.offsets.forEach( offset => this.owner.createdEntities.push( 
        new Bullet( this.bulletInfo, offset, this.owner ) 
      ) );
      this.#timeUntilReady = this.timeBetweenShots;

      // TODO: This should happen once-per-shot in Weapon, using Weapon energy cost
      this.owner.energy -= this.energyCost;
    }
  }
}

class Engine {
  size;
  maxLength;
  fillStyle;
  offsets;
  owner;

  #trail;

  constructor( engineInfo, owner ) {
    Object.assign( this, engineInfo );

    this.#trail = new Trail( this.maxLength );
    this.owner = owner;
  }

  update( dt ) {
    const length = this.owner.speed * dt;

    this.#trail.addPoint( this.owner.x, this.owner.y, this.owner.angle, length );
  }

  draw( ctx ) {
    ctx.fillStyle = this.fillStyle;

    this.offsets.forEach( offset => {
      ctx.save();

      const pos = this.owner.getOffset( offset );
      ctx.translate( pos.x - this.owner.x, pos.y - this.owner.y );
      ctx.fill( this.#trail.getPath( this.size ) );

      ctx.restore();
    } );

  }
}

const TIME_BETWEEN_TRAILS = 10;
const TIME_BETWEEN_WANDERS = 5000;

export class Ship extends Entity {
  isShooting = false;
  isSprinting = false;
  
  gun;
  engine;

  maxLife;
  maxEnergy;

  goalAngle = 0;
  isSliding = false;
  accel = 0.002;

  goalX;
  goalY;

  #avoid;

  constructor( shipInfo ) {
    super( shipInfo );

    this.gun = new Gun( shipInfo.gunInfo, this );
    this.engine = new Engine( shipInfo.engineInfo, this );
    
    this.maxLife = shipInfo.life;
    this.maxEnergy = shipInfo.energy;

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
    const flame = new Flame( ParticleInfo.Flame );
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

  #getAvoid( goalAngle, entities ) {
    const cones = [];

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
        const spread = Math.asin( Math.min( 1, r / h ) );   // prevent floating point errors when we get really close
        
        lefts.push( Util.fixAngle( angle - spread ) );
        rights.push( Util.fixAngle( angle + spread ) );
        weights.push( 150 / h );
      } );

      cones.push( { 
        left: Math.min( ...lefts ), 
        right: Math.max( ...rights ),
        value: Math.max( ...weights ),
      } );
    } );

    // DEBUG
    // debugDiv.innerText = 'Cones:\n' + JSON.stringify( cones );

    const edges = [];
    const goalAvoidValue = avoidValue( goalAngle, cones );
    
    // debugDiv.innerText += '\n\nGoal Angle: ' + goalAngle + ', avoid value: ' + goalAvoidValue;

    if ( goalAvoidValue == 0 ) {
      return goalAngle;
    }
    else {   
      cones.forEach( c => {
        [ c.left, c.right ].forEach( angle => {
          edges.push( { 
            angle: angle, 
            value: Math.max( 0, avoidValue( angle, cones ) ),
          } );
        } );
      } );
    
      // debugDiv.innerText += '\n\Edges:\n' + JSON.stringify( edges );
    
      edges.sort( ( a, b ) => a.value - b.value );
      const bestEdges = edges.filter( c => c.value == edges[ 0 ].value );
    
      return {
        cones: cones,
        bestAngle: bestEdges.sort( ( a, b ) => 
          Math.abs( Util.deltaAngle( a.angle, goalAngle ) ) - 
          Math.abs( Util.deltaAngle( b.angle, goalAngle ) )
        )[ 0 ].angle
      }
    }
  }

  think( world ) {
    // TODO: Or if we get close
    // if ( this.timers.wander < 0 ) {
    //   this.timers.wander = TIME_BETWEEN_WANDERS;
    //   [ this.wanderX, this.wanderY ] = world.getEmptyLocation( this.size );
    // }

    // Remove ourselves if we reached our goal
    if ( Math.hypot( this.goalX - this.x, this.goalY - this.y ) < this.size * 2 ) {
      this.life = 0;
    }

    const target = world.player?.life > 0 ? world.player : null;

    let goalX = this.goalX;
    let goalY = this.goalY;

    if ( target?.distanceTo( this ) < PURSUE_RANGE ) {
      goalX = target.x;
      goalY = target.y;
    }

    const goalAngle = Math.atan2( goalY - this.y, goalX - this.x );

    this.#avoid = this.#getAvoid(
      goalAngle, 
      world.entities.filter( e => 
        e != this && !( e instanceof Bullet ) && 
        this.distanceTo( e ) < ( e == world.player ? 250 : 500 )
      ),
    );
    this.goalAngle = this.#avoid.bestAngle;
    
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
      let speed = this.speed;
      if ( this.isSprinting && this.energy > 2 ) {
        speed *= 2;
        this.energy -= 2;
      }

      this.dx = approach( 
        this.dx, Math.cos( this.angle ) * speed, this.accel, dt 
      );
      this.dy = approach( 
        this.dy, Math.sin( this.angle ) * speed, this.accel, dt
      );
    }

    super.update( dt );

    this.energy = Math.min( this.maxEnergy, this.energy + this.energyRechargeRate * dt );

    this.gun.update( dt );
    this.engine.update( dt );
  }
  
  draw( ctx ) {
    if ( !this.isSliding ) {
      this.engine.draw( ctx );
    }

    // DEBUG
    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.goalX, this.goalY );
    ctx.strokeStyle = 'green';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.x + Math.cos( this.goalAngle ) * AVOID_TIME, this.y + Math.sin( this.goalAngle ) * AVOID_TIME );
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    this.#avoid?.cones?.forEach( cone => {
      ctx.beginPath();
      ctx.moveTo( this.x, this.y );
      ctx.arc( this.x, this.y, cone.value * 100, cone.left, cone.right );
      ctx.closePath();
      
      ctx.fillStyle = `rgba( ${ cone.value * 100 }, 0, 0, 0.2 )`;    
      ctx.fill();
    } );

    super.draw( ctx );
  }
}

function avoidValue( angle, cones ) {
  return Math.max( 0, 
    ...cones.filter( cone => Util.betweenAngles( angle, cone.left, cone.right ) 
  ).map( c => c.value ) );
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

