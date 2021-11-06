import GameScene from '../game';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import {
  getLaneNote,
  getNoteAround,
  InstrumentType,
} from '../utils/instruments';
import { BEAT_LENGTH, MusicManagerSignals } from '../utils/musicManager';
import { SpritesRes } from '../utils/resources';

const SPEED = 800;
const LASER_SPEED = 1000;

const CHARGE_OFFSET = 0.1;

export default class Ship {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shooting = false;
  private charging = false;

  private chargeBeat: number = -1;
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(private game: GameScene, x: number, y: number) {
    this.sprite = game.physics.add.sprite(x, y, SpritesRes.ghost, 0);
    GameScene.collisionManager.groups[CollisionGroup.Ship].add(this.sprite);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.scale = 1.6; // TMP
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(5);
    this.sprite.setData(PARENT_KEY, this);

    this.cursors = game.input.keyboard.createCursorKeys();
    this.cursors.down.on('down', () => this.charge());
    this.cursors.down.on('up', () => this.releaseCharge());

    GameScene.musicManager.signals.subscribe(MusicManagerSignals.triplet, () =>
      this.shoot()
    );
  }

  update() {
    if (!this.charging) {
      this.move();
    } else if (this.chargeBeat >= 0) {
      this.updateCharging();
    }
    this.shooting = this.cursors.up.isDown;
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
    if (this.shooting && !this.charging) {
      const laser = this.game.add.rectangle(
        this.sprite.x,
        this.sprite.y,
        5,
        40,
        0xee1111
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

  private async charge() {
    if (this.charging) return;

    this.charging = true;
    this.sprite.setTint(0xeeeeee);
    this.sprite.setVelocityX(0);

    await GameScene.musicManager.signals.yield(MusicManagerSignals.beat);
    if (!this.charging) return;
    this.sprite.setTint(0xcccccc);
    this.clearTweens();
    this.tweens.push(
      this.game.tweens.add({
        targets: [this.sprite],
        scale: 1.3, //TMP
        ease: 'Sine.easeInt',
        duration: BEAT_LENGTH * 1000,
      })
    );

    GameScene.instruments.playNote(InstrumentType.shoot, 'C3');
    this.chargeBeat = (GameScene.musicManager.beat + 2) % 8;

    this.game.debugText.setText(
      `from: ${GameScene.musicManager.beat} to: ${this.chargeBeat}`
    );
  }

  private compareCurrentBeatWIthChargeBeat() {
    const currentBeat = GameScene.musicManager.beat;
    if (this.chargeBeat > 1) {
      return currentBeat >= this.chargeBeat;
    } else {
      return (
        currentBeat < 7 - (1 - this.chargeBeat) &&
        currentBeat >= this.chargeBeat
      );
    }
  }

  private updateCharging() {
    const currentBeat = GameScene.musicManager.beat;
    if (this.compareCurrentBeatWIthChargeBeat()) {
      const offset = GameScene.musicManager.metronome.getOffset(
        GameScene.musicManager.currentTime
      );
      if (currentBeat > this.chargeBeat || offset > CHARGE_OFFSET) {
        this.failSideShoot();
        this.stopCharging();
      }
    }
  }

  private releaseCharge() {
    if (!this.charging) return;

    const currentBeat = GameScene.musicManager.beat;
    if (currentBeat !== this.chargeBeat) {
      if ((currentBeat + 1) % 8 === this.chargeBeat) {
        const offset =
          GameScene.musicManager.metronome.getNextNthBeatTime(
            this.chargeBeat - currentBeat
          ) - GameScene.musicManager.currentTime;
        if (offset <= CHARGE_OFFSET) {
          this.sideShoot();
        } else {
          this.failSideShoot();
        }
      } else {
        this.failSideShoot();
      }
    } else if (currentBeat === this.chargeBeat) {
      const offset = GameScene.musicManager.metronome.getOffset(
        GameScene.musicManager.currentTime
      );
      if (offset <= CHARGE_OFFSET) {
        this.sideShoot();
      } else {
        this.failSideShoot();
      }
    }

    this.stopCharging();
  }

  private stopCharging() {
    this.charging = false;
    this.chargeBeat = -1;
    this.sprite.setTint(0xffffff);
    this.clearTweens();
    this.tweens.push(
      this.game.tweens.add({
        targets: [this.sprite],
        scale: 1.6, // TMP,
        duration: 100,
        ease: 'Sine.easeOut',
      })
    );
  }

  private sideShoot() {
    this.charging = false;
    // Shoot

    for (const direction of [-1, 1]) {
      const laser = this.game.add.rectangle(
        this.sprite.x,
        this.sprite.y,
        50,
        15,
        0xee1111
      );
      this.game.physics.world.enable(laser);
      GameScene.collisionManager.groups[CollisionGroup.Laser].add(laser);

      const laserBody = laser.body as Phaser.Physics.Arcade.Body;
      laserBody.setVelocityX(LASER_SPEED * 4 * direction);

      const currentLane = GameScene.battleground.getLane(this.sprite.x);
      const note = getNoteAround(
        getLaneNote(currentLane),
        -2 + Math.round(Math.random() * 4)
      );
      GameScene.instruments.playNote(InstrumentType.shoot, note);
    }
  }

  private failSideShoot() {
    // Play unpleasant sound
  }

  private clearTweens() {
    this.tweens.forEach((tween) => tween.stop());
    this.tweens = [];
  }
}
