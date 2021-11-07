import Invader from './Invader';

const MARGIN = 30;
export const NB_LANES = 15;

export default class Battleground {
  public borders: Phaser.Physics.Arcade.StaticGroup;
  public floor: Phaser.GameObjects.Zone;
  public roof: Phaser.GameObjects.Zone;

  private localWidth: number;
  private laneWidth;

  private lanesContent: Invader[][];

  constructor(game: Phaser.Scene, width: number, height: number) {
    this.lanesContent = [...new Array(NB_LANES)].map(() => []);

    this.borders = game.physics.add.staticGroup();
    this.borders.add(game.add.zone(-100, height, 10, 100));
    this.borders.add(game.add.zone(width + 100, height, 10, 100));
    this.floor = game.add.zone(width / 2, height + 50, width, 20);

    this.localWidth = width - 2 * MARGIN;
    this.laneWidth = this.localWidth / NB_LANES;

    game.physics.world.enable(this.floor, Phaser.Physics.Arcade.STATIC_BODY);
    this.roof = game.add.zone(width / 2, -50, width, 20);
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

  addToLane(lane: number, invader: Invader) {
    this.lanesContent[lane].push(invader);
  }
  remove(invader: Invader) {
    this.lanesContent[invader.lane] = this.lanesContent[invader.lane].filter(
      (i) => i !== invader
    );
  }

  isLaneOpen(laneIdx: number) {
    const lane = this.lanesContent[laneIdx];

    return lane.length < 4 && !lane.some((invader) => invader.y < 90);
  }
}
