import 'dart:html';
import 'dart:math';

import 'entity.dart';
import 'ship.dart';
import 'world.dart';

mixin Aimable on Entity {
  num speed = 0, turnSpeed = 0;
  num _goalAngle = 0;

  void aimToward(Entity entity) => aimTowardPoint(entity.x, entity.y);
  void aimTowardPoint(num x, num y) => setGoalAngle(atan2(y - this.y, x - this.x));
  
  void aimAwayFrom(Entity entity) => aimAwayFromPoint(entity.x, entity.y);
  void aimAwayFromPoint(num x, num y) => setGoalAngle(angle + (angleFromPoint(x, y) < 0 ? pi/2 : -pi/2));

  void setGoalAngle(num angle) => _goalAngle = _adjustOurAngleSoWeCanUse(angle);
  num _adjustOurAngleSoWeCanUse(num otherAngle) {
    // Bring our angle into range of this other angle so we can use it for greater/less than calculations
    if (otherAngle - angle > pi) {
      angle += pi * 2;
    }
    else if (angle - otherAngle > pi) {
      angle -= pi * 2;
    }

    return otherAngle;
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

mixin EngineTrail on Aimable {
  static const num MAX_LENGTH = 10, RADIUS = 3;
  List<Point> _trail = [];

  void updateEngineTrail(num dt) {
    if (speed > 0) {
      _trail.insert(0, new Point(x, y));
      if (_trail.length > MAX_LENGTH) {
        _trail.removeLast();
      }
    }
  }

  void drawEngineTrail(CanvasRenderingContext2D ctx) {
    ctx.save();
    
    ctx.strokeStyle = color;

    // TODO: Do this to a separate canvas for more compositing options?
    // e.g. source-out so we can use alpha without doubling up

    ctx.beginPath();
    ctx.moveTo(x, y);

    var width = RADIUS * 2 + 0.5;    // the 0.5 gives us sharper borders
    for (var t in _trail) {
      ctx.lineWidth = max(width, 0);
      width -= RADIUS * 2 / _trail.length;
      ctx.lineCap = 'round';
      ctx.lineTo(t.x, t.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
    }

    ctx.restore();
  }
}

mixin AvoidNearby on Ship {
  static const AVOID_TIME = 2000;

  Entity? avoid;

  void updateAvoid(Iterable<Entity> nearby, {num avoidTime = AVOID_TIME}) {
    final AVOID_BUFFER = 10;
    final RECENT_PAST = -100;

    Entity? closestAvoid = null;
    num closestAvoidTime = double.infinity;

    for (var e in nearby) {
      final time = timeUntilHit(e, buffer: AVOID_BUFFER);

      // Include hits in the near "past", since we may be in our buffer zone
      if (RECENT_PAST < time && time < closestAvoidTime) {
        closestAvoid = e;
        closestAvoidTime = time;
      }
    }

    avoid = closestAvoidTime < avoidTime ? closestAvoid : null;
  }

  bool doAvoid() {
    if (avoid != null) {
      aimAwayFrom(avoid!);
      return true;
    }

    return false;
  }
}

mixin TargetNearby on Aimable {
  static const TARGET_DISTANCE = 1000;
  static const SHOOT_DISTANCE = 300;
  static const SHOOT_ANGLE = 0.5;

  Entity? target;

  bool targetInRange() {
    return target != null && distanceFrom(target!) < SHOOT_DISTANCE && angleFrom(target!).abs() < SHOOT_ANGLE;
  }

  void updateTarget(Iterable<Entity> nearbyTargets, {num maxDistance = double.infinity}) {
    Entity? closestTarget = null;
    num closestTargetDist = double.infinity;

    for (var e in nearbyTargets) {
      final dist = distanceFrom(e);

      if (dist < closestTargetDist) {
        closestTarget = e;
        closestTargetDist = dist;
      }
    }

    target = closestTargetDist < maxDistance ? closestTarget : null;
  }

  bool doTarget() {
    if (target != null) {
      aimToward(target!);
      return true;
    }

    return false;
  }
}

mixin Wander on Aimable {
  Point goal = new Point(0, 0);
  num goalTimer = 0;

  void doWander(num dt, World world) {
    goalTimer -= dt;
    if (goalTimer < 0 || distanceFromPoint(goal.x, goal.y) < radius * 2) {
      goal = world.getEmptySpawnLocation(radius);
      goalTimer = new Random().nextDouble() * 5000;
    }
    aimTowardPoint(goal.x, goal.y);
  }
}