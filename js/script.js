// ========================================
// ARK 22 — SISTEMA PRINCIPAL
// La web comienza directamente.
// No existe cuenta regresiva.
// ========================================

const $ = (id) => document.getElementById(id);

let hits = 0;
let timeLeft = 25;

let active = false;
let completed = false;

let timer = null;
let tauntIndex = 0;

const requiredHits = 8;

const arena = $("boss-arena");
const target = $("boss-target");
const overlay = $("boss-overlay");


// ========================================
// MENSAJES DEL JEFE
// ========================================

const taunts = [

    "¿Ese fue un ataque o estabas comprobando si funciona el mouse?",

    "Vamos, AR60. He visto slimes con más iniciativa.",

    "No mires el objetivo. ¡HAZLE CLIC!",

    "¿Necesitas que Pandita te marque la ubicación?",

    "El jefe está empezando a sentir vergüenza ajena.",

    "Un impacto más. No lo arruines ahora.",

    "Ya casi. No te desconcentres leyendo esto.",

    "¡Eso! Al final sí había reflejos detrás de tantos artefactos."

];


const fails = [

    "El jefe ganó. No diremos nada… por ahora.",

    "25 segundos y no alcanzó. ¿Todo bien por allá?",

    "El objetivo no era decorar la arena, era atacarlo.",

    "Reinténtalo. Tu reputación de AR60 está en juego."

];


// ========================================
// NAVEGACIÓN ENTRE PANTALLAS
// ========================================

function showScreen(id) {

    const page = $(id);

    if (!page || !page.classList.contains("page-section")) {
        return;
    }

    // El regalo no puede abrirse sin ganar.
    if (id === "gift" && !completed) {

        id = "challenge";

        $("boss-feedback").textContent =
            "Primero derrota al jefe. No se aceptan atajos sospechosos. 👀";

    }

    document.querySelectorAll(".page-section").forEach(el => {

        el.classList.toggle("active", el.id === id);

    });

    document.querySelectorAll(".nav-button").forEach(el => {

        el.classList.toggle(
            "active",
            el.dataset.screen === id
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


document.querySelectorAll("[data-screen]").forEach(btn => {

    btn.addEventListener("click", () => {

        showScreen(btn.dataset.screen);

    });

});


// ========================================
// ACTUALIZAR ESTADÍSTICAS DEL JUEGO
// ========================================

function updateUI() {

    $("boss-score").textContent =
        `${hits} / ${requiredHits}`;

    $("boss-time").textContent = timeLeft;

    $("boss-health-fill").style.width =
        `${hits / requiredHits * 100}%`;

}


// ========================================
// MOVER EL OBJETIVO
// ========================================

function moveTarget() {

    const r = arena.getBoundingClientRect();

    const size = target.offsetWidth || 58;

    const minX = size / 2 + 12;

    const maxX = Math.max(
        minX,
        r.width - size / 2 - 12
    );

    const minY = 100 + size / 2;

    const maxY = Math.max(
        minY,
        r.height - 20 - size / 2
    );

    const x =
        minX + Math.random() * (maxX - minX);

    const y =
        minY + Math.random() * (maxY - minY);

    target.style.left = `${x}px`;

    target.style.top = `${y}px`;

}


// ========================================
// MENSAJES DE PANTALLA
// ========================================

function overlayMessage(
    symbol,
    title,
    message,
    buttonText,
    action
) {

    overlay.innerHTML = `

        <div class="overlay-symbol">
            ${symbol}
        </div>

        <h3>${title}</h3>

        <p>${message}</p>

        <button class="primary-button" id="overlay-action">
            ${buttonText}
        </button>

    `;

    $("overlay-action").addEventListener(
        "click",
        action
    );

    overlay.classList.remove("hidden");

}


// ========================================
// FINAL DE LA BATALLA
// ========================================

function finish(won) {

    if (!active) return;

    active = false;

    clearInterval(timer);

    target.classList.remove("active");

    target.disabled = true;


    // VICTORIA
    if (won) {

        completed = true;

        $("completed-count").textContent = "1";

        $("boss-health-fill").style.width = "100%";

        $("boss-feedback").textContent =
            "Batalla completada. Por una vez, no necesitaste que te carrearan.";

        $("boss-taunt").textContent =
            "«Bueno… te salió bien. No te acostumbres». — Sistema";


        // Desbloquear regalo.
        $("gift-button").disabled = false;

        $("gift-button").textContent =
            "DESBLOQUEAR REGALO FINAL 🎁";


        overlayMessage(

            "🏆",

            "JEFE DERROTADO. INESPERADO.",

            "El sistema está revisando los resultados… sí, parece que sí sabes jugar.",

            "RECLAMAR RECOMPENSA",

            () => showScreen("gift")

        );


        // Confeti de victoria.
        confetti(110);

    }

    // DERROTA
    else {

        const line =
            fails[Math.floor(Math.random() * fails.length)];

        $("boss-feedback").textContent =
            "Tiempo agotado. El jefe solicita que practiques un poquito.";

        $("boss-taunt").textContent = line;


        overlayMessage(

            "✧",

            "SE TE ESCAPÓ. 😂",

            line,

            "VOLVER A INTENTAR",

            startBoss

        );

    }

}


// ========================================
// INICIAR BATALLA
// ========================================

function startBoss() {

    if (completed) return;

    clearInterval(timer);

    hits = 0;

    timeLeft = 25;

    active = true;

    tauntIndex = 0;

    updateUI();


    overlay.classList.add("hidden");

    target.disabled = false;

    target.classList.add("active");

    moveTarget();


    $("boss-feedback").textContent =
        "¡Batalla iniciada! A ver esos reflejos.";

    $("boss-taunt").textContent =
        "«No falles. Estoy observando». — Sistema";


    timer = setInterval(() => {

        timeLeft--;

        updateUI();

        if (timeLeft <= 0) {

            finish(false);

        }

    }, 1000);

}


// ========================================
// EVENTOS DEL JUEGO
// ========================================

$("boss-start").addEventListener(
    "click",
    startBoss
);


target.addEventListener("click", () => {

    if (!active || completed) return;

    hits++;

    updateUI();


    $("boss-taunt").textContent =
        taunts[Math.min(tauntIndex, taunts.length - 1)];

    tauntIndex++;


    if (hits >= requiredHits) {

        finish(true);

    } else {

        moveTarget();

    }

});


// ========================================
// DESBLOQUEAR REGALO
// ========================================

$("gift-button").addEventListener("click", () => {

    if (completed) {

        showScreen("gift");

    }

});


// ========================================
// SISTEMA DE CONFETI
// ========================================

const canvas = $("particles");

const ctx = canvas.getContext("2d");

let bits = [];


function resize() {

    const d = Math.min(
        devicePixelRatio || 1,
        2
    );

    canvas.width = innerWidth * d;

    canvas.height = innerHeight * d;

    ctx.setTransform(d, 0, 0, d, 0, 0);

}


function confetti(n = 80) {

    const colors = [

        "#f4d78e",
        "#86c2ff",
        "#bba5ff",
        "#fff"

    ];

    for (let i = 0; i < n; i++) {

        bits.push({

            x: Math.random() * innerWidth,

            y: -20 - Math.random() * 150,

            s: 3 + Math.random() * 5,

            v: 2 + Math.random() * 3,

            d: -1 + Math.random() * 2,

            c: colors[
                Math.floor(Math.random() * colors.length)
            ],

            a: Math.random() * 6,

            r: (Math.random() - .5) * .16

        });

    }

}


function draw() {

    ctx.clearRect(
        0,
        0,
        innerWidth,
        innerHeight
    );


    bits.forEach(p => {

        p.y += p.v;

        p.x += p.d;

        p.a += p.r;


        ctx.save();

        ctx.translate(p.x, p.y);

        ctx.rotate(p.a);

        ctx.fillStyle = p.c;

        ctx.fillRect(
            -p.s / 2,
            -p.s / 2,
            p.s,
            p.s * 1.5
        );

        ctx.restore();

    });


    bits = bits.filter(
        p => p.y < innerHeight + 30
    );


    requestAnimationFrame(draw);

}


// ========================================
// EVENTOS FINALES
// ========================================

window.addEventListener("resize", resize);


$("celebrate-button").addEventListener("click", () => {

    confetti(120);

});


// ========================================
// INICIAR WEB
// ========================================

resize();

draw();

// La web comienza directamente en el inicio.
showScreen("home");