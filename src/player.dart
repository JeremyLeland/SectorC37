import 'ship.dart';
import 'weapons.dart';

class Player extends Ship {
  static const COLOR = 'green';
  static const MAX_HEALTH = 100;
  static const MAX_SPEED = 0.2;

  Player({num x = 0, num y = 0})
   : super(x: x, y: y,
     radius: 10, 
     mass: 1,
     health: MAX_HEALTH, 
     damage: 50, 
     speed: MAX_SPEED, 
     turnSpeed: 0.005, 
     color: COLOR) {

    const GUN_ANGLE = 0.01;
    var playerShoot = () => new Bullet(damage: 10, speed: 0.4, color: COLOR);

    // Left gun
    guns.add(new Gun(
      frontOffset: radius,
      sideOffset: -radius,
      angleOffset: GUN_ANGLE,
      timeBetweenShots: 100, 
      shoot: playerShoot, 
      owner: this
    ));

    // Right gun
    guns.add(new Gun(
      frontOffset: radius,
      sideOffset: radius,
      angleOffset: -GUN_ANGLE,
      timeBetweenShots: 100, 
      shoot: playerShoot, 
      owner: this
    ));
  }
}