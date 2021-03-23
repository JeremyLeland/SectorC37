import 'dart:html';
import 'dart:math';

import 'entity.dart';
import 'player.dart';
import 'ship.dart';
import 'particles.dart' as Particles;
import 'world.dart';

class Asteroid extends Entity {
  String color;

  static Asteroid random() {
    final random = new Random();
    final dx = random.nextDouble() * 0.02 - 0.01;
    final dy = random.nextDouble() * 0.02 - 0.01;
    final radius = random.nextDouble() * 50 + 20;
    final c = random.nextInt(100) + 100;
    final color = 'rgb(${c}, ${c/2}, 0)';

    return new Asteroid(dx: dx, dy: dy, radius: radius, color: color);
  }

  Asteroid({num x = 0, num y = 0, num dx = 0, num dy = 0, required num radius, required String this.color}) 
   : super(x: x, y: y, dx: dx, dy: dy, radius: radius, 
           mass: radius * 0.5, health: radius * 20, damage: radius * 10);

  @override
  void bleedFrom(Entity entity) {
    // TODO: implement bleedFrom
  }

  @override
  void die() {
    for (var i = 0; i < this.radius * 2; i ++) {
      this.createEntity(new Particles.Rock(this));
    }

    // TODO: This is similar to Particles constructor, can we combine these somehow?
    const NUM_SMALLER = 3, SPEED = 0.01;
    Random random = new Random();
    final startAng = random.nextDouble() * pi * 2;
    for (var i = 0; i < NUM_SMALLER; i ++) {
      final ang = startAng + i * pi * 2 / NUM_SMALLER;

      this.createEntity(new Asteroid(
        x: x + cos(ang) * radius / 2, 
        y: y + sin(ang) * radius / 2, 
        dx: dx + cos(ang) * SPEED, 
        dy: dy + sin(ang) * SPEED, 
        radius: radius * (random.nextDouble() * 0.2 + 0.2), 
        color: color
      ));
    }
  }

  @override
  void drawEntity(CanvasRenderingContext2D ctx) {
    ctx..beginPath()..arc(0, 0, this.radius, 0, pi * 2);
    ctx..fillStyle = this.color..fill()..strokeStyle = 'black'..stroke();
  }
}

class Scout extends Ship {
  static const COLOR = 'blue';
  static const AVOID_TIME = 2000;
  static const TARGET_DISTANCE = 1000;

  num goalX = 0, goalY = 0;
  Entity? avoid, target;

  Scout({num x = 0, num y = 0})
   : super(x: x, y: y, 
     radius: 10,
     mass: 1,
     health: 50,
     damage: 50,
     speed: 0.15,
     turnSpeed: 0.003,
     color: COLOR) {
  }

  @override
  void spawn(num x, num y) {
    goalX = x;
    goalY = y;
    super.spawn(x, y);
  }

  @override
  // TODO: Move this to Actor so we can share it with turret?
  void think(World world) {
    // Head toward random location in level if nothing else is going on
    // TODO: also change this after time, in case the goal is somewhere we must avoid?
    if (distanceFromPoint(goalX, goalY) < radius * 2) {
      final random = new Random();
      goalX = random.nextDouble() * world.width;
      goalY = random.nextDouble() * world.height;
    }

    // Look for actors to avoid or target
    final nearby = world.getEntitiesNear(this);
    avoid = this.getClosestAvoid(nearby, AVOID_TIME);
    target = this.getClosestTarget(nearby, (e) => e is Player, maxDistance: TARGET_DISTANCE);

    if (avoid != null) {
      var angFrom = angleFrom(avoid!);
      setGoalAngle(angle + (angFrom < 0 ? pi/2 : -pi/2));
    }
    else if (target != null) {
      aimToward(target!);
    }
    else {
      aimTowardPoint(goalX, goalY);
    }
  }
}