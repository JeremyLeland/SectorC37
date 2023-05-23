export class Trail {
  goalLength = 1000;
  dLength = 0.1;

  maxWidth = 20;
  
  // TODO: Track length for drawing purposes?
  head;
  segments = [];
  length = 0;
  
  offset = { front: 0, side: 0, angle: 0 };
  color = 'red';

  #maxLength = 0;

  constructor( values ) {
    Object.assign( this, values );
  }

  update( dt, parent ) {
    const diff = this.goalLength - this.#maxLength;
    const delta = Math.min( Math.abs( diff ), this.dLength * dt );
    this.#maxLength += Math.sign( diff ) * delta;

    // if ( this.goalLength > this.#maxLength ) {
    //   this.#maxLength = this.goalLength;  // it'll slowly grow as we add segments
    // }
    // else if ( this.goalLength < this.#maxLength ) {
    //   this.#maxLength = Math.max( this.#maxLength - this.dLength * dt, this.goalLength );
    // }

    if ( parent ) {
      if ( this.head ) {
        const cx = parent.x - this.head.x;
        const cy = parent.y - this.head.y;
        const angle = Math.atan2( cy, cx );
        const length = Math.hypot( cx, cy );
        
        this.segments.unshift( { angle: angle, length: length } );
        
        this.length = Math.min( this.length + length, this.#maxLength );
      }
      
      this.head = parent.getOffset( this.offset );
    }

    let remaining = this.#maxLength;
    this.segments = this.segments.filter( s => {
      s.length = Math.min( s.length, remaining );
      remaining -= s.length;
      return s.length > 0;
    } );
  }

  draw( ctx ) {
    const left = [], right = [];

    if ( this.head ) {
      let x = this.head.x, y = this.head.y;
      let remaining = this.length;
      this.segments.forEach( s => {
        const width = this.maxWidth * remaining / this.#maxLength;
        
        left.push( {
          x: x - Math.sin( s.angle ) * width,
          y: y + Math.cos( s.angle ) * width,
        } );
        
        right.unshift( {
          x: x + Math.sin( s.angle ) * width,
          y: y - Math.cos( s.angle ) * width,
        } );
        
        x -= Math.cos( s.angle ) * s.length;
        y -= Math.sin( s.angle ) * s.length;
        
        remaining -= s.length;
      } );

      left.push( { x: x, y: y } );
    }
      
    const path = new Path2D();

    left.forEach( p => path.lineTo( p.x, p.y ) );
    right.forEach( p => path.lineTo( p.x, p.y ) );

    if ( this.head ) {
      path.arc(
        this.head.x, this.head.y, this.maxWidth * this.length / this.#maxLength, 
        this.head.angle - Math.PI / 2,
        this.head.angle + Math.PI / 2,
      );
    }

    path.closePath();

    ctx.fillStyle = this.color;
    ctx.fill( path );
  }
}