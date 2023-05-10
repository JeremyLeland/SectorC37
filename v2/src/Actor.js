import { Entity } from '../src/Entity.js';
import { AvoidCones } from '../src/AvoidCones.js';
import * as Util from '../src/Util.js';

const Constants = {
  AvoidDistance: 100,
  TargetWeight: 0.25,
  AlignWeight: 5,
  AvoidWeight: 2,
  ShootDistance: 200,
  ShootAngle: 0.25,
  UIScale: 100,
};

export class Actor extends Entity {
  turnSpeed = 0;
  moveSpeed = 0;
  goalAngle = 0;

  target;
  aligns;
  avoids;

  guns = [];
  isShooting = false;

  update( dt, entities ) {
    if ( this.target ) {
      const tx = this.target.x - this.x;
      const ty = this.target.y - this.y;
      const tangle = Math.atan2( ty, tx );

      this.goalAngle = tangle;

      if ( this.target.isAlive ) {
        const tdist = Math.hypot( tx, ty );// - this.size - this.target.size;
        const inFront = Math.abs( tangle - this.angle ) < Constants.ShootAngle;

        this.isShooting = inFront && tdist < Constants.ShootDistance;
      }
    }

    if ( this.aligns ) {
      this.align( entities.filter( e => e != this && this.aligns.includes( e.type ) ) );
    }

    if ( this.avoids ) {
      this.avoid( entities.filter( e => e != this && this.avoids.includes( e.type ) ) );
    }

    const goalTurn = Util.deltaAngle( this.angle, this.goalAngle );
    const turn = Math.min( Math.abs( goalTurn ), this.turnSpeed * dt );
    this.angle += Math.sign( goalTurn ) * turn;
    this.angle = Util.fixAngle( this.angle );
    
    this.x += Math.cos( this.angle ) * this.moveSpeed * dt;
    this.y += Math.sin( this.angle ) * this.moveSpeed * dt;
    
    this.guns.forEach( gun => gun.update( dt, this ) );

    // super.update( dt );
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
    super.draw( ctx );

    if ( this.target ) {
      ctx.strokeStyle = 'gray';
      ctx.beginPath();
      ctx.moveTo( this.target.x, this.target.y );
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