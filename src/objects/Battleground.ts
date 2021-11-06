const MARGIN = 30;
export const NB_LANES = 15;

export default class Battleground {
  public borders: Phaser.Physics.Arcade.StaticGroup;
  public floor: Phaser.GameObjects.Zone;
  public roof: Phaser.GameObjects.Zone;

  private localWidth: number;
  private laneWidth;

  constructor(game: Phaser.Scene, width: number, height: number) {
    this.borders = game.physics.add.staticGroup();
    this.borders.add(game.add.zone(0, height / 2, MARGIN * 2, height));
    this.borders.add(game.add.zone(width, height / 2, MARGIN * 2, height));

    this.localWidth = width - 2 * MARGIN;
    this.laneWidth = this.localWidth / NB_LANES;

    this.floor = game.add.zone(width / 2, height, width, 20);
    game.physics.world.enable(this.floor, Phaser.Physics.Arcade.STATIC_BODY);
    this.roof = game.add.zone(width / 2, 20, -50, 20);
    game.physics.world.enable(this.roof, Phaser.Physics.Arcade.STATIC_BODY);
  }

  getLane(x: number): number {
    if (x < MARGIN) return 0;
    if (x > this.localWidth + MARGIN) return NB_LANES - 1;

    return Math.floor((x - MARGIN) / this.laneWidth);
  }

  getLaneCoord(lane: number) {
    return (
      MARGIN +
      this.laneWidth * Math.min(lane, NB_LANES - 1) +
      this.laneWidth / 2
    );
  }
}
