import { Orchestre } from 'orchestre-js';
import { MusicRes } from './resources';
import drumTestUrl from '../../assets/music/drum_test.wav';
import bassTestUrl from '../../assets/music/bass_test.wav';
import Signal from './signal';

export enum MusicManagerSignals {
  beat = 'beat',
  bar = 'bar',
  triplet = 'stripler',
}

const BPM = 90;
const BAR_SIGNATURE = 6;
export const BEAT_LENGTH = 60 / BPM;

export default class MusicManager {
  private orchestre: Orchestre;
  private context: AudioContext;

  public signals = new Signal<MusicManagerSignals>();
  public load: Promise<void>;

  public triplet = 0;
  public beat = 0;
  public bar = 0;

  constructor() {
    this.context = new AudioContext();
    this.orchestre = new Orchestre(BPM * BAR_SIGNATURE, this.context);
    this.load = this.orchestre.addPlayers([
      {
        name: MusicRes.drum_test,
        url: drumTestUrl,
        length: 8 * BAR_SIGNATURE,
        absolute: true,
      },
      {
        name: MusicRes.bass_test,
        url: bassTestUrl,
        length: 8 * 4 * BAR_SIGNATURE,
        absolute: true,
      },
    ]);
  }

  start() {
    this.orchestre.start([MusicRes.drum_test, MusicRes.bass_test]);
    this.orchestre.addListener(() => this.onTriplet(), 1, {
      absolute: true,
    });
    this.orchestre.addListener(() => this.onBeat(), 3, {
      absolute: true,
    });
    this.orchestre.addListener(() => this.onBar(), BAR_SIGNATURE * 4, {
      absolute: true,
    });
  }

  get currentTime() {
    return this.context.currentTime;
  }

  get metronome() {
    return this.orchestre.metronome;
  }

  private onTriplet() {
    this.triplet = (this.triplet + 1) % 3;
    this.signals.emit(MusicManagerSignals.triplet, this.triplet);
  }
  private onBeat() {
    this.beat = (this.beat + 1) % 8;
    this.signals.emit(MusicManagerSignals.beat, this.beat);
  }
  private onBar() {
    this.bar = (this.bar + 1) % 8;
    this.signals.emit(MusicManagerSignals.bar, this.bar);
  }
}
