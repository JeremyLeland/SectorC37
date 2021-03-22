import 'dart:html';
import 'dart:math';

import 'entity.dart';
import 'player.dart';
import 'ship.dart';
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

  Asteroid({num dx = 0, num dy = 0, required num radius, required String this.color}) 
   : super(dx: dx, dy: dy, radius: radius, 
           mass: radius * 0.5, health: radius * 20, damage: radius * 10);

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
    ctx..beginPath()..arc(0, 0, this.radius, 0, pi * 2);
    ctx..fillStyle = this.color..strokeStyle = 'black'..fill()..stroke();
  }
}

class Scout extends Ship {
  static const COLOR = 'blue';
  static const AVOID_TIME = 2000;
  static const TARGET_DISTANCE = 1000;

  num goalX = 0, goalY = 0;
  Entity? avoid, target;

  Scout(World world)
   : super(
     radius: 10,
     mass: 1,
     health: 50,
     damage: 50,
     speed: 0.05,
     turnSpeed: 0.003,
     color: Scout.COLOR,
     world: world) {
  }

  @override
  void spawn(num x, num y) {
    goalX = x;
    goalY = y;
    super.spawn(x, y);
  }

  @override
  void update(num dt) {
    // Head toward random location in level if nothing else is going on
    // TODO: also change this after time, in case the goal is somewhere we must avoid?
    if (distanceFromPoint(goalX, goalY) < radius * 2) {
      final random = new Random();
      goalX = random.nextDouble() * world.width;
      goalY = random.nextDouble() * world.height;
    }

    // Look for actors to avoid or target
    final nearby = world.getEntitiesNear(this);
    avoid = this.getClosestAvoid(nearby, Scout.AVOID_TIME);
    target = this.getClosestTarget(nearby, (e) => e is Player, maxDistance: Scout.TARGET_DISTANCE);

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

    super.update(dt);
  }
}