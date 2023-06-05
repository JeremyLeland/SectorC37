export class Entity {
  static DebugBounds = false;

  x = 0;
  y = 0;
  angle = 0;
  size = 1;

  dx = 0;
  dy = 0;
  dAngle = 0;
  dSize = 0;

  ddx = 0;
  ddy = 0;
  ddAngle = 0;
  ddSize = 0;

  color = 'black';
  drawPath = new Path2D();
  type = 'entity';

  life = 1;
  lifeSpan = Infinity;
  isAlive = true;
  
  mass = 1;

  boundingLines;

  trails;

  createdEntities = [];

  constructor( values ) {
    Object.assign( this, values );
  }

  update( dt ) {
    this.dx += this.ddx * dt;
    this.dy += this.ddy * dt;
    this.dAngle += this.ddAngle * dt;
    this.dSize += this.ddSize * dt;

    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.angle += this.dAngle * dt;
    this.size += this.dSize * dt;

    this.boundingLines?.update( this );

    this.lifeSpan -= dt;
    this.isAlive = this.life > 0 && this.lifeSpan > 0;

    this.trails?.forEach( trail => trail.update( dt, this ) );
  }

  draw( ctx ) {
    this.trails?.forEach( trail => trail.draw( ctx ) );

    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( this.angle );
    ctx.scale( this.size, this.size );

    // Fade out at end of lifespan
    if ( this.lifeSpan < 1000 ) {
      ctx.globalAlpha = this.lifeSpan / 1000;
    }

    ctx.fillStyle = this.color;
    ctx.fill( this.drawPath );
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / this.size;
    ctx.stroke( this.drawPath );

    ctx.restore();

    if ( Entity.DebugBounds ) {
      ctx.strokeStyle = 'red';
      this.boundingLines?.draw( ctx );
    }
  }

  getOffsetPosition( offset ) {
    const cos = Math.cos( this.angle );
    const sin = Math.sin( this.angle );
    
    return {
      x: this.x + this.size * ( cos * offset.front - sin * offset.side ),
      y: this.y + this.size * ( sin * offset.front + cos * offset.side ),
      angle: this.angle + offset.angle,
    }
  }

  getQuickHitTime( other ) {
    if ( this.boundingLines && other.boundingLines ) {

      // See https://stackoverflow.com/questions/33140999/at-what-delta-time-will-two-objects-collide
    
      const cx = this.x - other.x
      const cy = this.y - other.y
      const vx = this.dx - other.dx;
      const vy = this.dy - other.dy;
      const rr = this.size + other.size;

      const a = vx * vx + vy * vy;
      const b = 2 * ( cx * vx + cy * vy );
      const c = cx * cx + cy * cy - rr * rr;

      const disc = b * b - 4 * a * c;

      // If the objects don't collide, the discriminant will be negative
      // We only care about first intersection, so just return t0 (which uses -b)
      
      return disc < 0 ? Infinity : ( -b - Math.sqrt( disc ) ) / ( 2 * a );
    }
    else {
      return Infinity;
    }
  }

  getHit( other ) {
    if ( this.boundingLines && other.boundingLines ) {

      // TODO: Find a better way to make sure these are set
      if ( !this.boundingLines.lines )  this.boundingLines.update( this );
      if ( !other.boundingLines.lines )  other.boundingLines.update( other );

      const hit = this.boundingLines.getHit( other.boundingLines, this.dx, this.dy, other.dx, other.dy );
      hit.entities = [ this, other ];
      return hit;
    }
    else {
      return { time: Infinity };
    }
  }

  hitWith( hit ) {
    hit.entities.forEach( e => {
      if ( e != this && e.damage ) {
        this.life -= e.damage;
        this.bleed( hit );

        if ( this.life <= 0 ) {
          this.isAlive = false;
          this.die( hit );
        }
      }
    } );
  }

  bleed( hit ) {
    if ( this.getBleedParticle ) {
      // TODO: Normal should come from hit object
      const normal = Math.atan2( hit.position.y - this.y, hit.position.x - this.x );
      
      for ( let i = 0; i < 2; i ++ ) {
        const angle = normal + 0.5 * ( -0.5 + Math.random() );

        const speed = ( 0.01 + 0.1 * Math.random() );
        
        this.createdEntities.push( 
          Object.assign( this.getBleedParticle(), {
            x: hit.position.x,
            y: hit.position.y,
            dx: 0.5 * this.dx + speed * Math.cos( angle ),
            dy: 0.5 * this.dy + speed * Math.sin( angle ),
            dAngle: 0.02 * ( -0.5 + Math.random() ),
            lifeSpan: 1000 + 1000 * Math.random(),
          } )
        );
      }
    }
  }

  die( hit ) {
    if ( this.getDieParticle ) {
      for ( let i = 0; i < this.size * 3; i ++ ) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * this.size / 2;

        const speed = ( 0.01 + 0.03 * Math.random() );
        
        this.createdEntities.push( 
          Object.assign( this.getDieParticle(), {
            x: this.x,// + Math.cos( angle ) * dist,
            y: this.y,// + Math.sin( angle ) * dist,
            dx: 0.5 * this.dx + speed * Math.cos( angle ),
            dy: 0.5 * this.dy + speed * Math.sin( angle ),
            dAngle: 0.02 * ( -0.5 + Math.random() ),
            lifeSpan: 500 + 500 * Math.random(),
          } )
        );
      }
    }

    if ( this.getBleedParticle ) {
      for ( let i = 0; i < this.size * 4; i ++ ) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.5 + Math.random() * this.size;

        const speed = ( 0.01 + 0.1 * Math.random() );
        
        this.createdEntities.push( 
          Object.assign( this.getBleedParticle(), {
            x: this.x + Math.cos( angle ) * dist,
            y: this.y + Math.sin( angle ) * dist,
            dx: 0.5 * this.dx + speed * Math.cos( angle ),
            dy: 0.5 * this.dy + speed * Math.sin( angle ),
            dAngle: 0.02 * ( -0.5 + Math.random() ),
            lifeSpan: 1000 + 1000 * Math.random(),
          } )
        );
      }
    }
  }
}