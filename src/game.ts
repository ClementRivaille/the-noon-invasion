import Battleground, { NB_LANES } from './objects/Battleground';
import Invader, { InvaderSignals } from './objects/invader';
import Ship from './objects/Ship';
import CollisionManager from './utils/collisions';
import MusicManager, { MusicManagerSignals } from './utils/musicManager';
import { loadResources } from './utils/resources';

export default class GameScene extends Phaser.Scene {
  private camera: Phaser.Cameras.Scene2D.Camera;

  private ship: Ship;
  private invaders: Invader[] = [];

  private debugText: Phaser.GameObjects.Text;

  static battleground: Battleground;
  static musicManager: MusicManager;
  static collisionManager: CollisionManager;

  preload() {
    loadResources(this);
  }

  async create() {
    this.camera = this.cameras.main;
    GameScene.musicManager = new MusicManager();
    GameScene.battleground = new Battleground(
      this,
      this.camera.width,
      this.camera.height
    );
    GameScene.collisionManager = new CollisionManager(this);

    this.ship = new Ship(this, this.camera.centerX, this.camera.height - 50);

    this.debugText = this.add.text(100, 100, 'DEBUG', {
      fontSize: '30px',
    });
    this.debugText.setAlpha(0);

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

    this.debugText.setText(`${this.invaders.length}`);
  }

  onLaserHitInvader(
    laser: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    invader: Invader
  ) {
    laser.destroy();
    this.destroyInvader(invader);
  }
  onInvaderHitShip(invader: Invader, _ship: Ship) {
    this.destroyInvader(invader);
    this.camera.shake();
  }

  private onBeat(_beat: number) {
    const invader = new Invader(this, Math.floor(Math.random() * NB_LANES));
    this.invaders.push(invader);
    invader.signals.subscribe(InvaderSignals.invade, (i: Invader) =>
      this.destroyInvader(i)
    );
  }

  private destroyInvader(invader: Invader) {
    invader.destroy();
    this.invaders = this.invaders.filter((i) => i !== invader);
  }
}
