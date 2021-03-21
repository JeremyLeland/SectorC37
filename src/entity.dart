import 'dart:html';

import 'dart:math';

abstract class Entity {
  num x, y, dx, dy, angle, dAngle;
  num radius, mass, health, damage;

  Entity({this.x = 0, this.y = 0, this.dx = 0, this.dy = 0, this.angle = 0, this.dAngle = 0,
          this.radius = 0, this.mass = 0, this.health = 1, this.damage = 0});
  
  bool isAlive() => health > 0;
  
  void hitWith(Entity entity) {
    health -= entity.damage;

    bleedFrom(entity);
    if (health <= 0) {
      die();
    }
  }

  void bleedFrom(Entity entity);
  void die();

  //
  // Distances and angles
  //
  num distanceFrom(Entity entity) => distanceFromPoint(entity.x, entity.y);
  num distanceFromPoint(num x, num y) => sqrt(pow(x - this.x, 2) + pow(y - this.y, 2));
  num angleFrom(Entity entity) => angleFromPoint(entity.x, entity.y);
  num angleFromPoint(num x, num y) => atan2(y - this.y, x - this.x) - angle;

  Point getOffsetPosition(num frontOffset, num sideOffset) {
    return new Point(
      x + cos(angle) * frontOffset + cos(angle + pi/2) * sideOffset,
      y + sin(angle) * frontOffset + sin(angle + pi/2) * sideOffset
    );
  }

  //
  // Collision
  //
  bool isCollidingWith(Entity entity) => distanceFrom(entity) < radius + entity.radius;

  num timeUntilHit(Entity other, {num buffer = 0}) {
    // See when ships would collide if continuing at their current direction and rate of speed
    // This will return a negative value if the collision would have occurred in the past
    // See https://stackoverflow.com/questions/33140999/at-what-delta-time-will-two-objects-collide
    // (Line-Line was http://www.jeffreythompson.org/collision-detection/line-line.php)

    final cx = x - other.x;
    final cy = y - other.y;
    final vx = dx - other.dx;
    final vy = dy - other.dy;
    final rr = radius + other.radius + buffer;

    final a = pow(vx, 2) + pow(vy, 2);
    final b = 2 * (cx * vx + cy * vy);
    final c = pow(cx, 2) + pow(cy, 2) - pow(rr, 2);

    final disc = b*b - 4*a*c;

    // If the objects don't collide, the discriminant will be negative
    // We only care about first intersection, so just return t0 (which uses -b)
    return disc < 0 ? double.infinity : (-b - sqrt(disc)) / (2*a);
  }

  //
  // Update
  //
  void updatePosition(num dt) {
    x += dx * dt;
    y += dy * dt;
    angle += dAngle * dt;
  }

  void update(num dt) {
    updatePosition(dt);
  }

  //
  // Draw
  //
  void drawEntity(CanvasRenderingContext2D ctx);

  void draw(CanvasRenderingContext2D ctx) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    drawEntity(ctx);
    ctx.restore();
  }
}