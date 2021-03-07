export class Entity {
   constructor(x, y, dx, dy, angle, dAngle, radius) {
      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
      this.angle = angle
      this.dAngle = dAngle
      this.radius = radius
   }

   isAlive() {
      return true
   }

   updatePosition(dt) {
      this.x += this.dx * dt
      this.y += this.dy * dt
      this.angle += this.dAngle * dt
   }

   update(dt) {
      this.updatePosition(dt)
   }
}