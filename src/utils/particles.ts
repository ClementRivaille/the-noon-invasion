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

  getLargeEmitter() {
    return this.dotParticles.createEmitter({
      lifespan: { min: 400, max: 1000 },
      tint: 0xdc4c49,
      scale: { start: 1.2, end: 0 },
      gravityY: 0,
      speed: { min: 600, max: 800 },
      frequency: -1,
    });
  }
}
