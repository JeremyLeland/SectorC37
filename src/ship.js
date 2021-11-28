const SVGNS = 'http://www.w3.org/2000/svg';

export const Settings = {
  GoalWeight: 0.5,
  AvoidWeight: 100,
  AvoidPower: 1,
  DrawForces: false,
};

const shipInfo = {
  player: {
    speed: 0.2,
    turnSpeed: 0.005,
    size: 10,
    life: 100,
    damage: 100,
  },
  enemy: {
    speed: 0.15,
    turnSpeed: 0.005,
    size: 10,
    life: 50,
    damage: 50,
  },
}

export class Ship {
  x;
  y;
  goalAngle;

  wanderX = 0;
  wanderY = 0;

  #angle = 0;

  speed;
  turnSpeed;
  size;
  life;
  damage;

  constructor( { shipInfoKey, x, y } ) {
    this.x = x;
    this.y = y;
    this.goalAngle = this.#angle;

    const info = shipInfo[ shipInfoKey ];
    this.speed = info.speed;
    this.turnSpeed = info.turnSpeed;
    this.size = info.size;
    this.life = info.life;
    this.damage = info.damage;

    this.svg = document.createElementNS( SVGNS, 'use' );
    this.svg.setAttribute( 'href', `#${ shipInfoKey }` );

    document.getElementById( 'svg' ).appendChild( this.svg );
  }

  checkHitWith( other ) {
    if ( this != other && Math.hypot( this.x - other.x, this.y - other.y ) < this.size + other.size ) {
      this.life -= other.damage;

      if ( this.life <= 0 ) {
        this.die();
      }
    }
  }

  die() {
    this.svg.remove();
    // TODO: Particles!
  }

  getAvoidVectors( entities ) {
    return entities.filter( e => e != this ).map( entity => {
      const cx = this.x - entity.x;
      const cy = this.y - entity.y;
      const angle = Math.atan2( cy, cx );
      const dist = Math.hypot( cx, cy ) - entity.size - this.size;
      
      return { 
        angle: angle,
        dist: dist,
      };
    } );
    // TODO: Filter out items we can't crash into (e.g. behind us)?
  }

  think( target, avoid ) {
    const goalX = target?.x ?? this.wanderX;
    const goalY = target?.y ?? this.wanderY;

    const avoidVectors = this.getAvoidVectors( avoid );
    const weighted = avoidVectors.map( vector => {
      const weightedDist = Math.abs( Settings.AvoidWeight / Math.pow( vector.dist, Settings.AvoidPower ) );
      return { 
        x: Math.cos( vector.angle ) * weightedDist / avoidVectors.length,
        y: Math.sin( vector.angle ) * weightedDist / avoidVectors.length,
      };
    } );

    const goalAngle = Math.atan2( goalY - this.y, goalX - this.x );
    const goalForce = {
      x: Settings.GoalWeight * Math.cos( goalAngle ), 
      y: Settings.GoalWeight * Math.sin( goalAngle ),
    }

    const finalForce = weighted.reduce(
      ( acc, wv ) => ( { x: acc.x + wv.x, y: acc.y + wv.y } ),
      goalForce
    );

    this.goalAngle = Math.atan2( finalForce.y, finalForce.x );
  }

  update( dt ) {
    // Turn toward goal angle
    this.#angle = fixAngleTo( this.#angle, this.goalAngle );
    if ( this.goalAngle < this.#angle ) {
      this.#angle = Math.max( this.goalAngle, this.#angle - this.turnSpeed * dt );
    }
    else if ( this.#angle < this.goalAngle ) {
      this.#angle = Math.min( this.goalAngle, this.#angle + this.turnSpeed * dt );
    }

    // Move forward
    const moveDist = this.speed * dt;

    this.x += Math.cos( this.#angle ) * moveDist;
    this.y += Math.sin( this.#angle ) * moveDist;

    // Draw
    this.svg.style.transform = `translate( ${ this.x }px, ${ this.y }px ) rotate( ${ this.#angle }rad ) scale( ${ this.size } )`;
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
