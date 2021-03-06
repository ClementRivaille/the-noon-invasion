import GameScene from '../game';
import { yieldTimeout } from '../utils/animation';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import { getChord } from '../utils/harmony';
import {
  getLaneNote,
  getNoteAround,
  InstrumentType,
} from '../utils/instruments';
import { MusicManagerSignals } from '../utils/musicManager';
import { PIXEL_SCALE, SpritesRes } from '../utils/resources';
import Signal from '../utils/signal';

const SPEED = 800;
const LASER_SPEED = 1000;

export const SIDE_FLAG = 'SIDE';

export const SHIP_COLOR = 0xe7add9;
const LASER_COLOR = 0xf38472;

export enum ShipSignals {
  die = 'die',
}
export default class Ship {
  public signals = new Signal<ShipSignals>();

  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shooting = false;
  private sideShooting = false;
  private sideOffBeat: number = 0;

  //private tweens: Phaser.Tweens.Tween[] = [];

  private active = false;
  public continues = 3;

  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    private game: GameScene,
    private startX: number,
    private y: number
  ) {
    this.sprite = game.physics.add.sprite(startX, y, SpritesRes.ship, 0);
    GameScene.collisionManager.groups[CollisionGroup.Ship].add(this.sprite);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.scale = PIXEL_SCALE;
    this.sprite.setTint(SHIP_COLOR);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(5);
    this.sprite.setData(PARENT_KEY, this);

    this.cursors = game.input.keyboard.createCursorKeys();
    this.cursors.down.on('down', () => this.setSideOffBeat());

    GameScene.musicManager.signals.subscribe(MusicManagerSignals.triplet, () =>
      this.shoot()
    );
    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.beat,
      (beat: number) => this.sideShoot(beat)
    );

    this.sprite.setAlpha(0);

    this.particleEmitter = GameScene.particles.getLargeEmitter();
  }

  update() {
    if (!this.active) return;

    if (!this.sideShooting) {
      this.move();
    } else if (this.sprite.body.velocity.x !== 0) {
      this.sprite.setVelocityX(0);
    }
    this.shooting = this.cursors.up.isDown;
    this.sideShooting = this.cursors.down.isDown && !this.shooting;
  }

  activate() {
    this.sprite.setPosition(this.startX, this.y);
    this.continues = 3;
    this.sprite.setAlpha(1);
    this.active = true;

    // Animate
    this.enterAnimation();
  }

  async onHitInvader() {
    // Explosion
    this.sprite.setAlpha(0);
    this.sprite.setVelocityX(0);
    this.particleEmitter.explode(
      15 + Math.floor(Math.random() * 10),
      this.sprite.x,
      this.sprite.y
    );

    this.active = false;
    this.continues = this.continues - 1;
    this.signals.emit(ShipSignals.die, this.continues);
  }

  respawn() {
    this.active = true;
    this.sprite.setAlpha(1);
    this.sprite.setY(this.y);
    this.enterAnimation();

    // Blink
    let nbBlinks = 0;
    const interval = setInterval(async () => {
      this.sprite.setAlpha(0);
      await yieldTimeout(100);
      this.sprite.setAlpha(1);
      nbBlinks++;
      if (nbBlinks > 3) {
        clearInterval(interval);
      }
    }, 200);
  }

  private move() {
    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown) {
      direction.x = -1;
    } else if (this.cursors.right.isDown) {
      direction.x = 1;
    }

    const velocity = direction.normalize().scale(SPEED);
    this.sprite.setVelocity(velocity.x, 0);
  }

  private shoot() {
    if (this.shooting && this.active && !this.sideShooting) {
      const laser = this.game.add.rectangle(
        this.sprite.x,
        this.sprite.y,
        4,
        40,
        LASER_COLOR
      );
      this.game.physics.world.enable(laser);
      GameScene.collisionManager.groups[CollisionGroup.Laser].add(laser);

      const laserBody = laser.body as Phaser.Physics.Arcade.Body;
      laserBody.setVelocityY(-LASER_SPEED);

      const currentLane = GameScene.battleground.getLane(this.sprite.x);
      const note = getNoteAround(
        getLaneNote(currentLane),
        -2 + Math.round(Math.random() * 4)
      );
      GameScene.instruments.playNote(InstrumentType.shoot, note);
    }
  }

  private sideShoot(beat: number) {
    if (this.active && this.sideShooting && beat % 2 == this.sideOffBeat)
      for (const direction of [-1, 1]) {
        const laser = this.game.add.rectangle(
          this.sprite.x,
          this.sprite.y,
          40,
          15,
          LASER_COLOR
        );
        this.game.physics.world.enable(laser);
        GameScene.collisionManager.groups[CollisionGroup.Laser].add(laser);

        const laserBody = laser.body as Phaser.Physics.Arcade.Body;
        laserBody.setVelocityX(LASER_SPEED * 2 * direction);

        laser.setData(SIDE_FLAG, true);

        const currentLane = GameScene.battleground.getLane(this.sprite.x);
        const note = getNoteAround(
          getLaneNote(currentLane),
          -2 + Math.round(Math.random() * 4)
        );
        GameScene.instruments.playNote(InstrumentType.shoot, note);
      }
  }

  private setSideOffBeat() {
    this.sideOffBeat = (GameScene.musicManager.beat + 1) % 2;
  }

  private async enterAnimation() {
    this.sprite.setScale(PIXEL_SCALE * 0.4);

    this.game.tweens.add({
      targets: [this.sprite],
      scale: PIXEL_SCALE,
      duration: 150,
      ease: 'Back.easeOut',
    });

    const chord = getChord(GameScene.musicManager.bar);
    for (const note of chord) {
      GameScene.instruments.playNote(InstrumentType.square, note);
      await yieldTimeout(60);
    }
  }

  // private clearTweens() {
  //   this.tweens.forEach((tween) => tween.stop());
  //   this.tweens = [];
  // }
}
