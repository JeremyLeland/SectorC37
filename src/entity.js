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

  hitWith( hit ) {
    if ( this.isAlive() ) {
      this.life -= hit.damage;

      this.bleed( hit );
  
      if ( this.life <= 0 ) {
        this.die( hit );
      }
    }
  }

  // TODO: Bleed amount, where hit? ( so we have a direction for particles -- otherwise, go from center in all directions)
  bleed( hit ) {
    // children should override
  }

  die( hit ) {
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
      angle: dir,
      dAngle: randMid() * turnSpeed,
      dSize: entity.dSize * rand25(),
    } );
  }

  spawnFromHit( entity, hit, { moveSpeed = 0.075, turnSpeed = 0.04 } = {} ) {
    const ANGLE_SPREAD = 0.5;   // TODO: Parameter
    const dir = hit.normal + randMid() * ANGLE_SPREAD;
    const cos = Math.cos( dir );
    const sin = Math.sin( dir );
 
    Object.assign( entity, { 
      x: hit.x,
      y: hit.y,
      dx: cos * rand25() * moveSpeed,
      dy: sin * rand25() * moveSpeed,
      angle: dir,
      dAngle: randMid() * turnSpeed,
      dSize: entity.dSize * rand25(),
    } );
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
    //ctx.lineWidth = 1 / this.size;
    ctx.fill( this.bodyPath );
    // ctx.stroke( this.bodyPath );

    ctx.restore();
  }
}



function rand25()  { return Math.random() + 0.25; }
function randMid() { return Math.random() - 0.50; }