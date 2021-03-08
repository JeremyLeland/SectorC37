import { Entity } from "./entity.js"

export class Actor extends Entity {
   constructor({x, y, radius, mass, health, damage}) {
      super({x: x, y: y, radius: radius, mass: mass, health: health, damage: damage})
      
      this.guns = []
      this.isShooting = false
   }

   //
   // Guns
   //

   setGuns(...guns) {
      this.guns = guns
   }

   startShooting() {
      this.isShooting = true
   }

   stopShooting() {
      this.isShooting = false
   }

   handleGuns(dt) {
      for (const g of this.guns) {
         g.update(dt)

         if (this.isShooting && g.isReadyToShoot()) {
            this.createEntity(g.shoot())
         }
      }
   }

   //
   // Turning
   //

   turnToward(actor, dt) {
      this.turnTowardPoint(actor.x, actor.y, dt)
   }

   turnTowardPoint(towardX, towardY, dt) {
      const towardAngle = Math.atan2(towardY - this.y, towardX - this.x)

      // Adjust our angle so we can use towardAngle
      if (towardAngle - this.angle > Math.PI) {
         this.angle += Math.PI * 2
      }
      else if (this.angle - towardAngle > Math.PI) {
         this.angle -= Math.PI * 2
      }

      if (towardAngle < this.angle) {
         this.angle = Math.max(towardAngle, this.angle - this.turnSpeed * dt)
      }
      else if (towardAngle > this.angle) {
         this.angle = Math.min(towardAngle, this.angle + this.turnSpeed * dt)
      }

      this.dx = Math.cos(this.angle) * this.speed
      this.dy = Math.sin(this.angle) * this.speed
   }

   turnAwayFrom(actor, dt) {
      this.turnAwayFromPoint(actor.x, actor.y, dt)
   }

   turnAwayFromPoint(avoidX, avoidY, dt) {
      const avoidAngle = Math.atan2(avoidY - this.y, avoidX - this.x)

      // Adjust our angle so we can use goalAngle
      if (avoidAngle - this.angle > Math.PI) {
         this.angle += Math.PI * 2
      }
      else if (this.angle - avoidAngle > Math.PI) {
         this.angle -= Math.PI * 2
      }

      if (avoidAngle <= this.angle) {
         this.angle += this.turnSpeed * dt
      }
      else if (avoidAngle > this.angle) {
         this.angle -= this.turnSpeed * dt
      }

      this.dx = Math.cos(this.angle) * this.speed
      this.dy = Math.sin(this.angle) * this.speed
   }

   think(level) {
      // Sub-classes should override
   }

   update(dt) {
      this.handleGuns(dt)

      super.update(dt)
   }
}