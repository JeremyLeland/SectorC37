import { Entity } from "./entity.js"
import { Actor } from "./actor.js"
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

export class Gun {
   constructor({frontOffset, sideOffset, angleOffset = 0, 
                timeBetweenShots, bulletSpeed, bulletDamage, bulletColor, owner}) {
      this.frontOffset = frontOffset
      this.sideOffset = sideOffset
      this.angleOffset = angleOffset

      this.shootDelay = this.timeBetweenShots = timeBetweenShots
      this.bulletSpeed = bulletSpeed
      this.bulletDamage = bulletDamage
      this.bulletColor = bulletColor
      this.owner = owner
   }

   isReadyToShoot() {
      return this.shootDelay == 0
   }

   shoot() {
      const [x, y] = this.owner.getOffsetPosition(this.frontOffset, this.sideOffset)
      const angle = this.owner.angle + this.angleOffset
      
      const dx = Math.cos(angle) * this.bulletSpeed
      const dy = Math.sin(angle) * this.bulletSpeed

      this.shootDelay = this.timeBetweenShots
      return new Bullet(x, y, dx, dy, this.bulletDamage, this.bulletColor)
   }

   update(dt) {
      this.shootDelay = Math.max(0, this.shootDelay - dt)
   }
}
