import GameScene from '../game';
import { MusicManagerSignals } from '../utils/musicManager';
import Signal from '../utils/signal';

export enum InvaderSchedulerSignals {
  sendInvader = 'sendInvader',
}

export default class InvaderScheduler {
  public signals = new Signal<InvaderSchedulerSignals>();

  private waitBeats = -1;
  private anticipation = false;

  constructor() {
    GameScene.musicManager.signals.subscribe(MusicManagerSignals.beat, () =>
      this.onBeat()
    );
    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.triplet,
      (triplet: number) => this.onTriplet(triplet)
    );
  }

  scheduleNextInvader() {
    this.waitBeats = 1 + Math.floor(Math.random() * 2);
    this.anticipation = Math.random() > 0.5;
  }

  private onBeat() {
    if (this.waitBeats > 0) {
      this.waitBeats -= 1;
      if (this.waitBeats <= 0) {
        this.signals.emit(InvaderSchedulerSignals.sendInvader);
      }
    }
  }

  private onTriplet(triplet: number) {
    if (triplet === 2 && this.anticipation && this.waitBeats === 1) {
      this.waitBeats = 0;
      this.signals.emit(InvaderSchedulerSignals.sendInvader);
    }
  }
}
