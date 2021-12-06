const WIDTH = 2000, HEIGHT = 2000;
const SPAWN_DIST = 20;

export class World {
  entities = [];
  particles = [];

  spawn( entity ) {
    do {
      entity.x = Math.random() * WIDTH;
      entity.y = Math.random() * HEIGHT;
      entity.angle = Math.random() * Math.PI * 2;
    }
    while( this.entities.some( other => entity.distanceTo( other ) < SPAWN_DIST ) );

    // TODO: Make sure we don't run forever...bail after 10 tries or something
    this.entities.push( entity );
  }

  update( dt ) {
    const createdEntities = [], createdParticles = [];

    this.entities.forEach( entity => {
      entity.update( dt );

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