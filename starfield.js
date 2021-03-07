export class Starfield {
   constructor(width, height, numStars) {
      this.image = document.createElement('canvas')
      this.image.width = width
      this.image.height = height

      const ctx = this.image.getContext('2d')

      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < numStars; i ++) {
         const x = Math.random() * width
         const y = Math.random() * height
         const r = Math.random() * 1
         const col = Math.random() * 200

         ctx.fillStyle = 'rgb(' + col + ', ' + col + ', ' + col + ')'

         ctx.beginPath()
         ctx.arc(x, y, r, 0, Math.PI * 2)
         ctx.fill()
      }
   }

   draw(ctx) {
      ctx.drawImage(this.image, 0, 0)
   }
}