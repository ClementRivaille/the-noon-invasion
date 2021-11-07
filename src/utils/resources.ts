import shipSpriteUrl from '../../assets/sprites/ship.png';
import invaderSpriteUrl from '../../assets/sprites/invader.png';
import continueSpriteUrl from '../../assets/sprites/continue.png';

export enum SpritesRes {
  ship = 'ship',
  invader = 'invader',
  continue = 'continue',
}

const spritesUrls = new Map<SpritesRes, string>([
  [SpritesRes.ship, shipSpriteUrl],
  [SpritesRes.invader, invaderSpriteUrl],
  [SpritesRes.continue, continueSpriteUrl],
]);
const spritesDimensions = new Map<
  SpritesRes,
  Phaser.Types.Loader.FileTypes.ImageFrameConfig
>([
  [
    SpritesRes.ship,
    {
      frameWidth: 11,
      frameHeight: 8,
    },
  ],
  [
    SpritesRes.invader,
    {
      frameWidth: 14,
      frameHeight: 13,
    },
  ],
  [
    SpritesRes.continue,
    {
      frameWidth: 11,
      frameHeight: 7,
    },
  ],
]);

export const PIXEL_SCALE = 4.2;

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
