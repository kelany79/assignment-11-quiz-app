export class AudioBoard {
  constructor() {
    this.ctx = null;
    this.cues = {
      hit: [
        [523.25, 0.1, 'sine', 0.3, 0],
        [659.25, 0.1, 'sine', 0.3, 0.1],
        [783.99, 0.15, 'sine', 0.3, 0.2],
      ],
      miss: [[200, 0.3, 'sawtooth', 0.2, 0]],
      tick: [[600, 0.1, 'square', 0.2, 0]],
      expire: [
        [300, 0.2, 'sawtooth', 0.3, 0],
        [200, 0.3, 'sawtooth', 0.3, 0.2],
      ],
      finale: [
        [523.25, 0.2, 'sine', 0.3, 0],
        [659.25, 0.2, 'sine', 0.3, 0.15],
        [783.99, 0.2, 'sine', 0.3, 0.3],
        [1046.5, 0.2, 'sine', 0.3, 0.45],
      ],
    };
  }

  arm() {
    const Factory = window.AudioContext || window.webkitAudioContext;
    if (!Factory) return;
    if (!this.ctx) this.ctx = new Factory();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  play(name) {
    const cue = this.cues[name];
    if (!cue || !this.ctx) return;
    cue.forEach(([frequency, duration, shape, volume, delay]) => {
      this.tone(frequency, duration, shape, volume, delay);
    });
  }

  tone(frequency, duration, shape, volume, delay) {
    const start = this.ctx.currentTime + delay;
    const voice = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    voice.type = shape;
    voice.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
    voice.connect(gain);
    gain.connect(this.ctx.destination);
    voice.start(start);
    voice.stop(start + duration);
  }
}
