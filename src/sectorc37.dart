import 'dart:html';
import 'dart:math';

import 'Game.dart';
import 'asteroid.dart';
import 'enemies.dart';
import 'player.dart';
import 'world.dart';

class SectorC37 extends Game {
  World world = new World(width: 2000, height: 2000);
  late CanvasElement backgroundImage;
  
  late Player player;
  static const TIME_BEFORE_RESPAWN = 1000;
  num respawnDelay = TIME_BEFORE_RESPAWN;

  List<TimedEvent> events = [];

  SectorC37() {
    backgroundImage = generateStarfieldImage(world.width, world.height);

    for (int i = 0; i < 5; i ++) {
      world.spawnInBounds(new Scout());
    }

    for (int i = 0; i < 5; i ++) {
      world.spawnInBounds(new Turret());
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
    player = new Player();
    world.spawnInBounds(player);
    respawnDelay = TIME_BEFORE_RESPAWN;
  }

  void _controlPlayer() {
    player.aimTowardPoint(mouse.x + scrollX, mouse.y + scrollY);

    player.isShootingPrimary = mouse.isPressed(Mouse.LEFT_BUTTON);
    player.isShootingSecondary = mouse.isPressed(Mouse.RIGHT_BUTTON);

    if (keyboard.isPressed(KeyCode.SHIFT)) {
      player.speed = 0;
    }
    else {
      player.speed = Player.MAX_SPEED;
    }
  }

  @override
  void update(dt) {
    events..forEach((e) => e.update(dt))..removeWhere((e) => e.timeLeft < 0);
    
    if (player.isAlive) {
      _controlPlayer();
    }
    else {
      respawnDelay -= dt;
      if (respawnDelay < 0 && mouse.isPressed(Mouse.LEFT_BUTTON)) {
        spawnPlayer();
      }
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

  _drawUI(CanvasRenderingContext2D ctx) {
    final lifePerc = player.health / Player.MAX_HEALTH;
    this._drawUIBar(ctx, 5.5, 5.5, 200, 12, lifePerc, 'red');

    if (!player.isAlive && respawnDelay < 0) {
      ctx..textAlign = 'center'..textBaseline = 'middle';
      ctx..fillStyle = 'white'..font = '16px Arial';
      ctx.fillText('Click to Respawn', canvasWidth / 2, canvasHeight / 2);
    }
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