import 'dart:html';
import 'dart:math';

import 'enemies.dart';
import 'entity.dart';

abstract class Particle extends Entity {
  Particle({required num startX, required num startY, num startSpread = 0, 
            num startDX = 0, num startDY = 0, num dirAngle = 0, num dirSpread = pi * 2, 
            num minSpeed = 0, required num maxSpeed, num maxSpin = 0,
            num minRadius = 0, required num maxRadius, num decay = 0, String color = 'black'}) {
    Random random = new Random();
    angle = dirAngle + random.nextDouble() * dirSpread - dirSpread/2;
    dAngle = random.nextDouble() * (maxSpin / 2) - maxSpin;

    final dist = random.nextDouble() * startSpread;
    x = startX + cos(angle) * dist;
    y = startY + sin(angle) * dist;

    final speed = minSpeed + random.nextDouble() * (maxSpeed - minSpeed);
    dx = startDX + cos(angle) * speed;
    dy = startDY + sin(angle) * speed;

    radius = minRadius + random.nextDouble() * (maxRadius - minRadius);
    this.decay = decay;
    this.color = color;
  }

  void setSlowAlphaFade(CanvasRenderingContext2D ctx) => ctx.globalAlpha = sin(0.5 * pi * life);
}

class Fire extends Particle {
  Fire(Entity entity)
   : super(startX: entity.x, startY: entity.y, startDX: entity.dx, startDY: entity.dy,
           maxSpeed: 0.04, maxRadius: 16, decay: 1/1000);

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

class EngineTrail extends Particle {
   static const RADIUS = 4;

  EngineTrail(Entity entity)
   : super(startX: entity.x, startY: entity.y, maxSpeed: 0, 
           minRadius: RADIUS, maxRadius: RADIUS, decay: 1/300);

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

class Spark extends Particle {
  final num startX, startY;

  Spark(this.startX, this.startY, num hitAng)
   : super(startX: startX, startY: startY, 
           dirAngle: hitAng, dirSpread: pi / 8, 
           minSpeed: 0.1, maxSpeed: 0.1, maxRadius: 1, decay: 1/500);

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

class Rock extends Particle {
  late final String color;

  Rock(Asteroid asteroid)
   : super(startX: asteroid.x, startY: asteroid.y, startSpread: asteroid.radius,
           maxSpeed: 0.06, maxSpin: 0.01, maxRadius: 5, decay: 1/1500) {
    color = asteroid.color;
  }

  void drawEntity(ctx) {
    setSlowAlphaFade(ctx);
    ctx..beginPath()..arc(0, 0, this.radius, 0, pi * 2);
    ctx..fillStyle = color..fill()..strokeStyle = 'black'..stroke();
   }
}

class Debris extends Particle {
  Debris(Entity entity)
   : super(startX: entity.x, startY: entity.y, startSpread: entity.radius,
           startDX: entity.dx, startDY: entity.dy, 
           maxSpeed: 0.1, maxSpin: 0.01, maxRadius: 3, decay: 1/1000, color: entity.color);

  drawEntity(ctx) {
    setSlowAlphaFade(ctx);

    ctx.beginPath();
    ctx.moveTo(-this.radius, -this.radius);
    ctx.lineTo( this.radius,  0);
    ctx.lineTo(-this.radius,  this.radius);
    ctx.closePath();
    ctx..fillStyle = color..fill()..strokeStyle = "black"..stroke();
  }
}
