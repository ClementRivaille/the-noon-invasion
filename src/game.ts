import Battleground, { NB_LANES } from './objects/Battleground';
import Invader, { InvaderSignals } from './objects/invader';
import Ship from './objects/Ship';
import MusicManager, { MusicManagerSignals } from './utils/musicManager';
import { loadResources } from './utils/resources';

export default class GameScene extends Phaser.Scene {
  private camera: Phaser.Cameras.Scene2D.Camera;

  private ship: Ship;

  private debugText: Phaser.GameObjects.Text;

  static battleground: Battleground;
  static musicManager: MusicManager;

  preload() {
    loadResources(this);
  }

  async create() {
    this.camera = this.cameras.main;
    this.ship = new Ship(this, this.camera.centerX, this.camera.height - 50);
    GameScene.battleground = new Battleground(
      this,
      this.camera.width,
      this.camera.height
    );
    //this.physics.add.collider(this.battleground.borders, this.ship.sprite);

    GameScene.musicManager = new MusicManager();

    this.debugText = this.add.text(100, 100, 'DEBUG', {
      fontSize: '30px',
    });

    await GameScene.musicManager.load;
    GameScene.musicManager.start();

    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.beat,
      (beat: number) => {
        this.onBeat(beat);
      }
    );
  }

  update() {
    this.ship.update();

    this.debugText.setText(
      `${GameScene.battleground.getLane(this.ship.sprite.x)}`
    );
  }

  private onBeat(_beat: number) {
    const invader = new Invader(this, Math.random() * NB_LANES);
    invader.signals.subscribe(InvaderSignals.invade, (i: Invader) =>
      i.destroy()
    );
  }
}
