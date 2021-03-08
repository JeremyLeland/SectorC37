import { Actor } from "./actor.js"
import * as Particles from "./particles.js"

export class Ship extends Actor {
   constructor({x, y, radius, mass, health, damage, speed, turnSpeed, color}) {
      super({x: x, y: y, radius: radius, mass: mass, health: health, damage: damage})

      this.goalX = x
      this.goalY = y

      this.speed = speed
      this.turnSpeed = turnSpeed

      this.engineTrailDelay = this.timeBetweenEngineTrails = 10

      this.color = color
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
   }

   hitWith(actor) {
      // "Bleed" some debris to make it clearer we were hit
      for (let i = 0; i < 3; i ++) {
         this.createEntity(new Particles.ShipDebris(this))
      }
      super.hitWith(actor)
   }

   die() {
      for (let i = 0; i < 50; i ++) {
         this.createEntity(new Particles.Fire(this))
      }
      for (let i = 0; i < 50; i ++) {
         this.createEntity(new Particles.ShipDebris(this))
      }
   }

   makeEngineTrail(dt) {
      this.engineTrailDelay -= dt
      if (this.engineTrailDelay < 0) {
         this.createEntity(new Particles.EngineTrail(this))
         this.engineTrailDelay = this.timeBetweenEngineTrails
      }
   }

   update(dt) {
      this.makeEngineTrail(dt)

      super.update(dt)
   }

   drawEntity(ctx) {
      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      ctx.beginPath()
      ctx.moveTo(-this.radius, -this.radius)
      ctx.lineTo( this.radius,  0)
      ctx.lineTo(-this.radius,  this.radius)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()
   }

      // // DEBUG
      // ctx.beginPath()
      // ctx.moveTo(this.goalX, this.goalY)
      // ctx.lineTo(this.x, this.y)

      // ctx.setLineDash([1, 8])
      // ctx.strokeStyle = "yellow"
      // ctx.stroke()
   
}