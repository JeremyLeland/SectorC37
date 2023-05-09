export class Entity {
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
}