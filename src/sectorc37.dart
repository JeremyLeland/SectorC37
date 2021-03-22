import 'dart:html';
import 'dart:math';

import 'Game.dart';
import 'enemies.dart';
import 'player.dart';
import 'world.dart';

class SectorC37 extends Game {
  World world = new World(width: 2000, height: 2000);
  late CanvasElement backgroundImage;
  late Player player;

  SectorC37() {
    backgroundImage = generateStarfieldImage(world.width, world.height);

    for (int i = 0; i < 5; i ++) {
      world.spawnInBounds(new Scout(world: world));
    }

    for (int i = 0; i < 5; i ++) {
      world.spawnInBounds(Asteroid.random());
    }

    spawnPlayer();

    setCursor('crosshair');
    animate();
  }

  num get scrollX => max(0, min(world.width - canvasWidth, player.x - canvasWidth / 2));
  num get scrollY => max(0, min(world.height - canvasHeight, player.y - canvasHeight / 2));

  CanvasElement generateStarfieldImage(width, height, {density = 2000}) {
    final image = new CanvasElement(width: width, height: height);
    final ctx = image.context2D;

    ctx..fillStyle = 'black'..fillRect(0, 0, width, height);

    final NUM_STARS = width * height / density;
    final random = new Random();
    for (var i = 0; i < NUM_STARS; i ++) {
      final x = random.nextDouble() * width;
      final y = random.nextDouble() * height;
      final radius = random.nextDouble() * 1;
      ctx..beginPath()..arc(x, y, radius, 0, pi*2);

      final col = random.nextInt(200);
      ctx..fillStyle = 'rgb(${col}, ${col}, ${col})'..fill();
    }

    return image;
  }

  void spawnPlayer() {
    player = new Player(world: world);
    world.spawnInBounds(player);
  }

  void _controlPlayer() {
    player.aimTowardPoint(mouse.x + scrollX, mouse.y + scrollY);

    if (keyboard.isPressed(KeyCode.SHIFT)) {
      player.speed = 0;
    }
    else {
      player.speed = Player.MAX_SPEED;
    }
  }

  @override
  void update(dt) {
    if (player.isAlive) {
      _controlPlayer();
    }

    world.update(dt);
  }

  _drawUIBar(CanvasRenderingContext2D ctx, num x, num y, num width, num height, num percent, String color) {
    if (percent > 0) {
      ctx..fillStyle = color..globalAlpha = 0.5;
      ctx.fillRect(x, y, (width * percent).floor(), height);
      ctx.globalAlpha = 1;
    }

    ctx..strokeStyle = 'white'..strokeRect(x, y, width, height);
  }

  _drawUI(ctx) {
    final lifePerc = player.health / Player.MAX_HEALTH;
    this._drawUIBar(ctx, 5.5, 5.5, 200, 12, lifePerc, 'red');
  }

  @override
  void draw(ctx) {
    ctx.save();
    ctx.translate(-scrollX, -scrollY);

    ctx.drawImage(backgroundImage, 0, 0);
    world.draw(ctx);
    
    ctx.restore();

    _drawUI(ctx);
  }
}

void main() {
   new SectorC37();
}