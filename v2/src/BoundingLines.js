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
    this.lines?.forEach( line => line.draw( ctx ) );
  }

  // Find when we would hit another set of BoundingLines (with given velocities)
  getHit( other, thisDX, thisDY, otherDX, otherDY ) {

    let closestHit = { time: Infinity };

    this.lines.forEach( a => {
      other.lines.forEach( b => {

        // TODO: Completely surrounded, no lines intersecting (e.g. splash damage?)

        // Already colliding?
        const intersection = Line.getIntersection( 
          a.x1, a.y1, a.x2, a.y2, 
          b.x1, b.y1, b.x2, b.y2,
        );

        if ( intersection && 0 < closestHit.time ) {
          closestHit = { 
            time: 0, 
            position: {
              x: a.x1 + ( a.x2 - a.x1 ) * intersection.uA,
              y: a.y1 + ( a.y2 - a.y1 ) * intersection.uA,
            }
          };
        }

        // Test endpoints against lines
        const aToB = Line.getIntersection( 
          a.x1, a.y1, a.x1 + thisDX - otherDX, a.y1 + thisDY - otherDY,
          b.x1, b.y1, b.x2, b.y2,
        );

        if ( aToB && aToB.uA < closestHit.time ) {
          closestHit = {
            time: aToB.uA,
            position: {
              x: a.x1 + thisDX * aToB.uA,
              y: a.y1 + thisDY * aToB.uA,
            }
          };
        }

        // TODO: Can't use relative movement to determine position, just time

        const bToA = Line.getIntersection( 
          a.x1, a.y1, a.x2, a.y2,
          b.x1, b.y1, b.x1 + otherDX - thisDX, b.y1 + otherDY - thisDY, 
        );

        if ( bToA && bToA.uB < closestHit.time ) {
          closestHit = {
            time: bToA.uB,
            position: {
              x: b.x1 + otherDX * bToA.uB,
              y: b.y1 + otherDY * bToA.uB,
            }
          };
        }
      } );
    } );

    // TODO: Return range of points if already intersecting? (e.g. bite)

    closestHit.entities = [ this, other ];

    return closestHit;
  }
}