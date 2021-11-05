import 'phaser';

interface ZoneEvents {
  zoneBody: Phaser.Physics.Arcade.Body;
  onEnter: () => void;
  onExit: () => void;
}

export default class CollisionManager {
  private zonesEvents: ZoneEvents[] = [];

  constructor(
    private physics: Phaser.Physics.Arcade.ArcadePhysics,
    private playerBody: Phaser.GameObjects.GameObject
  ) {}

  addOverlap(
    zone: Phaser.GameObjects.Zone,
    onEnter: () => void,
    onExit: () => void
  ) {
    this.physics.world.enable(zone);
    this.physics.add.overlap(zone, this.playerBody);
    this.zonesEvents.push({
      zoneBody: zone.body as Phaser.Physics.Arcade.Body,
      onEnter,
      onExit,
    });
  }

  update() {
    for (const zoneEvent of this.zonesEvents) {
      // Treat 'embedded' as 'touching' also
      if (zoneEvent.zoneBody.embedded) zoneEvent.zoneBody.touching.none = false;

      var touching = !zoneEvent.zoneBody.touching.none;
      var wasTouching = !zoneEvent.zoneBody.wasTouching.none;

      if (touching && !wasTouching) zoneEvent.onEnter();
      else if (!touching && wasTouching) zoneEvent.onExit();
    }
  }
}
