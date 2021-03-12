import { Actor } from "./actor.js"
import * as Particles from "./particles.js"

export class Ship extends Actor {
   constructor({x, y, radius, mass, health, damage, speed, turnSpeed, color}) {
      super({x: x, y: y, radius: radius, 
             mass: mass, health: health, damage: damage, 
             speed: speed, turnSpeed: turnSpeed, color: color
      })

      this.goalX = x
      this.goalY = y

      this.guns = []
      this.turrets = []
      this.isShooting = false

      this.engineTrailDelay = this.timeBetweenEngineTrails = 10
   }

   //
   // Guns
   //

   setGuns(...guns) {
      this.guns = guns
   }

   setTurrets(...turrets) {
      this.turrets = turrets
   }

   startShooting() {
      this.isShooting = true
   }

   stopShooting() {
      this.isShooting = false
   }

   //
   // Hit response
   //

   hitWith(actor) {
      // "Bleed" some debris to make it clearer we were hit
      for (let i = 0; i < 3; i ++) {
         this.createEntity(new Particles.Debris(this))
      }
      super.hitWith(actor)
   }

   die() {
      for (let i = 0; i < 50; i ++) {
         this.createEntity(new Particles.Fire(this))
      }
      for (let i = 0; i < 50; i ++) {
         this.createEntity(new Particles.Debris(this))
      }
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
   }

   think(level) {
      this.turrets.forEach(t => t.think(level))
   }

   makeEngineTrail(dt) {
      this.engineTrailDelay -= dt
      if (this.engineTrailDelay < 0) {
         this.createEntity(new Particles.EngineTrail(this))
         this.engineTrailDelay = this.timeBetweenEngineTrails
      }
   }

   update(dt) {
      for (const g of this.guns) {
         g.update(dt)

         if (this.isShooting && g.isReadyToShoot()) {
            this.createEntity(g.shoot())
         }
      }

      for (const t of this.turrets) {
         t.update(dt)

         for (const e of t.getCreatedEntities()) {
            this.createEntity(e)
         }
      }

      if (this.speed > 0) {
         this.makeEngineTrail(dt)

         this.dx = Math.cos(this.angle) * this.speed
         this.dy = Math.sin(this.angle) * this.speed
      }

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

   draw(ctx) {
      super.draw(ctx)
      this.turrets.forEach(t => t.draw(ctx))
   }

      // // DEBUG
      // ctx.beginPath()
      // ctx.moveTo(this.goalX, this.goalY)
      // ctx.lineTo(this.x, this.y)

      // ctx.setLineDash([1, 8])
      // ctx.strokeStyle = "yellow"
      // ctx.stroke()
   
}