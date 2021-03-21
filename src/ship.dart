import 'dart:html';

import 'actor.dart';
import 'entity.dart';
import 'world.dart';

class Ship extends Actor {
  Ship({num x = 0, num y = 0, num radius = 0, num mass = 0, num health = 0, num damage = 0, 
        num speed = 0, num turnSpeed = 0, required String color, required World world})
   : super(x: x, y: y, radius: radius, mass: mass, health: health, damage: damage, 
           speed: speed, turnSpeed: turnSpeed, color: color, world: world);

  @override
  void bleedFrom(Entity entity) {
    // TODO: implement bleedFrom
  }

  @override
  void die() {
    // TODO: implement die
  }

  @override
  void drawEntity(CanvasRenderingContext2D ctx) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(-radius, -radius);
    ctx.lineTo( radius,  0);
    ctx.lineTo(-radius,  radius);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }
}