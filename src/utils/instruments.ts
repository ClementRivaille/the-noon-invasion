import { Note, Scale } from '@tonaljs/tonal';
import { Sampler } from 'tone';
import GameScene from '../game';
import { BEAT_LENGTH } from './musicManager';

export enum InstrumentType {
  invader,
  shoot,
  kill,
}

const SCALE = Scale.get('C dorian').notes;

export function getLaneNote(lane: number): string {
  const noteName = SCALE[lane % SCALE.length];
  const octave = 3 + Math.floor(lane / SCALE.length);
  return `${noteName}${octave}`;
}

export function getNoteAround(note: string, interval: number): string {
  const noteName = note.replace(/[0-9]/g, '');
  const octave = Note.octave(note) || 4;
  const index = SCALE.indexOf(noteName);

  let newIndex = index + interval;
  let newOctave = octave;
  if (newIndex < 0) {
    newOctave -= 1;
    newIndex = SCALE.length - newOctave;
  } else if (newIndex >= SCALE.length) {
    newOctave += 1;
    newIndex = newIndex % SCALE.length;
  }
  return `${SCALE[newIndex]}${newOctave}`;
}

export default class Instruments {
  private invaderSampler: Sampler;
  private shootSampler: Sampler;
  private killSampler: Sampler;

  public load: Promise<void[]>;

  constructor() {
    const promises: Promise<void>[] = [];
    promises.push(
      new Promise(
        (resolve) =>
          (this.invaderSampler = new Sampler({
            urls: {
              C3: 'inv_C3.wav',
              F3: 'inv_F3.wav',
              C4: 'inv_C4.wav',
              F4: 'inv_F4.wav',
              C5: 'inv_C5.wav',
            },
            baseUrl: './samples/invader/',
            release: 0.6,
            volume: -2,
            onload: () => resolve(),
          }).toDestination())
      )
    );

    promises.push(
      new Promise(
        (resolve) =>
          (this.shootSampler = new Sampler({
            urls: {
              C3: 'shoot_C3.wav',
              F3: 'shoot_F3.wav',
              C4: 'shoot_C4.wav',
              F4: 'shoot_F4.wav',
              C5: 'shoot_C5.wav',
            },
            baseUrl: './samples/shoot/',
            onload: () => resolve(),
            release: 0.1,
          }).toDestination())
      )
    );

    promises.push(
      new Promise(
        (resolve) =>
          (this.killSampler = new Sampler({
            urls: {
              C3: 'kill_C3.wav',
              F3: 'kill_F3.wav',
              C4: 'kill_C4.wav',
              F4: 'kill_F4.wav',
              C5: 'kill_C5.wav',
            },
            baseUrl: './samples/kill/',
            onload: () => resolve(),
            volume: -4,
          }).toDestination())
      )
    );

    this.load = Promise.all(promises);
  }

  playNote(instrument: InstrumentType, note: string) {
    if (instrument === InstrumentType.invader) {
      this.invaderSampler.releaseAll();
      this.invaderSampler.triggerAttackRelease(
        note,
        BEAT_LENGTH * 0.5,
        GameScene.musicManager.currentTime
      );
    } else if (instrument === InstrumentType.shoot) {
      this.shootSampler.releaseAll();
      this.shootSampler.triggerAttackRelease(
        note,
        BEAT_LENGTH / 2,
        GameScene.musicManager.currentTime
      );
    } else if (instrument === InstrumentType.kill) {
      const interval = Math.random() > 0.5 ? -2 : 2;
      const secondNote = getNoteAround(note, interval);

      this.killSampler.triggerAttack(
        [note, secondNote],
        GameScene.musicManager.currentTime
      );
    }
  }
}
