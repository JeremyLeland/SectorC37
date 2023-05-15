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

  // Find when we would hit another set of BoundingLines (given a relative velocity)
  getHit( other, dx, dy ) {

    let closestHit = { time: Infinity };

    this.lines.forEach( a => {
      other.lines.forEach( b => {
        // Already colliding?
        const intersection = Line.getIntersection( 
          a.x1, a.y1, a.x2, a.y2, 
          b.x1, b.y1, b.x2, b.y2 
        );

        const inBounds = intersection && 
          0 <= intersection.uA && intersection.uA <= 1 && 
          0 <= intersection.uB && intersection.uB <= 1;

        const hit = inBounds ? 
          { time: 0, position: intersection.position } : 
          { time: Infinity };
    
        if ( 0 <= hit.time && hit.time < closestHit.time ) {
          closestHit = hit;
        }
      } );
    } );

    // TODO: Return range of points if already intersecting? (e.g. bite)

    return closestHit;
  }
}