export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
}

export function clampAngleDeg(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}
