import GameScene from '../game';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import { MusicManagerSignals } from '../utils/musicManager';
import { PIXEL_SCALE, SpritesRes } from '../utils/resources';
import Signal from '../utils/signal';

const SPEED = 110;
const ATTACK_SPEED = 1400;

export const INVADER_COLOR = 0xcfd4b4;

export enum InvaderSignals {
  invade = 'invade',
}

export default class Invader {
  public signals = new Signal<InvaderSignals>();

  private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private active = false;
  static particlesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(private game: Phaser.Scene, public readonly lane: number) {
    this.sprite = game.physics.add.sprite(
      GameScene.battleground.getLaneCoord(lane),
      20,
      SpritesRes.invader,
      0
    );

    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setData(PARENT_KEY, this);
    this.sprite.setTint(INVADER_COLOR);

    this.sprite.setVelocityY(SPEED);

    GameScene.battleground.addToLane(lane, this);

    this.animate = this.animate.bind(this);
    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.beat,
      this.animate
    );

    // Animation on start
    this.sprite.setScale(0.2);
    this.sprite.setAlpha(0.3);
    this.game.tweens.add({
      targets: [this.sprite],
      scale: PIXEL_SCALE,
      alpha: 1,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => this.enableBody(),
    });

    // Particles
    if (!Invader.particlesEmitter) {
      Invader.particlesEmitter = GameScene.particles.getSmallEmitter();
    }
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
    Invader.particlesEmitter.explode(
      5 + Math.floor(5 * Math.random()),
      this.sprite.x,
      this.sprite.y
    );

    GameScene.collisionManager.groups[CollisionGroup.Invaders].remove(
      this.sprite
    );
    GameScene.musicManager.signals.unsubscribe(
      MusicManagerSignals.beat,
      this.animate
    );
    this.sprite.destroy();
  }

  private enableBody() {
    GameScene.collisionManager.groups[CollisionGroup.Invaders].add(this.sprite);
    this.sprite.setVelocityY(SPEED);
    this.active = true;
  }

  private animate() {
    this.sprite.setFrame(parseInt(this.sprite.frame.name, 10) === 0 ? 1 : 0);
    if (!this.active) return;
    this.game.tweens.add({
      targets: [this.sprite],
      scale: this.sprite.scale * 1.1,
      yoyo: true,
      duration: 60,
      ease: 'Sine.easeInOut',
    });
  }
}
