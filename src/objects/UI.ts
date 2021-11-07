import { Font, loadFonts } from '../utils/fonts';

const SMALL = 12;
const MEDIUM = 40;
const LARGE = 150;

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

  private gameOver: Phaser.GameObjects.Text;
  private scores: Phaser.GameObjects.Text;

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
  }

  showGameOver(score: number, best: number) {
    this.score.setAlpha(0);
    this.gameOver.setAlpha(1);
    this.scores.setAlpha(1);
    this.scores.setText(`Scores:\nLast - ${score}\nBest - ${best}`);
  }

  private async init(width: number, height: number) {
    await loadFonts();
    this.loading.setAlpha(0);

    // Title Screen
    this.title = this.game.add.text(50, 50, 'THE NOON\n INVASION', {
      fontFamily: Font.uroob,
      fontSize: '250px',
      align: 'left',
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

    // Score
    this.score = this.game.add.text(width - 20, height - 10, '000000', {
      ...DEFAULT_STYLE,
      fontSize: '80px',
      align: 'right',
    });
    this.score.setAlpha(0);
    this.score.setOrigin(1, 1);
    this.score.setScrollFactor(0.6);

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
      height - 200,
      'Scores:\nLast - 000\nBest - 000',
      {
        ...DEFAULT_STYLE,
      }
    );
    this.scores.setAlpha(0);
  }
}
