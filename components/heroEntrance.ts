export const HERO_ENTRANCE_START = "hero:entrance-start";
export const HERO_ENTRANCE_COMPLETE = "hero:entrance-complete";

export function dispatchHeroEntranceStart() {
  window.dispatchEvent(new CustomEvent(HERO_ENTRANCE_START));
}

export function dispatchHeroEntranceComplete() {
  window.dispatchEvent(new CustomEvent(HERO_ENTRANCE_COMPLETE));
}
