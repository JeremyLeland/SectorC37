import 'dart:math';

import 'enemies.dart';
import 'entity.dart';

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

class EngineTrail extends Entity {
  static const RADIUS = 4;

  EngineTrail(Entity entity) : super(decay: 1/300) {
    spawnParticle(startX: entity.x, startY: entity.y, maxSpeed: 0, minRadius: RADIUS, maxRadius: RADIUS);
  }

  @override
  void drawEntity(ctx) {
    // TODO: Make this like the Snake for a smoother trail
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

class Spark extends Entity {
  final num startX, startY;

  Spark(this.startX, this.startY, num hitAng) : super(decay: 1/500) {
    spawnParticle(
      startX: startX, startY: startY, 
      dirAngle: hitAng, dirSpread: pi / 8, 
      minSpeed: 0.1, maxSpeed: 0.1, maxRadius: 1);
  }

  @override
  void drawEntity(ctx) { /* we're overriding draw instead */ }

  @override
  void draw(ctx) {
    ctx.save();

    const LENGTH = 100;
    final grd = ctx.createLinearGradient(x - dx * LENGTH, y - dy * LENGTH, x, y);
    grd.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    grd.addColorStop(0.5, 'rgba(255, 255, 0, ${life * 0.5})');
    grd.addColorStop(1.0, 'rgba(255, 255, 255, ${life})');
    ctx.strokeStyle = grd;

    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    ctx.restore();
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
