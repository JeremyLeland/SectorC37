export class Gun {
  offset = { front: 0, side: 0, angle: 0 };

  ammo = 0;
  timeUntilReady = 0;
  isReloading = false;

  maxAmmo = Infinity;
  timeBetweenShots = 0;
  bulletsPerShot = 1;
  spread = 0;
  bulletSpeed = 0;
  reloadTime = 0;

  bulletTemplate;

  constructor( values ) {
    Object.assign( this, values );
    this.ammo = this.maxAmmo;
  }

  update( dt, owner ) {
    this.timeUntilReady -= dt;

    if ( this.timeUntilReady < 0 ) {
      this.isReloading = false;

      if ( owner.isShooting && !owner.isSprinting && this.ammo > 0 ) {
        for ( let i = 0; i < this.bulletsPerShot; i ++ ) {
          const values = owner.getOffset( this.offset );

          values.angle += this.spread * ( -0.5 + Math.random() );
          
          values.dx = owner.dx + Math.cos( values.angle ) * this.bulletSpeed;
          values.dy = owner.dy + Math.sin( values.angle ) * this.bulletSpeed;
          
          owner.createdEntities.push( this.getBullet( values ) );
        }

        this.ammo --;

        if ( this.ammo == 0 ) {
          this.isReloading = true;
          this.ammo = this.maxAmmo;
          this.timeUntilReady = this.reloadTime;
        }
        else {
          this.timeUntilReady = this.timeBetweenShots;
        }
      }
    }
  }

  getBullet( values ) { }
}