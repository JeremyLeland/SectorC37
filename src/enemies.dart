import 'dart:math';

import 'actor.dart';
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

class Scout extends Ship with AvoidNearby, TargetNearby, Wander {
  
  Scout({num x = 0, num y = 0})
   : super(x: x, y: y, 
     radius: 10,
     mass: 1,
     health: 50,
     damage: 50,
     speed: 0.15,
     turnSpeed: 0.003,
     color: 'blue') {
    guns.add(new Gun(
      frontOffset: radius * 2, 
      sideOffset: 0, 
      timeBetweenShots: 100, 
      shoot: () => new Bullet(damage: 10, speed: 0.4, color: this.color),  
      owner: this));
  }

  @override
  void update(dt, world) {
    final nearby = world.getEntitiesNear(this);
    
    if (avoidNearby(nearby) == null) {
      if (targetNearby(nearby.where((e) => e is Player)) == null) {
        wander(dt, world);
      }
    }

    super.update(dt, world);
  }
}

class Turret extends Ship with TargetNearby {
  Turret({num x = 0, num y = 0})
   : super(x: x, y: y,
    radius: 20,
    mass: 1,
    health: 20,
    damage: 50,
    turnSpeed: 0.003,
    color: 'gray'
  ) {
    guns.add(new Gun(
      timeBetweenShots: 100, 
      shoot: () => new Bullet(damage: 10, speed: 0.4, color: 'red'),  
      owner: this));
  }

  @override
  void update(dt, world) {
    targetNearby(world.getEntitiesNear(this).where((e) => e is Player || e is Asteroid));
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
