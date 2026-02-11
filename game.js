// -----------------------------
// Firebase config (ES module)
// -----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfULLIaP3Ovs-cJlFV_gsrSiYcwZvAx_E",
  authDomain: "valentim-d8b52.firebaseapp.com",
  projectId: "valentim-d8b52",
  storageBucket: "valentim-d8b52.firebasestorage.app",
  messagingSenderId: "131144862287",
  appId: "1:131144862287:web:ff39b696efac3a1243383a",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// -----------------------------
// Firestore helpers
// -----------------------------
async function saveMessage(texto) {
  if (!texto || texto.length < 3) return;
  const col = collection(db, "mensagens");
  await addDoc(col, {
    texto,
    createdAt: serverTimestamp(),
  });
}

async function loadMessages() {
  const q = query(
    collection(db, "mensagens"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);

  // cards comes from Firestore now
  cards = snapshot.docs.map(doc => ({
    x: Math.random() * 700 + 40,
    y: Math.random() * 500 + 40,
    tone: "lembranca",
    sealColor: "#ffb9cf",
    importance: false,
    message: doc.data().texto
  }));

  game.cardsRead.clear();
  updateCounter?.();
}

// -----------------------------
// Prompt-based add flow
// -----------------------------
async function askAndSaveMessage() {
  const txt = (window.prompt("Escreve a tua mensagem de São Valentim 💌", "Com amor...") || "").trim();
  if (txt.length >= 3) {
    await saveMessage(txt);
    await loadMessages();
  }
}
// === SELECT UI ELEMENTS ===
const addMsgBtn  = document.getElementById('addMsgBtn');
const modal      = document.getElementById('messageModal');
const input      = document.getElementById('messageInput');
const saveBtn    = document.getElementById('saveBtn');
const cancelBtn  = document.getElementById('cancelBtn');

// Log to confirm we have them (temporary diagnostics)
console.log({ addMsgBtn, modal, input, saveBtn, cancelBtn });

// === MODAL HELPERS ===
function openAddMessageModal() {
  if (!modal || !input) return;
  input.value = '';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  // Next tick focus to ensure rendered
  setTimeout(() => input.focus(), 0);
}
function closeAddMessageModal() {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

// === EVENT WIRING ===
addMsgBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();               // avoid bubbling into canvas / overlays
  openAddMessageModal();
});

cancelBtn?.addEventListener('click', () => closeAddMessageModal());

// Close when clicking outside the dialog content
modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeAddMessageModal();
});

// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeAddMessageModal();
  }
});
function startDir(key) { game.keys[key] = true; }
function stopDir(key)  { game.keys[key] = false; }

// Up
document.querySelector('#dpad .up').addEventListener('touchstart', () => startDir("ArrowUp"));
document.querySelector('#dpad .up').addEventListener('touchend',   () => stopDir("ArrowUp"));

// Down
document.querySelector('#dpad .down').addEventListener('touchstart', () => startDir("ArrowDown"));
document.querySelector('#dpad .down').addEventListener('touchend',   () => stopDir("ArrowDown"));

// Left
document.querySelector('#dpad .left').addEventListener('touchstart', () => startDir("ArrowLeft"));
document.querySelector('#dpad .left').addEventListener('touchend',   () => stopDir("ArrowLeft"));

// Right
document.querySelector('#dpad .right').addEventListener('touchstart', () => startDir("ArrowRight"));
document.querySelector('#dpad .right').addEventListener('touchend',   () => stopDir("ArrowRight"));
// === SAVE HANDLER (uses your Firestore helpers) ===
saveBtn?.addEventListener('click', async () => {
  const text = (input?.value || '').trim();
  if (text.length < 3) {
    input?.focus();
    return;
  }
  await saveMessage(text);   // your addDoc(...) function
  await loadMessages();      // refresh cards & counter
  closeAddMessageModal();
});

// Configuração do Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
canvas.width = 800;
canvas.height = 600;

const tileSize = 20;
const gridWidth = canvas.width / tileSize;
const gridHeight = canvas.height / tileSize;

function createDesign() {
    return Array.from({ length: 16 }, () => Array(16).fill(null));
}

// Estado do jogo
const game = {
    player: {
        x: 400,
        y: 300,
        width: 40,
        height: 46,
        speed: 3,
        color: '#ffc0d4',
        facing: 'down',
        anim: {
            step: 0,
            lastStep: 0,
            isMoving: false,
            lastMoveTime: 0,
            lastFlowerTime: 0
        }
    },
    pet: {
        name: 'Enzo',
        x: 360,
        y: 320,
        width: 30,
        height: 24,
        speed: 2.2,
        sitUntil: 0,
        wagBoostUntil: 0,
        circleMode: false,
        lastInteract: 0,
        isMoving: false,
        lastIdleHeart: 0
    },
    ducks: [
        { x: 610, y: 420, drift: 0.25, type: 'duck' },
        { x: 620, y: 410, drift: 0.3, type: 'duckling' },
        { x: 600, y: 445, drift: 0.2, type: 'duckling' },
        { x: 630, y: 435, drift: 0.18, type: 'duckling' },
        { x: 675, y: 430, drift: 0.16, type: 'duckling' },
        { x: 650, y: 420, drift: 0.21, type: 'duck' }
    ],
    birds: {
        flying: [
            { x: 40, y: 80, speed: 0.35, colorIndex: 0 },
            { x: 220, y: 130, speed: 0.28, colorIndex: 1 },
            { x: 520, y: 60, speed: 0.4, colorIndex: 2 },
            { x: 120, y: 100, speed: 0.3, colorIndex: 3 },
            { x: 360, y: 70, speed: 0.34, colorIndex: 4 },
            { x: 260, y: 90, speed: 0.31, colorIndex: 2 },
            { x: 620, y: 110, speed: 0.27, colorIndex: 1 }
        ],
        nests: [
            { x: 120, y: 90 },
            { x: 690, y: 140 }
        ]
    },
    keys: {},
    messageBox: document.getElementById('messageBox'),
    messageText: document.getElementById('messageText'),
    messageTitle: document.getElementById('messageTitle'),
    closeBtn: document.getElementById('closeBtn'),
    counter: document.getElementById('counter'),
    cardsRead: new Set(),
    showingMessage: false,
    currentCard: null,
    messageType: 'card',
    finalUnlocked: false,
    finalShown: false,
    completionShown: false,
    valentinePromptShown: false,
    theme: 'natural',
    editingTerrain: false,
    terrainTool: 'grass',
    terrainTiles: new Map(),
    designTiles: new Set(),
    designs: {
        ground: createDesign()
    },
    currentColor: '#ffb9cf',
    particles: [],
    grassFlowers: [],
    lastDuckHeart: 0
};


const cards = [
    { x: 100, y: 100, tone: 'lembranca', sealColor: '#ffb9cf', importance: false, message: "Desde o primeiro momento que te vi, soube que você era especial. ❤️" },
    { x: 350, y: 150, tone: 'promessa', sealColor: '#cbb8ff', importance: true, message: "Cada dia ao teu lado é uma nova aventura que eu quero viver. 🌟" },
    { x: 600, y: 120, tone: 'agradecimento', sealColor: '#ffd7a8', importance: false, message: "Você ilumina minha vida como ninguém mais consegue fazer. ✨" },
    { x: 150, y: 280, tone: 'agradecimento', sealColor: '#ffd7a8', importance: false, message: "Obrigado por existir e por fazer parte da minha história. 💕" },
    { x: 700, y: 250, tone: 'piada', sealColor: '#aee6ff', importance: false, message: "Seu sorriso é a coisa mais linda que eu já vi. 😊" },
    { x: 400, y: 400, tone: 'lembranca', sealColor: '#ffb9cf', importance: false, message: "Com você, até os momentos simples se tornam mágicos. 🎆" },
    { x: 120, y: 480, tone: 'promessa', sealColor: '#cbb8ff', importance: true, message: "Você é meu lugar favorito, meu lar. 🏠💗" },
    { x: 650, y: 450, tone: 'agradecimento', sealColor: '#ffd7a8', importance: false, message: "Cada batida do meu coração sussurra seu nome. 💓" },
    { x: 300, y: 520, tone: 'futuro', sealColor: '#ffc7e8', importance: true, message: "Amar você é a melhor decisão que já tomei. 💝" },
    { x: 500, y: 330, tone: 'piada', sealColor: '#aee6ff', importance: false, message: "Você é a razão dos meus melhores sorrisos. 😍" },
    { x: 250, y: 200, tone: 'lembranca', sealColor: '#ffb9cf', importance: false, message: "Juntos somos mais fortes, mais felizes, mais completos. 👫" },
    { x: 550, y: 80, tone: 'futuro', sealColor: '#ffc7e8', importance: true, message: "Te amo hoje, amanhã e para sempre. Feliz Dia de São Valentim! 💖🌹" }
];

const introMessage = "Este lugar guarda memórias... algumas ainda estão espalhadas pelo caminho.";
const finalMessage = "Estas cartas são só um resumo. O resto eu quero continuar a escrever contigo.";
const completionMessage = "Conseguimos encontrar todas as cartas! Obrigado por cada memoria.";
const valentineMessage = "Gostarias de ser o meu S\u00e3o Valentim? \u{1F48C}";
const lakeBench = { x: 560, y: 472, width: 44, height: 10 };

const audioState = {
    ctx: null,
    enabled: false
};

function initAudio() {
    if (audioState.enabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioState.ctx = ctx;
        audioState.enabled = true;
    } catch {
        audioState.enabled = false;
    }
}

function playTone(freq, duration, gainValue = 0.05) {
    if (!audioState.enabled || !audioState.ctx) return;
    const ctx = audioState.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

function playCardChime() {
    playTone(740, 0.12, 0.05);
    setTimeout(() => playTone(980, 0.1, 0.04), 90);
}

function playFinalChime() {
    playTone(660, 0.16, 0.05);
    setTimeout(() => playTone(880, 0.16, 0.05), 120);
    setTimeout(() => playTone(1100, 0.18, 0.05), 240);
}

function drawDesignPattern(pattern, x, y, width, height, alpha = 0.9) {
    const cellW = width / 16;
    const cellH = height / 16;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 16; col++) {
            const color = pattern[row][col];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(x + col * cellW, y + row * cellH, cellW, cellH);
        }
    }
    ctx.restore();
}

// Função para desenhar o jogador (pixel art)
function drawPlayer() {
    const p = game.player;
    const time = Date.now() / 1000;
    const bob = Math.sin(time * 6) * (p.anim.isMoving ? 1.1 : 0.4);
    const step = p.anim.isMoving ? (p.anim.step === 0 ? -1 : 1) : 0;
    const scale = 0.8;
    const baseW = 48;
    const baseH = 56;
    const ox = p.x + (p.width - baseW * scale) / 2;
    const oy = p.y + (p.height - baseH * scale) / 2;
    const skin = '#f7d5c6';
    const hair = '#b48963';
    const eye = '#8a6a4f';
    const blush = '#f5b4c6';
    const dress = '#ff9fc0';
    const hem = '#f0a2bb';
    const shoes = '#3a2a24';

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    // Sombra
    ctx.fillStyle = 'rgba(60, 40, 30, 0.18)';
    ctx.beginPath();
    ctx.ellipse(24, 54, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeca arredondada
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(24, 15 + bob, 11, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(24, 13 + bob, 11, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(12, 11 + bob, 24, 5);
    ctx.fillRect(9, 15 + bob, 6, 8);
    ctx.fillRect(33, 15 + bob, 6, 8);

    // Olhos e bochechas
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(19, 17 + bob, 1.8, 0, Math.PI * 2);
    ctx.arc(29, 17 + bob, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9a54e';
    ctx.beginPath();
    ctx.arc(19.4, 17 + bob, 0.9, 0, Math.PI * 2);
    ctx.arc(29.4, 17 + bob, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6fb07d';
    ctx.beginPath();
    ctx.arc(19.9, 17.3 + bob, 0.6, 0, Math.PI * 2);
    ctx.arc(29.9, 17.3 + bob, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = blush;
    ctx.beginPath();
    ctx.arc(15, 20 + bob, 2.2, 0, Math.PI * 2);
    ctx.arc(33, 20 + bob, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Vestido
    ctx.fillStyle = dress;
    ctx.beginPath();
    ctx.roundRect(15, 26 + bob, 18, 20, 6);
    ctx.fill();
    ctx.fillStyle = hem;
    ctx.fillRect(16, 44 + bob, 16, 3);

    // Maozinhas
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(13, 38 + bob + step * 0.4, 2, 0, Math.PI * 2);
    ctx.arc(35, 38 + bob - step * 0.4, 2, 0, Math.PI * 2);
    ctx.fill();


    // Pernas e sapatos
    ctx.fillStyle = skin;
    ctx.fillRect(19, 46 + bob + step, 4, 8);
    ctx.fillRect(25, 46 + bob - step, 4, 8);
    ctx.fillStyle = shoes;
    ctx.fillRect(17, 54 + bob + step, 6, 3);
    ctx.fillRect(23, 54 + bob - step, 6, 3);

    ctx.restore();
}

function drawDog() {
    const d = game.pet;
    const time = Date.now() / 1000;
    const bob = Math.sin(time * 6) * 0.6;
    const now = performance.now();
    const isSitting = now < d.sitUntil;
    const wagSpeed = now < d.wagBoostUntil ? 16 : 10;
    const wag = Math.sin(time * wagSpeed) * 4;
    const pawSwing = d.isMoving ? Math.sin(time * 8 + (d.x + d.y) * 0.01) : 0;
    const pawLift = Math.max(0, pawSwing) * 1.6;
    const pawLiftAlt = Math.max(0, -pawSwing) * 1.6;
    const scale = 0.75;
    const baseW = 40;
    const baseH = 32;
    const ox = d.x + (d.width - baseW * scale) / 2;
    const oy = d.y + (d.height - baseH * scale) / 2;
    const white = '#ffffff';
    const shadow = '#ece7df';
    const ear = '#f3e8dc';

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    // Sombra
    ctx.fillStyle = 'rgba(60, 40, 30, 0.16)';
    ctx.beginPath();
    ctx.ellipse(20, 32, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo arredondado
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.ellipse(16, 16 + bob, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(16, 18 + bob, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeca
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.arc(28, 12 + bob + (isSitting ? 2 : 0), 8, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = ear;
    ctx.beginPath();
    ctx.ellipse(24, 6 + bob, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.ellipse(32, 6 + bob, 4, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Olhos e nariz
    ctx.fillStyle = '#3a2a24';
    ctx.beginPath();
    ctx.arc(26, 12 + bob, 1.5, 0, Math.PI * 2);
    ctx.arc(30, 12 + bob, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6a4a3a';
    ctx.beginPath();
    ctx.arc(28, 16 + bob, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Patinhas
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(8, 24 + bob + pawLift, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 24 + bob + pawLiftAlt, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(24, 24 + bob + pawLift, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rabo
    ctx.strokeStyle = white;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(2, 14 + bob);
    ctx.lineTo(-4, 8 + bob + wag * 0.15);
    ctx.stroke();

    ctx.restore();
}

function drawBirds() {
    const time = Date.now() / 1000;
    const progress = Math.min(12, game.cardsRead.size);
    const stage = Math.floor(progress / 3);

    const extraFlying = [
        { x: 120, y: 60, speed: 0.32 },
        { x: 420, y: 90, speed: 0.38 },
        { x: 700, y: 110, speed: 0.3 }
    ];
    const flyingCount = Math.min(game.birds.flying.length + stage, game.birds.flying.length + extraFlying.length);
    const flyingList = game.birds.flying.concat(extraFlying).slice(0, flyingCount);

    const frame = Math.floor(time * 6) % 2;
    const birdColors = [
        { body: '#c07a3f', head: '#d19a67', wing: '#b56d36', beak: '#f0b35e' },
        { body: '#7fa6d8', head: '#9bc0e8', wing: '#6f93c6', beak: '#f2b35e' },
        { body: '#e08fa8', head: '#f2b1c6', wing: '#d77a96', beak: '#f0b35e' },
        { body: '#c7c7c7', head: '#e2e2e2', wing: '#b0b0b0', beak: '#f2b35e' },
        { body: '#9fd6a2', head: '#b7e3ba', wing: '#88c78c', beak: '#f0b35e' }
    ];

    const drawPixelBird = (x, y, wingUp, colors) => {
        const s = 2;
        const ox = x;
        const oy = y;
        const px = (dx, dy, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(ox + dx * s, oy + dy * s, w * s, h * s);
        };

        px(0, 1, 4, 3, colors.body);
        px(1, 0, 3, 2, colors.head);
        px(3, 2, 1, 1, '#2b1e18');
        px(4, 2, 2, 1, colors.beak);

        if (wingUp) {
            px(1, -1, 3, 1, colors.wing);
        } else {
            px(1, 4, 3, 1, colors.wing);
        }
    };

    flyingList.forEach((bird, index) => {
        const x = (bird.x + time * bird.speed * 120) % (canvas.width + 60) - 30;
        const y = bird.y + Math.sin(time * 2 + index) * 6;
        const palette = birdColors[bird.colorIndex ?? (index % birdColors.length)];
        drawPixelBird(x, y, frame === 0, palette);
    });

    const extraNests = [
        { x: 520, y: 120 }
    ];
    const nestCount = Math.min(game.birds.nests.length + Math.floor(stage / 2), game.birds.nests.length + extraNests.length);
    const nests = game.birds.nests.concat(extraNests).slice(0, nestCount);

    nests.forEach((nest, index) => {
        const bob = Math.sin(time * 2 + index) * 1.5;

        // Ninho (pixel)
        ctx.fillStyle = '#d2b08a';
        ctx.fillRect(nest.x - 10, nest.y - 3, 20, 6);
        ctx.fillStyle = '#b4875a';
        ctx.fillRect(nest.x - 8, nest.y - 1, 16, 3);

        // Filhotes
        ctx.fillStyle = '#ffe5a3';
        ctx.fillRect(nest.x - 6, nest.y - 6, 3, 3);
        ctx.fillRect(nest.x + 2, nest.y - 5, 3, 3);
        ctx.fillStyle = '#c98268';
        ctx.fillRect(nest.x - 4, nest.y - 6, 1, 1);
        ctx.fillRect(nest.x + 4, nest.y - 5, 1, 1);

        // Passarinho adulto
        ctx.fillStyle = '#f7f3ed';
        ctx.fillRect(nest.x + 10, nest.y - 10 + bob, 6, 4);
        ctx.fillStyle = '#f2d9c4';
        ctx.fillRect(nest.x + 14, nest.y - 12 + bob, 3, 3);
    });
}

function drawDucks() {
    const time = Date.now() / 1000;
    const frame = Math.floor(time * 4) % 2;
    const now = performance.now();
    const playerX = game.player.x + game.player.width / 2;
    const playerY = game.player.y + game.player.height / 2;
    let nearDuck = false;

    game.ducks.forEach((duck, index) => {
        const bob = Math.sin(time * 2 + index) * 2;
        const x = duck.x + Math.sin(time * duck.drift + index) * 6;
        const y = duck.y + bob;
        const type = duck.type || 'duck';
        const s = type === 'duckling' ? 1.5 : type === 'goose' ? 2.5 : 2;

        if (Math.hypot(playerX - x, playerY - y) < 90) {
            nearDuck = true;
        }

        const px = (dx, dy, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x + dx * s, y + dy * s, w * s, h * s);
        };

        if (type === 'duckling') {
            px(0, 2, 6, 2, '#ffe08a');
            px(2, 0, 3, 2, '#ffe08a');
            px(4, 1, 2, 1, '#ffb54a');
            px(2, 1, 1, 1, '#2b1e18');
            px(2, 3 + frame, 2, 1, '#ffb54a');
            return;
        }

        if (type === 'goose') {
            px(0, 3, 10, 3, '#ffffff');
            px(4, 0, 4, 4, '#ffffff');
            px(8, 1, 3, 2, '#ffb54a');
            px(5, 2, 1, 1, '#2b1e18');
            px(2, 6 + frame, 3, 1, '#ffb54a');
            return;
        }

        px(0, 2, 8, 3, '#ffffff');
        px(2, 0, 4, 3, '#ffffff');
        px(6, 1, 3, 2, '#ffb54a');
        px(3, 1, 1, 1, '#2b1e18');
        px(3, 4 + frame, 2, 1, '#ffb54a');
    });

    if (nearDuck && now - game.lastDuckHeart > 900) {
        game.lastDuckHeart = now;
        spawnSmallHearts(playerX + 6, playerY - 12, 2);
    }
}

// Função para desenhar uma carta (pixel art)
function drawCard(card, index) {
    const isRead = game.cardsRead.has(index);
    
    // Sombra
    ctx.fillStyle = 'rgba(60, 40, 30, 0.18)';
    ctx.fillRect(card.x + 3, card.y + 3, 28, 28);

    // Envelope
    ctx.fillStyle = isRead ? '#efe7db' : '#fff6e9';
    ctx.fillRect(card.x, card.y, 28, 28);

    // Borda do envelope
    ctx.strokeStyle = isRead ? '#cbb6a0' : '#e080a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x, card.y, 28, 28);

    // Coração no envelope
    if (!isRead) {
        ctx.fillStyle = card.sealColor || '#e080a6';
        ctx.font = 'bold 16px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💌', card.x + 14, card.y + 20);
    } else {
        ctx.fillStyle = '#b7a392';
        ctx.font = 'bold 16px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', card.x + 14, card.y + 20);
    }
    
    // Indicador de proximidade
    const distance = Math.sqrt(
        Math.pow(game.player.x + game.player.width/2 - (card.x + 14), 2) +
        Math.pow(game.player.y + game.player.height/2 - (card.y + 14), 2)
    );
    
    if (distance < 60 && !isRead) {
        // Brilho pulsante
        const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 220, 170, ${pulse * 0.45})`;
        ctx.beginPath();
        ctx.arc(card.x + 14, card.y + 14, 20 + pulse * 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Texto "ESPAÇO"
        ctx.fillStyle = '#fffaf3';
        ctx.strokeStyle = '#6a4a3a';
        ctx.lineWidth = 3;
        ctx.font = 'bold 12px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText('ESPAÇO', card.x + 14, card.y - 10);
        ctx.fillText('ESPAÇO', card.x + 14, card.y - 10);
    }
}

// Função para desenhar decorações (corações flutuantes)
function drawDecorations() {
    const time = Date.now() / 1000;
    
    for (let i = 0; i < 15; i++) {
        const x = (i * 80 + time * 20) % canvas.width;
        const y = 30 + Math.sin(time + i) * 15;
        const size = 8 + Math.sin(time * 2 + i) * 3;
        
        ctx.fillStyle = `rgba(255, 169, 196, ${0.3 + Math.sin(time + i) * 0.2})`;
        ctx.font = `${size}px Fredoka, sans-serif`;
        ctx.fillText('❤', x, y);
    }
}

function spawnHearts(x, y) {
    for (let i = 0; i < 6; i++) {
        game.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.6 - Math.random() * 0.6,
            life: 60 + Math.random() * 30,
            size: 8 + Math.random() * 4
        });
    }
}

function spawnSmallHearts(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
        game.particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.4 - Math.random() * 0.4,
            life: 40 + Math.random() * 20,
            size: 6 + Math.random() * 2
        });
    }
}

function updateParticles() {
    game.particles = game.particles.filter((p) => p.life > 0);
    game.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        ctx.fillStyle = `rgba(255, 185, 207, ${Math.max(0, p.life / 90)})`;
        ctx.font = `${p.size}px Fredoka, sans-serif`;
        ctx.fillText('❤', p.x, p.y);
    });
}

function updateGrassFlowers() {
    game.grassFlowers = game.grassFlowers.filter((f) => f.life > 0);
    game.grassFlowers.forEach((f) => {
        f.life -= 1;
    });
}

function drawTerrainTiles() {
    game.terrainTiles.forEach((type, key) => {
        const [gx, gy] = key.split(',').map(Number);
        const x = gx * tileSize;
        const y = gy * tileSize;

        if (type === 'path') {
            ctx.fillStyle = '#e3c2a3';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = '#d3a77f';
            ctx.fillRect(x, y + tileSize - 6, tileSize, 6);
        } else if (type === 'water') {
            ctx.fillStyle = '#9bd9ff';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(x + 2, y + 2, tileSize - 8, 4);
        } else if (type === 'cliff') {
            ctx.fillStyle = '#7ec08e';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = '#6aa97f';
            ctx.fillRect(x, y, tileSize, 4);
            ctx.fillStyle = 'rgba(40, 70, 40, 0.18)';
            ctx.fillRect(x, y + tileSize - 4, tileSize, 4);
        }
    });

    game.designTiles.forEach((key) => {
        const [gx, gy] = key.split(',').map(Number);
        const x = gx * tileSize;
        const y = gy * tileSize;
        ctx.fillStyle = '#fff6e9';
        ctx.fillRect(x, y, tileSize, tileSize);
        drawDesignPattern(game.designs.ground, x, y, tileSize, tileSize, 0.9);
        ctx.strokeStyle = 'rgba(180, 160, 140, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
    });
}

// Função para desenhar relva/ambiente
function drawEnvironment() {
    const time = Date.now() / 1000;
    const progress = Math.min(12, game.cardsRead.size);
    const stage = Math.floor(progress / 3);
    const lightBoost = progress / 12;

    // Grama
    ctx.fillStyle = '#a7e7a2';
    for (let y = 0; y < canvas.height; y += 30) {
        for (let x = 0; x < canvas.width; x += 30) {
            const offset = (x + y) % 2 === 0 ? 0 : 10;
            ctx.fillRect(x, y, 30, 30);
            ctx.fillStyle = offset === 0 ? '#a7e7a2' : '#94d992';
            const noise = (x * 17 + y * 31) % 100;
            if (noise < 12) {
                ctx.fillStyle = '#7fcb7b';
                ctx.fillRect(x + 6, y + 8, 3, 8);
                ctx.fillRect(x + 12, y + 10, 3, 6);
            }
            if (noise > 92) {
                ctx.fillStyle = '#7cc678';
                ctx.fillRect(x + 18, y + 18, 6, 4);
            }
        }
        ctx.fillStyle = '#a7e7a2';
    }

    // Manchas de relva mais escura
    for (let i = 0; i < 16; i++) {
        const px = (i * 97) % canvas.width;
        const py = (i * 73) % canvas.height;
        ctx.fillStyle = 'rgba(118, 196, 112, 0.3)';
        ctx.beginPath();
        ctx.ellipse(px + 40, py + 20, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTerrainTiles();

    // Caminho de terra
    const pathWidth = 96;
    for (let y = 0; y <= canvas.height; y += 20) {
        const t = y / 90;
        const center = canvas.width / 2 + Math.sin(t) * 90;
        ctx.fillStyle = '#e3c2a3';
        ctx.fillRect(center - pathWidth / 2, y, pathWidth, 22);
        ctx.fillStyle = '#d3a77f';
        ctx.fillRect(center - pathWidth / 2, y + 14, pathWidth, 6);
    }

    // Bordas do caminho
    for (let y = 0; y <= canvas.height; y += 40) {
        const t = y / 90;
        const center = canvas.width / 2 + Math.sin(t) * 90;
        ctx.fillStyle = '#c39a73';
        ctx.fillRect(center - pathWidth / 2 - 6, y + 6, 6, 20);
        ctx.fillRect(center + pathWidth / 2, y + 6, 6, 20);
    }


    // Lago pequeno
    const lakeBase = progress >= 10 ? '#aee6ff' : '#9bd9ff';
    const lakeEdge = progress >= 10 ? '#d7f2ff' : '#cbefff';
    ctx.fillStyle = lakeBase;
    ctx.beginPath();
    ctx.ellipse(640, 420, 90, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Efeitos no lago
    for (let i = 0; i < 4; i++) {
        const rippleX = 600 + i * 30;
        const rippleY = 405 + Math.sin(time * 2 + i) * 6;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rippleX, rippleY, 8, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
    }

    // Tronco no lago
    ctx.fillStyle = '#cfa37c';
    ctx.fillRect(600, 420, 36, 10);
    ctx.fillStyle = '#b3845c';
    ctx.fillRect(600, 426, 36, 4);
    ctx.fillStyle = '#95613f';
    ctx.fillRect(600, 420, 6, 10);

    // Peixinhos
    const fish = [
        { x: 635, y: 410 },
        { x: 660, y: 438 }
    ];
    fish.forEach((f, idx) => {
        const wiggle = Math.sin(time * 3 + idx) * 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y + wiggle, 6, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
    });

    // Bolinhas
    for (let i = 0; i < 4; i++) {
        const bx = 625 + i * 14;
        const by = 402 + Math.sin(time * 2 + i) * 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = lakeEdge;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = '#6fb3de';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + lightBoost * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(670, 405, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Margem de areia
    ctx.fillStyle = 'rgba(246, 232, 199, 0.9)';
    ctx.beginPath();
    ctx.ellipse(640, 420, 98, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lakeBase;
    ctx.beginPath();
    ctx.ellipse(640, 420, 90, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Banco perto do lago (desbloqueia no fim)
    if (progress >= 12) {
        ctx.fillStyle = 'rgba(255, 215, 170, 0.35)';
        ctx.beginPath();
        ctx.ellipse(lakeBench.x + 22, lakeBench.y + 8, 26, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#d7b48c';
    ctx.fillRect(lakeBench.x, lakeBench.y, lakeBench.width, lakeBench.height);
    ctx.fillStyle = '#b1865d';
    ctx.fillRect(lakeBench.x, lakeBench.y - 6, lakeBench.width, 6);
    ctx.fillRect(lakeBench.x + 4, lakeBench.y + lakeBench.height, 6, 8);
    ctx.fillRect(lakeBench.x + lakeBench.width - 10, lakeBench.y + lakeBench.height, 6, 8);

    // Ponte de madeira
    ctx.fillStyle = 'rgba(110, 80, 60, 0.18)';
    ctx.fillRect(600, 420, 80, 8);
    ctx.fillStyle = '#d7b48c';
    ctx.fillRect(600, 395, 80, 22);
    ctx.fillStyle = '#c99a6b';
    ctx.fillRect(600, 413, 80, 6);
    ctx.fillStyle = '#b08258';
    ctx.fillRect(600, 393, 80, 4);
    ctx.fillRect(600, 417, 80, 4);

    // Cercas
    ctx.strokeStyle = '#c39a73';
    ctx.lineWidth = 3;
    for (let x = 110; x <= 290; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 380);
        ctx.lineTo(x, 410);
        ctx.stroke();
    }
    ctx.fillStyle = '#c39a73';
    ctx.fillRect(110, 392, 200, 6);
    ctx.fillStyle = 'rgba(110, 80, 60, 0.18)';
    ctx.fillRect(112, 412, 200, 4);

    // Casinha simples
    ctx.fillStyle = 'rgba(90, 60, 35, 0.2)';
    ctx.fillRect(100, 344, 120, 10);
    ctx.fillStyle = '#ffe0b8';
    ctx.fillRect(90, 260, 120, 80);
    ctx.fillStyle = '#eab98a';
    ctx.fillRect(90, 260, 120, 10);
    ctx.fillStyle = '#c98a5f';
    ctx.beginPath();
    ctx.moveTo(80, 260);
    ctx.lineTo(150, 210);
    ctx.lineTo(230, 260);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b3744b';
    ctx.fillRect(100, 260, 100, 4);
    ctx.fillRect(96, 264, 108, 4);
    ctx.fillStyle = '#8a5a3a';
    ctx.fillRect(135, 300, 30, 40);
    ctx.fillStyle = '#7b4a2e';
    ctx.fillRect(138, 302, 24, 36);
    ctx.fillStyle = '#f3d9be';
    ctx.beginPath();
    ctx.arc(158, 320, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#92c8f2';
    ctx.fillRect(110, 280, 20, 18);
    ctx.fillRect(170, 280, 20, 18);
    ctx.strokeStyle = '#f1d1b4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 280);
    ctx.lineTo(120, 298);
    ctx.moveTo(180, 280);
    ctx.lineTo(180, 298);
    ctx.stroke();
    ctx.fillStyle = '#6aaee6';
    ctx.fillRect(112, 282, 16, 6);
    ctx.fillRect(172, 282, 16, 6);
    ctx.strokeStyle = '#b3845c';
    ctx.lineWidth = 2;
    for (let x = 92; x <= 210; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, 256);
        ctx.lineTo(x + 10, 262);
        ctx.stroke();
    }
    ctx.fillStyle = '#d2a977';
    ctx.fillRect(120, 340, 50, 8);
    ctx.fillStyle = '#b9855f';
    ctx.fillRect(122, 340, 46, 4);
    ctx.fillStyle = '#b1865d';
    ctx.fillRect(140, 318, 4, 22);
    ctx.fillRect(156, 318, 4, 22);
    ctx.fillStyle = '#ffd7a8';
    ctx.fillRect(108, 300, 28, 8);
    ctx.fillStyle = '#ffb2c8';
    ctx.beginPath();
    ctx.arc(116, 304, 3, 0, Math.PI * 2);
    ctx.arc(122, 304, 3, 0, Math.PI * 2);
    ctx.arc(128, 304, 3, 0, Math.PI * 2);
    ctx.fill();

    // Chamine e fumo
    ctx.fillStyle = '#8a5a3a';
    ctx.fillRect(185, 220, 12, 22);
    ctx.fillStyle = '#6f4630';
    ctx.fillRect(185, 220, 12, 4);
    for (let i = 0; i < 3; i++) {
        const sx = 191 + Math.sin(time * 0.8 + i) * 6;
        const sy = 210 - i * 10 - (time * 10 % 20);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 8 - i * 2, 5 - i, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Canteiros de flores
    const beds = [
        {x: 260, y: 200}, {x: 520, y: 470}
    ];

    beds.forEach((bed) => {
        ctx.fillStyle = '#d8caa8';
        ctx.fillRect(bed.x - 40, bed.y - 16, 80, 32);
        ctx.strokeStyle = '#bda980';
        ctx.lineWidth = 2;
        ctx.strokeRect(bed.x - 40, bed.y - 16, 80, 32);

        for (let i = -3; i <= 3; i++) {
            const fx = bed.x + i * 12;
            ctx.fillStyle = '#ff9fc0';
            ctx.beginPath();
            ctx.arc(fx, bed.y - 4, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffe08a';
            ctx.beginPath();
            ctx.arc(fx, bed.y + 6, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Arvores
    const trees = [
        {x: 70, y: 90}, {x: 730, y: 120}, {x: 120, y: 430},
        {x: 700, y: 480}, {x: 220, y: 250}, {x: 580, y: 300},
        {x: 90, y: 520}, {x: 640, y: 80}, {x: 420, y: 120},
        {x: 520, y: 360}, {x: 300, y: 140}, {x: 360, y: 520}
    ];

    trees.forEach((tree, index) => {
        const sway = Math.sin(time * 2 + index) * 2;
        ctx.fillStyle = 'rgba(50, 80, 50, 0.18)';
        ctx.beginPath();
        ctx.ellipse(tree.x, tree.y + 30, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Copa
        ctx.fillStyle = '#7fd39a';
        ctx.beginPath();
        ctx.arc(tree.x + sway, tree.y, 18, 0, Math.PI * 2);
        ctx.arc(tree.x - 12 + sway, tree.y + 4, 14, 0, Math.PI * 2);
        ctx.arc(tree.x + 12 + sway, tree.y + 6, 14, 0, Math.PI * 2);
        ctx.fill();

        // Tronco
        ctx.fillStyle = '#b3875f';
        ctx.fillRect(tree.x - 6, tree.y + 16, 12, 18);
        ctx.fillStyle = '#95613f';
        ctx.fillRect(tree.x - 6, tree.y + 28, 12, 6);
    });


    // Arbustos
    const bushes = [
        {x: 120, y: 150}, {x: 680, y: 160}, {x: 140, y: 360},
        {x: 620, y: 520}, {x: 260, y: 120}, {x: 520, y: 520},
        {x: 720, y: 260}, {x: 320, y: 320},
        {x: 420, y: 420}, {x: 200, y: 520}
    ];

    bushes.forEach((bush, index) => {
        const sway = Math.sin(time * 2.2 + index) * 1.5;
        ctx.fillStyle = 'rgba(50, 80, 50, 0.16)';
        ctx.beginPath();
        ctx.ellipse(bush.x, bush.y + 14, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8ad8a0';
        ctx.beginPath();
        ctx.arc(bush.x + sway, bush.y, 16, 0, Math.PI * 2);
        ctx.arc(bush.x - 12 + sway, bush.y + 4, 12, 0, Math.PI * 2);
        ctx.arc(bush.x + 12 + sway, bush.y + 4, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffb9cf';
        ctx.beginPath();
        ctx.arc(bush.x + sway, bush.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Flores decorativas
    const flowers = [
        {x: 50, y: 50}, {x: 750, y: 550}, {x: 200, y: 500},
        {x: 700, y: 100}, {x: 400, y: 50}
    ];
    const extraFlowers = [
        {x: 160, y: 120}, {x: 240, y: 460}, {x: 520, y: 120},
        {x: 610, y: 520}, {x: 320, y: 420}, {x: 680, y: 320},
        {x: 430, y: 520}, {x: 560, y: 240}
    ];
    const extraCount = Math.min(extraFlowers.length, stage * 2);

    flowers.concat(extraFlowers.slice(0, extraCount)).forEach((flower) => {
        ctx.fillStyle = '#ffb2c8';
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (j / 5) * Math.PI * 2;
            const px = flower.x + Math.cos(angle) * 8;
            const py = flower.y + Math.sin(angle) * 8;
            ctx.arc(px, py, 5, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.fillStyle = '#ffe5a3';
        ctx.beginPath();
        ctx.arc(flower.x, flower.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Flores que crescem ao caminhar
    game.grassFlowers.forEach((flower) => {
        const sway = Math.sin(time * 2 + flower.seed) * 1.2;
        const alpha = Math.max(0, Math.min(1, flower.life / 360));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#7cc678';
        ctx.fillRect(flower.x - 1 + sway, flower.y + 2, 2, 5);
        ctx.fillStyle = flower.color;
        ctx.beginPath();
        ctx.arc(flower.x + sway, flower.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Relva extra (tufts)
    for (let i = 0; i < 24; i++) {
        const gx = (i * 73) % canvas.width;
        const gy = (i * 91) % canvas.height;
        ctx.fillStyle = '#7fcb7b';
        ctx.fillRect(gx + 4, gy + 6, 2, 6);
        ctx.fillRect(gx + 8, gy + 4, 2, 8);
    }

    for (let i = 0; i < 40; i++) {
        const gx = (i * 47 + 23) % canvas.width;
        const gy = (i * 59 + 19) % canvas.height;
        ctx.fillStyle = i % 2 === 0 ? '#7cc678' : '#8ad49a';
        ctx.fillRect(gx + 2, gy + 10, 2, 5);
        ctx.fillRect(gx + 6, gy + 8, 2, 6);
        ctx.fillRect(gx + 10, gy + 12, 2, 4);
    }

    if (game.theme === 'pastel') {
        const ribbons = [
            {x: 320, y: 110}, {x: 460, y: 500}
        ];

        ribbons.forEach((ribbon) => {
            ctx.fillStyle = '#ffd7ea';
            ctx.beginPath();
            ctx.ellipse(ribbon.x, ribbon.y, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffb2c8';
            ctx.beginPath();
            ctx.arc(ribbon.x, ribbon.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    if (game.theme === 'city') {
        const benches = [
            {x: 300, y: 420}, {x: 520, y: 360}
        ];

        benches.forEach((bench) => {
            ctx.fillStyle = '#d7b48c';
            ctx.fillRect(bench.x, bench.y, 36, 8);
            ctx.fillRect(bench.x, bench.y - 6, 36, 6);
            ctx.fillStyle = '#b1865d';
            ctx.fillRect(bench.x + 4, bench.y + 8, 6, 8);
            ctx.fillRect(bench.x + 26, bench.y + 8, 6, 8);
        });

        const lamps = [
            {x: 240, y: 280}, {x: 560, y: 220}
        ];

        lamps.forEach((lamp) => {
            ctx.fillStyle = '#b1865d';
            ctx.fillRect(lamp.x, lamp.y, 6, 24);
            ctx.fillStyle = '#ffe5a3';
            ctx.beginPath();
            ctx.arc(lamp.x + 3, lamp.y - 2, 8, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Troncos
    const logs = [
        {x: 520, y: 220}, {x: 150, y: 470}
    ];

    logs.forEach((log) => {
        ctx.fillStyle = '#cfa37c';
        ctx.fillRect(log.x - 16, log.y - 6, 32, 12);
        ctx.fillStyle = '#b3845c';
        ctx.fillRect(log.x - 16, log.y + 2, 32, 4);
        ctx.fillStyle = '#95613f';
        ctx.beginPath();
        ctx.arc(log.x - 16, log.y, 6, 0, Math.PI * 2);
        ctx.arc(log.x + 16, log.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    // Luz quente do por do sol
    const sunset = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const topGlow = progress >= 10 ? 0.22 : 0.18;
    const midGlow = progress >= 10 ? 0.16 : 0.12;
    const lowGlow = 0.08 - lightBoost * 0.04;
    sunset.addColorStop(0, `rgba(255, 200, 170, ${topGlow})`);
    sunset.addColorStop(0.6, `rgba(255, 175, 150, ${midGlow})`);
    sunset.addColorStop(1, `rgba(255, 160, 140, ${Math.max(0.04, lowGlow)})`);
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (progress >= 12) {
        ctx.fillStyle = 'rgba(255, 245, 235, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Atualizar posição do jogador
function updatePlayer() {
    if (game.showingMessage || game.editingTerrain) return;
    
    const p = game.player;
    const now = performance.now();
    const oldX = p.x;
    const oldY = p.y;
    let newX = p.x;
    let newY = p.y;
    
    if (game.keys['ArrowLeft']) newX -= p.speed;
    if (game.keys['ArrowRight']) newX += p.speed;
    if (game.keys['ArrowUp']) newY -= p.speed;
    if (game.keys['ArrowDown']) newY += p.speed;
    
    // Limites do canvas
    newX = Math.max(0, Math.min(canvas.width - p.width, newX));
    newY = Math.max(0, Math.min(canvas.height - p.height, newY));
    
    p.x = newX;
    p.y = newY;

    const moving = newX !== oldX || newY !== oldY;
    p.anim.isMoving = moving;
    if (moving) {
        p.anim.lastMoveTime = now;
        if (now - p.anim.lastFlowerTime > 140) {
            p.anim.lastFlowerTime = now;
            game.grassFlowers.push({
                x: p.x + p.width / 2,
                y: p.y + p.height - 4,
                life: 360,
                seed: Math.random() * 10,
                color: Math.random() > 0.5 ? '#ffb2c8' : '#ffe08a'
            });
            if (game.grassFlowers.length > 70) {
                game.grassFlowers.shift();
            }
        }
    }
    if (game.keys['ArrowUp']) p.facing = 'up';
    else if (game.keys['ArrowDown']) p.facing = 'down';
    else if (game.keys['ArrowLeft']) p.facing = 'left';
    else if (game.keys['ArrowRight']) p.facing = 'right';

    if (moving) {
        if (now - p.anim.lastStep > 120) {
            p.anim.step = (p.anim.step + 1) % 2;
            p.anim.lastStep = now;
        }
    } else {
        p.anim.step = 0;
        if (now - p.anim.lastMoveTime > 2200 && now - game.pet.lastIdleHeart > 2400) {
            game.pet.lastIdleHeart = now;
            game.pet.wagBoostUntil = now + 1200;
            spawnSmallHearts(game.pet.x + 12, game.pet.y - 2, 3);
        }
    }
}

function updateDog() {
    const d = game.pet;
    const now = performance.now();
    const player = game.player;
    let offsetX = 28;
    if (player.facing === 'right') offsetX = -28;
    if (player.facing === 'left') offsetX = 28;
    const targetX = player.x + offsetX;
    const targetY = player.y + 14;

    if (now < d.sitUntil) {
        d.isMoving = false;
        return;
    }

    const dx = targetX - d.x;
    const dy = targetY - d.y;
    d.isMoving = Math.hypot(dx, dy) > 0.6;
    d.x += dx * 0.06;
    d.y += dy * 0.06;

    d.x = Math.max(0, Math.min(canvas.width - d.width, d.x));
    d.y = Math.max(0, Math.min(canvas.height - d.height, d.y));
}

// Verificar interação com cartas
function checkCardInteraction() {
    if (game.showingMessage || game.editingTerrain) return;

    let handled = false;
    cards.forEach((card, index) => {
        if (game.cardsRead.has(index)) return;
        
        const distance = Math.sqrt(
            Math.pow(game.player.x + game.player.width/2 - (card.x + 14), 2) +
            Math.pow(game.player.y + game.player.height/2 - (card.y + 14), 2)
        );
        
        if (distance < 60) {
            game.currentCard = index;
            if (game.keys[' '] || game.keys['Space']) {
                showMessage(card.message, index, '💌 Carta de Amor', 'card');
                handled = true;
            }
        }
    });

    if (handled) return;

    const now = performance.now();
    const enzoDist = Math.hypot(
        game.player.x + game.player.width / 2 - (game.pet.x + game.pet.width / 2),
        game.player.y + game.player.height / 2 - (game.pet.y + game.pet.height / 2)
    );
    if (enzoDist < 60 && (game.keys[' '] || game.keys['Space'])) {
        if (now - game.pet.lastInteract > 1200) {
            game.pet.wagBoostUntil = now + 1200;
            game.pet.sitUntil = now + 600;
            game.pet.lastInteract = now;
        }
        return;
    }

    if (game.finalUnlocked && !game.finalShown) {
        const benchDist = Math.hypot(
            game.player.x + game.player.width / 2 - (lakeBench.x + lakeBench.width / 2),
            game.player.y + game.player.height / 2 - (lakeBench.y + lakeBench.height / 2)
        );
        if (benchDist < 70 && (game.keys[' '] || game.keys['Space'])) {
            showMessage(finalMessage, null, '✨ Banco do Lago', 'final');
            playFinalChime();
            game.finalShown = true;
        }
    }
}

// Mostrar mensagem
function showMessage(message, cardIndex, title, type) {
    game.messageType = type || 'card';
    if (game.messageTitle) {
        game.messageTitle.textContent = title || '💌 Carta de Amor';
    }
    game.showingMessage = true;
    game.messageText.textContent = message;
    game.messageBox.classList.remove('hidden');

    if (cardIndex !== null && cardIndex !== undefined) {
        if (!game.cardsRead.has(cardIndex)) {
            game.cardsRead.add(cardIndex);
            playCardChime();
            spawnHearts(game.player.x + 12, game.player.y - 4);
            game.pet.sitUntil = performance.now() + 1000;
            game.pet.wagBoostUntil = performance.now() + 1400;
            updateCounter();
        }
    }
}

// Fechar mensagem
function closeMessage() {
    const lastType = game.messageType;
    game.showingMessage = false;
    game.messageBox.classList.add('hidden');
    game.currentCard = null;
    if (game.messageType === 'intro') {
        game.messageType = 'card';
    }
    if (lastType === 'completion' && !game.valentinePromptShown) {
        game.valentinePromptShown = true;
        showMessage(valentineMessage, null, '\u{1F498} Uma pergunta', 'valentine');
        playFinalChime();
    }
}

// Atualizar contador
function updateCounter() {
    game.counter.textContent = `Cartas lidas: ${game.cardsRead.size}/12`;
    if (game.cardsRead.size >= 12) {
        game.finalUnlocked = true;
        if (!game.completionShown) {
            game.completionShown = true;
            showMessage(completionMessage, null, '💖 Todas as cartas', 'completion');
            playFinalChime();
        }
    }
}

// Loop principal do jogo
function gameLoop() {
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar tudo
    drawEnvironment();
    drawDecorations();
    drawBirds();
    updateParticles();
    drawDucks();
    cards.forEach((card, index) => drawCard(card, index));
    drawDog();
    drawPlayer();
    
    // Atualizar
    updatePlayer();
    updateDog();
    updateGrassFlowers();
    checkCardInteraction();
    
    requestAnimationFrame(gameLoop);
}


// Event Listeners
document.addEventListener('keydown', (e) => {
    initAudio();
    game.keys[e.key] = true;
    
    if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (game.showingMessage) {
            closeMessage();
        }
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

document.addEventListener('pointerdown', initAudio, { once: true });

game.closeBtn.addEventListener('click', closeMessage);

game.messageBox.addEventListener('click', (e) => {
    if (e.target === game.messageBox) {
        closeMessage();
    }
});


showMessage(introMessage, null, '🌸 Bem-vinda', 'intro');

// Iniciar o jogo
gameLoop();
console.log('🎮 Jogo de São Valentim carregado! Use as setas para mover e ESPAÇO para ler cartas.');






