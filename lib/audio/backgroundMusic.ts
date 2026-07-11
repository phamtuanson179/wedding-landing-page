type BackgroundMusicController = {
  playWithSound: () => void;
  setMuted: (muted: boolean) => void;
  isUnlocked: () => boolean;
};

let controller: BackgroundMusicController | null = null;

export function registerBackgroundMusicController(
  next: BackgroundMusicController,
) {
  controller = next;

  return () => {
    if (controller === next) {
      controller = null;
    }
  };
}

/** Must be called synchronously inside a user-gesture handler. */
export function playBackgroundMusicWithSound() {
  controller?.playWithSound();
}

export function setBackgroundMusicMuted(muted: boolean) {
  controller?.setMuted(muted);
}

export function isBackgroundMusicUnlocked() {
  return controller?.isUnlocked() ?? false;
}
