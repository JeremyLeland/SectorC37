import { Bullet } from "./bullet.js"

export class Gun {
   constructor({frontOffset, sideOffset, timeBetweenShots, bulletSpeed, bulletDamage, bulletColor, level}) {
      this.frontOffset = frontOffset
      this.sideOffset = sideOffset
      this.shootDelay = this.timeBetweenShots = timeBetweenShots
      this.bulletSpeed = bulletSpeed
      this.bulletDamage = bulletDamage
      this.bulletColor = bulletColor
      this.level = level
   }

   isReadyToShoot() {
      return this.shootDelay == 0
   }

   shoot(shipX, shipY, shipAngle) {
      const sinAngFront = Math.sin(shipAngle), cosAngFront = Math.cos(shipAngle)
      const sinAngSide = Math.sin(shipAngle + Math.PI/2), cosAngSide = Math.cos(shipAngle + Math.PI/2)
      const x = shipX + cosAngFront * this.frontOffset + cosAngSide * this.sideOffset
      const y = shipY + sinAngFront * this.frontOffset + sinAngSide * this.sideOffset
      const dx = cosAngFront * this.bulletSpeed
      const dy = sinAngFront * this.bulletSpeed

      const bullet = new Bullet(x, y, dx, dy, this.bulletDamage, this.bulletColor, this.level)
      this.level.addActor(bullet)

      this.shootDelay = this.timeBetweenShots
   }

   update(dt) {
      this.shootDelay = Math.max(0, this.shootDelay - dt)
   }
}