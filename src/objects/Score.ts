import Signal from '../utils/signal';

export enum ScoreSignals {
  updateScore = 'updateScore',
}

const SAVE_KEY = `the_noon_invaders_score`;

export default class Score {
  public signals = new Signal<ScoreSignals>();
  public best = 0;

  constructor() {
    try {
      const savedScore = localStorage.getItem(SAVE_KEY);
      if (savedScore && !!parseInt(savedScore, 10)) {
        this.best = parseInt(savedScore);
      }
    } catch (e) {
      console.warn('Will not be able to save score');
    }
  }

  private value = 0;

  reset() {
    this.value = 0;
    this.signals.emit(ScoreSignals.updateScore, 0);
  }

  increase(bonus = false) {
    this.value += 3 * (bonus ? 2 : 1);
    this.signals.emit(ScoreSignals.updateScore, this.value, true);
  }

  decrease() {
    this.value = Math.max(0, this.value - 2);
    this.signals.emit(ScoreSignals.updateScore, this.value, false);
  }

  validate() {
    if (this.value > this.best) {
      this.best = this.value;
      try {
        localStorage.setItem(SAVE_KEY, `${this.value}`);
      } catch (e) {
        console.warn('Unable to save best score!');
      }
    }
    return this.value;
  }
}
