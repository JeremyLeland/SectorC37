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

  spawnOutside( entity ) {
    [ entity.x, entity.y ] = this.getEmptyLocation( entity, this.size * 1.0 );
    this.entities.push( entity );
  }

  getEmptyLocation( entity, radius = Math.random() * this.size ) {
    let x, y, tries = 0;
    do {
      const angle = Math.random() * Math.PI * 2;
      x = Math.cos( angle ) * radius;
      y = Math.sin( angle ) * radius;
      tries ++;
    }
    while( tries < 10 && this.entities.some( e => Math.hypot( e.x - x, e.y - y ) < entity.size * SPAWN_GAP ) );

    return [ x, y ];
  }


  update( dt ) {
    const createdEntities = [], createdParticles = [];

    this.entities.forEach( entity => entity.update( dt ) );

    // TODO: Not everything checks against everything else...do these by category?
    this.entities.forEach( entity => {
      this.entities.forEach( other => {
        if ( entity != other && entity.distanceTo( other ) < 0 ) {
          // TODO: Find actual point of impact, and normal
          const norm = Math.atan2( other.y - entity.y, other.x - entity.x );
          const hit = { 
            x: other.x - Math.cos( norm ) * other.size,
            y: other.y - Math.sin( norm ) * other.size, 
            normal: norm, 
            damage: other.damage
          };
          entity.hitWith( hit );
        }
      } );
      
      createdEntities.push( ...entity.createdEntities.splice( 0 ) );
      createdParticles.push( ...entity.createdParticles.splice( 0 ) );
    } );
    
    this.particles.forEach( part => part.update( dt ) );
    
    this.entities.push( ...createdEntities );
    this.particles.push( ...createdParticles );    
    
    this.entities = this.entities.filter( e => e.isAlive() && Math.hypot( e.x, e.y ) < this.size * 1.5 );
    this.particles = this.particles.filter( p => p.isAlive() );
  }

  draw( ctx ) {
    // DEBUG
    ctx.beginPath();
    ctx.moveTo( -this.size, 0 );  ctx.lineTo( this.size, 0 );
    ctx.moveTo( 0, -this.size );  ctx.lineTo( 0, this.size );
    for ( let rad = 0; rad <= this.size; rad += 1000 ) {
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