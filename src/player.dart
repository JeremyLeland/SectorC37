import 'ship.dart';
import 'world.dart';

class Player extends Ship {
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
     color: "green") {
    
  }

  @override
  void think(World world) {
    // Player thinks for themselves!
  }
}