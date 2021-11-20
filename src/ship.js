const SVGNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS( SVGNS, 'svg' );
document.body.appendChild( svg );

export const Settings = {

};

export class Ship {
  x;
  y;
  goalAngle;

  #angle = 0;
  #turnSpeed = 0.005;
  #length = 0;

  wanderX = Math.random() * window.innerWidth;
  wanderY = Math.random() * window.innerHeight;

  speed = 0.2;
  size = 10;

  #color = 'blue';

  #bodySVG = document.createElementNS( SVGNS, 'path' );
  #goalForceSVG = document.createElementNS( SVGNS, 'path' );
  #avoidForcesSVG = document.createElementNS( SVGNS, 'path' );
  #finalForceSVG = document.createElementNS( SVGNS, 'path' );

  constructor( 
    x = rand() * window.innerWidth, 
    y = rand() * window.innerHeight,
    angle = Math.random() * Math.PI * 2,
  ) {
    this.x = x;
    this.y = y;
    this.#angle = angle;

    this.goalAngle = angle;

    // setInterval( () => {
    //   this.wanderX = rand() * window.innerWidth;
    //   this.wanderY = rand() * window.innerHeight;
    // }, 5000 );

  }

  angleTo( other ) { return this.angleToPoint( other.x, other.y ); }
  angleToPoint( x, y ) { return Math.atan2( y - this.y, x - this.x ); }

  distanceTo( other ) { return this.distanceToPoint( other.x, other.y ); }
  distanceToPoint( x, y ) { return Math.hypot( x - this.x, y - this.y ); }

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
    
  }

  #getForceDString( force, length = 100 ) {
    return `M ${ this.x },${ this.y } L ${ this.x + force.x * length },${ this.y + force.y * length }`
  }
      
  #getDString() {
    if ( this.#tail.length > 0 ) {
      const leftCoords = [], rightCoords = [];
      this.#tail.forEach( ( segment, index, tail ) => {
        const width = this.size * index / tail.length;

        const leftAng = segment.angle - Math.PI / 2;
        const leftX = segment.x + Math.cos( leftAng ) * width;
        const leftY = segment.y + Math.sin( leftAng ) * width;
        leftCoords.push( `${ leftX },${ leftY }` );

        const rightAng = segment.angle + Math.PI / 2;
        const rightX = segment.x + Math.cos( rightAng ) * width;
        const rightY = segment.y + Math.sin( rightAng ) * width;
        rightCoords.unshift( `${ rightX },${ rightY }` );

      } );

      return `M ${ leftCoords.join( ' L ' ) } A ${ this.size } ${ this.size } 0 0 1 ${ rightCoords.join( ' L ' ) }`;
    }
    else {
      return '';
    }
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

function rand() { return Math.random() * 0.5 + 0.25; }

export class Apple {
  x;
  y;
  size = 10;
  #svg = document.createElementNS( SVGNS, 'circle' );

  constructor( 
    x = rand() * window.innerWidth, 
    y = rand() * window.innerHeight,
  ) {
    this.x = x;
    this.y = y;

    this.#svg.setAttribute( 'class', 'apple' );
    this.#svg.setAttribute( 'cx', x );
    this.#svg.setAttribute( 'cy', y );
    this.#svg.setAttribute( 'r', this.size );

    svg.appendChild( this.#svg );
  }

  remove() {
    this.#svg.remove();
  }
}
