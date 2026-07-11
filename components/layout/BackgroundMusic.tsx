"use client";

import { useEffect, useRef, useState } from "react";
import { registerBackgroundMusicController } from "@/lib/audio/backgroundMusic";

const MUSIC_SRC = "/audio/wedding.mp3";
const MUSIC_VOLUME = 0.55;

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 5 6.5 9H3v6h3.5L11 19V5Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16 10 4 4m0-4-4 4"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5 6.5 9H3v6h3.5L11 19V5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
      />
    </svg>
  );
}

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const mutedRef = useRef(false);

  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = MUSIC_VOLUME;
    audio.muted = true;

    const playWithSound = () => {
      mutedRef.current = false;
      setMuted(false);
      audio.muted = false;

      const playAttempt = audio.play();
      unlockedRef.current = true;
      setUnlocked(true);

      void playAttempt.catch(() => {});
    };

    const setMutedState = (nextMuted: boolean) => {
      mutedRef.current = nextMuted;
      setMuted(nextMuted);
      audio.muted = nextMuted;

      if (!nextMuted && audio.paused) {
        void audio.play().catch(() => {});
      }
    };

    return registerBackgroundMusicController({
      playWithSound,
      setMuted: setMutedState,
      isUnlocked: () => unlockedRef.current,
    });
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!unlockedRef.current) {
      mutedRef.current = false;
      setMuted(false);
      audio.muted = false;
      void audio.play().catch(() => {});
      unlockedRef.current = true;
      setUnlocked(true);
      return;
    }

    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    audio.muted = nextMuted;

    if (!nextMuted && audio.paused) {
      void audio.play().catch(() => {});
    }
  };

  const showMuted = !unlocked || muted;

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        preload="auto"
        playsInline
        loop
        className="pointer-events-none invisible absolute h-0 w-0"
      />

      <button
        type="button"
        data-bg-music-toggle
        onClick={toggleMute}
        aria-label={showMuted ? "Bật nhạc nền" : "Tắt tiếng nhạc nền"}
        aria-pressed={showMuted}
        title={showMuted ? "Bật nhạc" : "Tắt tiếng"}
        className="fixed right-3 top-[20%] z-[60] flex h-9 w-9 items-center justify-center border border-background/35 bg-primary/80 text-background backdrop-blur-sm transition-[opacity,background-color] duration-300 hover:bg-primary md:right-5"
      >
        <SpeakerIcon muted={showMuted} />
      </button>
    </>
  );
}
