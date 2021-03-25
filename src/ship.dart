import 'dart:html';

import 'actor.dart';
import 'entity.dart';
import 'particles.dart' as Particles;
import 'weapons.dart';

abstract class Ship extends Actor {
  List<Gun> guns = [];
  bool isShooting = false;

  Ship({num x = 0, num y = 0, num radius = 0, num mass = 0, num health = 0, num damage = 0, 
        num speed = 0, num turnSpeed = 0, String color = 'black'})
   : super(x: x, y: y, radius: radius, mass: mass, health: health, damage: damage, 
           speed: speed, turnSpeed: turnSpeed, color: color);

  @override
  void bleedFrom(entity, world) {
    for (var i = 0; i < 3; i ++) {
      world.addEntity(new Particles.Debris(this));
    }
  }

  @override
  void die(world) {
    for (var i = 0; i < 50; i ++) {
      world.addEntity(new Particles.Fire(this));
    }
    for (var i = 0; i < 50; i ++) {
      world.addEntity(new Particles.Debris(this));
    }
  }

  @override
  void update(dt, world) {
    for (var g in guns) {
      g.update(dt, world);
    }

    super.update(dt, world);
  }

  @override
  void drawEntity(CanvasRenderingContext2D ctx) {
    ctx.beginPath();
    ctx.moveTo(-radius, -radius);
    ctx.lineTo( radius,  0);
    ctx.lineTo(-radius,  radius);
    ctx.closePath();

    ctx..fillStyle = color..fill()..strokeStyle = "black"..stroke();
  }
}