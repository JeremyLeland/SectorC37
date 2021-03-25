import 'dart:html';
import 'dart:math';

import 'entity.dart';

class World {
  num width, height;
  List<Entity> _entities = [], _particles = [];

  World({this.width = 0, this.height = 0});

  Iterable<Entity> getEntitiesNear(Entity entity) {
    // TODO: only return actors close to given actor
    // Only return entities we can collide with
    return _entities.where((e) => e != entity && e.isAlive && e.damage > 0);
  }

  void addEntity(Entity entity) => entity.damage == 0 ? _particles.add(entity) : _entities.add(entity);

  void spawnInBounds(Entity entity) {
    var location = getEmptySpawnLocation(entity.radius);
    entity.spawn(x: location.x, y: location.y);
    addEntity(entity);
  }

  void spawnOutOfBounds(Entity entity) {
    var location = getLocationOutside();
    entity.spawn(x: location.x, y: location.y);
    addEntity(entity);
  }

  Point getEmptySpawnLocation(num radius) {
    var random = new Random();

    // TODO: actually make sure it's empty

    return new Point(random.nextDouble() * width, random.nextDouble() * height);
  }

  Point getLocationOutside() {
    var angle = new Random().nextDouble() * pi * 2;
    return new Point(width/2 + cos(angle) * width/2 * 1.5, height/2 + sin(angle) * height/2 * 1.5);
  }

  void update(num dt) {
    // Use local list of entities in case more are added during update
    var localEntities = List<Entity>.from(_entities);
    localEntities.forEach((e) => e.update(dt, this));
    
    // Perform each entity vs entity check only once
    var others = List<Entity>.from(localEntities);

    for (var e in localEntities) {
      others.remove(e);

      // TODO: What if we hit multiple others? Figure out which we hit first?
      for (var o in others) {
        final hitTime = e.timeUntilHit(o);

        if (-dt < hitTime && hitTime < 0) {
          e.updatePosition(hitTime);
          o.updatePosition(hitTime);

          // TODO: bounce?
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