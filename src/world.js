const SPAWN_DIST = 20;

export class World {
  entities = [];
  particles = [];

  constructor( width = 500, height = 400 ) {
    this.width = width;
    this.height = height;
  }

  spawn( entity ) {
    [ entity.x, entity.y ] = this.getEmptyLocation( entity.size );
    entity.angle = Math.random() * Math.PI * 2;

    this.entities.push( entity );
  }

  getEmptyLocation( size ) {
    let x, y, tries = 0;
    do {
      x = Math.random() * this.width;
      y = Math.random() * this.height;
      tries ++;
    }
    while( tries < 10 && this.entities.some( e => Math.hypot( e.x - x, e.y - y ) < size + SPAWN_DIST ) );

    return [ x, y ];
  }

  update( dt ) {
    const createdEntities = [], createdParticles = [];

    this.entities.forEach( entity => entity.update( dt ) );
    
    // TODO: Not everything checks against everything else...do these by category?
    this.entities.forEach( entity => {
      this.entities.forEach( other => {
        if ( entity != other && entity.distanceTo( other ) < 0 ) {
          entity.hitWith( other );
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
    this.particles.forEach( p => p.draw( ctx ) );
    this.entities.forEach( e => e.draw( ctx ) );
  }
}