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
  goalAngle = 0;

  wanderX = 0;
  wanderY = 0;

  speed;
  turnSpeed;
  size;
  life;
  damage;

  constructor( shipInfoKey ) {
    this.shipInfoKey = shipInfoKey;
    
    const info = shipInfo[ shipInfoKey ];
    Object.assign( this, info );

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

    for ( let i = 0; i < 15; i ++ ) {
      flame( this.x, this.y );
    }

    for ( let i = 0; i < 40; i ++ ) {
      shard( this.x, this.y, this.shipInfoKey );
    }
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
    this.angle = fixAngleTo( this.angle, this.goalAngle );
    if ( this.goalAngle < this.angle ) {
      this.angle = Math.max( this.goalAngle, this.angle - this.turnSpeed * dt );
    }
    else if ( this.angle < this.goalAngle ) {
      this.angle = Math.min( this.goalAngle, this.angle + this.turnSpeed * dt );
    }

    // Move forward
    const moveDist = this.speed * dt;

    this.x += Math.cos( this.angle ) * moveDist;
    this.y += Math.sin( this.angle ) * moveDist;

    // Draw
    this.svg.style.transform = `translate( ${ this.x }px, ${ this.y }px ) rotate( ${ this.angle }rad ) scale( ${ this.size } )`;
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

function flame( cx, cy ) {
  const flame = getTriangle( 25 );
  flame.setAttribute( 'class', 'flame' );

  const anim = flame.animate(
    {
      fill: [ 'white', 'orange', 'gray' ],
      opacity: [ '100%', '0%' ],
      transform: getTransformKeyframes( {
        x: cx, y: cy, scale: 0,
        posSpread: 3, moveSpeed: 0.04, spinSpeed: randMid() * 0.02, growSpeed: 0.002,
        duration: 1000
      } ),
    },
    1000
  );
  anim.onfinish = () => flame.remove();

  svg.appendChild( flame );
}

function shard( cx, cy, className ) {
  const shard = getTriangle( 4 );
  shard.setAttribute( 'class', className );

  const anim = shard.animate(
    {
      opacity: [ '100%', '0%' ],
      transform: getTransformKeyframes( {
        x: cx, y: cy,
        posSpread: 5, moveSpeed: 0.15, spinSpeed: randMid() * 0.04,
        duration: 1000
      } ),
    },
    1000
  );
  anim.onfinish = () => shard.remove();

  svg.appendChild( shard );
}

function getTriangle( size ) {
  const part = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
  const points = [ 
    [ rand25() *  size, 0 ],
    [ rand25() * -size, rand25() *  size ],
    [ rand25() * -size, rand25() * -size ],
  ].join( ' L ' );
  part.setAttribute( 'd', `M ${ points } Z` );
  return part;
}

function getTransformKeyframes( { 
  x, y, angle = 0, scale = 1, moveDir = 0,
  posSpread = 0, angleSpread = Math.PI * 2, scaleSpread = 0, dirSpread = Math.PI * 2, 
  moveSpeed = 0, spinSpeed = 0, growSpeed = 0,
  duration 
} ) {
  const dir = moveDir + dirSpread * randMid();
  const cos = Math.cos( dir );
  const sin = Math.sin( dir );

  // TODO: How many of these should actually have rand as part of them?
  const rand = Math.random();
  const x1 = x + cos * posSpread * rand;
  const y1 = y + sin * posSpread * rand;
  const ang1 = angle + angleSpread * randMid();
  const scale1 = scale + scaleSpread * randMid();

  const x2 = x1 + cos * moveSpeed * rand * duration;
  const y2 = y1 + sin * moveSpeed * rand * duration;
  const ang2 = ang1 + spinSpeed * duration;
  const scale2 = scale1 + growSpeed * duration;

  return [
    `translate( ${ x1 }px, ${ y1 }px ) rotate( ${ ang1 }rad ) scale( ${ scale1 } )`,
    `translate( ${ x2 }px, ${ y2 }px ) rotate( ${ ang2 }rad ) scale( ${ scale2 } )`,
  ];
}

function rand25()  { return Math.random() + 0.25; }
function randMid() { return Math.random() - 0.50; }
