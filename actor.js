import { Entity } from "./entity.js"

export class Actor extends Entity {
   constructor(x, y, dx, dy, angle, dAngle, radius, mass, health, damage, level) {
      super(x, y, dx, dy, angle, dAngle, radius)
      this.mass = mass
      this.health = health
      this.damage = damage
      this.level = level
   }

   isAlive() {
      return this.health > 0
   }

   hitWith(actor) {
      this.health -= actor.damage

      if (this.health <= 0) {
         this.die()
      }
   }

   die() {
   }

   isCollidingWith(actor) {
      return this.distanceFrom(actor) < this.radius + actor.radius
   }

   distanceFrom(actor) {
      return this.distanceFromPoint(actor.x, actor.y)
   }

   distanceFromPoint(x, y) {
      const cx = x - this.x
      const cy = y - this.y
      return Math.sqrt(cx*cx + cy*cy)
   }

   angleTo(actor) {
      return this.angleToPoint(actor.x, actor.y)
   }

   angleToPoint(x, y) {
      return Math.atan2(y - this.y, x - this.x) - this.angle
   }

   timeUntilHit(other, buffer = 0) {
      // See when ships would collide if continuing at their current direction and rate of speed
      // This will return a negative value if the collision would have occurred in the past
      // See https://stackoverflow.com/questions/33140999/at-what-delta-time-will-two-objects-collide
      // (Line-Line was http://www.jeffreythompson.org/collision-detection/line-line.php)
      const cx = this.x - other.x
      const cy = this.y - other.y

      const dx1 = this.dx
      const dy1 = this.dy
      const dx2 = other.dx
      const dy2 = other.dy
      const vx = dx1 - dx2
      const vy = dy1 - dy2

      const rr = this.radius + other.radius + buffer

      const a = vx*vx + vy*vy
      const b = 2 * (cx * vx + cy * vy)
      const c = cx*cx + cy*cy - rr*rr

      const disc = b*b - 4*a*c

      // If the objects don't collide, the discriminant will be negative
      if (disc < 0) {
         return Number.POSITIVE_INFINITY
      }
      else {
         const t0 = (-b - Math.sqrt(disc)) / (2*a)

         return t0

         // if (t0 >= 0) {
         //    return t0
         // }
         // else {
         //    const t1 = (-b + Math.sqrt(disc)) / (2*a)

         //    console.log("t0 = " + t0)
         //    console.log("t1 = " + t1)
         //    console.log("\n")

         //    return t1 < 0 ? Number.POSITIVE_INFINITY : t1
         // }
      }
   }

   static handleBounce(a1, a2) {
      // See https://ericleong.me/research/circle-circle/#dynamic-circle-circle-collision
      // TODO: try something from this monster? http://www.euclideanspace.com/physics/dynamics/collision/twod/index.htm
      const diffX = a2.x - a1.x
      const diffY = a2.y - a1.y
      const distBetween = Math.sqrt(diffX * diffX + diffY * diffY)
      const normX = diffX / distBetween
      const normY = diffY / distBetween

      const p = 2 * (a1.dx * normX + a1.dy * normY - a2.dx * normX - a2.dy * normY) / (a1.mass + a2.mass)

      // console.log(`Before bounce: a1 ${a1.dx}, ${a1.dy}`)
      // console.log(`Before bounce: a2 ${a2.dx}, ${a2.dy}`)

      a1.dx -= p * a2.mass * normX
      a1.dy -= p * a2.mass * normY
      a2.dx += p * a1.mass * normX
      a2.dy += p * a1.mass * normY

      // console.log(`After bounce: a1 ${a1.dx}, ${a1.dy}`)
      // console.log(`After bounce: a2 ${a2.dx}, ${a2.dy}`)
   }
}