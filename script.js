const spinner = document.getElementById('spinner');
const startBtn = document.getElementById('startBtn');
const resultSection = document.getElementById('resultSection');
const resultIcon = document.getElementById('resultIcon');
const resultText = document.getElementById('resultText');
const resultDesc = document.getElementById('resultDesc');
const actionBtn = document.getElementById('actionBtn');
const timerSection = document.getElementById('timerSection');
const timerEl = document.getElementById('timer');
const cancelBtn = document.getElementById('cancelBtn');
const rollAgainBtn = document.getElementById('rollAgainBtn');

const options = [
  { name: 'DRAW', icon: '🎨', desc: 'Draw the movie!', angle: 300 },
  { name: 'ACT', icon: '💃', desc: 'Act the movie!', angle: 180 },
  { name: 'EXPLAIN', icon: '😃', desc: 'Explain the movie!', angle: 60 }
];

let currentRotation = 0;
let timerInterval;
let audioCtx;

/* ------------------ 사운드 ------------------ */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, duration, type = 'sine', volume = 0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration
  );
}

// 룰렛 회전음
function playSpinSound() {
  let count = 0;
  const spinInterval = setInterval(() => {
    playTone(200 + count * 5, 0.03, 'square', 0.05);
    count++;
    if (count > 60) clearInterval(spinInterval);
  }, 60);
}

// 결과 ding
function playDing() {
  playTone(880, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(1320, 0.2, 'sine', 0.12), 120);
}

// 마지막 10초 tick
function playTick() {
  playTone(600, 0.05, 'square', 0.08);
}

/* ------------------ 스피너 ------------------ */
startBtn.addEventListener('click', () => {
  initAudio();

  startBtn.disabled = true;
  resultSection.classList.add('hidden');
  rollAgainBtn.classList.add('hidden');

  const result = options[Math.floor(Math.random() * options.length)];

  const extraSpins = 5 * 360;
  const finalAngle = extraSpins + result.angle;

  currentRotation += finalAngle;

  spinner.style.transform = `rotate(${currentRotation}deg)`;

  playSpinSound();

  setTimeout(() => {
    showResult(result);
    playDing();
    startBtn.disabled = false;
  }, 4000);
});

function showResult(result) {
  resultIcon.textContent = result.icon;
  resultText.textContent = result.name;
  resultDesc.textContent = result.desc;
  resultSection.classList.remove('hidden');
}

/* ------------------ 타이머 ------------------ */
actionBtn.addEventListener('click', startTimer);
cancelBtn.addEventListener('click', resetGame);
rollAgainBtn.addEventListener('click', resetGame);

function startTimer() {
  actionBtn.classList.add('hidden');
  timerSection.classList.remove('hidden');

  let timeLeft = 60;
  updateTimer(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer(timeLeft);

    if (timeLeft <= 10 && timeLeft > 0) {
      timerEl.classList.add('warning');
      playTick();
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerEl.textContent = 'TIME'S UP!';
      timerEl.classList.remove('warning');
      playDing();

      setTimeout(() => {
        timerSection.classList.add('hidden');
        rollAgainBtn.classList.remove('hidden');
      }, 1000);
    }
  }, 1000);
}

function updateTimer(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  timerEl.textContent = `${mins}:${secs}`;
}

function resetGame() {
  clearInterval(timerInterval);

  resultSection.classList.add('hidden');
  timerSection.classList.add('hidden');
  rollAgainBtn.classList.add('hidden');
  actionBtn.classList.remove('hidden');

  timerEl.classList.remove('warning');
  timerEl.textContent = '01:00';
}

/* ------------------ 파티클 효과 ------------------ */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedY = Math.random() * 1 + 0.2;
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.y -= this.speedY;
    if (this.y < 0) {
      this.y = canvas.height;
      this.x = Math.random() * canvas.width;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,79,216,${this.alpha})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff4fd8';
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animateParticles);
}
animateParticles();