import gsap from "gsap";

export function getScroller() {
  return document.getElementById("smooth-wrapper") ? "#smooth-wrapper" : undefined;
}

export function getCornerNav() {
  return document.querySelector<HTMLElement>("[data-corner-nav]");
}

export function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getCornerChrome() {
  return document.querySelectorAll<HTMLElement>("[data-hero-corner-chrome]");
}

export function setCornerNavColor(mode: "loading" | "hero" | "accent") {
  const cornerNav = getCornerNav();
  if (!cornerNav) {
    return;
  }

  const isBeige = mode === "loading" || mode === "hero";
  cornerNav.classList.toggle("text-background", isBeige);
  cornerNav.classList.toggle("text-primary", !isBeige);
}

export function ensureDesktopCornerChromeVisible() {
  if (isMobileViewport()) {
    return;
  }

  const targets = getCornerChrome();
  gsap.set(targets, {
    autoAlpha: 1,
    visibility: "visible",
    clearProps: "opacity,visibility",
  });
}

export function setMobileCornerChromeVisible(visible: boolean) {
  if (!isMobileViewport()) {
    ensureDesktopCornerChromeVisible();
    return;
  }

  const targets = getCornerChrome();
  if (targets.length === 0) {
    return;
  }

  if (visible) {
    gsap.to(targets, {
      autoAlpha: 1,
      visibility: "visible",
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });
    return;
  }

  gsap.set(targets, {
    autoAlpha: 0,
    visibility: "hidden",
    overwrite: true,
  });
}
