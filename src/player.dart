import 'ship.dart';
import 'weapons.dart';

class Player extends Ship {
  static const MAX_HEALTH = 100;
  static const MAX_SPEED = 0.2;

  Player()
   : super(
     radius: 10, 
     mass: 1,
     health: MAX_HEALTH, 
     damage: 50, 
     speed: MAX_SPEED, 
     turnSpeed: 0.005, 
     color: 'green'
  ) {
    const GUN_ANGLE = 0.01;
    var playerShoot = () => new Bullet(damage: 10, color: color);

    // Left gun
    guns.add(new Gun(
      frontOffset: radius,
      sideOffset: -radius,
      angleOffset: GUN_ANGLE,
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: playerShoot, 
      owner: this
    ));

    // Right gun
    guns.add(new Gun(
      frontOffset: radius,
      sideOffset: radius,
      angleOffset: -GUN_ANGLE,
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: playerShoot, 
      owner: this
    ));

    // Missle launcher
    guns.add(new Gun(
      frontOffset: radius * 2,
      timeBetweenShots: 1000, 
      shoot: () => new Missle(damage: 50, speed: 0.3), 
      owner: this
    ));
  }
}