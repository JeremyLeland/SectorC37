import 'dart:html';

import 'entity.dart';

class World {
  List<Entity> _entities = [], _particles = [];

  Iterable<Entity> getEntitiesNear(Entity entity) {
    // TODO: only return actors close to given actor
    // Only return entities we can collide with
    return _entities.where((e) => e != entity && e.isAlive() && e.damage > 0);
  }

  void addEntity(Entity entity) => _entities.add(entity);
  void addParticle(Entity particle) => _particles.add(particle);

  void update(num dt) {
    _entities.forEach((e) => e.update(dt));
    
    // Perform each entity vs entity check only once
    var others = List<Entity>.from(_entities);

    for (var e in _entities) {
      others.remove(e);

      // TODO: What if we hit multiple others? Figure out which we hit first?
      for (var o in others) {
        final hitTime = e.timeUntilHit(o);

        if (-dt < hitTime && hitTime < 0) {
          e.updatePosition(hitTime);
          o.updatePosition(hitTime);

          // TODO: bounce?
          e.hitWith(o);
          o.hitWith(e);

          e.updatePosition(-hitTime);
          o.updatePosition(-hitTime);
        }
      }
    }
    _entities.removeWhere((e) => !e.isAlive());

    for (var entity in _entities) {
      entity.update(dt);

      for (var other in getEntitiesNear(entity)) {
        final hitTime = entity.timeUntilHit(other);

        if (-dt < hitTime && hitTime < 0) {

        }
      }
    }
    _entities.removeWhere((e) => !e.isAlive());
  }

  void draw(CanvasRenderingContext2D ctx) {
    _entities.forEach((e) => e.draw(ctx));
  }
}