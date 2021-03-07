import { Ship } from "./ship.js"
import { Gun } from "./gun.js"

class PlayerGun extends Gun {
   constructor(frontOffset, sideOffset, level) {
      super({
         frontOffset: frontOffset,
         sideOffset: sideOffset,
         timeBetweenShots: 100,
         bulletSpeed: 0.4,
         bulletDamage: 10,
         bulletColor: Player.COLOR,
         level: level
      })
   }
}

export class Player extends Ship {
   static COLOR = "green"

   constructor(x, y, level) {
      super({
         x: x, y: y, 
         radius: 10, 
         mass: 1,
         health: 100, 
         damage: 50, 
         speed: 0.2, 
         turnSpeed: 0.005,
         color: Player.COLOR,
         level: level
      })

      const leftGun = new PlayerGun(this.radius * 2, -this.radius / 2, level)
      const rightGun = new PlayerGun(this.radius * 2, this.radius / 2, level)

      this.setGuns(leftGun, rightGun)
   }

   update(dt) {
      this.turnTowardPoint(this.goalX, this.goalY, dt)

      super.update(dt)
   }
}