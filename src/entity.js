
export class Entity {
  x = 0;
  y = 0;
  angle = 0;

  dx = 0;
  dy = 0;
  dAngle = 0;

  div = document.createElement( 'div' );

  createdEntities = [];
  
  constructor( info = { 
    speed: 0,
    turnSpeed: 0,
    size: 0,
    life: 0,
    damage: 0 
  } ) {
    Object.assign( this, info );

    this.div.className = `shape ${ this.className }`;
    document.body.appendChild( this.div );
  }

  isAlive() {
    return this.life > 0;
  }

  distanceTo( other ) {
    return Math.hypot( this.x - other.x, this.y - other.y ) - this.size - other.size;
  }

  hitWith( other ) {
    if ( this.isAlive() && other.isAlive() ) {  // TODO: Maybe only check if we're alive?
      this.life -= other.damage;
  
      if ( this.life <= 0 ) {
        this.div.remove();
        this.die();
      }
    }
  }

  die() {
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

    this.dx = randMid() * 0.01;
    this.dy = randMid() * 0.01;
    this.dAngle = randMid() * 0.001;

    this.div.className = 'shape rock';
  }

  die() {
    // Make smaller rocks
    if ( this.size > 10 ) {
      [ -1, 1 ].forEach( xOffset => {
        [ -1, 1 ].forEach( yOffset => {
          const rock = new Rock( { 
            size: this.size / 2, 
            life: this.size / 2, 
            damage: this.damage / 2
          } );

          rock.x = this.x + xOffset * this.size / 2;
          rock.y = this.y + yOffset * this.size / 2;
          rock.dx += xOffset * 0.01;
          rock.dy += yOffset * 0.01;

          this.createdEntities.push( rock );
        } );
      } );
    }

    // Make particles
    for ( let i = 0; i < this.size / 4; i ++ ) {
      const shard = this.div.cloneNode();
  
      const dir = randMid() * Math.PI * 2;
      const offset = rand25() * 20;
      const dist = 50 + offset;
      
      const anim = shard.animate( { 
        transform: [
          `translate( ${ this.x + Math.cos( dir ) * offset }px, ${ this.y + Math.sin( dir ) * offset }px ) rotate( ${ randMid() * 360 }deg ) scale( 2 )`, 
          `translate( ${ this.x + Math.cos( dir ) * dist   }px, ${ this.y + Math.sin( dir ) * dist   }px ) rotate( ${ randMid() * 720 }deg ) scale( 2 )`,
        ],
        opacity: [ '100%', '0%' ],
      }, 1000 );
      anim.onfinish = () => shard.remove();
  
      document.body.appendChild( shard );
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

function rand25()  { return Math.random() + 0.25; }
function randMid() { return Math.random() - 0.50; }