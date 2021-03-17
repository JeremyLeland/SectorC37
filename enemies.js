import { Entity } from "./entity.js"
import { Actor } from "./actor.js"
import { Ship } from "./ship.js"
import { Player } from "./player.js"
import { Gun } from "./weapons.js"

export class Asteroid extends Entity {
   static randomAsteroid(x, y) {
      const dx = Math.random() * 0.02 - 0.01
      const dy = Math.random() * 0.02 - 0.01
      const radius = Math.random() * 50 + 20
      const c = Math.random() * 100 + 100
      const col = `rgb(${c}, ${c/2}, 0)`

      return new Asteroid({x: x, y: y, dx: dx, dy: dy, radius: radius, color: col})
   }

   constructor({x, y, dx = 0, dy = 0, radius, color}) {
      // Mass, health, and damage based on radius
      const mass = radius * 0.5
      const health = radius * 20
      const damage = radius * 10

      super({x: x, y: y, dx: dx, dy: dy, 
            radius: radius, mass: mass, health: health, damage: damage})

      this.color = color
   }

   die() {
      for (let i = 0; i < this.radius * 2; i ++) {
         this.createEntity(new Particles.Rock(this))
      }

      const NUM_SMALLER = 3
      const startAng = Math.random() * Math.PI * 2
      for (let i = 0; i < NUM_SMALLER; i ++) {
         const ang = startAng + i * Math.PI * 2 / NUM_SMALLER
         const x = this.x + Math.cos(ang) * this.radius / 2
         const y = this.y + Math.sin(ang) * this.radius / 2

         const SPEED = 0.01
         const dx = this.dx + Math.cos(ang) * SPEED
         const dy = this.dy + Math.sin(ang) * SPEED

         const radius = this.radius * (Math.random() * 0.2 + 0.2)

         this.createEntity(new Asteroid(x, y, dx, dy, radius, this.color))
      }
   }

   drawEntity(ctx) {
      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
   }
}

export class Scout extends Ship {
   static COLOR = "blue"

   static SHOOT_DISTANCE = 300
   static SHOOT_ANGLE = 0.5

   static AVOID_TIME = 2000
   static TARGET_DISTANCE = 1000

   constructor(x, y) {
      super({
         x: x, y: y, 
         radius: 10, 
         mass: 1,
         health: 50, 
         damage: 50, 
         speed: 0.15, 
         turnSpeed: 0.003,
         color: Scout.COLOR
      })

      this.setGuns(new Gun({
         frontOffset: this.radius * 2,
         sideOffset: 0,
         timeBetweenShots: 100,
         bulletSpeed: 0.3,
         bulletDamage: 5,
         bulletColor: Scout.COLOR,
         owner: this
      }))
   }

   setRandomGoal() {
      
   }

   checkForGoal() {
      
   }

   think(level) {
      //
      // Goals
      //

      // Head toward random location in level if nothing else is going on
      // TODO: also change this after time, in case the goal is somewhere we must avoid?
      if (this.distanceFromPoint(this.goalX, this.goalY) < this.radius * 2) {
         this.setGoal(Math.random() * level.width, Math.random() * level.height)
      }

      //
      // Avoid and targets
      //

      // TODO: Flocking?
      // - https://www.red3d.com/cwr/boids/
      // - https://gamedevelopment.tutsplus.com/tutorials/3-simple-rules-of-flocking-behaviors-alignment-cohesion-and-separation--gamedev-3444


      // Look for actors to avoid or target
      const nearby = level.getActorsNear(this)

      this.avoidActor = this.getClosestAvoid(nearby, Scout.AVOID_TIME)
      this.targetActor = this.getClosestTarget(nearby, e => e instanceof Player, Scout.TARGET_DISTANCE)
   }

   update(dt) {
      if (this.avoidActor != null) {
         this.turnAwayFrom(this.avoidActor, dt)
      }
      else if (this.targetActor != null) {
         this.turnToward(this.targetActor, dt)
      }
      else {
         this.turnTowardPoint(this.goalX, this.goalY, dt)
      }

      if (this.targetActor != null && 
          this.distanceFrom(this.targetActor) < Scout.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetActor)) < Scout.SHOOT_ANGLE) {
         this.startShooting()
      }
      else {
         this.stopShooting()
      }

      super.update(dt)
   }

   // draw(ctx) {
   //    super.draw(ctx)

   //    // // DEBUG
   //    // if (this.avoidActor != null) {
   //    //    ctx.beginPath()
   //    //    ctx.moveTo(this.avoidActor.x, this.avoidActor.y)
   //    //    ctx.lineTo(this.x, this.y)

   //    //    ctx.setLineDash([1, 8])
   //    //    ctx.strokeStyle = "red"
   //    //    ctx.stroke()
   //    // }
   // }
}

class Turret extends Actor {
   static TARGET_DIST = 1000
   static SHOOT_DISTANCE = 300
   static SHOOT_ANGLE = 0.5

   constructor(frontOffset, sideOffset, owner) {
      super({x: owner.x + frontOffset, y: owner.y + sideOffset, radius: 20, 
         mass: 1, health: 20, damage: 10, turnSpeed: 0.003, color: "gray"
      })

      this.frontOffset = frontOffset
      this.sideOffset = sideOffset
      this.owner = owner

      this.gun = new Gun({
         frontOffset: this.radius * 2,
         sideOffset: 0,
         timeBetweenShots: 100,
         bulletSpeed: 0.3,
         bulletDamage: 5,
         bulletColor: "red",
         owner: this
      })
      this.isShooting = false

      this.targetActor = null
   }

   think(level) {
      const nearby = level.getActorsNear(this)
      this.targetActor = this.getClosestTarget(nearby, e => e instanceof Player, Turret.TARGET_DIST)
   }

   update(dt) {
      [this.x, this.y] = this.owner.getOffsetPosition(this.frontOffset, this.sideOffset)

      if (this.targetActor != null) {
         this.turnToward(this.targetActor, dt)
      }

      this.gun.update(dt)
      
      if (this.gun.isReadyToShoot() &&
          this.targetActor != null && 
          this.distanceFrom(this.targetActor) < Turret.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetActor)) < Turret.SHOOT_ANGLE) {
         this.createEntity(this.gun.shoot())
      }      

      super.update(dt)
   }

   drawEntity(ctx) {
      const BASE_PERCENT = 0.5, BARREL_PERCENT = 0.15
      ctx.fillStyle = "gray"
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

export class TurretPlatform extends Ship {
   constructor(x, y) {
      super({
         x: x, y: y, 
         radius: 10, 
         mass: 1,
         health: 50, 
         damage: 50,
         color: "gray"
      })

      this.setTurrets(new Turret(0, 0, this))
   }
}