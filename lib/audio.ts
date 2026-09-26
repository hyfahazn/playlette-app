// Web Audio API sound generator with Metallic Ping / Ratchet Tick synthesis

class SoundFX {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Metallic ratchet tick with high Q resonance ping
  playTick(pitchModifier = 1) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp metallic ring
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400 * pitchModifier, t);
      osc.frequency.exponentialRampToValueAtTime(320 * pitchModifier, t + 0.035);

      // High resonance bandpass for steel ping
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200 * pitchModifier, t);
      filter.Q.setValueAtTime(18, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Audio playback restrictions fallback gracefully
    }
  }

  // Polished chrome lever actuation sound
  playLever() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Low mechanical clunk + high metallic ping
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(120, t);
      osc1.frequency.exponentialRampToValueAtTime(60, t + 0.12);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1850, t);
      osc2.frequency.exponentialRampToValueAtTime(900, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.14);
      osc2.stop(t + 0.14);
    } catch {
      // Fallback
    }
  }

  // Metallic win chime / chime harmonic resonance when wheel lands
  playWin() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Shimmering silver bell harmonics
      const freqs = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, t + idx * 0.07);

        gain.gain.setValueAtTime(0.1, t + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.07 + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.6);
      });
    } catch {
      // Fallback
    }
  }
}

export const soundFX = new SoundFX();
