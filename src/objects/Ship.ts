import GameScene from '../game';
import { CollisionGroup, PARENT_KEY } from '../utils/collisions';
import {
  getLaneNote,
  getNoteAround,
  InstrumentType,
} from '../utils/instruments';
import { MusicManagerSignals } from '../utils/musicManager';
import { SpritesRes } from '../utils/resources';

const SPEED = 800;
const LASER_SPEED = 1000;

export default class Ship {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private shooting = false;

  constructor(private game: GameScene, x: number, y: number) {
    this.sprite = game.physics.add.sprite(x, y, SpritesRes.ghost, 0);
    GameScene.collisionManager.groups[CollisionGroup.Ship].add(this.sprite);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.scale = 1.6; // TMP
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(5);
    this.sprite.setData(PARENT_KEY, this);

    this.cursors = game.input.keyboard.createCursorKeys();

    GameScene.musicManager.signals.subscribe(MusicManagerSignals.triplet, () =>
      this.shoot()
    );
  }

  update() {
    this.move();
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
    if (this.shooting) {
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
      this.game.debugText.setText(note);
      GameScene.instruments.playNote(InstrumentType.shoot, note);
    }
  }
}
