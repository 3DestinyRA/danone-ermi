// "Tutorial already seen" is per-browser and non-critical state. A kiosk profile
// or a private window can throw on localStorage access, and the right fallback
// there is simply to show the tutorial again — never to break the app.
const KEY = "arcil8:onboarding:v1";

export function hasSeenOnboarding() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Ignored: the tutorial reappearing is a far smaller problem than a crash.
  }
}
