import { Entity } from "./entity.js"
import { Actor } from "./actor.js"
import { Bullet } from "./bullet.js"

export class Level {
   constructor(width, height) {
      this.width = width
      this.height = height

      this.entities = []
      this.particles = []
   }

   getActorsNear(actor) {
      // TODO: only return actors close to given actor
      // Only return entities we can collide with
      return this.entities.filter(e => e != actor && e.isAlive() && e.damage > 0)
   }

   addEntity(entity) {
      // Track zero-damage entities seperately as particles
      if (entity.damage == 0) {
         this.particles.push(entity)
      }
      else {
         this.entities.push(entity)
      }
   }

   addCreatedEntities(entities) {
      for (const e of entities) {
         this.addEntity(e)
      }
   }

   update(dt) {
      for (const e of this.entities) {
         if (e instanceof Actor) {
            e.think(this)
         }

         e.update(dt)
         this.addCreatedEntities(e.getCreatedEntities())

         const nearby = this.getActorsNear(e)
         for (const n of nearby) {
            // Ignore bullets hitting each other
            if (e instanceof Bullet && n instanceof Bullet) {
               continue
            }

            const hitTime = e.timeUntilHit(n)
            if (-dt < hitTime && hitTime < 0) {
               // Roll back actors to time of collision
               e.updatePosition(hitTime)
               n.updatePosition(hitTime)

               // Collision response
               Entity.handleBounce(e, n)
               e.hitWith(n)
               n.hitWith(e)

               this.addCreatedEntities(e.getCreatedEntities())
               this.addCreatedEntities(n.getCreatedEntities())

               // Finish the update with new velocity
               // TODO: Do we need this? Can't tell if its having an effect...
               e.updatePosition(-hitTime)
               n.updatePosition(-hitTime)
            }
         }
      }
      this.entities = this.entities.filter(e => e.isAlive())

      this.particles.forEach(p => p.update(dt))
      this.particles = this.particles.filter(p => p.isAlive())
   }

   draw(ctx) {
      this.particles.forEach(p => p.draw(ctx))
      this.entities.forEach(e => e.draw(ctx))
   }
}