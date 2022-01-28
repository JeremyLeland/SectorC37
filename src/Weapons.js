import { Entity } from './Entity.js';
import { Info } from '../info/info.js';
import { Trail } from './Trail.js';

export class Bullet extends Entity {
  #trail;
  
  constructor( gun ) {
    super( Info.Bullet );

    this.applyOffset( gun.owner, gun.offset );

    this.dx = gun.owner.dx + Math.cos( this.angle ) * this.speed;
    this.dy = gun.owner.dy + Math.sin( this.angle ) * this.speed;

    this.owner = gun.owner;

    this.#trail = new Trail( { size: this.size, maxLength: 40, fillStyle: gun.owner.bodyFill } );
  }

  die( hit ) {
    for ( let i = 0; i < 1; i ++ ) {
      const shard = new Entity( { 
        size: 1,
        life: 1,
        decay: 1 / 1000,
        bodyFill: this.bodyFill, 
        bodyPath: this.bodyPath
      } );

      this.spawnFromHit( shard, hit, { moveSpeed: this.speed * 0.2, turnSpeed: 0 } );
      this.createdParticles.push( shard );
    }
  }

  update( dt ) {
    super.update( dt );

    this.#trail.addPoint( this.x, this.y, this.angle, this.speed * dt );
  }

  draw( ctx ) {
    this.#trail.draw( ctx );
  }
}