// const debugDiv = document.getElementById( 'debug' );

export class Avoid {
  bestAngle;

  #goalX;
  #goalY;
  #cones = [];

  constructor( { entity, others, goalX, goalY } ) {
    this.#goalX = goalX;
    this.#goalY = goalY;
    const goalAngle = Math.atan2( goalY - this.y, goalX - this.x );

    others.forEach( other => {
      const r = other.size + entity.size * 2;
      
      const lefts = [], rights = [], weights = [];

      // TODO: entity kind of works with a low-ish AVOID_TIME, but it doesn't
      // seem to work as well if other is travelling faster. Maybe some
      // sort of "sweep" test here rather than look at two separate times?
      [ 0, AVOID_TIME ].forEach( time => {
        const cx = other.x + other.dx * time - entity.x;
        const cy = other.y + other.dy * time - entity.y;
        const h = Math.hypot( cx, cy );
        const angle = Math.atan2( cy, cx );
        const spread = Math.asin( Math.min( 1, r / h ) );   // prevent floating point errors when we get really close
        
        lefts.push( Util.fixAngle( angle - spread ) );
        rights.push( Util.fixAngle( angle + spread ) );
        weights.push( 150 / h );
      } );

      this.#cones.push( { 
        left: Math.min( ...lefts ), 
        right: Math.max( ...rights ),
        value: Math.max( ...weights ),
      } );
    } );

    // DEBUG
    // debugDiv.innerText = 'Cones:\n' + JSON.stringify( cones );

    const edges = [];
    const goalAvoidValue = avoidValue( goalAngle, cones );
    
    // debugDiv.innerText += '\n\nGoal Angle: ' + goalAngle + ', avoid value: ' + goalAvoidValue;

    if ( goalAvoidValue == 0 ) {
      return goalAngle;
    }
    else {   
      cones.forEach( c => {
        [ c.left, c.right ].forEach( angle => {
          edges.push( { 
            angle: angle, 
            value: Math.max( 0, avoidValue( angle, cones ) ),
          } );
        } );
      } );
    
      // debugDiv.innerText += '\n\Edges:\n' + JSON.stringify( edges );
    
      edges.sort( ( a, b ) => a.value - b.value );
      const bestEdges = edges.filter( c => c.value == edges[ 0 ].value );
    
      this.bestAngle = bestEdges.sort( ( a, b ) => 
        Math.abs( Util.deltaAngle( a.angle, goalAngle ) ) - 
        Math.abs( Util.deltaAngle( b.angle, goalAngle ) )
      )[ 0 ].angle;
    }
  }

  draw( ctx ) {
    

    ctx.beginPath();
    ctx.moveTo( this.x, this.y );
    ctx.lineTo( this.x + Math.cos( this.goalAngle ) * AVOID_TIME, this.y + Math.sin( this.goalAngle ) * AVOID_TIME );
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    this.#cones?.forEach( cone => {
      ctx.beginPath();
      ctx.moveTo( this.x, this.y );
      ctx.arc( this.x, this.y, 0.001 < cone.value ? 50 : 100, cone.left, cone.right );
      ctx.closePath();
      
      ctx.fillStyle = 0.001 < cone.value ? `rgba( 128, 0, 0, ${ cone.value * 0.5 } )` : 'rgba( 0, 128, 0, 0.5 )';    
      ctx.fill();
    } );

    
  }
}