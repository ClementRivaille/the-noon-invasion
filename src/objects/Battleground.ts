const MARGIN = 30;
const NBZONES = 15;

export default class Battleground {
  public borders: Phaser.Physics.Arcade.StaticGroup;
  private localWidth: number;

  constructor(game: Phaser.Scene, width: number, height: number) {
    this.borders = game.physics.add.staticGroup();
    this.borders.add(game.add.zone(0, height / 2, MARGIN * 2, height));
    this.borders.add(game.add.zone(width, height / 2, MARGIN * 2, height));

    this.localWidth = width - 2 * MARGIN;
  }

  getZone(x: number): number {
    if (x < MARGIN) return 0;
    if (x > this.localWidth + MARGIN) return NBZONES - 1;

    const zoneChunk = this.localWidth / NBZONES;
    return Math.floor((x - MARGIN) / zoneChunk);
  }
}
