import GameScene from '../game';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import {
  getLaneNote,
  getNoteAround,
  InstrumentType,
} from '../utils/instruments';
import { MusicManagerSignals } from '../utils/musicManager';
import { PIXEL_SCALE, SpritesRes } from '../utils/resources';

const SPEED = 800;
const LASER_SPEED = 1000;

const SHIP_COLOR = 0xe7add9;
const LASER_COLOR = 0xf38472;

export default class Ship {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shooting = false;
  private sideShooting = false;
  private sideOffBeat: number = 0;

  //private tweens: Phaser.Tweens.Tween[] = [];

  constructor(private game: GameScene, x: number, y: number) {
    this.sprite = game.physics.add.sprite(x, y, SpritesRes.ship, 0);
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
  }

  update() {
    if (!this.sideShooting) {
      this.move();
    } else if (this.sprite.body.velocity.x !== 0) {
      this.sprite.setVelocityX(0);
    }
    this.shooting = this.cursors.up.isDown;
    this.sideShooting = this.cursors.down.isDown && !this.shooting;
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
    if (this.shooting && !this.sideShooting) {
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
    if (this.sideShooting && beat % 2 == this.sideOffBeat)
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

  // private clearTweens() {
  //   this.tweens.forEach((tween) => tween.stop());
  //   this.tweens = [];
  // }
}
