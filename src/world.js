const WIDTH = 800, HEIGHT = 600;
const SPAWN_DIST = 20;

export class World {
  entities = [];

  spawn( entity ) {
    do {
      entity.x = Math.random() * WIDTH;
      entity.y = Math.random() * HEIGHT;
      entity.angle = Math.random() * Math.PI * 2;
    }
    while( this.entities.some( other => entity.distanceTo( other ) < SPAWN_DIST ) );

    // TODO: Make sure we don't run forever...bail after 10 tries or something
    this.add( entity );
  }

  add( entity ) {
    this.entities.push( entity );
  }

  update( dt ) {
    const createdEntities = [];

    this.entities.forEach( entity => {
      entity.update( dt );

      this.entities.forEach( other => {
        if ( entity != other && entity.distanceTo( other ) < 0 ) {
          entity.hitWith( other );
        }
      } );

      createdEntities.push( ...entity.createdEntities.splice( 0 ) );
    } );

    this.entities.push( ...createdEntities );

    this.entities = this.entities.filter( entity => entity.isAlive() );
  }

  draw( ctx ) {
    this.entities.forEach( entity => entity.draw( ctx ) );
  }
}