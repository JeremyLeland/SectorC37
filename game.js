export class Game {
   static VERSION = 0

   constructor() {
      // Canvas
      this.canvas = document.createElement("canvas")
      this.canvas.style = "display: block"
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      document.body.appendChild(this.canvas)

      window.addEventListener('resize', () => this.resize(), false)

      this.context = this.canvas.getContext("2d")

      // UI
      this.prepareUI()

      // Keyboard
      this.keyBindings = {}
      this.keyDown = {}
      document.onkeydown = (e) => this.keyDownCallback(e)
      document.onkeyup = (e) => this.keyUpCallback(e)

      // Mouse
      this.mousex = 0
      this.mousey = 0
      this.mouseIsDown = false
      this.mouseButton = -1
      this.canvas.onmousedown = (e) => this.mouseDownCallback(e)
      this.canvas.onmouseup = (e) => this.mouseUpCallback(e)
      this.canvas.onmousemove = (e) => this.mouseMovedCallback(e)
   }

   resize() {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
   }

   prepareUI() {
      this.fpsUI = document.createElement('div')
      this.fpsUI.style = "position: absolute; left: 100%; top: 100%; transform: translate(-14px, -14px); font: 10px sans-serif"
      document.body.appendChild(this.fpsUI)
      this.frames = 0
      setInterval(() => this.updateFPS(), 1000)

      this.versionUI = document.createElement('div')
      this.versionUI.textContent = Game.VERSION
      this.versionUI.style = "position: absolute; left: 2px; top: 100%; transform: translate(0, -14px); font: 10px sans-serif"
      document.body.appendChild(this.versionUI)

      this.debugUI = document.createElement('div')
      this.debugUI.style = "position: absolute; white-space: pre; left: 2px; top: 2px; font: 10px sans-serif"
      document.body.appendChild(this.debugUI)
   }

   startGame() {
      this.lastTime = new Date().getTime()
      this.animate()
   }

   keyDownCallback(e) {
      for (var k in this.keyBindings) {
         if (e.keyCode == this.keyBindings[k]) {
            this.keyDown[k] = true
         }
      }
   }

   keyUpCallback(e) {
      for (var k in this.keyBindings) {
         if (e.keyCode == this.keyBindings[k]) {
            this.keyDown[k] = false
         }
      }
   }

   mouseDownCallback(e) {
      this.mouseIsDown = true

      this.mousex = e.offsetX
      this.mousey = e.offsetY
      this.mouseButton = e.button
   }

   mouseUpCallback(e) {
      this.mouseIsDown = false

      this.mousex = e.offsetX
      this.mousey = e.offsetY
      this.mouseButton = -1
   }

   mouseMovedCallback(e) {
      this.mousex = e.offsetX
      this.mousey = e.offsetY
   }

   animate() {
      requestAnimationFrame( () => this.animate() )

      const MAX_DT = 20

      let now = new Date().getTime()

      // Do multiple updates for long delays (so we don't miss things)
      for (let dt = now - this.lastTime; dt > 0; dt -= MAX_DT) {
         this.update(Math.min(dt, MAX_DT))
      }

      this.lastTime = now

      this.draw(this.context)
      this.frames ++
   }

   updateFPS() {
      this.fpsUI.textContent = this.frames
      this.frames = 0
   }

   update(dt) {}
   draw(ctx) {}
}
