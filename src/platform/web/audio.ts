import type { AudioCue, AudioPort } from "../../application/audio";

const FREQUENCIES: Readonly<Record<AudioCue, number>> = { place: 440, warning: 196, reward: 660, submit: 523 };

export class WebAudioAdapter implements AudioPort {
  private muted = false;
  private volume = 0.12;

  setMuted(muted: boolean): void { this.muted = muted; }
  setVolume(volume: number): void { this.volume = Math.max(0, Math.min(1, volume)); }
  play(cue: AudioCue): void {
    if (this.muted || this.volume === 0 || typeof AudioContext === "undefined") return;
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = FREQUENCIES[cue];
      gain.gain.value = this.volume;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.06);
      void context.close();
    } catch {
      // Browser autoplay permissions must never block game input.
    }
  }
}
