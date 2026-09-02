"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambient space soundscape — synthesized live with WebAudio (no audio files).
 * Deep filtered-noise rumble + a faint low drone. Off by default (browser
 * autoplay rules require a user gesture anyway).
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);

  async function toggle() {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      gainRef.current = master;

      // brown-noise rumble
      const len = ctx.sampleRate * 4;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 120;
      noise.connect(lp);
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.5;
      lp.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      // faint drone (two slightly detuned lows = slow beat)
      [55, 55.4].forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        const og = ctx.createGain();
        og.gain.value = 0.05;
        osc.connect(og);
        og.connect(master);
        osc.start();
      });

      // gentle shimmer LFO on the master
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();
    }

    const ctx = ctxRef.current!;
    const master = gainRef.current!;
    if (on) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => ctx.suspend(), 450);
      setOn(false);
    } else {
      await ctx.resume();
      master.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 1.2);
      setOn(true);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      data-cursor
      className="fixed bottom-5 right-5 z-40 flex h-11 items-center gap-2 rounded-full border border-white/15 bg-ink/70 px-4 text-xs font-medium text-slate-300 backdrop-blur-lg transition hover:border-accent/50 hover:text-white"
    >
      <span className="relative flex h-2 w-2">
        {on && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${on ? "bg-accent" : "bg-slate-600"}`} />
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
