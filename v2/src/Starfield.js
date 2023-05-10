export class Starfield {
  #images = [];

  constructor( width, height, density = 2000, layers = 1 ) {
    this.width = width;
    this.height = height;

    for ( let layer = 0; layer < layers; layer ++ ) {
      const layerWidth = width * Math.pow( 2, -layer );
      const layerHeight = height * Math.pow( 2, -layer );

      const image = document.createElement( 'canvas' );
      image.width = layerWidth;
      image.height = layerHeight;
      
      const ctx = image.getContext( '2d' );

      ctx.fillStyle = layer == 0 ? 'rgba(100,0,0,0.1)' : layer == 1 ? 'rgba(0,100,0,0.1)' : 'rgba(0,0,100,0.1)';
      ctx.fillRect( 0, 0, this.width, this.height );
      
      const numStars = layerWidth * layerHeight / density;
      for ( let i = 0; i < numStars; i ++ ) {
        const x = Math.random() * layerWidth;
        const y = Math.random() * layerHeight;
        const r = Math.random() * 1;
        
        ctx.beginPath();
        ctx.arc( x, y, r, 0, Math.PI * 2 );
        
        const col = Math.random() * 200;
        ctx.fillStyle = `rgb( ${ col }, ${ col }, ${ col } )`;
        // ctx.fillStyle = l == 0 ? 'yellow' : l == 1 ? 'red' : 'blue';
        ctx.fill();
      }
      
      this.#images.push( image );
    }
  }

  draw( ctx, scrollX = 0, scrollY = 0 ) {
    // ctx.fillStyle = 'black';
    // ctx.fillRect( -this.width / 2, -this.height / 2, this.width, this.height );

    this.#images.forEach( ( image, index ) => {
      const dim = Math.pow( 2, index + 1 );
      ctx.drawImage( image, 
        -this.width / dim  + scrollX * Math.pow( 2, -index ), 
        -this.height / dim + scrollY * Math.pow( 2, -index ), 
      );
    } );
  }
}