
import 'dart:math';

import '../enemies.dart';
import '../game.dart';
import '../player.dart';
import '../world.dart';

class TimeUntilHitTest extends Game {
  late World world;
  late Player player;
  late Asteroid asteroid;

  TimeUntilHitTest() {
    world = new World(width: canvasWidth, height: canvasHeight);
    player = new Player(x: 100, y: 100, world: world);
    asteroid = new Asteroid(x: 400, y: 100, radius: 30, color: 'brown');

    setCursor('crosshair');
    animate();
  }

  update(dt) {
      if (mouse.isPressed(Mouse.LEFT_BUTTON)) {
        player.x = mouse.x;
        player.y = mouse.y;
      }

      player.aimTowardPoint(mouse.x, mouse.y);

      player.update(dt);
      player.updatePosition(-dt);   // keep us still for this test
  }

  debugText(ctx, text) {
    ctx..textAlign = "start"..textBaseline = "top";
    ctx..fillStyle = "white"..font = "10px Arial";
    ctx.fillText(text, 0, 0);
  }

  draw(ctx) {
      player.draw(ctx);
      asteroid.draw(ctx);

      final time = player.timeUntilHit(asteroid, buffer: 10);
      debugText(ctx, 'Time to hit: ${time}');

      if (time != double.infinity) {
        final hitX = player.x + player.dx * time;
        final hitY = player.y + player.dy * time;
        
        ctx..beginPath()..arc(hitX, hitY, player.radius, 0, pi * 2);
        ctx..fillStyle = "red"..fill();
      }
  }
}

void main() {
  new TimeUntilHitTest();
}