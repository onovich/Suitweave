import { describe, expect, it } from "vitest";
import { WebAudioAdapter } from "./audio";

describe("WebAudioAdapter", () => {
  it("treats mute and missing browser audio as safe no-ops", () => {
    const adapter = new WebAudioAdapter();
    adapter.setMuted(true);
    expect(() => { adapter.play("reward"); }).not.toThrow();
    adapter.setMuted(false);
    adapter.setVolume(0);
    expect(() => { adapter.play("submit"); }).not.toThrow();
  });
});
