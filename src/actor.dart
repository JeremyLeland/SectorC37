import 'dart:math';

import 'entity.dart';
import 'player.dart';

mixin Aimable on Entity {
  num speed = 0, turnSpeed = 0;
  num _goalAngle = 0;

  bool isShooting = false;  // TODO: Not sure this makes sense here

  void aimToward(Entity entity) => aimTowardPoint(entity.x, entity.y);
  void aimTowardPoint(num x, num y) => setGoalAngle(atan2(y - this.y, x - this.x));
  void setGoalAngle(num angle) => _goalAngle = _adjustOurAngleSoWeCanUse(angle);

  // Bring our angle into range of this other angle so we can use it for greater/less than calculations
  num _adjustOurAngleSoWeCanUse(num otherAngle) {
    if (otherAngle - angle > pi) {
      angle += pi * 2;
    }
    else if (angle - otherAngle > pi) {
      angle -= pi * 2;
    }

    return otherAngle;
  }

  Entity? getClosestAvoid(Iterable<Entity> entities, num avoidTime) {
    final AVOID_BUFFER = 10;
    final RECENT_PAST = -100;

    Entity? closestAvoid = null;
    num closestAvoidTime = double.infinity;

    for (var e in entities) {
      final time = timeUntilHit(e, buffer: AVOID_BUFFER);

      // Include hits in the near "past", since we may be in our buffer zone
      if (RECENT_PAST < time && time < closestAvoidTime) {
        closestAvoid = e;
        closestAvoidTime = time;
      }
    }

    return closestAvoidTime < avoidTime ? closestAvoid : null;
  }

  Entity? getClosestTarget(Iterable<Entity> entities, bool Function(Entity) isTarget, 
                           {num maxDistance = double.infinity}) {
    Entity? closestTarget = null;
    num closestTargetDist = double.infinity;

    for (var e in entities) {
      if (isTarget(e)) {
        final dist = distanceFrom(e);

        if (dist < closestTargetDist) {
            closestTarget = e;
            closestTargetDist = dist;
        }
      }
    }

    return closestTargetDist < maxDistance ? closestTarget : null;
  }

  void updateAim(num dt) {
    if (_goalAngle < angle) {
      angle = max(_goalAngle, angle - turnSpeed * dt);
    }
    else if (_goalAngle > angle) {
      angle = min(_goalAngle, angle + turnSpeed * dt);
    }

    if (speed != 0) {
      dx = cos(angle) * speed;
      dy = sin(angle) * speed;
    }
  }
}

mixin TargetPlayer on Aimable {
  static const TARGET_DISTANCE = 1000;
  static const SHOOT_DISTANCE = 300;
  static const SHOOT_ANGLE = 0.5;

  bool targetPlayer(Iterable<Entity> nearby) {
    final target = this.getClosestTarget(nearby, (e) => e is Player, maxDistance: TARGET_DISTANCE);

    if (target != null) {
      aimToward(target);
      isShooting = distanceFrom(target) < SHOOT_DISTANCE && angleFrom(target).abs() < SHOOT_ANGLE;
      return true;
    }

    isShooting = false;
    return false;
  }
}