import GameScene from '../game';
import Invader from '../objects/Invader';
import Ship from '../objects/Ship';

export enum CollisionGroup {
  Invaders,
  Ship,
  Laser,
}

export const PARENT_KEY = 'parent;';
export const DEATH_FLAG = 'dead';

export default class CollisionManager {
  public groups: {
    [group in CollisionGroup]: Phaser.Physics.Arcade.Group;
  };
  constructor(private game: GameScene) {
    this.groups = {
      [CollisionGroup.Invaders]: this.game.physics.add.group(),
      [CollisionGroup.Ship]: this.game.physics.add.group(),
      [CollisionGroup.Laser]: this.game.physics.add.group(),
    };

    this.game.physics.add.collider(
      this.groups[CollisionGroup.Invaders],
      this.groups[CollisionGroup.Laser],
      (invader, laser) => {
        // Check if invader is alive
        this.game.onLaserHitInvader(laser, invader.getData(PARENT_KEY));
      }
    );
    this.game.physics.add.collider(
      this.groups[CollisionGroup.Invaders],
      GameScene.battleground.floor,
      (_object, invader) => {
        (invader.getData(PARENT_KEY) as Invader).onFloorContact();
      }
    );

    this.game.physics.add.collider(
      this.groups[CollisionGroup.Invaders],
      this.groups[CollisionGroup.Ship],
      (_invader, shipSprite) => {
        const ship = shipSprite.getData(PARENT_KEY) as Ship;
        ship.onHitInvader();
      }
    );

    this.game.physics.add.collider(
      this.groups[CollisionGroup.Laser],
      GameScene.battleground.roof,
      (_object, laser) => {
        laser.destroy();
      }
    );
    this.game.physics.add.collider(
      this.groups[CollisionGroup.Laser],
      GameScene.battleground.borders,
      (laser) => {
        laser.destroy();
      }
    );
  }
}
