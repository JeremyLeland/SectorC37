export class Starfield {
  #images = [];

  constructor( width, height, density = 2000, layers = 1 ) {
    this.width = width;
    this.height = height;

    for ( let layer = 0; layer < layers; layer ++ ) {
      const image = document.createElement( 'canvas' );
      image.width = width;
      image.height = height;
      
      const ctx = image.getContext( '2d' );

      if ( layer == 0 ) {
        ctx.fillStyle = 'black';
        ctx.fillRect( 0, 0, width, height );
      }
      
      const numStars = density / width * height;
      for ( let i = 0; i < numStars; i ++ ) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 0.5 + 0.5 * ( layers - layer - Math.random() ) / layers;
        
        ctx.beginPath();
        ctx.arc( x, y, r, 0, Math.PI * 2 );
        
        const col = r * 150; //Math.random() * 250 / ( layer + 1);
        ctx.fillStyle = `rgba( ${ col }, ${ col }, ${ col }, ${ r } )`;
        ctx.fill();
      }
      
      this.#images.push( image );
    }
  }

  draw( ctx, scrollX = 0, scrollY = 0 ) {
    // ctx.fillStyle = 'black';
    // ctx.fillRect( -this.width / 2, -this.height / 2, this.width, this.height );

    this.#images.forEach( ( image, index ) => {
      ctx.drawImage( image, 
        -this.width / 2  + scrollX / Math.pow( 2, index ), 
        -this.height / 2 + scrollY / Math.pow( 2, index ), 
      );
    } );
  }
}