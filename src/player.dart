import 'ship.dart';
import 'world.dart';

class Player extends Ship {
  Player(num x, num y, World world)
   : super(
     x: x, y: y, 
     radius: 10, 
     mass: 1,
     health: 100, 
     damage: 50, 
     speed: 0.2, 
     turnSpeed: 0.005, 
     color: "green", 
     world: world) {
    
  }
}