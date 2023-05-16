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

  bleed( hit ) {}
  die( hit ) {}
}