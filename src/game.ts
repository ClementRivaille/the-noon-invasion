import Battleground from './objects/Battleground';
import Ship from './objects/Ship';
import { loadResources } from './utils/resources';

export default class GameScene extends Phaser.Scene {
  private camera: Phaser.Cameras.Scene2D.Camera;

  private ship: Ship;
  private battleground: Battleground;

  private debugText: Phaser.GameObjects.Text;

  preload() {
    loadResources(this);
  }

  create() {
    this.camera = this.cameras.main;
    this.ship = new Ship(this, this.camera.centerX, this.camera.height - 50);
    this.battleground = new Battleground(
      this,
      this.camera.width,
      this.camera.height
    );
    //this.physics.add.collider(this.battleground.borders, this.ship.sprite);

    this.debugText = this.add.text(100, 100, 'DEBUG', {
      fontSize: '30px',
    });
  }

  update() {
    this.ship.update();

    this.debugText.setText(`${this.battleground.getZone(this.ship.sprite.x)}`);
  }
}
