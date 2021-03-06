import 'dart:math';

import 'asteroid.dart';
import 'player.dart';
import 'ship.dart';
import 'weapons.dart';

mixin Enemy {

}

class Scout extends Ship with Enemy {
  Scout()
   : super(
     radius: 10,
     mass: 1,
     health: 50,
     damage: 50,
     speed: 0.15,
     turnSpeed: 0.003,
     color: 'blue'
  ) {
    gunsPrimary.add(new Gun(
      frontOffset: radius * 2, 
      sideOffset: 0, 
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: () => new Bullet(damage: 10, color: color),  
      owner: this));

      // Engine
    engines.add(new Gun(
      frontOffset: -radius * 0.9,
      ignoreOwnerVelocity: true,
      shoot: () => new EngineTrail(this),
      owner: this
    ));
  }

  @override
  void update(dt, world) {
    final nearby = world.getEntitiesNear(this);

    updateAvoid(nearby);
    updateTarget(nearby.where((e) => e is Player));
    updateWander(dt, world);

    super.update(dt, world);
  }
}

class Gunship extends Ship with Enemy {
  Gunship()
   : super(
     radius: 15,
     mass: 1.5,
     health: 100,
     damage: 100,
     speed: 0.05,
     turnSpeed: 0.001,
     color: 'cyan'
  ) {
    const GUN_ANGLE = 0.02;
    final shoot = () => new Bullet(damage: 10, color: color);

    // Guns
    gunsPrimary.add(new Gun(
      frontOffset: radius, 
      sideOffset: -radius,
      angleOffset: -GUN_ANGLE,
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: shoot,
      owner: this));

    gunsPrimary.add(new Gun(
      frontOffset: radius, 
      sideOffset: -radius,
      angleOffset: GUN_ANGLE,
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: shoot,
      owner: this));

    gunsPrimary.add(new Gun(
      frontOffset: radius, 
      sideOffset: radius,
      angleOffset: -GUN_ANGLE,
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: shoot,
      owner: this));

    gunsPrimary.add(new Gun(
      frontOffset: radius, 
      sideOffset: radius,
      angleOffset: GUN_ANGLE,
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: shoot,
      owner: this));

    // Engines
    engines.add(new Gun(
      frontOffset: -radius,
      sideOffset: -radius / 2,
      ignoreOwnerVelocity: true,
      shoot: () => new EngineTrail(this),
      owner: this
    ));

    // Engine
    engines.add(new Gun(
      frontOffset: -radius,
      sideOffset: radius / 2,
      ignoreOwnerVelocity: true,
      shoot: () => new EngineTrail(this),
      owner: this
    ));
  }

  @override
  void update(dt, world) {
    final nearby = world.getEntitiesNear(this);

    updateAvoid(nearby);
    updateTarget(nearby.where((e) => e is Player));
    updateWander(dt, world);

    super.update(dt, world);
  }
}

class Turret extends Ship with Enemy {
  Turret()
   : super(
    radius: 20,
    mass: 1,
    health: 20,
    damage: 50,
    turnSpeed: 0.003,
    color: 'gray'
  ) {
    gunsPrimary.add(new Gun(
      speed: 0.4,
      timeBetweenShots: 100, 
      shoot: () => new Bullet(damage: 10, color: 'red'),  
      owner: this));
  }

  @override
  void update(dt, world) {
    updateTarget(world.getEntitiesNear(this).where((e) => e is Player || e is Asteroid));
    super.update(dt, world);
  }

  @override
  void drawEntity(ctx) {
    const BASE_PERCENT = 0.5, BARREL_PERCENT = 0.15;
    ctx..fillStyle = "gray"..strokeStyle = "black";

    ctx.beginPath();
    ctx.arc(0, 0, radius * BASE_PERCENT, 0, pi * 2);
    ctx..fill()..stroke();

    final barrelSize = radius * BARREL_PERCENT;
    ctx.beginPath();
    ctx.arc(0, 0, barrelSize, pi/2, pi * 3/2);
    ctx.lineTo(radius, -barrelSize);
    ctx.lineTo(radius, barrelSize);
    ctx.closePath();
    ctx..fill()..stroke();
   }
}
