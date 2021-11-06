import GameScene from '../game';
import { SpritesRes } from '../utils/resources';
import Signal from '../utils/signal';

const SPEED = 200;

export enum InvaderSignals {
  invade = 'invade',
}

export default class Invader {
  public signals = new Signal<InvaderSignals>();

  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  constructor(game: Phaser.Scene, lane: number) {
    this.sprite = game.physics.add.sprite(
      GameScene.battleground.getLaneCoord(lane),
      0,
      SpritesRes.invader,
      0
    );
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setVelocityY(SPEED);

    // Collision
    game.physics.add.collider(GameScene.battleground.floor, this.sprite, () =>
      this.onFloorContact()
    );
  }

  public destroy() {
    this.sprite.destroy();
  }

  private onFloorContact() {
    this.signals.emit(InvaderSignals.invade, this);
  }
}
