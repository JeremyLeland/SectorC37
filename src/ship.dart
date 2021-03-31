import 'dart:math';

import 'entity.dart';
import 'weapons.dart';
import 'world.dart';

abstract class Ship extends Entity {
  num speed = 0, turnSpeed = 0;
  num _goalAngle = 0;

  List<Gun> gunsPrimary = [], gunsSecondary = [];
  bool isShootingPrimary = false, isShootingSecondary = false;

  static const TARGET_DISTANCE = 1000, SHOOT_DISTANCE = 300, SHOOT_ANGLE = 0.5;

  Entity? avoid, target;
  Point? wander;
  num wanderTimer = 0;

  Ship({num radius = 0, num mass = 0, num health = 0, num damage = 0, 
        num speed = 0, num turnSpeed = 0, String color = 'black'})
   : super(radius: radius, mass: mass, health: health, damage: damage, color: color) {
    this.speed = speed;
    this.turnSpeed = turnSpeed;
  }

  @override
  void bleedFrom(entity, world) {
    for (var i = 0; i < 3; i ++) {
      world.addEntity(new Debris(this));
    }
  }

  @override
  void die(world) {
    for (var i = 0; i < 50; i ++) {
      world.addEntity(new Fire(this));
    }
    for (var i = 0; i < 50; i ++) {
      world.addEntity(new Debris(this));
    }
  }

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

  void updateAvoid(Iterable<Entity> nearby, {num avoidTime = 2000}) {
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

  void updateWander(num dt, World world) {
    wanderTimer -= dt;
    if (wanderTimer < 0 || distanceFromPoint(wander!.x, wander!.y) < radius * 2) {
      wander = world.getEmptySpawnLocation(radius);
      wanderTimer = new Random().nextDouble() * 5000;
    }
  }

  @override
  void update(dt, world) {
    if (avoid != null) {
      aimAwayFrom(avoid!);
      isShootingPrimary = false;
    }
    else if (target != null) {
      aimToward(target!);
      isShootingPrimary = distanceFrom(target!) < SHOOT_DISTANCE && angleFrom(target!).abs() < SHOOT_ANGLE;
    }
    else if (wander != null) {
      aimTowardPoint(wander!.x, wander!.y);
      isShootingPrimary = false;
    }
    updateAim(dt);

    gunsPrimary.forEach((g) => g.update(dt, world, isShootingPrimary));
    gunsSecondary.forEach((g) => g.update(dt, world, isShootingSecondary));
    
    super.update(dt, world);
  }

  @override
  void drawEntity(ctx) {
    ctx.beginPath();
    ctx.moveTo(-radius, -radius);
    ctx.lineTo( radius,  0);
    ctx.lineTo(-radius,  radius);
    ctx.closePath();

    ctx..fillStyle = color..fill()..strokeStyle = "black"..stroke();
  }
}

class Fire extends Entity {
  Fire(Entity entity) : super(decay: 1/1000) {
    spawnParticle(
      startX: entity.x, startY: entity.y, startDX: entity.dx, startDY: entity.dy,
      maxSpeed: 0.04, maxRadius: 16);
  }

  @override
  void drawEntity(ctx) {
    final size = sin(pi * life) * radius;

    // Inspired by http://codepen.io/davepvm/pen/Hhstl
    final r = 140 + 120 * life;
    final g = 170 - 120 * life;
    final b = 120 - 120 * life;
    final a = 0.4 * life;
    
    ctx.globalCompositeOperation = 'lighter';
    ctx..beginPath()..arc(0, 0, size, 0, pi * 2);
    ctx..fillStyle = 'rgba(${r}, ${g}, ${b}, ${a})'..fill();
  }
}

class Debris extends Entity {
  Debris(Entity entity) : super(decay: 1/1000, color: entity.color) {
   spawnParticle(startX: entity.x, startY: entity.y, startSpread: entity.radius,
           startDX: entity.dx, startDY: entity.dy, 
           maxSpeed: 0.1, maxSpin: 0.01, maxRadius: 3);
  }

  @override
  drawEntity(ctx) {
    ctx.beginPath();
    ctx.moveTo(-this.radius, -this.radius);
    ctx.lineTo( this.radius,  0);
    ctx.lineTo(-this.radius,  this.radius);
    ctx.closePath();

    ctx.globalAlpha = sin(0.5 * pi * life);
    ctx..fillStyle = color..fill()..strokeStyle = "black"..stroke();
  }
}
