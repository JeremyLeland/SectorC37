import * as Util from './Util.js';

export class AvoidCones {
  cones = [];

  constructor( cones ) {
    cones.forEach( newCone => {
      this.cones = this.cones.filter( other => {
        let merge = false;

        if ( Util.betweenAngles( newCone.left, other.left, other.right ) ) {
          newCone.left = other.left;
          merge = true;
        }
  
        if ( Util.betweenAngles( newCone.right, other.left, other.right ) ) {
          newCone.right = other.right;
          merge = true;
        }
  
        if ( Util.betweenAngles( other.left, newCone.left, newCone.right ) && 
            Util.betweenAngles( other.right, newCone.left, newCone.right ) ) {
          merge = true;
        }

        return !merge;
      } );

      this.cones.push( newCone );
    } );
  }

  getCone( angle ) {
    return this.cones.find( c => Util.betweenAngles( angle, c.left, c.right ) );
  }

  draw( ctx, scale = 100 ) {
    ctx.save();
    
    this.cones.forEach( cone => {
      ctx.beginPath();
      ctx.moveTo( 0, 0 );
      ctx.arc( 0, 0, scale, cone.left, cone.right );
      ctx.closePath();
      ctx.globalAlpha = cone.open ? 0.1 : 0.2;
      ctx.fill();

      if ( !cone.open ) {
        ctx.stroke();
      }
    } );
    ctx.restore();
  }
}