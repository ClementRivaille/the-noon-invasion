import Battleground, { NB_LANES } from './objects/Battleground';
import Invader, { InvaderSignals } from './objects/invader';
import InvaderScheduler, {
  InvaderSchedulerSignals,
} from './objects/InvaderScheduler';
import Ship from './objects/Ship';
import CollisionManager from './utils/collisions';
import Instruments, { getLaneNote, InstrumentType } from './utils/instruments';
import MusicManager, { MusicManagerSignals } from './utils/musicManager';
import { loadResources } from './utils/resources';

export default class GameScene extends Phaser.Scene {
  private camera: Phaser.Cameras.Scene2D.Camera;

  private ship: Ship;
  private invaders: Invader[] = [];
  private invaderScheduler: InvaderScheduler;

  public debugText: Phaser.GameObjects.Text;

  static battleground: Battleground;
  static musicManager: MusicManager;
  static collisionManager: CollisionManager;
  static instruments: Instruments;

  preload() {
    loadResources(this);
  }

  async create() {
    this.camera = this.cameras.main;
    GameScene.musicManager = new MusicManager();
    GameScene.instruments = new Instruments();
    GameScene.battleground = new Battleground(
      this,
      this.camera.width,
      this.camera.height
    );
    GameScene.collisionManager = new CollisionManager(this);

    this.ship = new Ship(this, this.camera.centerX, this.camera.height - 50);

    this.invaderScheduler = new InvaderScheduler();
    this.invaderScheduler.signals.subscribe(
      InvaderSchedulerSignals.sendInvader,
      () => this.addInvader()
    );

    this.debugText = this.add.text(100, 100, 'DEBUG', {
      fontSize: '30px',
    });
    this.debugText.setAlpha(0);

    // LOADING
    await Promise.all([
      GameScene.musicManager.load,
      GameScene.instruments.load,
    ]);
    GameScene.musicManager.start();

    GameScene.musicManager.signals.subscribe(MusicManagerSignals.beat, () => {
      this.onBeat();
    });
    this.invaderScheduler.scheduleNextInvader();
  }

  update() {
    this.ship.update();

    // this.debugText.setText(
    //   `${GameScene.battleground.getLane(this.ship.sprite.x)}`
    // );
  }

  onLaserHitInvader(
    laser: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    invader: Invader
  ) {
    laser.destroy();
    GameScene.instruments.playNote(
      InstrumentType.kill,
      getLaneNote(GameScene.battleground.getLane(invader.x))
    );
    this.destroyInvader(invader);
  }
  onInvaderHitShip(invader: Invader, _ship: Ship) {
    this.destroyInvader(invader);
    this.camera.shake();
  }

  private addInvader() {
    const lane = Math.floor(Math.random() * NB_LANES);
    const invader = new Invader(this, lane);
    this.invaders.push(invader);
    GameScene.instruments.playNote(InstrumentType.invader, getLaneNote(lane));
    invader.signals.subscribe(InvaderSignals.invade, (i: Invader) =>
      this.destroyInvader(i)
    );

    this.invaderScheduler.scheduleNextInvader();
  }

  private destroyInvader(invader: Invader) {
    invader.destroy();
    this.invaders = this.invaders.filter((i) => i !== invader);
  }

  private onBeat() {}
}
