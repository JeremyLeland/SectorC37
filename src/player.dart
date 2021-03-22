import 'ship.dart';
import 'world.dart';

class Player extends Ship {
  static const MAX_HEALTH = 100;
  static const MAX_SPEED = 0.1;

  Player({num x = 0, num y = 0, required World world})
   : super(x: x, y: y,
     radius: 10, 
     mass: 1,
     health: Player.MAX_HEALTH, 
     damage: 50, 
     speed: Player.MAX_SPEED, 
     turnSpeed: 0.005, 
     color: "green", 
     world: world) {
    
  }
}