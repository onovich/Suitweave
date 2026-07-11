export type AudioCue = "place" | "warning" | "reward" | "submit";

export interface AudioPort {
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;
  play(cue: AudioCue): void;
}
