import { Actor } from "./actor.js"
import { Player } from "./player.js"

export class Turret extends Actor {
   constructor({frontOffset, sideOffset, radius, mass, health, damage, turnSpeed, color, owner}) {
      const [x, y] = owner.getOffsetPosition(frontOffset, sideOffset)

      super({x: x, y: y, radius: radius, mass: mass, health: health, damage: damage})

      this.frontOffset = frontOffset
      this.sideOffset = sideOffset

      this.turnSpeed = turnSpeed
      this.color = color
      this.owner = owner

      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5      
   }

   think(level) {
      const nearby = level.getActorsNear(this)
      this.targetActor = this.getClosestTarget(nearby, e => e instanceof Player, this.TARGET_DIST)
   }

   update(dt) {
      [this.x, this.y] = this.owner.getOffsetPosition(this.frontOffset, this.sideOffset)

      if (this.targetActor != null) {
         this.turnToward(this.targetActor, dt)
      }

      if (this.targetActor != null && 
          this.distanceFrom(this.targetActor) < this.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetActor)) < this.SHOOT_ANGLE) {
         this.startShooting()
      }
      else {
         this.stopShooting()
      }

      super.update(dt)
   }

   drawEntity(ctx) {
      const BASE_PERCENT = 0.5, BARREL_PERCENT = 0.15
      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      ctx.beginPath()
      ctx.arc(0, 0, this.radius * BASE_PERCENT, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      const barrelSize = this.radius * BARREL_PERCENT
      ctx.beginPath()
      ctx.arc(0, 0, barrelSize, Math.PI/2, Math.PI * 3/2)
      ctx.lineTo(this.radius, -barrelSize)
      ctx.lineTo(this.radius, barrelSize)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
   }
}