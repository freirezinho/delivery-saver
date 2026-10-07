/**
 * High-fidelity acoustic cash chime synthesis using Web Audio API.
 * Designed with physical acoustic resonance: a soft tactile sub-bass tap,
 * followed by a warm, harmonic major bell resonance filtered for smoothness.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved mute preference
    const saved = localStorage.getItem('delivery_saver_muted');
    this.isMuted = saved === 'true';
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('delivery_saver_muted', muted ? 'true' : 'false');
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays the signature Cash Bank chime.
   * Warm, tactile, and deeply satisfying.
   */
  public playCashChime() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, now);
      masterGain.connect(this.ctx.destination);

      // Low-pass filter to give warmth and remove harsh digital highs
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3400, now);
      filter.Q.setValueAtTime(0.7, now);
      filter.connect(masterGain);

      // Stage 1: Tactile sub-bass thud (gives physical weight to the button click)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      subGain.gain.setValueAtTime(0.22, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.08);

      // Stage 2: Warm Harmonic Chime (Golden Chord: D5, A5, D6 with rich detune)
      // Chord frequencies: D5 (587.33), F#5 (739.99), A5 (880.00), D6 (1174.66)
      const notes = [
        { freq: 587.33, delay: 0.00, gain: 0.16, duration: 0.55 },
        { freq: 739.99, delay: 0.04, gain: 0.14, duration: 0.60 },
        { freq: 880.00, delay: 0.08, gain: 0.18, duration: 0.65 },
        { freq: 1174.66, delay: 0.12, gain: 0.15, duration: 0.70 }
      ];

      notes.forEach((note) => {
        if (!this.ctx) return;
        const startTime = now + note.delay;

        // Dual oscillators for natural chorused resonance
        [-3, 3].forEach((detuneCents) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          osc.type = 'triangle'; // triangle has warmer odd harmonics than sine
          osc.frequency.setValueAtTime(note.freq, startTime);
          osc.detune.setValueAtTime(detuneCents, startTime);

          // Envelope: instant soft attack, gentle exponential decay
          noteGain.gain.setValueAtTime(0, startTime);
          noteGain.gain.linearRampToValueAtTime(note.gain * 0.5, startTime + 0.015);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.duration);

          osc.connect(noteGain);
          noteGain.connect(filter);

          osc.start(startTime);
          osc.stop(startTime + note.duration + 0.05);
        });
      });
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
