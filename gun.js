import { Bullet } from "./bullet.js"

export class Gun {
   constructor({frontOffset, sideOffset, angleOffset = 0, 
                timeBetweenShots, bulletSpeed, bulletDamage, bulletColor, owner}) {
      this.frontOffset = frontOffset
      this.sideOffset = sideOffset
      this.angleOffset = angleOffset

      this.shootDelay = this.timeBetweenShots = timeBetweenShots
      this.bulletSpeed = bulletSpeed
      this.bulletDamage = bulletDamage
      this.bulletColor = bulletColor
      this.owner = owner
   }

   isReadyToShoot() {
      return this.shootDelay == 0
   }

   shoot() {
      const [x, y] = this.owner.getOffsetPosition(this.frontOffset, this.sideOffset)
      const angle = this.owner.angle + this.angleOffset
      
      const dx = Math.cos(angle) * this.bulletSpeed
      const dy = Math.sin(angle) * this.bulletSpeed

      this.shootDelay = this.timeBetweenShots
      return new Bullet(x, y, dx, dy, this.bulletDamage, this.bulletColor)
   }

   update(dt) {
      this.shootDelay = Math.max(0, this.shootDelay - dt)
   }
}