import { SpritesRes } from '../utils/resources';

const SPEED = 800;

export default class Ship {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(game: Phaser.Scene, x: number, y: number) {
    this.sprite = game.physics.add.sprite(x, y, SpritesRes.ghost, 0);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.scale = 1.6; // TMP
    this.sprite.setCollideWorldBounds(true);

    this.cursors = game.input.keyboard.createCursorKeys();
  }

  update() {
    this.move();
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
}
