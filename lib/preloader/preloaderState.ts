let preloaderPolygonAnimating = false;

export function setPreloaderPolygonAnimating(active: boolean) {
  preloaderPolygonAnimating = active;
}

export function isPreloaderPolygonAnimating() {
  return preloaderPolygonAnimating;
}

export function whenPreloaderComplete(callback: () => void) {
  const loader = document.getElementById("loader");
  if (!loader || loader.getAttribute("aria-hidden") === "true") {
    callback();
    return () => {};
  }

  const observer = new MutationObserver(() => {
    if (loader.getAttribute("aria-hidden") === "true") {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(loader, {
    attributes: true,
    attributeFilter: ["aria-hidden"],
  });

  return () => observer.disconnect();
}
