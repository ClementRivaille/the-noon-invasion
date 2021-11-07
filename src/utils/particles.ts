import { INVADER_COLOR } from '../objects/Invader';

export enum Particles {
  dot = 'dot',
}

export default class ParticlesManager {
  private dotParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  constructor(game: Phaser.Scene) {
    // Particles
    const rayParticle = game.make.graphics({ x: 0, y: 0, add: false });
    rayParticle.fillStyle(0xffffff);
    rayParticle.fillRect(0, 0, 16, 16);
    rayParticle.generateTexture(Particles.dot, 16, 16);

    this.dotParticles = game.add.particles(Particles.dot);
  }

  getSmallEmitter() {
    const color = Phaser.Display.Color.ValueToColor(INVADER_COLOR);
    color.lighten(30);
    return this.dotParticles.createEmitter({
      lifespan: 400,
      tint: color.color,
      scale: { start: 0.7, end: 0 },
      gravityY: 0,
      speed: { min: 200, max: 250 },
      frequency: -1,
    });
  }
}
