const WIDTH = 800, HEIGHT = 600;

export class World {
  entities = [];

  spawn( entity ) {
    do {
      entity.x = Math.random() * WIDTH;
      entity.y = Math.random() * HEIGHT;
      entity.angle = Math.random() * Math.PI * 2;
    }
    while( this.entities.some( other => entity.distanceTo( other ) < 10 ) );

    // TODO: Make sure we don't run forever...bail after 10 tries or something
    this.add( entity );
  }

  add( entity ) {
    this.entities.push( entity );
  }

  update( dt ) {
    this.entities.forEach( entity => entity.update( dt ) );

    this.entities.forEach( entity => {
      this.entities.forEach( other => {
        if ( entity != other && other.isAlive() && entity.distanceTo( other ) < 0 ) {
          entity.hitWith( other, this );
        }
      } );
    } );

    this.entities = this.entities.filter( entity => entity.isAlive() );
  }
}