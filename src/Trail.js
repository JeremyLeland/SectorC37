export class Trail {
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
