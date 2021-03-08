import { Entity } from "./entity.js"
import * as Particles from "./particles.js"

export class Asteroid extends Entity {
   static randomAsteroid(x, y) {
      const dx = Math.random() * 0.02 - 0.01
      const dy = Math.random() * 0.02 - 0.01
      const radius = Math.random() * 50 + 20
      const c = Math.random() * 100 + 100
      const col = `rgb(${c}, ${c/2}, 0)`

      return new Asteroid(x, y, dx, dy, radius, col)
   }

   constructor(x, y, dx, dy, radius, color) {
      // Mass, health, and damage based on radius
      const mass = radius * 0.5
      const health = radius * 20
      const damage = radius * 10

      super({x: x, y: y, dx: dx, dy: dy, 
            radius: radius, mass: mass, health: health, damage: damage})

      this.color = color
   }

   die() {
      for (let i = 0; i < this.radius * 2; i ++) {
         this.createEntity(new Particles.RockDebris(this))
      }

      const NUM_SMALLER = 3
      const startAng = Math.random() * Math.PI * 2
      for (let i = 0; i < NUM_SMALLER; i ++) {
         const ang = startAng + i * Math.PI * 2 / NUM_SMALLER
         const x = this.x + Math.cos(ang) * this.radius / 2
         const y = this.y + Math.sin(ang) * this.radius / 2

         const SPEED = 0.01
         const dx = this.dx + Math.cos(ang) * SPEED
         const dy = this.dy + Math.sin(ang) * SPEED

         const radius = this.radius * (Math.random() * 0.2 + 0.2)

         this.createEntity(new Asteroid(x, y, dx, dy, radius, this.color))
      }
   }

   drawEntity(ctx) {
      ctx.fillStyle = this.color
      ctx.strokeStyle = "black"

      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
   }
}