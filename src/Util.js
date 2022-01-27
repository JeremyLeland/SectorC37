//
// Angles
//
export function fixAngle( a ) {
  return a > Math.PI ? a - Math.PI * 2 : a < -Math.PI ? a + Math.PI * 2 : a;
  //return a - Math.floor( a / Math.PI ) * Math.PI * 2;
}

export function deltaAngle( a, b ) {
  return fixAngle( b - a );
}

export function betweenAngles( angle, lower, upper ) {
  return 0 < deltaAngle( lower, angle ) && 0 < deltaAngle( angle, upper ); 
}

export function rotatedXY( x, y, angle ) {
  const cosX = Math.cos( angle );
  const sinX = Math.sin( angle );
  const cosY = Math.cos( angle - Math.PI / 2 );
  const sinY = Math.sin( angle - Math.PI / 2 );

  return [ cosX * x + cosY * y, sinX * x + sinY * y ];
}

//
// Random
//
export function rand25()  {
  return Math.random() + 0.25;
}

export function randMid() {
  return Math.random() - 0.50;
}