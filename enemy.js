import { Ship } from "./ship.js"
import { Player } from "./player.js"
import { Gun } from "./gun.js"

class EnemyGun extends Gun {
   constructor(frontOffset, sideOffset, owner) {
      super({
         frontOffset: frontOffset,
         sideOffset: sideOffset,
         timeBetweenShots: 100,
         bulletSpeed: 0.3,
         bulletDamage: 5,
         bulletColor: Enemy.COLOR,
         owner: owner
      })
   }
}

export class Enemy extends Ship {
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
         color: Enemy.COLOR
      })

      this.setGuns(new EnemyGun(this.radius * 2, 0, this))

      this.targetActor = null
      this.avoidActor = null

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

      let closestAvoid = null, closestAvoidTime = Number.POSITIVE_INFINITY
      let closestPlayer = null, closestPlayerDist = Number.POSITIVE_INFINITY
      nearby.forEach(n => {
         //
         // Look for actors to avoid
         //
         const time = this.timeUntilHit(n, 10)

         // Include hits in the near "past", since we may be in our buffer zone
         if (time > -100 && time < closestAvoidTime) {
            closestAvoid = n
            closestAvoidTime = time
         }

         //
         // Look for targets
         //
         if (n instanceof Player) {
            const dist = this.distanceFrom(n)

            if (dist < closestPlayerDist) {
               closestPlayer = n
               closestPlayerDist = dist
            }
         }
      })

      this.avoidActor = closestAvoidTime < this.AVOID_TIME ? closestAvoid : null
      this.targetActor = closestPlayerDist < this.TARGET_DIST ? closestPlayer : null
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