import ghostSpriteUrl from '../../assets/sprites/ghost_spritesheet.png';
import invaderSpriteUrl from '../../assets/sprites/invader.png';

export enum SpritesRes {
  ghost = 'ghost',
  invader = 'invader',
}

const spritesUrls = new Map<SpritesRes, string>([
  [SpritesRes.ghost, ghostSpriteUrl],
  [SpritesRes.invader, invaderSpriteUrl],
]);
const spritesDimensions = new Map<
  SpritesRes,
  Phaser.Types.Loader.FileTypes.ImageFrameConfig
>([
  [
    SpritesRes.ghost,
    {
      frameWidth: 15,
      frameHeight: 30,
    },
  ],
  [
    SpritesRes.invader,
    {
      frameWidth: 50,
      frameHeight: 37,
    },
  ],
]);

export enum MusicRes {
  drum_test = 'drum_test',
  bass_test = 'bass_test',
}

export function loadResources(scene: Phaser.Scene) {
  for (const key of spritesUrls.keys()) {
    scene.load.spritesheet(
      key,
      spritesUrls.get(key),
      spritesDimensions.get(key)
    );
  }
}
