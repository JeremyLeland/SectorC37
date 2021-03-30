import 'dart:math';

import 'actor.dart';
import 'enemies.dart';
import 'entity.dart';
import 'particles.dart' as Particles;
import 'ship.dart';

class Bullet extends Entity {
  Bullet({num damage = 0, String color = 'black'})
   : super(radius: 1, mass: 0.01, decay: 1/10000, health: 1, damage: damage, color: color);

  @override
  void die(world) {
    // This is post-bounce, so we can use our new direction
    final hitAng = atan2(dy, dx);

    for (var i = 0; i < 20; i ++) {
      world.addEntity(new Particles.Spark(x, y, hitAng));
    }
  }

  @override
  void drawEntity(ctx) {
    ctx..beginPath()..arc(0, 0, radius, 0, pi * 2);
    ctx..fillStyle = color..fill();
  } 
}

class Missle extends Entity with Aimable, TargetNearby {
  Missle({num damage = 0, num speed = 0, String color = 'gray'})
   : super(radius: 5, mass: 0.1, decay: 1/10000, health: 10, damage: damage, color: color) {
    this.turnSpeed = 0.001;
    this.speed = speed;
  }

  @override
  void update(dt, world) {
    updateTarget(world.getEntitiesNear(this).where((e) => e is Scout));
    doTarget();
    updateAim(dt);
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

class Gun {
  final num frontOffset, sideOffset, angleOffset, speed;
  final Ship owner;
  final Entity Function() shoot;
  num shootDelay = 0, timeBetweenShots;

  Gun({this.frontOffset = 0, this.sideOffset = 0, this.angleOffset = 0, this.speed = 0,
    required this.timeBetweenShots, required this.shoot, required this.owner});

  void update(dt, world) {
    shootDelay -= dt;
    if (shootDelay < 0 && owner.isShooting) {
      shootDelay = timeBetweenShots;

      final pos = owner.getOffsetPosition(frontOffset, sideOffset);
      final ang = owner.angle + angleOffset;

      var bullet = shoot();
      bullet.spawn(
        x: pos.x, 
        y: pos.y, 
        dx: owner.dx + cos(ang) * speed, 
        dy: owner.dy + sin(ang) * speed,
        angle: ang);
      world.addEntity(bullet);
    }
  }
}