import { Actor } from "./actor.js"
import { Ship } from "./ship.js"
import { Player } from "./player.js"
import { Gun } from "./gun.js"

class ScoutGun extends Gun {
   constructor(frontOffset, sideOffset, owner) {
      super({
         frontOffset: frontOffset,
         sideOffset: sideOffset,
         timeBetweenShots: 100,
         bulletSpeed: 0.3,
         bulletDamage: 5,
         bulletColor: Scout.COLOR,
         owner: owner
      })
   }
}

export class Scout extends Ship {
   static COLOR = "blue"

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

      this.setGuns(new ScoutGun(this.radius * 2, 0, this))

      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5

      this.AVOID_TIME = 2000
      this.TARGET_DIST = 1000
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

      this.avoidActor = this.getClosestAvoid(nearby, this.AVOID_TIME)
      this.targetActor = this.getClosestTarget(nearby, e => e instanceof Player, this.TARGET_DIST)
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
          this.distanceFrom(this.targetActor) < this.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetActor)) < this.SHOOT_ANGLE) {
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

class TurretGun extends Gun {
   constructor(frontOffset, sideOffset, owner) {
      super({
         frontOffset: frontOffset,
         sideOffset: sideOffset,
         timeBetweenShots: 100,
         bulletSpeed: 0.3,
         bulletDamage: 5,
         bulletColor: "red",
         owner: owner
      })
   }
}

class Turret extends Actor {
   constructor(frontOffset, sideOffset, owner) {
      super({x: owner.x + frontOffset, y: owner.y + sideOffset, radius: 20, 
         mass: 1, health: 20, damage: 10, turnSpeed: 0.003, color: "gray"
      })

      this.frontOffset = frontOffset
      this.sideOffset = sideOffset
      this.owner = owner

      this.gun = new TurretGun(this.radius * 2, 0, this)
      this.isShooting = false

      this.TARGET_DIST = 1000
      this.SHOOT_DISTANCE = 300
      this.SHOOT_ANGLE = 0.5

      this.targetActor = null
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

      this.gun.update(dt)
      
      if (this.gun.isReadyToShoot() &&
          this.targetActor != null && 
          this.distanceFrom(this.targetActor) < this.SHOOT_DISTANCE && 
          Math.abs(this.angleTo(this.targetActor)) < this.SHOOT_ANGLE) {
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

export class TurretPlatform extends Actor {
   constructor(x, y) {
      super({
         x: x, y: y, 
         radius: 10, 
         mass: 1,
         health: 50, 
         damage: 50,
         color: "gray"
      })

      this.turret = new Turret(0, 0, this)
   }

   think(level) {
      this.turret.think(level)
   }

   update(dt) {
      this.turret.update(dt)

      for (const e of this.turret.getCreatedEntities()) {
         this.createEntity(e)
      }
   }

   draw(ctx) {
      super.draw(ctx)
      this.turret.draw(ctx)
   }
}