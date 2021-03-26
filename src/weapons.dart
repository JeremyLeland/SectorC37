import 'dart:math';

import 'entity.dart';
import 'particles.dart' as Particles;
import 'ship.dart';

class Bullet extends Entity {
  num speed;

  Bullet({num damage = 0, this.speed = 0, String color = 'black'})
   : super(radius: 1, mass: 0.01, decay: 1/10000, health: 1, damage: damage, color: color);

  @override
  void die(world) {
    // This is post-bounce, so we can use our new direction
    final hitAng = atan2(dy, dx);

    for (var i = 0; i < 20; i ++) {
      world.addEntity(new Particles.Spark(x, y, hitAng));
    }
  }

  void drawEntity(ctx) {
    ctx..beginPath()..arc(0, 0, radius, 0, pi * 2);
    ctx..fillStyle = color..fill();
  } 
}

class Gun {
  final num frontOffset, sideOffset, angleOffset;
  final Ship owner;
  final Bullet Function() shoot;
  num shootDelay = 0, timeBetweenShots;

  Gun({this.frontOffset = 0, this.sideOffset = 0, this.angleOffset = 0, 
    required this.timeBetweenShots, required this.shoot, required this.owner});

  void update(dt, world) {
    shootDelay -= dt;
    if (shootDelay < 0 && owner.isShooting) {
      shootDelay = timeBetweenShots;

      final pos = owner.getOffsetPosition(frontOffset, sideOffset);
      final ang = owner.angle + angleOffset;

      var bullet = shoot();
      bullet.spawn(x: pos.x, y: pos.y, dx: cos(ang) * bullet.speed, dy: sin(ang) * bullet.speed);
      world.addEntity(bullet);
    }
  }
}