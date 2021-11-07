import GameScene from '../game';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import { MusicManagerSignals } from '../utils/musicManager';
import { PIXEL_SCALE, SpritesRes } from '../utils/resources';
import Signal from '../utils/signal';

const SPEED = 110;
const ATTACK_SPEED = 1400;

const INVADER_COLOR = 0xcfd4b4;

export enum InvaderSignals {
  invade = 'invade',
}

export default class Invader {
  public signals = new Signal<InvaderSignals>();

  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  constructor(private game: Phaser.Scene, public readonly lane: number) {
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
    this.sprite.setScale(PIXEL_SCALE);
    this.sprite.setTint(INVADER_COLOR);

    GameScene.battleground.addToLane(lane, this);

    this.animate = this.animate.bind(this);
    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.beat,
      this.animate
    );
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
  get y() {
    return this.sprite.y;
  }

  public destroy() {
    GameScene.collisionManager.groups[CollisionGroup.Invaders].remove(
      this.sprite
    );
    GameScene.musicManager.signals.unsubscribe(
      MusicManagerSignals.beat,
      this.animate
    );
    this.sprite.destroy();
  }

  private animate() {
    this.sprite.setFrame(parseInt(this.sprite.frame.name, 10) === 0 ? 1 : 0);
    this.game.tweens.add({
      targets: [this.sprite],
      scale: this.sprite.scale * 1.1,
      yoyo: true,
      duration: 60,
      ease: 'Sine.easeInOut',
    });
  }
}
