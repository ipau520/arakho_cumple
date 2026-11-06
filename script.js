
/* =========================================
   ARAKHO 22 - SISTEMA PRINCIPAL
   Desbloqueo: 28/11/2026 - 00:00 Argentina
========================================= */

// CAMBIA A true SOLO PARA PROBAR.
// En true, se desbloquea después de 10 segundos.
// Para publicar la web, déjalo en false.
const MODO_PRUEBA = false;

// Argentina: UTC-3.
// 28 noviembre 2026, 00:00 Argentina = 03:00 UTC.
const UNLOCK_DATE = MODO_PRUEBA
  ? Date.now() + 10000
  : Date.UTC(2026, 10, 28, 3, 0, 0);


const countdownScreen = document.getElementById("countdown-screen");
const unlockScreen = document.getElementById("unlock-screen");
const birthdaySite = document.getElementById("birthday-site");

let unlocked = false;
let countdownInterval = null;


// =========================================
// 1. CUENTA REGRESIVA
// =========================================

function updateCountdown() {
  const difference = UNLOCK_DATE - Date.now();

  if (difference <= 0) {
    unlockBirthday();
    return;
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  document.getElementById("days").textContent = formatTime(days);
  document.getElementById("hours").textContent = formatTime(hours);
  document.getElementById("minutes").textContent = formatTime(minutes);
  document.getElementById("seconds").textContent = formatTime(seconds);
}

function formatTime(number) {
  return String(number).padStart(2, "0");
}


// =========================================
// 2. DESBLOQUEO AUTOMÁTICO
// =========================================

function unlockBirthday() {
  if (unlocked) return;

  unlocked = true;

  clearInterval(countdownInterval);

  if (!MODO_PRUEBA) {
    localStorage.setItem("arakhoBirthdayUnlocked", "true");
  }

  countdownScreen.classList.add("hidden");
  unlockScreen.classList.remove("hidden");

  createConfetti();

  setTimeout(() => {
    unlockScreen.classList.add("hidden");
    birthdaySite.classList.remove("hidden");

    showScreen("home");
    createConfetti();
  }, 3500);
}


// =========================================
// 3. COMPROBAR SI YA LLEGÓ EL CUMPLEAÑOS
// =========================================

const alreadyUnlocked =
  !MODO_PRUEBA &&
  localStorage.getItem("arakhoBirthdayUnlocked") === "true";

if (Date.now() >= UNLOCK_DATE || alreadyUnlocked) {
  if (alreadyUnlocked && Date.now() < UNLOCK_DATE) {
    // Conserva el desbloqueo si ya se había conseguido.
    unlocked = true;
    countdownScreen.classList.add("hidden");
    unlockScreen.classList.add("hidden");
    birthdaySite.classList.remove("hidden");
    showScreen("home");
  } else {
    updateCountdown();
  }
} else {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}


// =========================================
// 4. NAVEGACIÓN
// =========================================

function showScreen(screenId) {
  if (!unlocked) return;

  if (screenId === "gift" && completedGames.size < 3) {
    screenId = "games";
  }

  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.remove("active");
  });

  const selected = document.getElementById(screenId);

  if (selected) selected.classList.add("active");

  document.querySelectorAll(`[data-screen="${screenId}"]`).forEach(button => {
    if (button.classList.contains("nav-button")) {
      button.classList.add("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-screen]").forEach(button => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screen);
  });
});


// =========================================
// 5. PROGRESO DE LOS MINIJUEGOS
// =========================================

const completedGames = new Set();

const giftButton = document.getElementById("gift-button");

function completeGame(gameName) {
  completedGames.add(gameName);

  document.getElementById("completed-count").textContent =
    completedGames.size;

  if (completedGames.size === 3) {
    giftButton.disabled = false;
    giftButton.textContent = "DESBLOQUEAR REGALO FINAL 🎁";
    createConfetti();
  }
}

giftButton.addEventListener("click", () => {
  if (completedGames.size === 3) {
    showScreen("gift");
    createConfetti();
  }
});


// =========================================
// 6. CAMBIAR DE MINIJUEGO
// =========================================

document.querySelectorAll(".game-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".game-tab").forEach(item => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".game-panel").forEach(panel => {
      panel.classList.remove("active");
    });

    tab.classList.add("active");
    document.getElementById(tab.dataset.game).classList.add("active");
  });
});


// =========================================
// 7. JUEGO 1 - SLIME RUN
// =========================================

const runnerPlayer = document.getElementById("runner-player");
const runnerObstacle = document.getElementById("runner-obstacle");
const runnerOverlay = document.getElementById("runner-overlay");
const runnerStart = document.getElementById("runner-start");
const runnerTime = document.getElementById("runner-time");
const runnerFeedback = document.getElementById("runner-feedback");

let runnerActive = false;
let runnerSeconds = 15;
let runnerTimer = null;
let collisionTimer = null;
let jumping = false;

function jump() {
  if (!runnerActive || jumping) return;

  jumping = true;
  runnerPlayer.classList.add("jumping");

  setTimeout(() => {
    runnerPlayer.classList.remove("jumping");
    jumping = false;
  }, 550);
}

document.getElementById("jump-button").addEventListener("click", jump);

document.addEventListener("keydown", event => {
  if (["Space", "ArrowUp"].includes(event.code) && runnerActive) {
    event.preventDefault();
    jump();
  }
});

function stopRunner(message, won) {
  if (!runnerActive) return;

  runnerActive = false;
  clearInterval(runnerTimer);
  clearInterval(collisionTimer);

  runnerObstacle.classList.remove("moving");
  runnerOverlay.classList.remove("hidden");

  runnerOverlay.innerHTML = won
    ? `<h3>¡Sobreviviste! 🏆</h3>
       <p>Ni los slimes pudieron contigo.</p>
       <button class="primary-button" id="runner-retry">VOLVER A JUGAR</button>`
    : `<h3>¡Te atraparon! 😂</h3>
       <p>El slime tenía otros planes.</p>
       <button class="primary-button" id="runner-retry">INTENTAR DE NUEVO</button>`;

  runnerFeedback.textContent = message;

  document.getElementById("runner-retry")
    .addEventListener("click", startRunner);

  if (won) completeGame("runner");
}

function startRunner() {
  if (completedGames.has("runner")) {
    runnerFeedback.textContent = "¡Este desafío ya está completado!";
    return;
  }

  runnerActive = true;
  jumping = false;
  runnerSeconds = 15;

  runnerTime.textContent = runnerSeconds;
  runnerOverlay.classList.add("hidden");
  runnerPlayer.classList.remove("jumping");

  runnerObstacle.classList.remove("moving");
  void runnerObstacle.offsetWidth;
  runnerObstacle.classList.add("moving");

  runnerTimer = setInterval(() => {
    runnerSeconds--;
    runnerTime.textContent = runnerSeconds;

    if (runnerSeconds <= 0) {
      stopRunner("¡Desafío superado!", true);
    }
  }, 1000);

  collisionTimer = setInterval(() => {
    if (!runnerActive || jumping) return;

    const playerRect = runnerPlayer.getBoundingClientRect();
    const obstacleRect = runnerObstacle.getBoundingClientRect();

    const collision =
      playerRect.right > obstacleRect.left + 5 &&
      playerRect.left < obstacleRect.right - 5 &&
      playerRect.bottom > obstacleRect.top + 5;

    if (collision) stopRunner("¡El slime te alcanzó!", false);
  }, 40);
}

runnerStart.addEventListener("click", startRunner);


// =========================================
// 8. JUEGO 2 - JEFE FINAL
// =========================================

const bossArena = document.getElementById("boss-arena");
const bossTarget = document.getElementById("boss-target");
const bossOverlay = document.getElementById("boss-overlay");
const bossScore = document.getElementById("boss-score");
const bossTime = document.getElementById("boss-time");
const bossFeedback = document.getElementById("boss-feedback");

let bossHits = 0;
let bossSeconds = 20;
let bossActive = false;
let bossTimer = null;

function moveBossTarget() {
  const maxX = bossArena.clientWidth - bossTarget.offsetWidth;
  const maxY = bossArena.clientHeight - bossTarget.offsetHeight;

  const x = Math.random() * Math.max(0, maxX);
  const y = 55 + Math.random() * Math.max(0, maxY - 55);

  bossTarget.style.left = `${x}px`;
  bossTarget.style.top = `${y}px`;
}

function stopBoss(won) {
  if (!bossActive) return;

  bossActive = false;
  clearInterval(bossTimer);
  bossTarget.classList.remove("active");
  bossOverlay.classList.remove("hidden");

  bossOverlay.innerHTML = won
    ? `<h3>¡JEFE DERROTADO! ⚔</h3>
       <p>El verdadero jefe eras tú.</p>
       <button class="primary-button" id="boss-retry">JUGAR OTRA VEZ</button>`
    : `<h3>¡Se escapó el objetivo!</h3>
       <p>Necesitas un poco más de puntería.</p>
       <button class="primary-button" id="boss-retry">REINTENTAR</button>`;

  bossFeedback.textContent = won
    ? "¡Batalla completada!"
    : "Se terminó el tiempo.";

  document.getElementById("boss-retry")
    .addEventListener("click", startBoss);

  if (won) completeGame("boss");
}

function startBoss() {
  if (completedGames.has("boss")) {
    bossFeedback.textContent = "¡Jefe derrotado anteriormente!";
    return;
  }

  bossHits = 0;
  bossSeconds = 20;
  bossActive = true;

  bossScore.textContent = "0 / 8";
  bossTime.textContent = bossSeconds;

  bossOverlay.classList.add("hidden");
  bossTarget.classList.add("active");
  moveBossTarget();

  bossTimer = setInterval(() => {
    bossSeconds--;
    bossTime.textContent = bossSeconds;

    if (bossSeconds <= 0) stopBoss(false);
  }, 1000);
}

bossTarget.addEventListener("click", () => {
  if (!bossActive) return;

  bossHits++;
  bossScore.textContent = `${bossHits} / 8`;

  if (bossHits >= 8) {
    stopBoss(true);
  } else {
    moveBossTarget();
  }
});

document.getElementById("boss-start")
  .addEventListener("click", startBoss);


// =========================================
// 9. JUEGO 3 - CAZA ESTELAR
// =========================================

const starsGrid = document.getElementById("stars-grid");
const starsOverlay = document.getElementById("stars-overlay");
const starsScore = document.getElementById("stars-score");
const starsTime = document.getElementById("stars-time");
const starsFeedback = document.getElementById("stars-feedback");

let collectedStars = 0;
let starsSeconds = 25;
let starsActive = false;
let starsTimer = null;

function buildStars() {
  starsGrid.innerHTML = "";

  const starPositions = new Set();

  while (starPositions.size < 10) {
    starPositions.add(Math.floor(Math.random() * 20));
  }

  for (let i = 0; i < 20; i++) {
    const cell = document.createElement("button");

    cell.className = "star-cell";
    cell.type = "button";
    cell.textContent = "·";

    if (starPositions.has(i)) {
      cell.dataset.star = "true";
      cell.textContent = "✧";
    }

    cell.addEventListener("click", () => {
      if (!starsActive || cell.classList.contains("found")) return;

      if (cell.dataset.star === "true") {
        cell.classList.add("found");
        cell.textContent = "✦";

        collectedStars++;
        starsScore.textContent = `${collectedStars} / 10`;

        if (collectedStars >= 10) stopStars(true);
      } else {
        starsFeedback.textContent = "Por aquí no había nada... 👀";
      }
    });

    starsGrid.appendChild(cell);
  }
}

function stopStars(won) {
  if (!starsActive) return;

  starsActive = false;
  clearInterval(starsTimer);
  starsOverlay.classList.remove("hidden");

  starsOverlay.innerHTML = won
    ? `<h3>¡Todas las estrellas! ✨</h3>
       <p>Hasta Paimon estaría orgullosa.</p>
       <button class="primary-button" id="stars-retry">JUGAR OTRA VEZ</button>`
    : `<h3>¡Se acabó el tiempo!</h3>
       <p>Las estrellas no iban a esperarte eternamente.</p>
       <button class="primary-button" id="stars-retry">REINTENTAR</button>`;

  starsFeedback.textContent = won
    ? "¡Colección completada!"
    : "Inténtalo otra vez.";

  document.getElementById("stars-retry")
    .addEventListener("click", startStars);

  if (won) completeGame("stars");
}

function startStars() {
  if (completedGames.has("stars")) {
    starsFeedback.textContent = "¡Ya conseguiste todas las estrellas!";
    return;
  }

  collectedStars = 0;
  starsSeconds = 25;
  starsActive = true;

  starsScore.textContent = "0 / 10";
  starsTime.textContent = starsSeconds;

  starsOverlay.classList.add("hidden");
  buildStars();

  starsTimer = setInterval(() => {
    starsSeconds--;
    starsTime.textContent = starsSeconds;

    if (starsSeconds <= 0) stopStars(false);
  }, 1000);
}

document.getElementById("stars-start")
  .addEventListener("click", startStars);


// =========================================
// 10. CONFETI
// =========================================

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let confettiPieces = [];

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;

  ctx.setTransform(
    devicePixelRatio, 0, 0,
    devicePixelRatio, 0, 0
  );
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createConfetti() {
  const colors = ["#f5d98c", "#78baff", "#bba2ff", "#ffffff"];

  for (let i = 0; i < 120; i++) {
    confettiPieces.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 300,
      size: Math.random() * 6 + 3,
      speed: Math.random() * 3 + 2,
      drift: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360
    });
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPieces.forEach(piece => {
    piece.y += piece.speed;
    piece.x += piece.drift;
    piece.rotation += 3;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation * Math.PI / 180);

    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);

    ctx.restore();
  });

  confettiPieces = confettiPieces.filter(piece => {
    return piece.y < window.innerHeight + 30;
  });

  requestAnimationFrame(animateConfetti);
}

animateConfetti();

document.getElementById("celebrate-button")
  .addEventListener("click", createConfetti);
