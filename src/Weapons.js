import { Entity } from './Entity.js';
import { WeaponInfo } from '../info/info.js';
import { Trail } from './Trail.js';

export class Bullet extends Entity {
  #trail;
  
  constructor( bulletInfo, offset, owner ) {
    super( bulletInfo );

    this.applyOffset( owner, offset );

    this.dx = owner.dx + Math.cos( this.angle ) * this.speed;
    this.dy = owner.dy + Math.sin( this.angle ) * this.speed;

    this.owner = owner;

    this.#trail = new Trail( this.trailLength );
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
    ctx.fillStyle = this.fillStyle;
    ctx.fill( this.#trail.getPath( this.size ) );
  }
}