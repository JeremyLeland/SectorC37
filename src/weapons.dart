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

class Gun extends Entity {
  final Ship owner;
  final Bullet Function() shoot;
  num shootDelay = 0, timeBetweenShots;

  // TODO: have GetBullet() from owner, then spawn that?
  // Combine Gun/Turret so we just have an array of Entities that we update internally?

  Gun({num frontOffset = 0, num sideOffset = 0, num angleOffset = 0, 
       required this.timeBetweenShots, required Bullet Function() this.shoot, required this.owner})
   : super(x: frontOffset, y: sideOffset, angle: angleOffset);

  void update(dt, world) {
    shootDelay -= dt;
    if (shootDelay < 0 && owner.isShooting) {
      shootDelay = timeBetweenShots;

      final pos = owner.getOffsetPosition(x, y);
      final ang = owner.angle + angle;

      var bullet = shoot();
      bullet.spawn(x: pos.x, y: pos.y, dx: cos(ang) * bullet.speed, dy: sin(ang) * bullet.speed);
      world.addEntity(bullet);
    }
  }
}

