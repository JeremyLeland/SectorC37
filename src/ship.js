const SVGNS = 'http://www.w3.org/2000/svg';

export class Ship {
  x;
  y;
  goalAngle;

  #angle = 0;
  #turnSpeed = 0.005;

  speed = 0.2;
  size = 10;

  constructor( { x, y, angle } ) {
    this.x = x;
    this.y = y;
    this.#angle = angle;

    this.goalAngle = angle;

    this.svg = document.createElementNS( SVGNS, 'use' );
    this.svg.setAttribute( 'href', '#ship' );

    document.getElementById( 'svg' ).appendChild( this.svg );
  }

  getAvoidVectors( entities ) {
    return entities.filter( e => e != this ).map( entity => {
      const cx = this.x - segment.x;
      const cy = this.y - segment.y;
      const angle = Math.atan2( cy, cx );
      const dist = Math.hypot( cx, cy ) - entity.size - this.size;
      
      return { 
        angle: angle,
        dist: dist,
      };
    } );
    // TODO: Filter out items we can't crash into (e.g. behind us)?
  }

  update( dt ) {
    // Turn toward goal angle
    this.#angle = fixAngleTo( this.#angle, this.goalAngle );
    if ( this.goalAngle < this.#angle ) {
      this.#angle = Math.max( this.goalAngle, this.#angle - this.#turnSpeed * dt );
    }
    else if ( this.#angle < this.goalAngle ) {
      this.#angle = Math.min( this.goalAngle, this.#angle + this.#turnSpeed * dt );
    }

    // Move forward
    const moveDist = this.speed * dt;

    this.x += Math.cos( this.#angle ) * moveDist;
    this.y += Math.sin( this.#angle ) * moveDist;

    // Draw
    this.svg.style.transform = `translate( ${ this.x }px, ${ this.y }px ) scale( ${ this.size } ) rotate( ${ this.#angle }rad )`;
  }
}

function fixAngleTo( angle, otherAngle ) {
  if ( otherAngle - angle > Math.PI ) {
    return angle + Math.PI * 2;
  }
  else if ( angle - otherAngle > Math.PI ) {
    return angle - Math.PI * 2;
  }

  return angle;
}

function removeAnimatedElement( animationEvent ) {
  animationEvent.srcElement.remove();
}
