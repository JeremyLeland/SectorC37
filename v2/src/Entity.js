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
  }

  draw( ctx ) {
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

  getOffset( offset ) {
    const cos = Math.cos( this.angle );
    const sin = Math.sin( this.angle );
    
    return {
      x: this.x + this.size * ( cos * offset.front - sin * offset.side ),
      y: this.y + this.size * ( sin * offset.front + cos * offset.side ),
      angle: this.angle + offset.angle,
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
        
        this.createdEntities.push( 
          Object.assign( this.getBleedParticle(), {
            x: hit.position.x,
            y: hit.position.y,
            dx: 0.1 * Math.cos( angle ),
            dy: 0.1 * Math.sin( angle ),
            dAngle: 0.02 * ( -0.5 + Math.random() ),
            lifeSpan: 1000 + 1000 * Math.random(),
          } )
        );
      }
    }
  }

  die( hit ) {
    if ( this.getDieParticle ) {
      for ( let i = 0; i < this.size; i ++ ) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * this.size / 2;
        
        this.createdEntities.push( 
          Object.assign( this.getDieParticle(), {
            x: this.x,// + Math.cos( angle ) * dist,
            y: this.y,// + Math.sin( angle ) * dist,
            dx: 0.5 * this.dx + ( 0.01 + 0.03 * Math.random() ) * Math.cos( angle ),
            dy: 0.5 * this.dy + ( 0.01 + 0.03 * Math.random() ) * Math.sin( angle ),
            dAngle: 0.02 * ( -0.5 + Math.random() ),
            lifeSpan: 500 + 500 * Math.random(),
          } )
        );
      }
    }

    if ( this.getBleedParticle ) {
      for ( let i = 0; i < this.size; i ++ ) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.5 + Math.random() * this.size;
        
        this.createdEntities.push( 
          Object.assign( this.getBleedParticle(), {
            x: this.x + Math.cos( angle ) * dist,
            y: this.y + Math.sin( angle ) * dist,
            dx: 0.5 * this.dx + ( 0.01 + 0.1 * Math.random() ) * Math.cos( angle ),
            dy: 0.5 * this.dy + ( 0.01 + 0.1 * Math.random() ) * Math.sin( angle ),
            dAngle: 0.02 * ( -0.5 + Math.random() ),
            lifeSpan: 1000 + 1000 * Math.random(),
          } )
        );
      }
    }
  }
}