import { Entity } from "./entity.js"

class Particle extends Entity {
   constructor({startX, startY, startSpread = 0, 
                startDX = 0, startDY = 0, dirAngle = 0, dirSpread = Math.PI * 2, 
                minSpeed = 0, maxSpeed, maxSpin = 0,
                minRadius = 0, maxRadius, life}) {
      const angle = dirAngle + Math.random() * dirSpread - dirSpread/2
      const dAngle = Math.random() * (maxSpin / 2) - maxSpin

      const dist = Math.random() * startSpread
      const x = startX + Math.cos(angle) * dist
      const y = startY + Math.sin(angle) * dist

      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed)
      const dx = startDX + Math.cos(angle) * speed
      const dy = startDY + Math.sin(angle) * speed

      const radius = minRadius + Math.random() * (maxRadius - minRadius)
      
      super(x, y, dx, dy, angle, dAngle, radius)
      this.life = this.MAX_LIFE = life
   }

   isAlive() {
      return this.life > 0
   }

   update(dt) {
      this.life -= dt

      super.update(dt)
   }

   setSlowAlphaFade(ctx) {
      const slowedPerc = Math.sin(0.5 * Math.PI * this.life / this.MAX_LIFE)
      ctx.globalAlpha = slowedPerc
   }

   drawParticle(ctx) {
      // particle itself, to be overriden by subclasses
   }

   draw(ctx) {
      ctx.save()

      ctx.translate(this.x, this.y)
      ctx.rotate(this.angle)

      this.drawParticle(ctx)

      ctx.restore()
   }
}

export class Fire extends Particle {
   constructor(actor) {
      super({startX: actor.x, startY: actor.y, startDX: actor.dx, startDY: actor.dy,
             maxSpeed: 0.04, maxRadius: 16, life: 1000})
   }

   drawParticle(ctx) {
      const lifePerc = this.life / this.MAX_LIFE
      const size = Math.sin(Math.PI * lifePerc) * this.radius

      // Inspired by http://codepen.io/davepvm/pen/Hhstl
      const r = 140 + 120 * lifePerc
      const g = 170 - 120 * lifePerc
      const b = 120 - 120 * lifePerc
      const a = 0.4 * lifePerc
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
      ctx.globalCompositeOperation = 'lighter'

      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fill()
   }
}

export class EngineTrail extends Particle {
   static RADIUS = 4

   constructor(ship) {
      super({startX: ship.x, startY: ship.y,
             maxSpeed: 0, minRadius: EngineTrail.RADIUS, maxRadius: EngineTrail.RADIUS, life: 300})
   }

   drawParticle(ctx) {
      const lifePerc = this.life / this.MAX_LIFE
      const size = lifePerc * this.radius

      const r = 140 + 120 * lifePerc
      const g = 170 - 120 * lifePerc
      const b = 120 - 120 * lifePerc
      const a = 0.4 * lifePerc
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
      ctx.globalCompositeOperation = 'lighter'

      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fill()
   }
}

export class Spark extends Particle {
   constructor(x, y, hitAng) {
      super({startX: x, startY: y, 
             dirAngle: hitAng, dirSpread: Math.PI / 8, 
             minSpeed: 0.1, maxSpeed: 0.1, maxRadius: 1, life: 500})

      this.startX = x
      this.startY = y
   }

   draw(ctx) {
      ctx.save()

      const lifePerc = this.life / this.MAX_LIFE

      const LENGTH = 100
      const grd = ctx.createLinearGradient(this.x - this.dx * LENGTH, 
                                           this.y - this.dy * LENGTH,
                                           this.x, this.y)
      grd.addColorStop(0.0, "rgba(0, 0, 0, 0)")
      grd.addColorStop(0.5, `rgba(255, 255, 0, ${lifePerc * 0.5})`)
      grd.addColorStop(1.0, `rgba(255, 255, 255, ${lifePerc})`)
      ctx.strokeStyle = grd

      ctx.beginPath()
      ctx.moveTo(this.startX, this.startY)
      ctx.lineTo(this.x, this.y)
      ctx.stroke()

      ctx.restore()
   }
}

export class RockDebris extends Particle {
   constructor(asteroid) {
      super({startX: asteroid.x, startY: asteroid.y, startSpread: asteroid.radius,
             maxSpeed: 0.06, maxSpin: 0.01, maxRadius: 5, life: 1500})

      this.color = asteroid.color
   }

   drawParticle(ctx) {
      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      this.setSlowAlphaFade(ctx)

      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
   }
}

export class ShipDebris extends Particle {
   constructor(ship) {
      super({startX: ship.x, startY: ship.y, startSpread: ship.radius,
             startDX: ship.dx, startDY: ship.dy, 
             maxSpeed: 0.1, maxSpin: 0.01, maxRadius: 3, life: 1000})

      this.color = ship.color
   }

   drawParticle(ctx) {
      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      this.setSlowAlphaFade(ctx)

      ctx.beginPath()
      ctx.moveTo(-this.radius, -this.radius)
      ctx.lineTo( this.radius,  0)
      ctx.lineTo(-this.radius,  this.radius)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
   }
}
