import { Entity } from './Entity.js';
import { Info } from '../info/info.js';
import * as Util from './Util.js';

export class Rock extends Entity {
  constructor( info ) {
    super( info );

    this.angle = Math.random() * Math.PI * 2;
    this.dx = Util.randMid() * 0.01;
    this.dy = Util.randMid() * 0.01;
    this.dAngle = Util.randMid() * 0.001;

    this.bodyPath = new Path2D( `M ${ getPoints().join( ' L ' ) } Z` );
  }

  bleed( hit ) {
    for ( let i = 0; i < 3; i ++ ) {
      this.createDebris( hit );
    }
  }

  die( hit ) {
    // Make smaller rocks
    if ( this.size > 20 ) {
      [ -1, 1 ].forEach( xOffset => {
        [ -1, 1 ].forEach( yOffset => {
          const rock = new Rock( Info.Rock );
          
          rock.size = this.size / 2;
          rock.mass = rock.size * 0.5;
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

  createDebris( hit ) {
    const shard = new Entity( { 
      size: 3,
      life: 1,
      decay: 1 / 1000,
      bodyFill: this.bodyFill, 
      bodyPath: this.bodyPath
    } );

    hit ? this.spawnFromHit( shard, hit, { spread: 0 } ) : this.spawnFromCenter( shard );
    this.createdParticles.push( shard );
  }


}

function getPoints( numPoints = 12 ) {
  const spacing = Math.PI * 2 / numPoints;
  const angles = Array.from( Array( numPoints ), ( _, ndx ) => 
    spacing * ( ndx + Util.randMid() * 0.5 ) 
  );
  return angles.map( angle => 
    [ Math.cos( angle ), Math.sin( angle ) ].map( e => 
      e + Util.randMid() * 0.2 
    )
  );
}
