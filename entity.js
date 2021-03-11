export class Entity {
   constructor({x = 0, y = 0, dx = 0, dy = 0, angle = 0, dAngle = 0,
                radius = 0, mass = 0, health = 1, damage = 0}) {
      this.x = x
      this.y = y
      this.dx = dx
      this.dy = dy
      this.angle = angle
      this.dAngle = dAngle

      this.radius = radius
      this.mass = mass
      this.health = health
      this.damage = damage

      this.createdEntities = []
   }

   //
   // Health
   //
   isAlive() {
      return this.health > 0
   }

   hitWith(entity) {
      this.health -= entity.damage

      if (this.health <= 0) {
         this.die()
      }
   }

   die() {
      // sub-classes should override this
   }

   updatePosition(dt) {
      this.x += this.dx * dt
      this.y += this.dy * dt
      this.angle += this.dAngle * dt
   }

   update(dt) {
      this.updatePosition(dt)
   }

   draw(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)

      this.drawEntity(ctx)

      ctx.restore()
   }

   createEntity(entity) {
      this.createdEntities.push(entity)
   }

   getCreatedEntities() {
      return this.createdEntities.splice(0)
   }

   //
   // Distances and angles
   //

   distanceFrom(entity) {
      return this.distanceFromPoint(entity.x, entity.y)
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

   getOffsetPosition(frontOffset, sideOffset) {
      const sinAngFront = Math.sin(this.angle)
      const cosAngFront = Math.cos(this.angle)
      const sinAngSide = Math.sin(this.angle + Math.PI/2)
      const cosAngSide = Math.cos(this.angle + Math.PI/2)

      const x = this.x + cosAngFront * frontOffset + cosAngSide * sideOffset
      const y = this.y + sinAngFront * frontOffset + sinAngSide * sideOffset

      return [x, y]
   }
   

   //
   // Collision
   //

   isCollidingWith(entity) {
      return this.distanceFrom(entity) < this.radius + entity.radius
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

   static handleBounce(e1, e2) {
      // See https://ericleong.me/research/circle-circle/#dynamic-circle-circle-collision
      // TODO: try something from this monster? http://www.euclideanspace.com/physics/dynamics/collision/twod/index.htm
      const diffX = e2.x - e1.x
      const diffY = e2.y - e1.y
      const distBetween = Math.sqrt(diffX * diffX + diffY * diffY)
      const normX = diffX / distBetween
      const normY = diffY / distBetween

      const p = 2 * (e1.dx * normX + e1.dy * normY - e2.dx * normX - e2.dy * normY) / (e1.mass + e2.mass)

      // console.log(`Before bounce: a1 ${a1.dx}, ${a1.dy}`)
      // console.log(`Before bounce: a2 ${a2.dx}, ${a2.dy}`)

      e1.dx -= p * e2.mass * normX
      e1.dy -= p * e2.mass * normY
      e2.dx += p * e1.mass * normX
      e2.dy += p * e1.mass * normY

      // console.log(`After bounce: a1 ${a1.dx}, ${a1.dy}`)
      // console.log(`After bounce: a2 ${a2.dx}, ${a2.dy}`)
   }
}