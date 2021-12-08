export class Game {
  mouseX = 0;
  mouseY = 0;
  mouseDown = false;

  constructor() {
    const canvas = document.createElement( 'canvas' );
    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.onresize();
    
    document.body.appendChild( canvas );
    const ctx = canvas.getContext( '2d' );

    const onInput = ( e ) => {
      const event = e.touches ? e.touches[ 0 ] : e;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
    document.onmousemove = onInput;
    document.ontouchmove = onInput;
    document.onmousedown  = ( e ) => { this.mouseDown = true; onInput( e ); }
    document.ontouchstart = ( e ) => { this.mouseDown = true; onInput( e ); }
    document.onmouseup  = ( e ) => this.mouseDown = false;
    document.ontouchend = ( e ) => this.mouseDown = false;
    

    let lastTime = null;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      this.update( now - lastTime );
      lastTime = now;
  
      ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
      this.draw( ctx );
  
      requestAnimationFrame( animate );
    };

    requestAnimationFrame( animate );
  }

  update( dt ) {}
  draw( ctx ) {}

}
