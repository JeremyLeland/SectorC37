

const SPAWN_GAP = 2.5;

export class World {
  size;
  entities = [];
  particles = [];

  constructor( size = 500 ) {
    this.size = size;
  }

  spawnInside( entity ) {
    [ entity.x, entity.y ] = this.getEmptyLocation( entity );
    this.entities.push( entity );
  }

  spawnOutside( entity, angle ) {
    [ entity.x, entity.y ] = this.getEmptyLocation( entity, this.size * 1.0, angle );
    this.entities.push( entity );
  }

  getEmptyLocation( entity, radius = Math.random() * this.size, angle = Math.random() * Math.PI * 2, spread = Math.PI / 3) {
    let x, y, tries = 0;
    do {
      const ang = angle + spread * ( Math.random() - 0.5 );
      x = Math.cos( ang ) * radius;
      y = Math.sin( ang ) * radius;
      tries ++;
    }
    while( tries < 10 && this.entities.some( e => Math.hypot( e.x - x, e.y - y ) < entity.size * SPAWN_GAP ) );

    return [ x, y ];
  }


  update( dt ) {
    const createdEntities = [], createdParticles = [];

    this.entities.forEach( entity => entity.update( dt ) );

    // TODO: Not everything checks against everything else...do these by category?

    // TODO: Check each pair of objects only once, and call hit on both of them
    //       (otherwise, "winner" of collision depends on check order)

    let others = this.entities;
    this.entities.forEach( entity => {
      others = others.filter( other => other != entity );

      others.forEach( other => {
        if ( entity != other.owner && other != entity.owner && entity.distanceTo( other ) < 0 ) {
          // TODO: Find actual point of impact, and normal
          const norm = Math.atan2( other.y - entity.y, other.x - entity.x );
          const hit = { 
            x: other.x - Math.cos( norm ) * other.size,
            y: other.y - Math.sin( norm ) * other.size, 
            normal: norm,
          };
          entity.hitWith( hit, other );
          other.hitWith( hit, entity );

          // No friction or elasticity in this game
          const normX = Math.cos( norm ), normY = Math.sin( norm );
          const p = 2 * ( ( entity.dx - other.dx ) * normX + 
                          ( entity.dy - other.dy ) * normY ) / 
                        ( entity.mass + other.mass );
          
          entity.dx -= p * other.mass * normX;
          entity.dy -= p * other.mass * normY;
          other.dx += p * entity.mass * normX;
          other.dy += p * entity.mass * normY;
        }
      } );
      
      createdEntities.push( ...entity.createdEntities.splice( 0 ) );
      createdParticles.push( ...entity.createdParticles.splice( 0 ) );
    } );
    
    this.particles.forEach( part => part.update( dt ) );
    
    this.entities.push( ...createdEntities );
    this.particles.push( ...createdParticles );
    
    this.entities = this.entities.filter( e => e.isAlive() );
    this.particles = this.particles.filter( p => p.isAlive() );
  }

  draw( ctx ) {
    // DEBUG
    ctx.beginPath();
    ctx.moveTo( -this.size, 0 );  ctx.lineTo( this.size, 0 );
    ctx.moveTo( 0, -this.size );  ctx.lineTo( 0, this.size );
    for ( let rad = 0; rad <= this.size; rad += 100 ) {
      ctx.moveTo( rad, 0 );
      ctx.arc( 0, 0, rad, 0, Math.PI * 2 );
    }
    ctx.strokeStyle = 'gray';
    ctx.stroke();

    this.particles.forEach( p => p.draw( ctx ) );
    this.entities.forEach( e => e.draw( ctx ) );
  }

  drawMinimap( ctx ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

    // Assume a square minimap
    const scale = ctx.canvas.width / ( this.size * 2 );
    
    this.entities.filter( e => e.size > 8 ).forEach( e => {
      ctx.beginPath();
      ctx.arc( 
        ( this.size + e.x ) * scale, 
        ( this.size + e.y ) * scale, 
        Math.max( 1, e.size * scale ), 
        0, Math.PI * 2 );
      ctx.fillStyle = e.bodyFill;
      ctx.fill();
    } );
  }
}