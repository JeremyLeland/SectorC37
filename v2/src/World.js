export class World {
  static DebugBounds = false;
  
  entities = [];

  constructor( size = 100 ) {
    this.size = size;
  }

  update( dt ) {
    const prevHits = [];

    for ( let tries = 0; dt > 0 && tries < 8; tries ++ ) {

      if ( tries == 7 ) {
        debugger;
      }

      let closestHit = { time: Infinity };
      
      for ( let i = 0; i < this.entities.length; i ++ ) {
        for ( let j = i + 1; j < this.entities.length; j ++ ) {
          const A = this.entities[ i ];
          const B = this.entities[ j ];

          // Don't get stuck on the same collision over and over
          // TODO: Also check time or position?
          if ( prevHits.find( e => e.entities.includes( A ) && e.entities.includes( B ) ) ) {
            continue;
          }

          const hit = A.getHit( B );
          
          if ( 0 <= hit.time && hit.time < closestHit.time ) {
            closestHit = hit;
          }
        }
      }

      prevHits.push( closestHit );

      let updateTime = Math.min( closestHit.time, dt );

      this.entities.forEach( entity => entity.update( updateTime, this ) );

      if ( closestHit.time < dt ) {
        closestHit.entities.forEach( e => e.hitWith( closestHit ) );

        // TODO: Should this be handled any differently if the impact destroys one of the objects?

        const A = closestHit.entities[ 0 ];
        const B = closestHit.entities[ 1 ];

        // Old way -- not sure if this was correctly accounting for mass
        // const norm = Math.atan2( B.y - A.y, B.x - A.x );
          
        // // No friction or elasticity in this game
        // const normX = Math.cos( norm ), normY = Math.sin( norm );
        // const p = 2 * ( ( A.dx - B.dx ) * normX + ( A.dy - B.dy ) * normY ) / 
        //               ( A.mass + B.mass );
        
        // A.dx -= p * B.mass * normX;
        // A.dy -= p * B.mass * normY;
        // B.dx += p * A.mass * normX;
        // B.dy += p * A.mass * normY;

        // https://www.vobarian.com/collisions/2dcollisions2.pdf
        // Compute unit normal and unit tangent vectors
        const norm = Math.atan2( B.y - A.y, B.x - A.x );
        const normX = Math.cos( norm ), normY = Math.sin( norm );
        const tangX = -normY, tangY = normX;
        
        // Compute scalar projections of velocities onto v_un and v_ut
        const v1n = normX * A.dx + normY * A.dy;
        const v1t = tangX * A.dx + tangY * A.dy;
        const v2n = normX * B.dx + normY * B.dy;
        const v2t = tangX * B.dx + tangY * B.dy;
        
        // Compute new tangential velocities
        // Note: in reality, the tangential velocities do not change after the collision
        const v1tPrime = v1t;
        const v2tPrime = v2t;
        
        // Compute new normal velocities using one-dimensional elastic collision equations in the normal direction
        const v1nPrime = ( v1n * ( A.mass - B.mass ) + 2 * B.mass * v2n ) / ( A.mass + B.mass );
        const v2nPrime = ( v2n * ( B.mass - A.mass ) + 2 * A.mass * v1n ) / ( A.mass + B.mass );
        
        // Compute new normal and tangential velocity vectors
        // Set new velocities in x and y coordinates
        A.dx = v1nPrime * normX + v1tPrime * tangX;
        A.dy = v1nPrime * normY + v1tPrime * tangY;
        B.dx = v2nPrime * normX + v2tPrime * tangX;
        B.dy = v2nPrime * normY + v2tPrime * tangY;
      }

      dt -= updateTime;

      const createdEntities = [];
      this.entities.forEach( 
        e => createdEntities.push( ...e.createdEntities.splice( 0 ) )
      );
      this.entities.push( ...createdEntities );
      this.entities = this.entities.filter( e => e.isAlive );
    }
  }

  draw( ctx ) {
    this.entities.forEach( entity => entity.draw( ctx ) );

    if ( World.DebugBounds ) {
      ctx.beginPath();
      ctx.arc( 0, 0, this.size, 0, Math.PI * 2 );
      ctx.stroke();
    }
  }
}