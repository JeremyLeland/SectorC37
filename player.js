import { Ship } from "./ship.js"
import { Gun } from "./weapons.js"

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