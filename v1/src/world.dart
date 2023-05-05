import 'dart:html';
import 'dart:math';

import 'enemies.dart';
import 'entity.dart';

class World {
  num width, height;
  List<Entity> _entities = [], _particles = [];

  World({this.width = 0, this.height = 0});

  Iterable<Entity> getEnemies() => _entities.where((e) => e is Enemy);

  Iterable<Entity> getEntitiesNear(Entity entity) {
    // TODO: only return actors close to given actor
    // Only return entities we can collide with
    return _entities.where((e) => e != entity && e.isAlive && e.damage > 0);
  }

  void addEntity(Entity entity) => entity.damage == 0 ? _particles.add(entity) : _entities.add(entity);

  void spawnInBounds(Entity entity) {
    final location = getEmptySpawnLocation(entity.radius);
    entity.spawn(x: location.x, y: location.y);
    addEntity(entity);
  }

  void spawnOutOfBounds(Entity entity) {
    final location = getLocationOutside();
    entity.spawn(x: location.x, y: location.y);
    addEntity(entity);
  }

  Point getEmptySpawnLocation(num radius) {
    final random = new Random();

    const MAX_ATTEMPTS = 10;
    for (var i = 0; i < MAX_ATTEMPTS; i ++) {
      final point = new Point(random.nextDouble() * width, random.nextDouble() * height);
      final overlapping = _entities.where((e) => e.distanceFromPoint(point.x, point.y) < e.radius + radius);
      if (overlapping.length == 0) {
        return point;
      }
    }

    // If all else fails, put it outside. TODO: something better?
    return getLocationOutside();
  }

  Point getLocationOutside() {
    final angle = new Random().nextDouble() * pi * 2;
    return new Point(width/2 + cos(angle) * width/2 * 1.5, height/2 + sin(angle) * height/2 * 1.5);
  }

  void update(num dt) {
    // Use local list of entities in case more are added during update
    final localEntities = List<Entity>.from(_entities);
    localEntities.forEach((e) => e.update(dt, this));
    
    // Perform each entity vs entity check only once
    final others = List<Entity>.from(localEntities);

    for (var e in localEntities) {
      others.remove(e);

      // TODO: What if we hit multiple others? Figure out which we hit first?
      for (var o in others) {
        final hitTime = e.timeUntilHit(o);

        if (-dt < hitTime && hitTime < 0) {
          e.updatePosition(hitTime);
          o.updatePosition(hitTime);

          Entity.handleBounce(e, o);
          e.hitWith(o, this);
          o.hitWith(e, this);

          e.updatePosition(-hitTime);
          o.updatePosition(-hitTime);
        }
      }
    }
    _entities.removeWhere((e) => !e.isAlive);

    _particles..forEach((p) => p.update(dt, this))..removeWhere((p) => !p.isAlive);
  }

  void draw(CanvasRenderingContext2D ctx) {
    _entities.forEach((e) => e.draw(ctx));
    _particles.forEach((p) => p.draw(ctx));
  }
}