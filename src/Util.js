//
// Angles
//
export function fixAngle( a ) {
  return a > Math.PI ? a - Math.PI * 2 : a < -Math.PI ? a + Math.PI * 2 : a;
}

export function deltaAngle( a, b ) {
  return fixAngle( b - a );
}

export function betweenAngles( angle, lower, upper ) {
  return 0 < deltaAngle( lower, angle ) && 0 < deltaAngle( angle, upper ); 
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