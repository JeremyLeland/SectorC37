import { Line } from './Line.js';

export class BoundingLines {
  points;
  lines;

  constructor( points ) {
    this.points = points;
  }

  update( owner ) {
    const cos = Math.cos( owner.angle );
    const sin = Math.sin( owner.angle );

    this.lines = [];
    for ( let i = 0; i < this.points.length; i ++ ) {
      const current = this.points[ i ];
      const next = this.points[ ( i + 1 ) % this.points.length ];

      this.lines.push( 
        new Line (
          owner.x + owner.size * ( cos * current[ 0 ] - sin * current[ 1 ] ),
          owner.y + owner.size * ( sin * current[ 0 ] + cos * current[ 1 ] ),
          owner.x + owner.size * ( cos * next[ 0 ] - sin * next[ 1 ] ),
          owner.y + owner.size * ( sin * next[ 0 ] + cos * next[ 1 ] ),
        ) 
      );
    }
  }

  draw( ctx ) {
    ctx.strokeStyle = 'red';
    this.lines?.forEach( line => line.draw( ctx ) );
  }
}