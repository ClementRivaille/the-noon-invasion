import Phaser from 'phaser';
import GameScene from './game';

const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'VGLab 2021',
  version: '2.0',
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: 'app',
  scene: GameScene,
  input: {
    keyboard: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  backgroundColor: '#555511',
  render: { pixelArt: true, antialias: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // `fullscreenTarget` must be defined for phones to not have
    // a small margin during fullscreen.
    fullscreenTarget: 'app',
    expandParent: false,
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

// Expose `_game` to allow debugging, mute button and fullscreen button
window.addEventListener('load', () => {
  (window as any)._game = new Game(GameConfig);
});
