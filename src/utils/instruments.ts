import { Note, Scale } from '@tonaljs/tonal';
import { FeedbackDelay, Sampler } from 'tone';
import GameScene from '../game';
import { BEAT_LENGTH } from './musicManager';

export enum InstrumentType {
  invader,
  shoot,
  kill,
  guitar,
  square,
  string_pad,
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
  private guitarSampler: Sampler;
  private squareSampler: Sampler;
  private stringPadSampler: Sampler;

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
            volume: 1,
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

    promises.push(
      new Promise((resolve) => {
        this.guitarSampler = new Sampler({
          urls: {
            C3: 'C3.wav',
            C4: 'C4.wav',
            E2: 'E2.wav',
            E3: 'E3.wav',
            'G#2': 'Gs2.wav',
            'G#3': 'Gs3.wav',
          },
          release: 1.0,
          baseUrl: './samples/guitar/',
          volume: -9,
          onload: () => resolve(),
        }).toDestination();
      })
    );
    promises.push(
      new Promise((resolve) => {
        const delay = new FeedbackDelay({
          delayTime: 0.2,
          wet: 0.2,
          feedback: 0.1,
        }).toDestination();
        this.squareSampler = new Sampler({
          urls: {
            'D#4': 'square-Ds.wav',
          },
          baseUrl: './samples/',
          release: 0.2,
          volume: -9,
          onload: () => resolve(),
        }).connect(delay);
      })
    );
    promises.push(
      new Promise((resolve) => {
        this.stringPadSampler = new Sampler({
          urls: {
            C5: 'C5.wav',
            D4: 'D4.wav',
            G4: 'G4.wav',
          },
          baseUrl: './samples/string_pad/',
          volume: 8,
          release: 0.6,
          onload: () => resolve(),
        }).toDestination();
      })
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
    } else if (instrument == InstrumentType.guitar) {
      const lowerNote = note.replace(
        /[0-9]/g,
        `${2 + Math.floor(Math.random())}`
      );
      this.guitarSampler.triggerAttackRelease(
        lowerNote,
        BEAT_LENGTH * 2,
        GameScene.musicManager.currentTime
      );
    } else if (instrument == InstrumentType.square) {
      const higherNote = note.replace(/[0-9]/g, '5');
      this.squareSampler.triggerAttackRelease(
        higherNote,
        BEAT_LENGTH / 2,
        GameScene.musicManager.currentTime
      );
    } else if (instrument == InstrumentType.string_pad) {
      this.stringPadSampler.releaseAll();
      this.stringPadSampler.triggerAttackRelease(
        note,
        BEAT_LENGTH * 1.5,
        GameScene.musicManager.currentTime
      );
    }
  }
}
