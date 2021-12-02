
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

    document.body.appendChild( this.div );
  }

  isAlive() {
    return this.life > 0;
  }

  checkHitWith( other ) {
    if ( this != other && Math.hypot( this.x - other.x, this.y - other.y ) < this.size + other.size ) {
      this.life -= other.info.damage;

      if ( this.life <= 0 ) {
        this.die();
      }
    }
  }

  die() {
    this.div.remove();
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
    // const moveDist = this.speed * dt;
    // this.x += Math.cos( this.angle ) * moveDist;
    // this.y += Math.sin( this.angle ) * moveDist;

    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.angle += this.dAngle * dt;

    // Draw
    this.div.style.transform = `translate( ${ this.x }px, ${ this.y }px ) rotate( ${ this.angle }rad ) scale( ${ this.size } )`;
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
