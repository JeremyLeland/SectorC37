import { Game } from "./game.js"
import { Level } from "./level.js"
import { Starfield } from "./starfield.js"
import { Player } from "./player.js"
import { Enemy } from "./enemy.js"
import { Asteroid } from "./asteroid.js"

class GameLevel extends Level {
   constructor(width, height) {
      super(width, height)

      this.starfield = new Starfield(this.width, this.height, 1000)

      this.spawnEnemyDelay = this.timeBetweenEnemies = 12000
      this.spawnAsteroidDelay = this.timeBetweenAsteroids = 14000

      // Initial spawns are inside of level, future spawns will be outside level
      for (let i = 0; i < 5; i++) {
         this.addRandomEnemy(this.width / 4 + this.width * i / 5)
      }

      for (let i = 0; i < 40; i++) {
         this.addRandomAsteroid(this.width / 4 + this.width * i / 40)
      }
   }

   addRandomEnemy(distFromCenter) {
      const [x, y] = this.getRandomSpawnLocation(distFromCenter)
      this.addEntity(new Enemy(x, y, this))
   }

   addRandomAsteroid(distFromCenter) {
      const [x, y] = this.getRandomSpawnLocation(distFromCenter)
      this.addEntity(Asteroid.randomAsteroid(x, y, this))
   }

   getRandomSpawnLocation(distFromCenter) {
      const ang = Math.random() * Math.PI * 2
      const x = Math.cos(ang) * distFromCenter
      const y = Math.sin(ang) * distFromCenter

      return [x + this.width / 2, y + this.height / 2]
   }

   spawnEnemies(dt) {
      this.spawnEnemyDelay -= dt
      if (this.spawnEnemyDelay < 0) {
         for (let i = 0; i < 5; i ++) {
            this.addRandomEnemy(this.width * 1.5)
         }
         this.spawnEnemyDelay = this.timeBetweenEnemies
      }
   }

   spawnAsteroids(dt) {
      this.spawnAsteroidDelay -= dt
      if (this.spawnAsteroidDelay < 0) {
         this.addRandomAsteroid(this.width * 1.5)
         this.spawnAsteroidDelay = this.timeBetweenAsteroids
      }
   }

   update(dt) {
      this.spawnEnemies(dt)
      this.spawnAsteroids(dt)

      super.update(dt)
   }

   draw(ctx) {
      this.starfield.draw(ctx)

      super.draw(ctx)
   }
}

export class SectorC37 extends Game {
   constructor() {
      Game.VERSION = "Sector C37 v0.11"

      super()

      this.level = new GameLevel(2000, 2000)
      this.spawnDelay = this.timeBeforeSpawn = 1000
      this.spawnPlayer()

      this.canvas.style.cursor = "crosshair"
      this.startGame()
   }

   spawnPlayer() {
      this.player = new Player(this.level.width / 2, this.level.height / 2)
      this.level.addEntity(this.player)
      this.spawnDelay = this.timeBeforeSpawn
   }

   updateScroll() {
      const w = this.context.canvas.width
      const h = this.context.canvas.height

      this.scrollX = Math.max(0, Math.min(this.level.width - w, this.player.x - w / 2))
      this.scrollY = Math.max(0, Math.min(this.level.height - h, this.player.y - h / 2))
   }

   controlPlayer() {
      const goalX = this.mousex + this.scrollX
      const goalY = this.mousey + this.scrollY
      this.player.setGoal(goalX, goalY)

      if (this.mouseIsDown) {
         this.player.startShooting()
      }
      else {
         this.player.stopShooting()
      }
   }

   update(dt) {
      this.updateScroll()

      if (this.player.isAlive()) {
         this.controlPlayer()
      }
      else {
         this.spawnDelay -= dt
         if (this.spawnDelay < 0 && this.mouseIsDown) {
            this.spawnPlayer()
         }
      }

      this.level.update(dt)
   }

   drawUIBar(ctx, x, y, w, h, percent, color) {
      if (percent > 0) {
         ctx.fillStyle = color
         ctx.globalAlpha = 0.5
         ctx.fillRect(x, y, Math.floor(w * percent), h)
         ctx.globalAlpha = 1
      }

      ctx.strokeStyle = "white"
      ctx.strokeRect(x, y, w, h)
   }

   drawUI(ctx) {
      const lifePerc = this.player.health / Player.MAX_HEALTH
      this.drawUIBar(ctx, 5.5, 5.5, 200, 12, lifePerc, "red")
   }

   draw(ctx) {
      ctx.save()
      ctx.translate(-this.scrollX, -this.scrollY)
      this.level.draw(ctx)
      ctx.restore()

      this.drawUI(ctx)
   }
}
