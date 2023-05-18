export class Trail {
  maxWidth = 20;
  maxLength = 1000;

  // TODO: Track length for drawing purposes?

  head;
  segments = [];

  offset = { front: 0, side: 0, angle: 0 };

  constructor( values ) {
    Object.assign( this, values );
  }

  update( entity ) {
    if ( this.head ) {
      const cx = entity.x - this.head.x;
      const cy = entity.y - this.head.y;

      this.segments.unshift( {
        angle: Math.atan2( cy, cx ),
        length: Math.hypot( cx, cy ),
      } );
    }

    this.head = entity.getOffset( this.offset );

    let remaining = this.maxLength;
    this.segments = this.segments.filter( s => {
      s.length = Math.min( s.length, remaining );
      remaining -= s.length;
      return s.length > 0;
    } );
  }

  getPath() {
    const left = [], right = [];

    if ( this.head ) {
      let x = this.head.x, y = this.head.y;
      let remaining = this.maxLength;
      this.segments.forEach( s => {
        const width = this.maxWidth * remaining / this.maxLength;
        
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
    }
      
    const path = new Path2D();

    left.forEach( p => path.lineTo( p.x, p.y ) );
    right.forEach( p => path.lineTo( p.x, p.y ) );

    if ( this.head ) {
      path.arc(
        this.head.x, this.head.y, this.maxWidth, 
        ( this.segments[ 0 ]?.angle ?? 0 ) - Math.PI / 2,
        ( this.segments[ 0 ]?.angle ?? 0 ) + Math.PI / 2,
      );
    }

    path.closePath();

    return path;
  }
}