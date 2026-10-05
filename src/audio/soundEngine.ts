/**
 * Procedural Web Audio API Sound Engine
 * Generates tactile mechanical keyboard clicks, dynamic footstep cadences,
 * harmonious typing chimes, creature roars, environmental ambience,
 * and a dynamic synthwave chase soundtrack that ramps up with chaser proximity.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Music state
  private musicTimer: number | null = null;
  private musicPlaying: boolean = false;
  private musicStep: number = 0;
  private bpm: number = 118;
  private chaserDangerFactor: number = 0; // 0 to 1

  // Ambience state
  private ambientSource: AudioBufferSourceNode | null = null;

  // Volume settings
  private masterVol: number = 0.8;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.45;
  private ambientVol: number = 0.35;
  private keyboardType: 'mechanical' | 'thock' | 'typewriter' | 'synth' | 'silent' = 'mechanical';

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVol, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.startAmbientNoise();
    } catch {
      // AudioContext may be blocked before user gesture
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Returns true once the AudioContext has been created and is not closed */
  public isReady(): boolean {
    return !!this.ctx && this.ctx.state !== 'closed';
  }

  /** Mute/unmute all output and persist to the master gain */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const target = muted ? 0 : this.masterVol;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Attach one-shot listeners so AudioContext auto-resumes after being
   * suspended by the browser (tab-switch, mobile background).
   * Safe to call multiple times — only attaches once.
   */
  private interactionListenerAttached = false;
  public resumeOnInteraction() {
    if (this.interactionListenerAttached) return;
    this.interactionListenerAttached = true;
    const handler = () => {
      if (this.ctx?.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handler();
    });
  }

  public setVolumes(master: number, sfx: number, music: number, ambient: number) {
    this.masterVol = master;
    this.sfxVol = sfx;
    this.musicVol = music;
    this.ambientVol = ambient;

    if (this.ctx && this.masterGain && this.sfxGain && this.musicGain && this.ambientGain) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(master, t, 0.05);
      this.sfxGain.gain.setTargetAtTime(sfx, t, 0.05);
      this.musicGain.gain.setTargetAtTime(music, t, 0.05);
      this.ambientGain.gain.setTargetAtTime(ambient, t, 0.05);
    }
  }

  public setKeyboardType(type: 'mechanical' | 'thock' | 'typewriter' | 'synth' | 'silent') {
    this.keyboardType = type;
  }

  // --- KEYSTROKE SOUNDS ---
  public playKeyClick(char: string, isCorrect: boolean, streak: number = 0) {
    if (!this.ctx || this.keyboardType === 'silent') return;
    this.resume();

    const t = this.ctx.currentTime;

    if (isCorrect) {
      // Tactile key switch sound based on keyboard profile
      this.playSwitchAcoustics(t);

      // Pitch-scaled pleasant harmonic chime (pentatonic scale ascending with streak)
      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
      const noteIdx = Math.min(streak % pentatonic.length, pentatonic.length - 1);
      const baseFreq = pentatonic[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.keyboardType === 'synth' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.09);
    } else {
      // Error thud
      this.playErrorSound();
    }
  }

  private playSwitchAcoustics(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    if (this.keyboardType === 'mechanical') {
      // Blue/Brown switch: High snap + low bottom out
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 300, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (this.keyboardType === 'thock') {
      // Deep creamy thock switch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (this.keyboardType === 'typewriter') {
      // Crisp metallic strike
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  public playErrorSound() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(95, t + 0.06);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // --- FOOTSTEPS ---
  public playFootstep(speedFactor: number = 1.0) {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 * speedFactor, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.04);

    gain.gain.setValueAtTime(0.06 * Math.min(speedFactor, 1.4), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- JUMP / DODGE ---
  public playJump() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.15);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playSlide() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // --- COMBO & REWARD SOUNDS ---
  public playComboMilestone(comboLevel: number) {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * (1 + comboLevel * 0.1), t + idx * 0.05);

      gain.gain.setValueAtTime(0.1, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.26);
    });
  }

  public playSpeedBoost() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.3);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // --- COUNTDOWN BLIP ---
  public playBlip(freq: number = 440) {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // --- CHASER ROAR / WARNING ---
  public playRoar(category: 'creature' | 'disaster') {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (category === 'creature') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(140, t + 0.2);
      osc.frequency.linearRampToValueAtTime(60, t + 0.7);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    } else {
      // Disaster rumble
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.linearRampToValueAtTime(45, t + 0.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  public playWarning() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(650, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // --- AMBIENCE ---
  private startAmbientNoise() {
    if (!this.ctx || !this.ambientGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Pink noise
        lastOut = data[i];
      }

      this.ambientSource = this.ctx.createBufferSource();
      this.ambientSource.buffer = buffer;
      this.ambientSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);

      this.ambientSource.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientSource.start();
    } catch {
      // Ignore if autoplay blocked
    }
  }

  // --- DYNAMIC PROCEDURAL SYNTHWAVE SOUNDTRACK ---
  public startMusic() {
    if (this.musicPlaying) return;
    this.init();
    this.resume();
    this.musicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public updateChaseDanger(distanceMeters: number) {
    // Distance 100m -> danger 0, Distance 10m -> danger 1
    const danger = Math.max(0, Math.min(1, (60 - distanceMeters) / 50));
    this.chaserDangerFactor = danger;
    this.bpm = 116 + danger * 40; // 116 BPM relaxed up to 156 BPM hyper-chase!
  }

  private scheduleMusicStep() {
    if (!this.musicPlaying || !this.ctx || !this.musicGain) return;

    const t = this.ctx.currentTime;
    const stepDuration = 60 / (this.bpm * 4); // 16th notes

    // Bassline notes in D minor / Cyberpunk scale: D1, F1, G1, A1, C2
    const bassScale = [73.42, 87.31, 98.00, 110.00, 130.81];
    const bassIdx = Math.floor(this.musicStep / 8) % bassScale.length;
    const bassFreq = bassScale[bassIdx];

    // 1. Kick on beats 0, 4, 8, 12
    if (this.musicStep % 4 === 0) {
      this.playSynthKick(t);
    }

    // 2. Snare on beats 4, 12
    if (this.musicStep % 8 === 4) {
      this.playSynthSnare(t);
    }

    // 3. Driving 16th-note synth bass
    if (this.musicStep % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, t);

      filter.type = 'lowpass';
      // Lowpass cutoff opens up as danger escalates!
      const cutoff = 300 + this.chaserDangerFactor * 1400;
      filter.frequency.setValueAtTime(cutoff, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + stepDuration * 1.6);
    }

    // 4. Arpeggiated lead synth when danger > 0.35
    if (this.chaserDangerFactor > 0.35 && this.musicStep % 2 === 1) {
      const arpFreqs = [293.66, 349.23, 440.00, 523.25, 587.33];
      const note = arpFreqs[(this.musicStep * 3) % arpFreqs.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.03 * this.chaserDangerFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + stepDuration + 0.02);
    }

    this.musicStep = (this.musicStep + 1) % 64;

    const delayMs = stepDuration * 1000;
    this.musicTimer = window.setTimeout(() => this.scheduleMusicStep(), delayMs);
  }

  private playSynthKick(t: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  private playSynthSnare(t: number) {
    if (!this.ctx || !this.musicGain) return;

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }
}

export const sound = new SoundEngine();
