"use client";
import { useDemo } from "@/services/store";
let context: AudioContext | undefined;
const playing = new Set<OscillatorNode>();
export function stopSound() {
  for (const o of playing) {
    try {
      o.stop();
    } catch {}
  }
  playing.clear();
}
export function sound(
  kind:
    | "click"
    | "selection"
    | "swipe"
    | "confirmation"
    | "warning"
    | "success" = "click",
) {
  const p = useDemo.getState().data.preferences;
  if (!p.sound || p.volume <= 0) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const osc = context.createOscillator(),
      gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = {
      click: 440,
      selection: 520,
      swipe: 330,
      confirmation: 660,
      warning: 220,
      success: 784,
    }[kind];
    gain.gain.setValueAtTime(
      Math.min(p.volume, 0.3) * 0.15,
      context.currentTime,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(context.destination);
    playing.add(osc);
    osc.onended = () => {
      playing.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(context.currentTime + 0.14);
  } catch {}
}
