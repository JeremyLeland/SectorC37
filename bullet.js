import { Entity } from "./entity.js"
import * as Particles from "./particles.js"

export class Bullet extends Entity {
   constructor(x, y, dx, dy, damage, color) {
      super({x: x, y: y, dx: dx, dy: dy, radius: 1, mass: 0.01, health: 10000, damage: damage})

      this.color = color
   }

   hitWith(entity) {
      this.health = 0
      super.hitWith(entity)
   }

   die() {
      // This is post-bounce, so we can use our new direction
      const hitAng = Math.atan2(this.dy, this.dx)

      for (let i = 0; i < 20; i ++) {
         this.createEntity(new Particles.Spark(this.x, this.y, hitAng))
      }
   }

   update(dt) {
      this.health -= dt    // so it won't fly around forever
      super.update(dt)
   }

   drawEntity(ctx) {
      ctx.fillStyle = this.color

      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()
   }
}