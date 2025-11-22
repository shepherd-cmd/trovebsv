import { Howl } from 'howler';

let soundsEnabled = true;

// Preload all sounds
const sounds = {
  find: new Howl({
    src: ['/sounds/creaky-door.mp3'],
    volume: 0.3,
    preload: true,
  }),
  scan: new Howl({
    src: ['/sounds/camera-shutter.mp3'],
    volume: 0.3,
    preload: true,
  }),
  own: new Howl({
    src: ['/sounds/diamond-ting.mp3'],
    volume: 0.3,
    preload: true,
  }),
};

export const playStepSound = (step: number) => {
  if (!soundsEnabled) return;
  
  const soundMap: { [key: number]: Howl } = {
    1: sounds.find,
    2: sounds.scan,
    3: sounds.own,
  };
  
  const sound = soundMap[step];
  if (sound) {
    sound.stop(); // Stop if already playing
    sound.play();
  }
};

export const toggleSounds = () => {
  soundsEnabled = !soundsEnabled;
  return soundsEnabled;
};

export const areSoundsEnabled = () => soundsEnabled;
