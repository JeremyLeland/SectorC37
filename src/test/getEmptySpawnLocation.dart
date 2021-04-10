import '../asteroid.dart';
import '../game.dart';
import '../world.dart';

class TimeUntilHitTest extends Game {
  World world = new World(width: 500, height: 500);
  
  TimeUntilHitTest() {
    setCursor('crosshair');
    animate();
  }

  update(dt) {
    if (mouse.isPressed(Mouse.LEFT_BUTTON)) {
      world.spawnInBounds(new Asteroid());
    }
  }

  debugText(ctx, text) {
    ctx..textAlign = "start"..textBaseline = "top";
    ctx..fillStyle = "white"..font = "10px Arial";
    ctx.fillText(text, 0, 0);
  }

  draw(ctx) {
    world.draw(ctx);
  }
}

void main() {
  new TimeUntilHitTest();
}