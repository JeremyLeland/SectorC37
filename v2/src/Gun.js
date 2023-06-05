export class Gun {
  offsets = [];

  ammo = 0;
  timeUntilReady = 0;
  isReloading = false;

  maxAmmo = Infinity;
  timeBetweenShots = 0;
  bulletsPerShot = 1;
  spread = 0;
  bulletSpeed = 0;
  reloadTime = 0;

  energyCost = 0;

  constructor( values ) {
    Object.assign( this, values );
    this.ammo = this.maxAmmo;
  }

  update( dt, owner, isShooting ) {
    this.timeUntilReady -= dt;

    if ( this.timeUntilReady < 0 ) {
      this.isReloading = false;

      if ( isShooting && !owner.isSprinting && this.ammo > 0 && owner.energy > this.energyCost ) {
        this.offsets.forEach( offset => {
          const offsetPosition = owner.getOffsetPosition( offset );

          for ( let i = 0; i < this.bulletsPerShot; i ++ ) {
            const bullet = this.getBullet( offsetPosition );
            
            bullet.angle += this.spread * ( -0.5 + Math.random() );
            
            bullet.dx = owner.dx + Math.cos( bullet.angle ) * this.bulletSpeed;
            bullet.dy = owner.dy + Math.sin( bullet.angle ) * this.bulletSpeed;
            
            owner.createdEntities.push( bullet );

          }
        } );
        
        owner.energy -= this.energyCost;

        // TODO: How does this apply to multiple offsets?
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