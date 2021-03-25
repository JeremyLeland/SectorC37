import 'dart:html';
import 'dart:math';

import 'entity.dart';
import 'player.dart';
import 'ship.dart';
import 'particles.dart' as Particles;
import 'weapons.dart';
import 'world.dart';

class Asteroid extends Entity {
  static Asteroid random() {
    final random = new Random();
    final dx = random.nextDouble() * 0.02 - 0.01;
    final dy = random.nextDouble() * 0.02 - 0.01;
    final radius = random.nextDouble() * 50 + 20;
    final c = random.nextInt(100) + 100;
    final color = 'rgb(${c}, ${c/2}, 0)';

    return new Asteroid(dx: dx, dy: dy, radius: radius, color: color);
  }

  Asteroid({num x = 0, num y = 0, num dx = 0, num dy = 0, num radius = 30, String color = 'brown'}) 
   : super(x: x, y: y, dx: dx, dy: dy, radius: radius, 
           mass: radius * 0.5, health: radius * 20, damage: radius * 10, color: color);

  @override
  void bleedFrom(entity, world) {
    // TODO: implement bleedFrom
  }

  @override
  void die(World world) {
    for (var i = 0; i < radius * 2; i ++) {
      world.addEntity(new Particles.Rock(this));
    }

    // TODO: This is similar to Particles constructor, can we combine these somehow?
    const NUM_SMALLER = 3, SPEED = 0.01, MIN_RADIUS = 10;
    if (radius > MIN_RADIUS) {
      Random random = new Random();
      final startAng = random.nextDouble() * pi * 2;
      for (var i = 0; i < NUM_SMALLER; i ++) {
        final ang = startAng + i * pi * 2 / NUM_SMALLER;

        world.addEntity(new Asteroid(
          x: x + cos(ang) * radius / 2, 
          y: y + sin(ang) * radius / 2, 
          dx: dx + cos(ang) * SPEED, 
          dy: dy + sin(ang) * SPEED, 
          radius: radius * (random.nextDouble() * 0.2 + 0.2), 
          color: color
        ));
      }
    }
  }

  @override
  void drawEntity(ctx) {
    ctx..beginPath()..arc(0, 0, radius, 0, pi * 2);
    ctx..fillStyle = color..fill()..strokeStyle = 'black'..stroke();
  }
}

class Scout extends Ship {
  static const COLOR = 'blue';
  static const AVOID_TIME = 2000;
  static const TARGET_DISTANCE = 1000;
  static const SHOOT_DISTANCE = 300;
  static const SHOOT_ANGLE = 0.5;

  num goalX = 0, goalY = 0, goalTimer = 0;
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
    guns.add(new Gun(
      frontOffset: radius * 2, 
      sideOffset: 0, 
      timeBetweenShots: 100, 
      shoot: () => new Bullet(damage: 10, speed: 0.4, color: COLOR),  
      owner: this));
  }

  @override
  // TODO: Move this to Actor so we can share it with turret?
  void update(dt, world) {
    // Head toward random location in level if nothing else is going on
    goalTimer -= dt;
    if (goalTimer < 0 || distanceFromPoint(goalX, goalY) < radius * 2) {
      final random = new Random();
      goalX = random.nextDouble() * world.width;
      goalY = random.nextDouble() * world.height;
      goalTimer = random.nextDouble() * 5000;
    }

    // Look for actors to avoid or target
    final nearby = world.getEntitiesNear(this);
    avoid = this.getClosestAvoid(nearby, AVOID_TIME);
    target = this.getClosestTarget(nearby, (e) => e is Player, maxDistance: TARGET_DISTANCE);

    if (avoid != null) {
      var angFrom = angleFrom(avoid!);
      setGoalAngle(angle + (angFrom < 0 ? pi/2 : -pi/2));
      isShooting = false;
    }
    else if (target != null) {
      aimToward(target!);
      isShooting = distanceFrom(target!) < SHOOT_DISTANCE && angleFrom(target!).abs() < SHOOT_ANGLE;
    }
    else {
      aimTowardPoint(goalX, goalY);
      isShooting = false;
    }

    super.update(dt, world);
  }
}