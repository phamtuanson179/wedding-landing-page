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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const unlockedRef = useRef(false);
  const mutedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const playRequestedRef = useRef(false);
  const wasPlayingBeforeHideRef = useRef(false);

  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Clear any potential system MediaSession so iOS never registers Now Playing / Dynamic Island
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      try {
        navigator.mediaSession.playbackState = "none";
      } catch {
        // ignore
      }
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = MUSIC_VOLUME;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    let isDisposed = false;

    const startSource = (buffer: AudioBuffer) => {
      if (isDisposed || !audioCtxRef.current || !gainRef.current) {
        return;
      }
      if (sourceRef.current) {
        return;
      }

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainRef.current);
      source.start(0);
      sourceRef.current = source;
      isPlayingRef.current = true;
    };

    // Pre-fetch & decode background audio into memory
    fetch(MUSIC_SRC)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        if (isDisposed || !audioCtxRef.current) return;
        return new Promise<AudioBuffer>((resolve, reject) => {
          const promise = audioCtxRef.current?.decodeAudioData(
            arrayBuffer,
            (decoded) => resolve(decoded),
            (err) => reject(err),
          );
          if (promise && typeof promise.then === "function") {
            promise.then(resolve).catch(reject);
          }
        });
      })
      .then((decodedBuffer) => {
        if (isDisposed || !decodedBuffer) return;
        bufferRef.current = decodedBuffer;
        if (playRequestedRef.current && !mutedRef.current) {
          startSource(decodedBuffer);
        }
      })
      .catch((err) => {
        console.warn("Failed to load background audio via Web Audio API:", err);
      });

    const playWithSound = () => {
      unlockedRef.current = true;
      setUnlocked(true);
      mutedRef.current = false;
      setMuted(false);
      playRequestedRef.current = true;

      const currentCtx = audioCtxRef.current;
      if (!currentCtx) {
        return;
      }

      if (currentCtx.state === "suspended") {
        void currentCtx.resume().catch(() => {});
      }

      if (gainRef.current) {
        gainRef.current.gain.setValueAtTime(MUSIC_VOLUME, currentCtx.currentTime);
      }

      if (bufferRef.current && !sourceRef.current) {
        startSource(bufferRef.current);
      }
    };

    const setMutedState = (nextMuted: boolean) => {
      mutedRef.current = nextMuted;
      setMuted(nextMuted);

      const currentCtx = audioCtxRef.current;
      const currentGain = gainRef.current;
      if (!currentCtx || !currentGain) {
        return;
      }

      if (nextMuted) {
        currentGain.gain.setValueAtTime(0, currentCtx.currentTime);
        void currentCtx.suspend().catch(() => {});
      } else {
        currentGain.gain.setValueAtTime(MUSIC_VOLUME, currentCtx.currentTime);
        void currentCtx.resume().catch(() => {});
        if (bufferRef.current && !sourceRef.current) {
          startSource(bufferRef.current);
        }
      }
    };

    const handleVisibilityChange = () => {
      const currentCtx = audioCtxRef.current;
      if (!currentCtx) {
        return;
      }

      if (document.hidden || document.visibilityState === "hidden") {
        if (isPlayingRef.current && !mutedRef.current && unlockedRef.current) {
          wasPlayingBeforeHideRef.current = true;
        }
        void currentCtx.suspend().catch(() => {});
      } else if (document.visibilityState === "visible") {
        if (
          wasPlayingBeforeHideRef.current &&
          !mutedRef.current &&
          unlockedRef.current
        ) {
          void currentCtx.resume().catch(() => {});
        }
        wasPlayingBeforeHideRef.current = false;
      }
    };

    const handlePageHide = () => {
      const currentCtx = audioCtxRef.current;
      if (!currentCtx) {
        return;
      }

      if (isPlayingRef.current && !mutedRef.current && unlockedRef.current) {
        wasPlayingBeforeHideRef.current = true;
      }
      void currentCtx.suspend().catch(() => {});
    };

    const handlePageShow = () => {
      const currentCtx = audioCtxRef.current;
      if (!currentCtx) {
        return;
      }

      if (
        !document.hidden &&
        wasPlayingBeforeHideRef.current &&
        !mutedRef.current &&
        unlockedRef.current
      ) {
        void currentCtx.resume().catch(() => {});
      }
      wasPlayingBeforeHideRef.current = false;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("freeze", handlePageHide);

    const unregister = registerBackgroundMusicController({
      playWithSound,
      setMuted: setMutedState,
      isUnlocked: () => unlockedRef.current,
    });

    return () => {
      isDisposed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("freeze", handlePageHide);
      unregister();

      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
          sourceRef.current.disconnect();
        } catch {
          // ignore
        }
        sourceRef.current = null;
      }

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (!unlockedRef.current) {
      unlockedRef.current = true;
      setUnlocked(true);
      mutedRef.current = false;
      setMuted(false);
      playRequestedRef.current = true;

      const currentCtx = audioCtxRef.current;
      const currentGain = gainRef.current;
      if (currentCtx && currentGain) {
        if (currentCtx.state === "suspended") {
          void currentCtx.resume().catch(() => {});
        }
        currentGain.gain.setValueAtTime(MUSIC_VOLUME, currentCtx.currentTime);
        if (bufferRef.current && !sourceRef.current) {
          const source = currentCtx.createBufferSource();
          source.buffer = bufferRef.current;
          source.loop = true;
          source.connect(currentGain);
          source.start(0);
          sourceRef.current = source;
          isPlayingRef.current = true;
        }
      }
      return;
    }

    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);

    const currentCtx = audioCtxRef.current;
    const currentGain = gainRef.current;
    if (!currentCtx || !currentGain) {
      return;
    }

    if (nextMuted) {
      currentGain.gain.setValueAtTime(0, currentCtx.currentTime);
      void currentCtx.suspend().catch(() => {});
    } else {
      currentGain.gain.setValueAtTime(MUSIC_VOLUME, currentCtx.currentTime);
      void currentCtx.resume().catch(() => {});
      if (bufferRef.current && !sourceRef.current) {
        const source = currentCtx.createBufferSource();
        source.buffer = bufferRef.current;
        source.loop = true;
        source.connect(currentGain);
        source.start(0);
        sourceRef.current = source;
        isPlayingRef.current = true;
      }
    }
  };

  const showMuted = !unlocked || muted;

  return (
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
  );
}
