import * as Util from './Util.js';

export class AvoidCones {
  cones = [];

  addCone( cone ) {
    this.cones = this.cones.filter( other => {
      let merge = false;

      if ( Util.betweenAngles( cone.left, other.left, other.right ) ) {
        cone.left = other.left;
        merge = true;
      }

      if ( Util.betweenAngles( cone.right, other.left, other.right ) ) {
        cone.right = other.right;
        merge = true;
      }

      if ( Util.betweenAngles( other.left, cone.left, cone.right ) && 
          Util.betweenAngles( other.right, cone.left, cone.right ) ) {
        merge = true;
      }

      return !merge;
    } );

    this.cones.push( cone );
  }

  getCone( angle ) {
    return this.cones.find( c => Util.betweenAngles( angle, c.left, c.right ) );
  }

  draw( ctx, scale = 100 ) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    
    ctx.beginPath();
    this.cones.forEach( cone => {
      ctx.moveTo( 0, 0 );
      ctx.arc( 0, 0, scale, cone.left, cone.right );
      ctx.closePath();
    } );
      ctx.fill();
      ctx.stroke();

    ctx.restore();
  }
}