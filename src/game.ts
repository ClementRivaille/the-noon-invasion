import Background from './objects/Background';
import Battleground from './objects/Battleground';
import Invader, { InvaderSignals } from './objects/Invader';
import InvaderScheduler, {
  InvaderSchedulerSignals,
} from './objects/InvaderScheduler';
import Ship, { ShipSignals } from './objects/Ship';
import UI from './objects/UI';
import { yieldTimeout } from './utils/animation';
import CollisionManager from './utils/collisions';
import { pickLane } from './utils/harmony';
import Instruments, { getLaneNote, InstrumentType } from './utils/instruments';
import MusicManager, { MusicManagerSignals } from './utils/musicManager';
import ParticlesManager from './utils/particles';
import { loadResources } from './utils/resources';

enum GameStates {
  Loading,
  Title,
  Play,
  GameOver,
}
export default class GameScene extends Phaser.Scene {
  private camera: Phaser.Cameras.Scene2D.Camera;

  private ship: Ship;
  private invaders: Invader[] = [];
  private invaderScheduler: InvaderScheduler;
  private ui: UI;

  public debugText: Phaser.GameObjects.Text;

  static battleground: Battleground;
  static musicManager: MusicManager;
  static collisionManager: CollisionManager;
  static instruments: Instruments;
  static particles: ParticlesManager;

  private state = GameStates.Loading;

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
    this.ui = new UI(this, this.camera.width, this.camera.height);

    new Background(this, this.camera.width, this.camera.height, 100);

    this.ship = new Ship(this, this.camera.centerX, this.camera.height - 50);
    this.ship.signals.subscribe(ShipSignals.die, (continues: number) =>
      this.onDie(continues)
    );

    this.invaderScheduler = new InvaderScheduler();
    this.invaderScheduler.signals.subscribe(
      InvaderSchedulerSignals.sendInvader,
      () => this.addInvader()
    );

    GameScene.particles = new ParticlesManager(this);

    this.debugText = this.add.text(100, 100, 'DEBUG', {
      fontSize: '30px',
    });
    this.debugText.setDepth(20);
    this.debugText.setAlpha(0);

    // LOADING
    await Promise.all([
      GameScene.musicManager.load,
      GameScene.instruments.load,
    ]);
    this.state = GameStates.Title;
    this.ui.onDoneLoading();

    GameScene.musicManager.signals.subscribe(MusicManagerSignals.beat, () => {
      this.onBeat();
    });
    //this.invaderScheduler.scheduleNextInvader();

    // UI Controls
    const enter = this.input.keyboard.addKey('ENTER');
    enter.on('down', () => this.onPressStart());
  }

  update() {
    this.ship.update();

    if (this.state === GameStates.Play) {
      this.camera.setScroll(
        (this.ship.sprite.x - this.camera.width / 2) * 0.08,
        this.camera.scrollY
      );
    }

    //this.debugText.setText(`${this.invaders.length}`);
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

  async onDie(continues: number) {
    this.camera.shake(0.2);

    this.invaderScheduler.setActive(false);
    while (this.invaders.length > 0) {
      this.destroyInvader(this.invaders[0]);
    }

    if (continues > 0) {
      await yieldTimeout(600);
      this.ship.respawn();
      this.invaderScheduler.setActive(true);
    } else {
      this.state = GameStates.GameOver;
      this.ui.showGameOver(0, 0);
      this.tweens.add({
        targets: [this.camera],
        scrollX: 0,
        duration: 500,
        ease: 'Sine.easeOut',
      });
    }
  }

  private addInvader() {
    let lane = pickLane(
      GameScene.musicManager.bar,
      GameScene.musicManager.beat
    );
    let trials = 0;
    while (!GameScene.battleground.isLaneOpen(lane)) {
      trials++;
      if (trials > 5) {
        return;
      }
      lane = pickLane(GameScene.musicManager.bar, GameScene.musicManager.beat);
    }
    const invader = new Invader(this, lane);
    this.invaders.push(invader);
    GameScene.instruments.playNote(InstrumentType.invader, getLaneNote(lane));
    invader.signals.subscribe(InvaderSignals.invade, (i: Invader) =>
      this.onInvade(i)
    );

    //this.invaderScheduler.scheduleNextInvader();
  }

  private onInvade(invader: Invader) {
    // TODO: lower health or whatever
    this.destroyInvader(invader);
  }

  private destroyInvader(invader: Invader) {
    invader.destroy();
    GameScene.battleground.remove(invader);
    this.invaders = this.invaders.filter((i) => i !== invader);
  }

  private onBeat() {}

  private onPressStart() {
    if (this.state === GameStates.Title || GameStates.GameOver) {
      if (this.state === GameStates.Title) {
        GameScene.musicManager.start();
      }

      // Start game
      this.state = GameStates.Play;
      this.ship.activate();
      this.ui.hideTitle();
      this.invaderScheduler.setActive(true);
    }
  }
}
