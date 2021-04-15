import 'dart:html';
import 'dart:math';

import 'world.dart';

abstract class Entity {
  num x, y, dx, dy, angle, dAngle;
  num radius, mass, life = 1, decay, health, damage;
  bool isSolid;
  String color;

  Entity({this.x = 0, this.y = 0, this.dx = 0, this.dy = 0, this.angle = 0, this.dAngle = 0,
          this.radius = 0, this.mass = 0, this.isSolid = false, this.decay = 0,
          this.health = 1, this.damage = 0, this.color = 'black'});
  
  // TODO: Use this to separate positioning calls from setting mass/damage/etc?
  Entity spawn({num x = 0, num y = 0, num dx = 0, num dy = 0, num angle = 0, num dAngle = 0}) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.angle = angle;
    this.dAngle = dAngle;

    return this;
  }

  Entity spawnParticle({required num startX, required num startY, num startSpread = 0, 
            num startDX = 0, num startDY = 0, num dirAngle = 0, num dirSpread = pi * 2, 
            num minSpeed = 0, required num maxSpeed, num maxSpin = 0,
            num minRadius = 0, required num maxRadius}) {
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

    return this;
  }

  // NOTE: life decreases with time, health decreases when hit
  bool get isAlive => life > 0 && health > 0;
  
  void hitWith(Entity entity, World world) {
    health -= entity.damage;

    bleedFrom(entity, world);
    if (health <= 0) {
      die(world);
    }
  }

  void bleedFrom(Entity entity, World world) {}
  void die(World world) {}

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

  static void handleBounce(Entity e1, Entity e2) {
    // See https://ericleong.me/research/circle-circle/#dynamic-circle-circle-collision
    // someday: try something from this monster? http://www.euclideanspace.com/physics/dynamics/collision/twod/index.htm
    final diffX = e2.x - e1.x;
    final diffY = e2.y - e1.y;
    final distBetween = sqrt(diffX * diffX + diffY * diffY);
    final normX = diffX / distBetween;
    final normY = diffY / distBetween;

    final p = 2 * (e1.dx * normX + e1.dy * normY - e2.dx * normX - e2.dy * normY) / (e1.mass + e2.mass);

    e1.dx -= p * e2.mass * normX;
    e1.dy -= p * e2.mass * normY;
    e2.dx += p * e1.mass * normX;
    e2.dy += p * e1.mass * normY;
   }

  //
  // Update
  //
  void updatePosition(num dt) {
    x += dx * dt;
    y += dy * dt;
    angle += dAngle * dt;
  }

  void update(num dt, World world) {
    life -= decay * dt;

    updatePosition(dt);
  }

  //
  // Draw
  //
  void drawEntity(CanvasRenderingContext2D ctx) {}

  void draw(CanvasRenderingContext2D ctx) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    drawEntity(ctx);
    ctx.restore();
  }
}