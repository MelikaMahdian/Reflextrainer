// --------- Level Reihenfolge ----------
const LEVELS = ["warmup", "colors", "numbers", "catch"];

// localStorage keys
const KEY = "reflextrainer_progress"; // speichert höchste freigeschaltete Stufe (index)
const DONE = "reflextrainer_done";    // optional

// app container
const app = document.getElementById("app");

// CSS dynamisch laden (damit du nicht alle CSS gleichzeitig in HTML brauchst)
let currentCssLink = null;
function loadLevelCss(level) {
  if (currentCssLink) currentCssLink.remove();
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `css/${level}.css`;
  document.head.appendChild(link);
  currentCssLink = link;
}

// Fortschritt lesen/schreiben
function getUnlockedIndex() {
  const v = Number(localStorage.getItem(KEY));
  return Number.isFinite(v) ? v : 0; // warmup unlocked
}
function unlockNext(currentLevel) {
  const idx = LEVELS.indexOf(currentLevel);
  const next = Math.min(idx + 1, LEVELS.length - 1);
  const unlocked = getUnlockedIndex();
  if (next > unlocked) localStorage.setItem(KEY, String(next));
}
function resetProgress() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(DONE);
}

// --------- Menu rendern ----------
function renderMenu() {
  document.body.className = "menu";
  if (currentCssLink) currentCssLink.remove();
  currentCssLink = null;

  const unlocked = getUnlockedIndex();

  app.innerHTML = `
    <main class="menu-page">
      <div>
        <h1 class="menu-title">Reflextrainer</h1>

        <section class="menu-levels">
          ${LEVELS.map((lvl, i) => {
            const title = ({
              warmup: "Warm-up",
              colors: "Farben",
              numbers: "Nummer Suchen",
              catch: "Fang den Ball"
            })[lvl];

            const sub = ({
              warmup: "Eine einfache Übung zum Einstieg",
              colors: "Reaktionsübungen mit wechselnden Farben",
              numbers: "Training mit zufälligen Zahlenreizen",
              catch: "Fortgeschrittene Übung mit bewegten Objekten"
            })[lvl];

            const isUnlocked = i <= unlocked;
            const isDone = i < unlocked; // alles davor als "done"

            const stateClass = isUnlocked ? (i === unlocked ? "active" : "") : "locked";
            const icon = isUnlocked ? (isDone ? "✓" : "✓") : "🔒";

            return `
              <div class="menu-card ${stateClass} ${isUnlocked ? "" : "locked"}"
                   role="button"
                   tabindex="${isUnlocked ? "0" : "-1"}"
                   data-level="${lvl}"
                   data-unlocked="${isUnlocked ? "1" : "0"}">
                <div>
                  <h2>${title}</h2>
                  <p>${sub}</p>
                </div>
                <div class="menu-icon">${icon}</div>
              </div>
            `;
          }).join("")}
        </section>

        <p class="menu-hint">Schließe jedes Level ab, um das nächste freizuschalten</p>

        <p class="menu-hint" style="margin-top:10px;">
          <button id="resetBtn" style="background:transparent;border:1px solid rgba(255,255,255,.15);color:#fff;padding:10px 14px;border-radius:12px;cursor:pointer;">
            Fortschritt zurücksetzen
          </button>
        </p>
      </div>
    </main>
  `;

  document.querySelectorAll(".menu-card").forEach(card => {
    const unlockedFlag = card.dataset.unlocked === "1";
    if (!unlockedFlag) return;

    card.addEventListener("click", () => startLevel(card.dataset.level));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") startLevel(card.dataset.level);
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    resetProgress();
    renderMenu();
  });
}

// --------- Level starten ----------
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    // Wenn schon geladen -> resolve
    const exists = [...document.scripts].some(s => s.src.includes(src));
    if (exists) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

async function startLevel(level) {
  loadLevelCss(level);

  if (level === "warmup") {
    await loadScriptOnce("js/warmup.js");
    window.renderWarmup({
      onBack: renderMenu,
      onComplete: () => {
        unlockNext("warmup");
        renderMenu(); // zurück ins Menü nach Abschluss
      }
    });
  }

  if (level === "colors") {
    await loadScriptOnce("js/colors.js");
    window.renderColors({
      onBack: renderMenu,
      onComplete: () => {
        unlockNext("colors");
        renderMenu();
      }
    });
  }

  if (level === "numbers") {
    await loadScriptOnce("js/numbers.js");
    window.renderNumbers({
      onBack: renderMenu,
      onComplete: () => {
        unlockNext("numbers");
        renderMenu();
      }
    });
  }

  if (level === "catch") {
    await loadScriptOnce("js/catch.js");
    window.renderCatch({
      onBack: renderMenu,
      onComplete: () => {
        localStorage.setItem(DONE, "1");
        renderMenu();
      }
    });
  }
}

// Start: Menü anzeigen
renderMenu();
