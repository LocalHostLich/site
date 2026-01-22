// --- CONFIGURATION ---
const countDownDate = new Date("Feb 2, 2026 00:00:00").getTime();
const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

// Element References
const startOverlay = document.getElementById('start-overlay');
const bgMusic = document.getElementById('bg-music');
const tickLoop = document.getElementById('tick-loop');
const dataSound = document.getElementById('data-sound');

const timerElement = document.getElementById('timer');
const headerElement = document.getElementById('header');
const ceckoMsg = document.getElementById('cecko-msg');

const loginScreen = document.getElementById('login-screen');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const terminalScreen = document.getElementById('terminal-screen');

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

let initialized = false;

// --- BUZZER SOUND GENERATOR ---
function playErrorSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// --- STARTUP SEQUENCE ---
startOverlay.addEventListener('click', () => {
    if (initialized) return;
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => { });
    tickLoop.volume = 1.0;
    tickLoop.play().catch(e => { });
    startOverlay.style.opacity = '0';
    setTimeout(() => { startOverlay.style.display = 'none'; }, 500);
    initialized = true;
    startTimer();
});

// --- TIMER LOGIC ---
function startTimer() {
    let lastSecond = -1;
    const x = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = days < 10 ? "0" + days : days;
        hoursEl.innerText = hours < 10 ? "0" + hours : hours;
        minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;

        // --- 7 DAY CHECK & AUTOMATIC OMEGA REVEAL ---
        if (distance <= sevenDaysInMs) {
            document.body.classList.add('reveal-background');
            // Ако остават 7 дни, показваме Омега бутона дори да не е решена първата загадка
            document.getElementById('omega-trigger').style.display = 'flex';
        } else {
            document.body.classList.remove('reveal-background');
        }

        if (initialized && seconds !== lastSecond && distance > 0) {
            lastSecond = seconds;
            timerElement.classList.add("tick-pulse");
            setTimeout(() => { timerElement.classList.remove("tick-pulse"); }, 50);
        }

        if (distance < 0) {
            clearInterval(x);
            finishCountdown();
        }
    }, 50);
}

function finishCountdown() {
    document.getElementById("timer").innerHTML = "00:00:00:00";
    document.getElementById("timer").style.opacity = "0.3";
    tickLoop.pause();
    tickLoop.currentTime = 0;
    document.title = "ОБЕДИНЕНА РЕПУБЛИКА СИБИР";
    if (loginScreen.style.display !== "none" && terminalScreen.style.display !== "flex") { }
    loginScreen.style.display = "flex";
    passwordInput.focus();
}

passwordInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") checkPassword();
});
loginBtn.addEventListener("click", checkPassword);

function checkPassword() {
    const inputVal = passwordInput.value.trim().toLowerCase();
    if (inputVal === "сибир" || inputVal === "siberia") {
        startTerminalSequence();
    } else {
        denyAccess(passwordInput);
    }
}

function denyAccess(inputElement) {
    playErrorSound();
    inputElement.classList.add("error-shake");
    inputElement.style.borderColor = "var(--error-red)";
    inputElement.style.color = "var(--error-red)";
    setTimeout(() => {
        inputElement.classList.remove("error-shake");
        inputElement.style.borderColor = "var(--doom-green)";
        inputElement.style.color = "var(--doom-green)";
        inputElement.value = "";
    }, 500);
}

function startTerminalSequence() {
    loginScreen.style.display = "none";
    timerElement.style.display = "none";
    headerElement.style.display = "none";
    terminalScreen.style.display = "flex";
    dataSound.volume = 0.8;
    dataSound.play().catch(e => { });

    const lines = [
        "> ИНИЦИАЛИЗИРАНЕ НА ПРОТОКОЛ ЗА СИГУРНОСТ...",
        "> ПРОВЕРКА НА БИОМЕТРИЧНИ ДАННИ... УСПЕШНА.",
        "> СВЪРЗВАНЕ С ЦЕНТРАЛЕН СЪРВЪР 'НОВОСИБИРСК'...",
        "> ....................................",
        "> ВРЪЗКАТА УСТАНОВЕНА.",
        "> ЗАРЕЖДАНЕ НА ГРАФИЧЕН ИНТЕРФЕЙС...",
        "> ДЕКРИПТИРАНЕ НА ФАЙЛОВЕ...",
        "> ДОСТЪП РАЗРЕШЕН."
    ];

    let i = 0;
    function printLine() {
        if (i < lines.length) {
            const p = document.createElement("div");
            p.classList.add("terminal-line");
            p.innerText = lines[i];
            terminalScreen.appendChild(p);
            i++;
            setTimeout(printLine, 400);
        } else {
            dataSound.pause();
            dataSound.currentTime = 0;
            const btn = document.createElement("button");
            btn.classList.add("access-btn");
            btn.innerText = "[ ВЛЕЗ В СИСТЕМАТА ]";
            btn.onclick = enterMainSystem;
            terminalScreen.appendChild(btn);
        }
    }
    printLine();
}

function enterMainSystem() {
    terminalScreen.style.display = "none";
    headerElement.style.display = "block";
    timerElement.style.display = "flex";
    headerElement.innerText = "ОБЕДИНЕНА РЕПУБЛИКА СИБИР";
    headerElement.style.textShadow = "0 0 30px var(--doom-green)";
    timerElement.style.opacity = "1";
    timerElement.style.textShadow = "0 0 40px var(--doom-green)";
    ceckoMsg.style.display = "block";
    document.body.classList.add('reveal-background');
}



// --- VARIABLES ---
const secretTrigger = document.getElementById('secret-trigger');
const sneakLoginScreen = document.getElementById('sneak-login-screen');
const sneakContentScreen = document.getElementById('sneak-content-screen');
const sneakInput = document.getElementById('sneak-input');
const sneakSubmitBtn = document.getElementById('sneak-submit-btn');
const sneakCancelBtn = document.getElementById('sneak-cancel-btn');
const sneakBackBtn = document.getElementById('sneak-back-btn');

const omegaTrigger = document.getElementById('omega-trigger');
const omegaLoginScreen = document.getElementById('omega-login-screen');
const omegaContentScreen = document.getElementById('omega-content-screen');
const omegaInput = document.getElementById('omega-input');
const omegaSubmitBtn = document.getElementById('omega-submit-btn');
const omegaCancelBtn = document.getElementById('omega-cancel-btn');
const omegaBackBtn = document.getElementById('omega-back-btn');

// --- LEVEL 1 (PI) HANDLERS ---
secretTrigger.addEventListener('click', () => {
    sneakLoginScreen.style.display = 'flex';
    sneakInput.value = '';
    sneakInput.focus();
});

sneakCancelBtn.addEventListener('click', () => { sneakLoginScreen.style.display = 'none'; });

function checkSneakPassword() {
    const code = sneakInput.value.trim().toLowerCase();

    // ОТГОВОР BIOSHOCK
    if (code === "rapture" || code === "раптчър") {
        openSneakPeek();
    } else {
        denyAccess(sneakInput);
    }
}

sneakSubmitBtn.addEventListener('click', checkSneakPassword);
sneakInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkSneakPassword(); });

function openSneakPeek() {
    sneakLoginScreen.style.display = 'none';
    sneakContentScreen.style.display = 'flex';
    playSuccessSound();

    
    omegaTrigger.style.display = 'flex';
}

sneakBackBtn.addEventListener('click', () => {
    sneakContentScreen.style.display = 'none';
});


// --- LEVEL 2 (OMEGA) HANDLERS ---
omegaTrigger.addEventListener('click', () => {
    omegaLoginScreen.style.display = 'flex';
    omegaInput.value = '';
    omegaInput.focus();
});

omegaCancelBtn.addEventListener('click', () => { omegaLoginScreen.style.display = 'none'; });

function checkOmegaPassword() {
    const code = omegaInput.value.trim().toLowerCase();

    
    if (code === "transmundane" ||
        code === "discerning the transmundane" ||
        code === "отвъдното") {
        openOmegaContent();
    } else {
        denyAccess(omegaInput);
    }
}

omegaSubmitBtn.addEventListener('click', checkOmegaPassword);
omegaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkOmegaPassword(); });

function openOmegaContent() {
    omegaLoginScreen.style.display = 'none';
    omegaContentScreen.style.display = 'flex';
    playSuccessSound();
}

omegaBackBtn.addEventListener('click', () => {
    omegaContentScreen.style.display = 'none';
});

// Helper for success beep
function playSuccessSound() {
    const successBeep = dataSound.cloneNode();
    successBeep.volume = 0.5;
    successBeep.play().catch(() => { });
    setTimeout(() => successBeep.pause(), 1000);
}