import ghostSpriteUrl from '../assets/sprites/ghost_spritesheet.png';

export default class GameScene extends Phaser.Scene {
  preload() {
    this.load.spritesheet('ghost', ghostSpriteUrl, {
      frameWidth: 15,
      frameHeight: 30,
    });
  }

  create() {
    this.add.rectangle(0, 0, 100, 100, 0xffffff);
    this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'ghost',
      0
    );

    //this.scale.toggleFullscreen();
  }
}
