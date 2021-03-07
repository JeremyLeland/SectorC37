import { Actor } from "./actor.js"
import { Bullet } from "./bullet.js"

export class Level {
   constructor(width, height) {
      this.width = width
      this.height = height

      this.actors = []
      this.particles = []
   }

   addActor(actor) {
      this.actors.push(actor)
   }

   addParticle(part) {
      this.particles.push(part)
   }

   getActorsNear(actor) {
      // TODO: only return actors close to given actor
      return this.actors.filter(a => a != actor && a.isAlive())
   }

   update(dt) {
      for (const a of this.actors) {
         a.update(dt)

         const nearby = this.getActorsNear(a)
         for (const n of nearby) {
            // Ignore bullets hitting each other
            if (a instanceof Bullet && n instanceof Bullet) {
               continue
            }

            const hitTime = a.timeUntilHit(n)
            if (-dt < hitTime && hitTime < 0) {
               // Roll back actors to time of collision
               a.updatePosition(hitTime)
               n.updatePosition(hitTime)

               // Collision response
               Actor.handleBounce(a, n)
               a.hitWith(n)
               n.hitWith(a)

               // Finish the update with new velocity
               // TODO: Do we need this? Can't tell if its having an effect...
               a.updatePosition(-hitTime)
               n.updatePosition(-hitTime)
            }
         }
      }
      this.actors = this.actors.filter(a => a.isAlive())

      this.particles.forEach(p => p.update(dt))
      this.particles = this.particles.filter(p => p.isAlive())
   }

   draw(ctx) {
      this.actors.forEach(e => e.draw(ctx))
      this.particles.forEach(p => p.draw(ctx))
   }
}