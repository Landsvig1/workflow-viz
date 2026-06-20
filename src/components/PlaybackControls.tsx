"use client";

import clsx from "clsx";
import type { PlaybackStatus } from "@/lib/playback";

interface PlaybackControlsProps {
  status: PlaybackStatus;
  index: number;
  total: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}

const btn =
  "inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/60";

export function PlaybackControls({
  status,
  index,
  total,
  onPlay,
  onPause,
  onStep,
  onReset,
}: PlaybackControlsProps) {
  const isRunning = status === "running";
  const atStart = status === "idle";

  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-[#080814]/85 backdrop-blur-xl px-2 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {isRunning ? (
        <button onClick={onPause} className={btn} aria-label="Pause" title="Pause">
          ⏸
        </button>
      ) : (
        <button
          onClick={onPlay}
          className={btn}
          aria-label="Afspil"
          title="Afspil"
        >
          ▶
        </button>
      )}

      <button
        onClick={onStep}
        className={btn}
        aria-label="Næste trin"
        title="Næste trin"
        disabled={status === "done"}
      >
        ⏭
      </button>

      <button
        onClick={onReset}
        className={btn}
        aria-label="Nulstil"
        title="Nulstil"
        disabled={atStart}
      >
        ⟲
      </button>

      <div className="mx-1 h-4 w-px bg-white/10" />

      <span
        className={clsx(
          "text-[11px] font-mono tabular-nums pr-1.5",
          status === "done" ? "text-emerald-400/80" : "text-white/40"
        )}
      >
        {atStart ? `${total} trin` : `Trin ${index + 1} / ${total}`}
      </span>
    </div>
  );
}
