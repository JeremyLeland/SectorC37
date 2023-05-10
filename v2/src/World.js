export class World {
  entities = [];

  constructor( size = 100 ) {
    this.size = size;
  }

  update( dt ) {
    const createdEntities = [];

    this.entities.forEach( entity => {
      entity.update( dt, this.entities );
      createdEntities.push( ...entity.createdEntities.splice( 0 ) );
    } );
    
    this.entities.push( ...createdEntities );
    this.entities = this.entities.filter( e => e.isAlive );
  }

  draw( ctx ) {
    this.entities.forEach( entity => entity.draw( ctx ) );
  }
}