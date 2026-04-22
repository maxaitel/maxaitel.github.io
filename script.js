const brailleGrid = document.getElementById("braille-grid");
const brailleCard = document.querySelector(".braille-card");
const yearElement = document.getElementById("year");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Grid of braille cells. Each cell packs 2x4 dots, so the effective
// resolution of the field is (COLS * 2) x (ROWS * 4).
const COLS = 14;
const ROWS = 6;
const TARGET_FPS = 30;

// Bit mask for each sub-dot inside a braille cell.
// Indexed as DOT_BITS[row][col] where row in 0..3, col in 0..1.
const DOT_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

function buildBrailleRows() {
  if (!brailleGrid) return [];
  brailleGrid.innerHTML = "";
  const rows = [];
  for (let r = 0; r < ROWS; r += 1) {
    const line = document.createElement("p");
    line.className = "braille-line";
    brailleGrid.appendChild(line);
    rows.push(line);
  }
  return rows;
}

// Pointer position in sub-dot coordinates and its current influence (0..1).
// `targetStrength` is the value we ease toward each frame so the cursor's
// bump fades smoothly in and out rather than snapping.
let pointerX = 0;
let pointerY = 0;
let pointerStrength = 0;
let targetStrength = 0;

function attachPointerTracking() {
  if (!brailleCard) return;

  const setFromEvent = (event) => {
    const rect = brailleCard.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    pointerX = nx * COLS * 2;
    pointerY = ny * ROWS * 4;
    targetStrength = 1;
  };

  brailleCard.addEventListener("pointermove", setFromEvent);
  brailleCard.addEventListener("pointerenter", setFromEvent);
  brailleCard.addEventListener("pointerleave", () => {
    targetStrength = 0;
  });
}

// Smooth wave field combining a few sines so the pattern drifts without
// visibly repeating. Add a soft pointer-driven bump + ripple on top.
const CENTER_X = COLS; // in sub-dot units (COLS * 2 / 2)
const CENTER_Y = ROWS * 2; // in sub-dot units (ROWS * 4 / 2)

function field(x, y, t) {
  // Three out-of-phase sines keep the pattern drifting without obvious
  // tiling. Scaled so the sum roughly sits in [-2.5, 2.5].
  const base =
    Math.sin(x * 0.32 + t * 0.8) * 0.9 +
    Math.sin(y * 0.5 - t * 0.55) * 0.9 +
    Math.sin((x * 0.22 + y * 0.3) + t * 0.45) * 0.7;

  // Slow radial ripple from the center for a gentle breathing focus.
  const radial =
    Math.sin(Math.hypot(x - CENTER_X, y - CENTER_Y) * 0.22 - t * 0.9) * 0.35;

  let pointer = 0;
  if (pointerStrength > 0.01) {
    const dx = x - pointerX;
    const dy = y - pointerY;
    const d2 = dx * dx + dy * dy;
    const bump = Math.exp(-d2 / 30) * 2.4;
    const ripple =
      Math.sin(Math.sqrt(d2) * 0.55 - t * 3.2) *
      Math.exp(-d2 / 280) *
      1.2;
    pointer = (bump + ripple) * pointerStrength;
  }

  return base + radial + pointer;
}

function renderFrame(t) {
  if (!brailleGrid || rows.length === 0) return;

  // Threshold breathes slowly so dot density gently pulses around ~45% fill.
  const threshold = 0.1 + Math.sin(t * 0.3) * 0.18;

  for (let r = 0; r < ROWS; r += 1) {
    let line = "";
    for (let c = 0; c < COLS; c += 1) {
      let bits = 0;
      for (let sy = 0; sy < 4; sy += 1) {
        for (let sx = 0; sx < 2; sx += 1) {
          const px = c * 2 + sx;
          const py = r * 4 + sy;
          if (field(px, py, t) > threshold) {
            bits |= DOT_BITS[sy][sx];
          }
        }
      }
      line += String.fromCharCode(0x2800 + bits);
    }
    rows[r].textContent = line;
  }
}

const rows = buildBrailleRows();

function startBrailleAnimation() {
  if (!brailleGrid || rows.length === 0) return;

  attachPointerTracking();

  // Initial still frame so SSR / reduced-motion users still see something.
  renderFrame(0);

  if (reducedMotion.matches) return;

  const frameInterval = 1000 / TARGET_FPS;
  let lastFrame = performance.now();
  let t = 0;

  const loop = (now) => {
    const delta = now - lastFrame;
    if (delta >= frameInterval) {
      lastFrame = now;
      t += delta * 0.001;
      // Ease pointer influence toward its target so hover fades in/out.
      const easing = Math.min(1, delta * 0.006);
      pointerStrength += (targetStrength - pointerStrength) * easing;
      renderFrame(t);
    }
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}

function setupReveal() {
  const reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reducedMotion.matches) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  reveals.forEach((element) => observer.observe(element));
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

startBrailleAnimation();
setupReveal();
