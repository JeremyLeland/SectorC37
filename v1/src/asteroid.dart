import 'dart:math';

import 'entity.dart';

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
  void die(world) {
    for (var i = 0; i < radius * 2; i ++) {
      world.addEntity(new Rock(this));
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

class Rock extends Entity {
  Rock(Asteroid asteroid) : super(color: asteroid.color, decay: 1/1500) {
    spawnParticle(
      startX: asteroid.x, startY: asteroid.y, startSpread: asteroid.radius,
      maxSpeed: 0.06, maxSpin: 0.01, maxRadius: 5);
  }

  @override
  void drawEntity(ctx) {
    ctx..beginPath()..arc(0, 0, this.radius, 0, pi * 2);
    ctx.globalAlpha = sin(0.5 * pi * life);
    ctx..fillStyle = color..fill()..strokeStyle = 'black'..stroke();
   }
}