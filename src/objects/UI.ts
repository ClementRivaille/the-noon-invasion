import { promisifyTween, yieldTimeout } from '../utils/animation';
import { Font, loadFonts } from '../utils/fonts';
import { PIXEL_SCALE, SpritesRes } from '../utils/resources';

const SMALL = 30;
const MEDIUM = 40;
const LARGE = 150;
const UI_SCROLL = 0.6;

const FONT_COLOR = '#ffffff66';

const DEFAULT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: Font.uroob,
  fontSize: `${MEDIUM}px`,
  align: 'left',
  color: FONT_COLOR,
};

export default class UI {
  private loading: Phaser.GameObjects.Text;

  private title: Phaser.GameObjects.Text;
  private pressStart: Phaser.GameObjects.Text;

  private score: Phaser.GameObjects.Text;
  private continues: Phaser.GameObjects.Sprite[] = [];
  private scoreTween?: Phaser.Tweens.Tween;

  private gameOver: Phaser.GameObjects.Text;
  private scores: Phaser.GameObjects.Text;

  private instructions: Phaser.GameObjects.Text;

  constructor(private game: Phaser.Scene, width: number, height: number) {
    this.loading = game.add.text(width / 2, height / 2, 'Loading', {
      ...DEFAULT_STYLE,
      align: 'left',
      fontFamily: 'sans-serif',
    });

    this.init(width, height);
  }

  onDoneLoading() {
    this.pressStart.setText('Press Enter');
  }

  hideTitle() {
    this.game.tweens.add({
      targets: [this.title, this.pressStart, this.gameOver, this.scores],
      alpha: 0,
      duration: 150,
      ease: 'Sine.easeIn',
    });
    this.score.setText('000000');
    this.score.setAlpha(0.3);
    for (const sprite of this.continues) {
      sprite.setAlpha(0.2);
    }
  }

  showGameOver(score: number, best: number) {
    this.score.setAlpha(0);
    this.gameOver.setAlpha(1);
    this.scores.setAlpha(1);
    this.scores.setText(
      `Scores:\nLast - ${this.formatScore(score)}\nBest - ${this.formatScore(
        best
      )}`
    );
    this.title.setAlpha(0.4);
    this.title.setScale(0.7);
    this.pressStart.setText('Press Enter to restart');
    this.pressStart.setAlpha(1);
  }

  updateContinues(continuesLeft: number) {
    for (let i = 0; i < this.continues.length; i++) {
      this.continues[i].setAlpha(i < continuesLeft ? 0.2 : 0);
    }
  }

  public updateScore(score: number, increase?: boolean) {
    this.score.setText(this.formatScore(score));

    if (!this.scoreTween || !this.scoreTween.isPlaying()) {
      if (increase) {
        this.scoreTween = this.game.tweens.add({
          targets: [this.score],
          scale: 1.1,
          yoyo: true,
          duration: 80,
          ease: 'Sine.easeOut',
        });
      } else if (increase === false) {
        this.scoreTween = this.game.tweens.add({
          targets: [this.score],
          x: this.score.x - 10,
          yoyo: true,
          duration: 40,
          loop: 3,
        });
      }
    }
  }

  async showMultiplier(x: number, y: number) {
    const text = this.game.add.text(x, y, 'x2', {
      ...DEFAULT_STYLE,
      align: 'center',
      fontSize: `${SMALL}px`,
    });
    const tween = this.game.tweens.add({
      targets: [text],
      alpha: 0,
      y: y - 50,
      ease: 'Sine.easeIn',
      duration: 600,
    });
    await promisifyTween(tween);
    text.destroy();
  }

  async showInstructions() {
    // this.instructions.setPosition(x, y);
    this.game.tweens.add({
      targets: [this.instructions],
      alpha: 1,
      duration: 200,
      ease: 'Sine.easeOut',
    });
    await yieldTimeout(4000);
    this.game.tweens.add({
      targets: [this.instructions],
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeOut',
    });
  }

  private async init(width: number, height: number) {
    await loadFonts();
    this.loading.setAlpha(0);

    // Title Screen
    this.title = this.game.add.text(50, 50, 'THE NOON\nINVASION', {
      fontFamily: Font.uroob,
      fontSize: '250px',
      align: 'right',
      color: FONT_COLOR,
    });
    this.title.setOrigin(0);
    this.title.setLineSpacing(-50);
    this.pressStart = this.game.add.text(
      180,
      height - 100,
      'Loading…',
      DEFAULT_STYLE
    );
    this.pressStart.setOrigin(0, 0.5);

    this.instructions = this.game.add.text(
      width / 2,
      height / 2,
      'Move with Left and Right\nHold Up or Down to shoot',
      {
        ...DEFAULT_STYLE,
        align: 'center',
      }
    );
    this.instructions.setAlpha(0);
    this.instructions.setOrigin(0.5, 0.5);

    // Score
    this.score = this.game.add.text(width - 20, height - 10, '000000', {
      ...DEFAULT_STYLE,
      fontSize: '80px',
      align: 'right',
      fixedWidth: 200,
    });
    this.score.setAlpha(0);
    this.score.setOrigin(1, 1);
    this.score.scrollFactorX = UI_SCROLL;
    // Ingame UI
    for (let x = 0; x < 3; x++) {
      const continueSprite = this.game.add.sprite(
        40 + x * 40,
        height - 50,
        SpritesRes.continue
      );
      continueSprite.setScale(PIXEL_SCALE / 2);
      continueSprite.scrollFactorX = UI_SCROLL;
      continueSprite.setAlpha(0);
      this.continues.push(continueSprite);
    }

    // Game Over screen
    this.gameOver = this.game.add.text(width / 2, 300, 'GAME OVER', {
      fontFamily: Font.uroob,
      fontSize: `${LARGE}px`,
      align: 'center',
      color: FONT_COLOR,
    });
    this.gameOver.setAlpha(0);
    this.scores = this.game.add.text(
      width / 2,
      height - 240,
      'Scores:\nLast - 000\nBest - 000',
      {
        ...DEFAULT_STYLE,
      }
    );
    this.scores.setAlpha(0);
  }

  private formatScore(score: number) {
    let textScore = `${score}`;
    while (textScore.length < 6) {
      textScore = `0${textScore}`;
    }
    return textScore;
  }
}
