import { Actor } from "./actor.js"
import * as Particles from "./particles.js"

export class Ship extends Actor {
   constructor({x, y, radius, mass, health, damage, speed, turnSpeed, color, level}) {
      super(x, y, 0, 0, 0, 0, radius, mass, health, damage, level)

      this.goalX = x
      this.goalY = y

      this.speed = speed
      this.turnSpeed = turnSpeed

      this.guns = []
      this.isShooting = false

      this.engineTrailDelay = this.timeBetweenEngineTrails = 10

      this.color = color
   }

   setGuns(...guns) {
      this.guns = guns
   }

   setGoal(goalX, goalY) {
      this.goalX = goalX
      this.goalY = goalY
   }

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

   startShooting() {
      this.isShooting = true
   }

   stopShooting() {
      this.isShooting = false
   }

   die() {
      for (let i = 0; i < 50; i ++) {
         this.level.addParticle(new Particles.Fire(this))
      }

      for (let i = 0; i < 50; i ++) {
         this.level.addParticle(new Particles.ShipDebris(this))
      }
   }

   handleGuns(dt) {
      for (const g of this.guns) {
         g.update(dt)

         if (this.isShooting && g.isReadyToShoot()) {
            this.level.addActor(g.shoot())
         }
      }
   }

   makeEngineTrail(dt) {
      this.engineTrailDelay -= dt
      if (this.engineTrailDelay < 0) {
         this.level.addParticle(new Particles.EngineTrail(this))
         this.engineTrailDelay = this.timeBetweenEngineTrails
      }
   }

   update(dt) {
      this.handleGuns(dt)
      this.makeEngineTrail(dt)

      super.update(dt)
   }

   drawTriangle(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)
      ctx.scale(this.radius, this.radius)  // at angle 0, "forward" is in x axis

      // Unit triangle centered at 0,0
      ctx.beginPath()
      ctx.moveTo(-1, -1)
      ctx.lineTo( 1,  0)
      ctx.lineTo(-1,  1)
      ctx.closePath()

      ctx.fillStyle = this.color
      ctx.fill()
      
      ctx.restore()
   }

   draw(ctx) {
      this.drawTriangle(ctx)

      // // DEBUG
      // ctx.beginPath()
      // ctx.moveTo(this.goalX, this.goalY)
      // ctx.lineTo(this.x, this.y)

      // ctx.setLineDash([1, 8])
      // ctx.strokeStyle = "yellow"
      // ctx.stroke()

      // ctx.beginPath()
      // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      // ctx.stroke()
   }
}