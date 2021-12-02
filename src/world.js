const WIDTH = 200, HEIGHT = 200;

export class World {
  #entities = [];

  spawn( entity ) {
    // TODO: Avoid existing entities?
    entity.x = Math.random() * WIDTH;
    entity.y = Math.random() * HEIGHT;
    entity.angle = Math.random() * Math.PI * 2;

    this.#entities.push( entity );
  }

  update( dt ) {
    this.#entities.forEach( entity => entity.update( dt ) );

    this.#entities = this.#entities.filter( entity => entity.isAlive() );
  }
}