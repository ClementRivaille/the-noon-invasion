import GameScene from '../game';
import { MusicManagerSignals } from '../utils/musicManager';
import Signal from '../utils/signal';

export enum InvaderSchedulerSignals {
  sendInvader = 'sendInvader',
}

type BeatChances = { note: number; anticipation: number };
const BEAT_PROBS: BeatChances[] = [
  { note: 0.4, anticipation: 0.5 },
  { note: 0.7, anticipation: 0.3 },
  { note: 0.4, anticipation: 0.6 },
  { note: 0.7, anticipation: 0.4 },
  { note: 0.6, anticipation: 0.1 },
  { note: 0.7, anticipation: 0.2 },
  { note: 0.8, anticipation: 0.3 },
  { note: 0.6, anticipation: 0.6 },
];

export default class InvaderScheduler {
  public signals = new Signal<InvaderSchedulerSignals>();

  private active = false;

  constructor() {
    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.beat,
      (beat: number) => this.onBeat(beat)
    );
    GameScene.musicManager.signals.subscribe(
      MusicManagerSignals.triplet,
      (triplet: number) => this.onTriplet(triplet)
    );
  }

  public setActive(value: boolean) {
    this.active = value;
  }

  private onBeat(beat: number) {
    if (!this.active) return;
    const prob = BEAT_PROBS[beat];
    if (Math.random() < prob.note) {
      this.signals.emit(InvaderSchedulerSignals.sendInvader);
    }
  }

  private onTriplet(triplet: number) {
    if (this.active && triplet === 2) {
      const next_beat = (GameScene.musicManager.beat + 1) % 8;
      const prob = BEAT_PROBS[next_beat];
      if (Math.random() < prob.anticipation)
        this.signals.emit(InvaderSchedulerSignals.sendInvader);
    }
  }
}
