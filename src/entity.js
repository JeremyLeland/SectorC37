
export class Entity {
  x = 0;
  y = 0;
  angle = 0;

  dx = 0;
  dy = 0;
  dAngle = 0;

  div = document.createElement( 'div' );
  
  constructor( info = { 
    speed: 0,
    turnSpeed: 0,
    size: 0,
    life: 0,
    damage: 0 
  } ) {
    Object.assign( this, info );

    this.div.className = this.className;
    document.body.appendChild( this.div );
  }

  isAlive() {
    return this.life > 0;
  }

  distanceTo( other ) {
    return Math.hypot( this.x - other.x, this.y - other.y ) - this.size - other.size;
  }

  hitWith( other, world ) {
    this.life -= other.damage;

    if ( this.life <= 0 ) {
      this.div.remove();
      this.die( world );
    }
  }

  die( world ) {
    // children should override
  }

  update( dt ) {
    // Turn toward goal angle
    if ( this.goalAngle ) {
      this.angle = fixAngleTo( this.angle, this.goalAngle );
      if ( this.goalAngle < this.angle ) {
        this.angle = Math.max( this.goalAngle, this.angle - this.turnSpeed * dt );
      }
      else if ( this.angle < this.goalAngle ) {
        this.angle = Math.min( this.goalAngle, this.angle + this.turnSpeed * dt );
      }  
    }
    
    // Move forward
    if ( this.speed ) {
      this.dx = Math.cos( this.angle ) * this.speed;
      this.dy = Math.sin( this.angle ) * this.speed;
    }

    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.angle += this.dAngle * dt;

    // Draw
    this.div.style.transform = `translate( ${ this.x }px, ${ this.y }px ) rotate( ${ this.angle }rad ) scale( ${ this.size } )`;
  }
}

export const Settings = {
  GoalWeight: 0.5,
  AvoidWeight: 100,
  AvoidPower: 1,
  DrawForces: false,
};

export class Ship extends Entity {
  wanderX = 0;
  wanderY = 0;

  constructor( shipInfo ) {
    super( shipInfo );
  }

  // die() {
  //   for ( let i = 0; i < 15; i ++ ) {
  //     flame( this.x, this.y );
  //   }

  //   for ( let i = 0; i < 40; i ++ ) {
  //     shard( this.x, this.y, this.shipInfoKey );
  //   }
  // }

  #getAvoidVectors( entities ) {
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

    const avoidVectors = this.#getAvoidVectors( avoid );
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
}

export class Rock extends Entity {
  constructor( info ) {
    super( info );

    // this.dx = randMid() * 0.01;
    // this.dy = randMid() * 0.01;
    // this.dAngle = randMid() * 0.001;

    this.div.className = 'rock';
  }

  die( world ) {
    if ( this.size > 5 ) {
      const newRocks = Array.from( Array( 4 ), _ => new Rock( { 
        size: this.size / 2, 
        life: this.size / 2, 
        damage: this.damage / 2
      } ) );

      let ndx = 0;
      [ -1, 1 ].forEach( xOffset => {
        [ -1, 1 ].forEach( yOffset => {
          newRocks[ ndx ].x = this.x + xOffset * this.size / 2;
          newRocks[ ndx ].y = this.y + yOffset * this.size / 2;
          newRocks[ ndx ].dx = xOffset * 0.01;
          newRocks[ ndx ].dy = yOffset * 0.01;
          ndx ++;
        } );
      } );

      newRocks.forEach( rock => world.add( rock ) );
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

function randMid() { return Math.random() - 0.50; }