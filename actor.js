import { Entity } from "./entity.js"

export class Actor extends Entity {
   constructor({x, y, radius, mass, health, damage, speed, turnSpeed, color}) {
      super({x: x, y: y, radius: radius, mass: mass, health: health, damage: damage})

      this.speed = speed
      this.turnSpeed = turnSpeed

      this.color = color
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
   }

   //
   // Thinking
   //

   getClosestAvoid(entities, avoidTime) {
      const AVOID_BUFFER = 10
      const RECENT_PAST = -100

      let closestAvoid = null, closestAvoidTime = Number.POSITIVE_INFINITY
      for (const e of entities) {
         const time = this.timeUntilHit(e, AVOID_BUFFER)

         // Include hits in the near "past", since we may be in our buffer zone
         if (RECENT_PAST < time && time < closestAvoidTime) {
            closestAvoid = e
            closestAvoidTime = time
         }
      }

      return closestAvoidTime < avoidTime ? closestAvoid : null
   }

   getClosestTarget(entities, test, maxDistance = Number.POSITIVE_INFINITY) {
      let closestTarget = null, closestTargetDist = Number.POSITIVE_INFINITY

      for (const e of entities) {
         if (test(e)) {
            const dist = this.distanceFrom(e)

            if (dist < closestTargetDist) {
               closestTarget = e
               closestTargetDist = dist
            }
         }
      }

      return closestTargetDist < maxDistance ? closestTarget : null
   }

   think(level) {
      // Sub-classes should override
   }

   update(dt) {
      

      super.update(dt)
   }

   
}