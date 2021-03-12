import { Ship } from "./ship.js"
import { Gun } from "./gun.js"

class PlayerGun extends Gun {
   constructor(frontOffset, sideOffset, angleOffset, owner) {
      super({
         frontOffset: frontOffset,
         sideOffset: sideOffset,
         angleOffset: angleOffset,
         timeBetweenShots: 100,
         bulletSpeed: 0.4,
         bulletDamage: 10,
         bulletColor: Player.COLOR,
         owner: owner
      })
   }

   drawEntity(ctx) {
      const BARREL_W = 1, BARREL_L = this.radius * 1.5
      ctx.fillStyle = "gray"
      ctx.strokeStyle = "black"
      ctx.fillRect(0, -BARREL_W, BARREL_L, BARREL_W * 2)
      ctx.strokeRect(0, -BARREL_W, BARREL_L, BARREL_W * 2)
   }
}

export class Player extends Ship {
   static COLOR = "green"
   static MAX_HEALTH = 100

   constructor(x, y) {
      super({
         x: x, y: y, 
         radius: 10, 
         mass: 1,
         health: Player.MAX_HEALTH, 
         damage: 50, 
         speed: 0.2, 
         turnSpeed: 0.005,
         color: Player.COLOR
      })

      const GUN_ANGLE = 0.01
      const leftGun = new PlayerGun(this.radius, -this.radius, GUN_ANGLE, this)
      const rightGun = new PlayerGun(this.radius, this.radius, -GUN_ANGLE, this)

      this.setGuns(leftGun, rightGun)
   }

   update(dt) {
      this.turnTowardPoint(this.goalX, this.goalY, dt)

      super.update(dt)
   }
}