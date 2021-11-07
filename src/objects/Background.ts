import { NB_LANES } from './Battleground';

const TOP_COLOR = 0x0e2c46;
const BOTTOM_COLOR = 0x578693;
const GRADIENT_MARGIN = 100;

export default class Background {
  private graphics: Phaser.GameObjects.Graphics;
  constructor(
    game: Phaser.Scene,
    width: number,
    height: number,
    margin: number
  ) {
    this.graphics = game.add.graphics();
    this.graphics.setDepth(-5);

    this.graphics.fillGradientStyle(
      TOP_COLOR,
      TOP_COLOR,
      BOTTOM_COLOR,
      BOTTOM_COLOR
    );
    this.graphics.fillRect(
      -margin,
      -GRADIENT_MARGIN,
      width + 2 * margin,
      height + 2 * GRADIENT_MARGIN
    );

    // Lines
    const nbLines = NB_LANES - 2;
    const lineWidth = width / nbLines;
    for (let i = -margin; i < width; i += lineWidth * 2) {
      const rect = game.add.rectangle(i, 0, lineWidth, height, 0x000000, 0.15);
      rect.setOrigin(0, 0);
      rect.setScrollFactor(0.5);
    }
  }
}
