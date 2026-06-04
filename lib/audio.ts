// Web Audio API Procedural Cosmic Sound Synthesizer
// Generates deep space hums, pulses, and interactive sounds entirely in code.

class CosmicAudioManager {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  
  // Drone Oscillators
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  
  private isMuted: boolean = false;
  private isStarted: boolean = false;

  init() {
    if (this.ctx) return;
    
    // Create Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Master volume gain
    this.primaryGain = this.ctx.createGain();
    this.primaryGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.primaryGain.connect(this.ctx.destination);
  }

  startAmbientHum() {
    this.init();
    if (!this.ctx || !this.primaryGain || this.isStarted) return;

    this.isStarted = true;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // 1. Create a Biquad Filter to make the sound warm and deep
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.setValueAtTime(90, t);
    this.filterNode.Q.setValueAtTime(3, t);

    // 2. Detuned Dual Oscillators for a rich chorus drone
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = "sawtooth";
    this.droneOsc1.frequency.setValueAtTime(55, t); // A1 note

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = "triangle";
    this.droneOsc2.frequency.setValueAtTime(55.3, t); // Slightly detuned

    // 3. Drone Gain Node
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, t); // Start silent
    this.droneGain.gain.linearRampToValueAtTime(0.12, t + 4); // Fade in over 4s

    // Connect nodes
    this.droneOsc1.connect(this.filterNode);
    this.droneOsc2.connect(this.filterNode);
    this.filterNode.connect(this.droneGain);
    this.droneGain.connect(this.primaryGain);

    // Start oscillators
    this.droneOsc1.start(t);
    this.droneOsc2.start(t);

    // 4. Filter modulation (LFO) for drifting space effect
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, t); // Very slow cycle (12 seconds)
    lfoGain.gain.setValueAtTime(25, t); // Modulate filter by 25Hz

    lfo.connect(lfoGain);
    lfoGain.connect(this.filterNode.frequency);
    lfo.start(t);
  }

  playHoverSound() {
    if (!this.ctx || !this.primaryGain || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime;
    
    // Quick sine wave chime representing a golden spark
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, t); // A4
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // Upward sweep

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); // Fade out

    // Delay/Reverb Mock Node
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.1, t);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.25, t);

    osc.connect(gain);
    gain.connect(this.primaryGain);

    // Delay loop
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(this.primaryGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  playClickSound() {
    if (!this.ctx || !this.primaryGain || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime;

    // Deep, heavy cosmic resonance
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(80, t);
    subOsc.frequency.linearRampToValueAtTime(30, t + 0.8); // Deep sub sweep

    subGain.gain.setValueAtTime(0.25, t);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);

    // Metallic chime sweep
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chimeOsc.type = "triangle";
    chimeOsc.frequency.setValueAtTime(220, t);
    chimeOsc.frequency.exponentialRampToValueAtTime(1100, t + 0.45);

    chimeGain.gain.setValueAtTime(0.04, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.primaryGain);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.primaryGain);

    subOsc.start(t);
    subOsc.stop(t + 1);

    chimeOsc.start(t);
    chimeOsc.stop(t + 0.55);

    // Briefly modulate ambient filter frequency (like a blast wave)
    if (this.filterNode) {
      this.filterNode.frequency.cancelScheduledValues(t);
      this.filterNode.frequency.setValueAtTime(90, t);
      this.filterNode.frequency.exponentialRampToValueAtTime(450, t + 0.25);
      this.filterNode.frequency.exponentialRampToValueAtTime(90, t + 1.2);
    }
  }

  playWarpSound() {
    if (!this.ctx || !this.primaryGain || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime;
    
    // Wind up engine sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 1.2); // Acceleration sweep
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(1000, t + 1.2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.primaryGain);
    
    osc.start(t);
    osc.stop(t + 1.5);
  }

  playWarpOutSound() {
    if (!this.ctx || !this.primaryGain || this.isMuted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.8); // Descending sweep
    
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    
    osc.connect(gain);
    gain.connect(this.primaryGain);
    
    osc.start(t);
    osc.stop(t + 0.9);
  }

  speakNarrative(text: string) {
    if (this.isMuted || typeof window === "undefined" || !window.speechSynthesis) return;
    
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Look for a deep male/robotic English voice
      const maleVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Male") || v.name.includes("Google") || v.name.includes("Microsoft"))
      );
      if (maleVoice) utterance.voice = maleVoice;

      utterance.pitch = 0.75;
      utterance.rate = 0.82;
      utterance.volume = 0.75;
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.primaryGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.3;
      this.primaryGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.2);
    }
    if (this.isMuted && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }
}

// Export single instance for application-wide audio control
export const audio = new CosmicAudioManager();
