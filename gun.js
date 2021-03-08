import { Bullet } from "./bullet.js"

export class Gun {
   constructor({frontOffset, sideOffset, angleOffset = 0, timeBetweenShots, bulletSpeed, bulletDamage, bulletColor, owner}) {
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
      const sinAngFront = Math.sin(this.owner.angle)
      const cosAngFront = Math.cos(this.owner.angle)
      const sinAngSide = Math.sin(this.owner.angle + Math.PI/2)
      const cosAngSide = Math.cos(this.owner.angle + Math.PI/2)
      const x = this.owner.x + cosAngFront * this.frontOffset + cosAngSide * this.sideOffset
      const y = this.owner.y + sinAngFront * this.frontOffset + sinAngSide * this.sideOffset
      
      const ang = this.owner.angle + this.angleOffset
      const dx = Math.cos(ang) * this.bulletSpeed
      const dy = Math.sin(ang) * this.bulletSpeed

      this.shootDelay = this.timeBetweenShots
      return new Bullet(x, y, dx, dy, this.bulletDamage, this.bulletColor)
   }

   update(dt) {
      this.shootDelay = Math.max(0, this.shootDelay - dt)
   }
}