import { Info } from '../info/info.js';

export class Entity {
  x = 0;
  y = 0;
  angle = 0;

  dx = 0;
  dy = 0;
  dAngle = 0;

  speed = 0;
  turnSpeed = 0;
  size = 0;
  life = 0;
  decay = 0;
  damage = 0;

  createdEntities = [];
  createdParticles = [];
  
  constructor( info ) {
    Object.assign( this, info );
  }

  isAlive() {
    return this.life > 0;
  }

  distanceTo( other ) {
    return Math.hypot( this.x - other.x, this.y - other.y ) - this.size - other.size;
  }

  hitWith( other ) {
    if ( this.isAlive() ) {
      this.life -= other.damage;

      this.bleed();
  
      if ( this.life <= 0 ) {
        this.die();
      }
    }
  }

  bleed() {
    // children should override
  }

  die() {
    // children should override
  }

  getDebrisCoords( moveSpeed = 0.1, turnSpeed = 0.01) {
    const dir = randMid() * Math.PI * 2;
    const cos = Math.cos( dir );
    const sin = Math.sin( dir );

    return { 
      x: this.x + cos * this.size / 2,
      y: this.y + sin * this.size / 2,
      dx: this.dx + cos * rand25() * moveSpeed,
      dy: this.dy + sin * rand25() * moveSpeed,
      dAngle: randMid() * turnSpeed,
    };
  }

  createFire() {
    const flame = new Flame( Object.assign( this.getDebrisCoords( 0.01, 0.01 ), Info.Flame ) );
    this.createdParticles.push( flame );
  }

  createDebris() {
    const shard = new Entity( Object.assign( 
      this.getDebrisCoords(), 
      {
        size: 3,
        life: 1,
        decay: 1 / 1000,
        bodyFill: this.bodyFill, 
        bodyPath: this.bodyPath
      }
    ) );

    this.createdParticles.push( shard );
  }

  update( dt ) {
    this.life -= this.decay * dt;   // TODO: Track life and decay separately?

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
    //this.div.style.transform = `translate( ${ this.x }px, ${ this.y }px ) rotate( ${ this.angle }rad ) scale( ${ this.size } )`;
  }

  draw( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( this.angle );
    ctx.scale( this.size, this.size );

    if ( this.decay > 0 ) {
      ctx.globalAlpha = this.life;
    }

    ctx.fillStyle = this.bodyFill;
    // ctx.strokeStyle = 'black';
    // ctx.lineWidth = 1 / this.size;
    ctx.fill( this.bodyPath );
    // ctx.stroke( this.bodyPath );

    ctx.restore();
  }
}

export const Settings = {
  GoalWeight: 0.5,
  AvoidWeight: 100,
  AvoidPower: 1,
  DrawForces: false,
};

const TIME_BETWEEN_SHOTS = 200;

export class Ship extends Entity {
  shootDelay = 0;

  wanderX = 0;
  wanderY = 0;

  constructor( shipInfo ) {
    super( shipInfo );
  }

  bleed() {
    for ( let i = 0; i < 3; i ++ ) {
      this.createDebris();
    }
  }

  die() {
    for ( let i = 0; i < 10; i ++ ) {
      this.createFire();
    }
    for ( let i = 0; i < 30; i ++ ) {
      this.createDebris();
    }
  }

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

  update( dt ) {
    super.update( dt );

    this.shootDelay -= dt;
    if ( this.shootDelay < 0 ) {
      const bullet = new Bullet( Info.Bullet );
      const cos = Math.cos( this.angle );
      const sin = Math.sin( this.angle );
      bullet.angle = this.angle;
      bullet.x = this.x + cos * this.size * 2;
      bullet.y = this.y + sin * this.size * 2;
  
      this.createdEntities.push( bullet );

      this.shootDelay = TIME_BETWEEN_SHOTS;
    }
  }
}

export class Rock extends Entity {
  constructor( info ) {
    super( info );

    this.dx = randMid() * 0.01;
    this.dy = randMid() * 0.01;
    this.dAngle = randMid() * 0.001;

    this.bodyPath = new Path2D( `M ${ getPoints().join( ' L ' ) } Z` );

    //this.div.className = 'shape rock';
  }

  bleed() {
    for ( let i = 0; i < 3; i ++ ) {
      this.createDebris();
    }
  }

  die() {
    // Make smaller rocks
    if ( this.size > 20 ) {
      [ -1, 1 ].forEach( xOffset => {
        [ -1, 1 ].forEach( yOffset => {
          const rock = new Rock( Info.Rock );
          
          rock.size = this.size / 2;
          rock.life = this.size / 2;
          rock.damage = this.damage / 2;

          rock.x = this.x + xOffset * this.size / 2;
          rock.y = this.y + yOffset * this.size / 2;
          rock.dx += this.dx + xOffset * 0.01;
          rock.dy += this.dy + yOffset * 0.01;
          rock.dAngle += this.dAngle;

          this.createdEntities.push( rock );
        } );
      } );
    }

    // Make particles
    for ( let i = 0; i < this.size / 4; i ++ ) {
      this.createDebris();
    }
  }
}

export class Bullet extends Entity {
  constructor( info ) {
    super( info );
  }

  // TODO: die() with sparks
}

export class Flame extends Entity {
  draw( ctx ) {
    ctx.save();

    ctx.filter = 'blur( 7px )';
    ctx.globalCompsiteOperation = 'lighter';
    
    super.draw( ctx );

    ctx.restore();
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

function getPoints( numPoints = 12 ) {
  const spacing = Math.PI * 2 / numPoints;
  const angles = Array.from( Array( numPoints ), ( _, ndx ) => 
    spacing * ( ndx + randMid() * 0.5 ) 
  );
  return angles.map( angle => 
    [ Math.cos( angle ), Math.sin( angle ) ].map( e => 
      e + randMid() * 0.2 
    )
  );
}

function rand25()  { return Math.random() + 0.25; }
function randMid() { return Math.random() - 0.50; }