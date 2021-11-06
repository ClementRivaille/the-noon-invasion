import GameScene from '../game';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import { SpritesRes } from '../utils/resources';
import Signal from '../utils/signal';

const SPEED = 110;
const ATTACK_SPEED = 1400;

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
    GameScene.collisionManager.groups[CollisionGroup.Invaders].add(this.sprite);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setVelocityY(SPEED);
    this.sprite.setData(PARENT_KEY, this);
  }

  onFloorContact() {
    this.sprite.setVelocityY(0);
    this.signals.emit(InvaderSignals.invade, this);
  }

  attack(direction: -1 | 1) {
    this.sprite.setVelocityX(direction * ATTACK_SPEED);
  }

  get x() {
    return this.sprite.x;
  }

  public destroy() {
    GameScene.collisionManager.groups[CollisionGroup.Invaders].remove(
      this.sprite
    );
    this.sprite.destroy();
  }
}
