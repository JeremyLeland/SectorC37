import { Entity } from '../src/Entity.js';
import { AvoidCones } from '../src/AvoidCones.js';
import * as Util from '../src/Util.js';

const Constants = {
  AvoidDistance: 200,
  TargetWeight: 0.25,
  AlignWeight: 5,
  AvoidWeight: 4,
  ShootDistance: 300,
  ShootAngle: 0.25,
  UIScale: 100,
  Debug: false,
};

export class Actor extends Entity {
  static DebugNavigation = false;

  accel = 0.002;  // temp: trying out accelerating by direction, then capping it

  turnSpeed = 0;
  moveSpeed = 0;
  goalAngle = 0;

  goal;

  targetGoal;
  wanderGoal;

  wanders = true;
  targets;
  aligns;
  avoids;

  guns = [];
  isShooting = false;
  isSliding = false;

  energy = 0;
  energyRechargeRate = 0;

  update( dt, world ) {
    if ( this.wanders ) {
      this.wander( world );
    }

    if ( this.targets ) {
      this.target( world.entities.filter( e => e != this && this.targets.includes( e.type ) ) );
    }

    this.goal = this.targetGoal ?? this.wanderGoal;

    if ( this.goal ) {
      this.goalAngle = Math.atan2( this.goal.y - this.y, this.goal.x - this.x );
    }

    if ( this.targets ) {
      if ( this.targetGoal ) {
        const tx = this.targetGoal.x - this.x;
        const ty = this.targetGoal.y - this.y;
        const tangle = Math.atan2( ty, tx );
        const tdist = Math.hypot( tx, ty );// - this.size - this.target.size;

        const inFront = Math.abs( tangle - this.angle ) < Constants.ShootAngle;
        this.isShooting = inFront && tdist < Constants.ShootDistance;
      }
      else {
        this.isShooting = false;
      }
    }

    if ( this.aligns ) {
      this.align( world.entities.filter( e => e != this && this.aligns.includes( e.type ) ) );
    }

    if ( this.avoids ) {
      this.avoid( world.entities.filter( e => e != this && this.avoids.includes( e.type ) ) );
    }

    const goalTurn = Util.deltaAngle( this.angle, this.goalAngle );
    const turn = Math.min( Math.abs( goalTurn ), this.turnSpeed * dt );
    this.angle += Math.sign( goalTurn ) * turn;
    this.angle = Util.fixAngle( this.angle );
    
    // TODO: Rework the sliding/sprinting section, especially with regards to tail length
    if ( this.isSliding ) {
      this.trails?.forEach( trail => trail.goalLength = 0 );
    }
    else {
      this.trails?.forEach( trail => trail.goalLength = 20 );   // TODO: Don't hardcode, maybe save original value in trail?

      this.dx += Math.cos( this.angle ) * this.accel * dt;
      this.dy += Math.sin( this.angle ) * this.accel * dt;
    }

    if ( this.isSprinting && this.energy > 0.1 * dt ) {
      this.trails?.forEach( trail => trail.goalLength = 20 * 1.5 );
      this.energy -= 0.1 * dt;   // TODO: Don't hardcode this
    }
    else {
      // this.trails?.forEach( trail => trail.goalLength = 20 );
      this.isSprinting = false;
    }

    const vel = Math.hypot( this.dx, this.dy );
    const speed = this.moveSpeed * ( this.isSprinting && !this.isSliding ? 1.5 : 1 );
    if ( vel > speed ) {
      this.dx *= speed / vel;
      this.dy *= speed / vel;
    }

    this.x += this.dx * dt;
    this.y += this.dy * dt;

    this.boundingLines?.update( this );
    
    this.guns.forEach( gun => gun.update( dt, this ) );

    this.trails?.forEach( trail => trail.update( dt, this ) );

    this.energy = Math.min( this.maxEnergy, this.energy + this.energyRechargeRate * dt );
  }

  wander( world ) {
    if ( this.wanderGoal ) {
      const dist = Math.hypot( this.wanderGoal.x - this.x, this.wanderGoal.y - this.y );
      if ( dist < 50 ) {
        this.wanderGoal = null;
      }
    }

    if ( !this.wanderGoal ) {
      const angle = Math.PI * 2 * Math.random();
      const dist = world.size * ( 0.25 + 0.5 * Math.random() );

      this.wanderGoal = { 
        x: Math.cos( angle ) * dist, 
        y: Math.sin( angle ) * dist, 
      };
    }
  }

  target( others ) {
    let closest = { dist: Infinity };

    others.forEach( other => {
      if ( other.isAlive ) {
        const cx = other.x - this.x;
        const cy = other.y - this.y;
        const dist = Math.hypot( cx, cy );
        
        if ( dist < closest.dist ) {
          closest = {
            entity: other,
            dist: dist
          };
        }
      }
    } );

    const TARGET_DIST = 500;
    this.targetGoal = closest.dist < TARGET_DIST ? closest.entity : null;
  }

  align( others ) {
    const targetWeight = Constants.TargetWeight;
    this.vectors = [ {
      x: Math.cos( this.goalAngle ) * targetWeight,
      y: Math.sin( this.goalAngle ) * targetWeight,
      src: { color: 'gray' },
    } ];

    others.forEach( other => {
      const cx = other.x - this.x;
      const cy = other.y - this.y;
      const dist = Math.max( 0.1, Math.hypot( cx, cy ) - this.size - other.size );
      const angle = Math.atan2( cy, cx );

      // TODO: Should these be averaged as well? (Not just weighted?)
      // If we have a bunch of small align vectors, they can overwhelm one big avoid vector
      // Seems like dividing by number of ships could mitigate that

      const avoidWeight = Constants.AvoidWeight / dist;
      this.vectors.push( {
        x: -Math.cos( angle ) * avoidWeight,
        y: -Math.sin( angle ) * avoidWeight,
        src: other,
      } );

      const alignWeight = Constants.AlignWeight / dist;
      const averageAngle = this.angle + Util.deltaAngle( this.angle, other.angle ) / 2;
      
      this.vectors.push ( {
        x: Math.cos( averageAngle ) * alignWeight,
        y: Math.sin( averageAngle ) * alignWeight,
        src: other,
      } );
    } );
    
    this.totalVector = this.vectors.reduce( ( a, b ) => ( { x: a.x + b.x, y: a.y + b.y } ), { x: 0, y: 0 } );
    this.goalAngle = Math.atan2( this.totalVector.y, this.totalVector.x );
  }

  avoid( others ) {
    this.avoidCones = new AvoidCones();
    others.forEach( other => {
      const cx = other.x - this.x;
      const cy = other.y - this.y;
      const dist = Math.hypot( cx, cy );
      
      if ( dist < Constants.AvoidDistance ) {
        const angle = Math.atan2( cy, cx );
      
        const r = this.size + other.size + 10;  // TODO: Don't randomly hardcode this
        const h = dist;
        const spread = Math.asin( Math.min( 1, r / h ) );   // min() prevents floating errors when we get really close

        this.avoidCones.addCone( { left: angle - spread, right: angle + spread } );
      }
    } );

    const goalCone = this.avoidCones.getCone( this.goalAngle );

    if ( goalCone ) {
      this.goalAngle = Util.closestAngle( this.angle, goalCone.left, goalCone.right );
    }
  }

  draw( ctx ) {
    if ( this.trails ) {
      ctx.fillStyle = 'red';
      this.trails.forEach( trail => trail.draw( ctx ) );
    }

    super.draw( ctx );

    if ( Actor.DebugNavigation ) {
      if ( this.goal ) {
        ctx.strokeStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo( this.goal.x, this.goal.y );
        ctx.lineTo( this.x, this.y );
        ctx.setLineDash( [ 5, 5 ] );
        ctx.stroke();
        ctx.setLineDash( [] );
      }

      ctx.save();
      ctx.translate( this.x, this.y );

      ctx.fillStyle = 'rgba( 100, 100, 100, 0.1 )';
      ctx.beginPath();
      ctx.moveTo( 0, 0 );
      ctx.arc( 0, 0, Constants.ShootDistance, this.angle - Constants.ShootAngle, this.angle + Constants.ShootAngle );
      ctx.fill();

      if ( this.avoidCones ) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'white';
        this.avoidCones.draw( ctx, Constants.UIScale );
      }

      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo( 0, 0 );
      ctx.lineTo( Math.cos( this.goalAngle ) * Constants.UIScale, Math.sin( this.goalAngle ) * Constants.UIScale );
      ctx.stroke();

      drawVector( this.totalVector, ctx, 'white' );
      this.vectors?.forEach( v => drawVector( v, ctx, v.src.color ) );

      ctx.restore();
    }
  } 
}

function drawVector( vector, ctx, color = 'white' ) {
  if ( vector ) { 
    const x = vector.x * Constants.UIScale;
    const y = vector.y * Constants.UIScale;
    const angle = Math.atan2( y, x );
    
    ctx.strokeStyle = ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo( 0, 0 );
    ctx.lineTo( x, y );
    ctx.stroke();
    
    const HEAD_LENGTH = 5;
    const HEAD_WIDTH = 2.5;
    ctx.beginPath();
    ctx.moveTo( x, y );
    ctx.arc( x, y, HEAD_LENGTH, angle + HEAD_WIDTH, angle - HEAD_WIDTH );
    ctx.fill();
  }
}