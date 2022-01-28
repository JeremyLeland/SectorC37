import { Ship } from './Ship.js';
import { Rock } from './Rock.js';
import { Info } from '../info/info.js';
import * as Util from './Util.js';

const SPAWN_GAP = 2.5;

export class World {
  size;
  entities = [];
  particles = [];

  level;
  player;

  #levelTime = 0;
  #waveIndex = 0;

  constructor( level ) {
    this.level = level;
    this.size = level?.size ?? 500;
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
    while( tries < 20 && this.entities.some( e => Math.hypot( e.x - x, e.y - y ) < entity.size * SPAWN_GAP ) );

    // if ( tries == 20 ) {
    //   debugger;
    // }

    return [ x, y ];
  }

  #updateLevel( dt ) {
    this.#levelTime += dt;

    if ( this.#waveIndex < this.level.waves.length && this.level.waves[ this.#waveIndex ].time <= this.#levelTime ) {
      this.level.waves[ this.#waveIndex ].spawns.forEach( spawn => {
        const ship = new Ship( Info[ spawn.type ] );
        [ ship.x, ship.y ] = Util.rotatedXY( this.level.size + spawn.x, spawn.y, this.level.entryAngle );
        
        // Head straight across the map
        [ ship.goalX, ship.goalY ] = Util.rotatedXY( this.level.size + spawn.x, -spawn.y, this.level.exitAngle );
        ship.angle = Math.atan2( ship.goalY - ship.y, ship.goalX - ship.x );

        this.entities.push( ship );
      } );

      this.#waveIndex ++;
    }
  }

  #handleRocks() {
    // "Bounce" out-of-bounds rocks (to try to keep same number of rocks in level)
    // TODO: Should we add rocks when other rocks are destoryed? Or just randomly?
    this.entities.filter( e => e instanceof Rock).forEach( rock => {
      if ( rock.x < -this.size - rock.size )  rock.dx = -rock.dx;
      if ( rock.y < -this.size - rock.size )  rock.dy = -rock.dy;
      if ( this.size + rock.size < rock.x )   rock.dx = -rock.dx;
      if ( this.size + rock.size < rock.y )   rock.dy = -rock.dy;
    } );
  }

  update( dt ) {
    if ( this.level ) { 
      this.#updateLevel( dt );
    }

    
    this.entities.forEach( entity => entity.update( dt ) );
    
    this.#handleRocks();
    this.entities.filter( e => e instanceof Ship).forEach( enemy => enemy.think( this.player, this ) );
    
    // TODO: Not everything checks against everything else...do these by category?
    
    const createdEntities = [], createdParticles = [];
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
    // ctx.beginPath();
    // ctx.moveTo( -this.size, 0 );  ctx.lineTo( this.size, 0 );
    // ctx.moveTo( 0, -this.size );  ctx.lineTo( 0, this.size );
    // for ( let rad = 0; rad <= this.size; rad += 100 ) {
    //   ctx.moveTo( rad, 0 );
    //   ctx.arc( 0, 0, rad, 0, Math.PI * 2 );
    // }
    // ctx.strokeStyle = 'gray';
    // ctx.stroke();

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

