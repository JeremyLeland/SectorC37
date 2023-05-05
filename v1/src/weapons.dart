import 'dart:math';

import 'enemies.dart';
import 'entity.dart';
import 'ship.dart';
import 'world.dart';

class Bullet extends Entity {
  Bullet({num damage = 0, String color = 'black'})
   : super(radius: 1, mass: 0.01, decay: 1/10000, health: 1, damage: damage, color: color);

  @override
  void die(world) {
    // This is post-bounce, so we can use our new direction
    final hitAng = atan2(dy, dx);

    for (var i = 0; i < 20; i ++) {
      world.addEntity(new Spark(x, y, hitAng));
    }
  }

  @override
  void drawEntity(ctx) {
    ctx..beginPath()..arc(0, 0, radius, 0, pi * 2);
    ctx..fillStyle = color..fill();
  } 
}

class Missle extends Ship {
  Missle({num damage = 0, num speed = 0, String color = 'gray'})
   : super(radius: 5, mass: 0.1, health: 10, damage: damage, color: color) {
    this.turnSpeed = 0.002;
    this.speed = speed;
    decay = 1/10000;
  }

  @override
  void update(dt, world) {
    updateTarget(world.getEntitiesNear(this).where((e) => e is Enemy));
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
  bool ignoreOwnerVelocity;

  Gun({this.frontOffset = 0, this.sideOffset = 0, this.angleOffset = 0, this.speed = 0, 
    this.ignoreOwnerVelocity = false, this.timeBetweenShots = 0, required this.shoot, required this.owner});

  void update(num dt, World world, bool isShooting) {
    shootDelay -= dt;
    if (shootDelay < 0 && isShooting) {
      shootDelay = timeBetweenShots;

      final pos = owner.getOffsetPosition(frontOffset, sideOffset);
      final ang = owner.angle + angleOffset;

      var bullet = shoot();
      bullet.spawn(
        x: pos.x, 
        y: pos.y, 
        dx: (ignoreOwnerVelocity ? 0 : owner.dx) + cos(ang) * speed, 
        dy: (ignoreOwnerVelocity ? 0 : owner.dy) + sin(ang) * speed,
        angle: ang);
      world.addEntity(bullet);
    }
  }
}

class Spark extends Entity {
  final num startX, startY;

  Spark(this.startX, this.startY, num hitAng) : super(decay: 1/500) {
    spawnParticle(
      startX: startX, startY: startY, 
      dirAngle: hitAng, dirSpread: pi / 8, 
      minSpeed: 0.1, maxSpeed: 0.1, maxRadius: 1);
  }

  @override
  void drawEntity(ctx) {
    final r = 255;
    final g = 128 + 128 * life;
    final b = 255 * life;
    final a = 0.4 * life;

    ctx..beginPath()..arc(0, 0, this.radius, 0, pi * 2);
    ctx.globalAlpha = sin(0.5 * pi * life);
    ctx..fillStyle = 'rgba(${r}, ${g}, ${b}, ${a})'..fill();
  }
}