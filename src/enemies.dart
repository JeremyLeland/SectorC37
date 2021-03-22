import 'dart:math';

import 'entity.dart';
import 'player.dart';
import 'ship.dart';
import 'world.dart';

class Scout extends Ship {
  static const COLOR = 'blue';
  static const AVOID_TIME = 2000;
  static const TARGET_DISTANCE = 1000;

  num goalX = 0, goalY = 0;
  Entity? avoid, target;

  Scout(num x, num y, World world)
   : super(
     x: x, y: y,
     radius: 10,
     mass: 1,
     health: 50,
     damage: 50,
     speed: 0.15,
     turnSpeed: 0.003,
     color: Scout.COLOR,
     world: world) {
    goalX = x;
    goalY = y;
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
      setGoalAngle(angle + pi/2);   // TODO: turn based on where avoid entity is, not just to the right
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