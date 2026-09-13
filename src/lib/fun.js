let audio;

function context() {
  if (!audio) audio = new AudioContext();
  if (audio.state === "suspended") audio.resume();
  return audio;
}

function beep(freq, duration, type = "sine", gain = 0.06) {
  try {
    const ctx = context();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* 有些瀏覽器要先點一下才有聲音 */
  }
}

export function sfxTap() {
  beep(720, 0.05, "triangle", 0.04);
}

export function sfxCorrect() {
  beep(523, 0.09, "sine");
  window.setTimeout(() => beep(784, 0.14, "sine", 0.07), 90);
}

export function sfxWrong() {
  beep(196, 0.2, "square", 0.05);
}

export function sfxWin() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    window.setTimeout(() => beep(freq, 0.14, "sine", 0.07), i * 95);
  });
}

export function sfxFlip() {
  beep(440, 0.07, "triangle", 0.04);
}

export function sfxPop() {
  beep(880, 0.06, "square", 0.035);
  window.setTimeout(() => beep(1320, 0.08, "triangle", 0.04), 50);
}

export function sfxWhoosh() {
  beep(320, 0.08, "triangle", 0.04);
  window.setTimeout(() => beep(520, 0.1, "sine", 0.04), 40);
}

export function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const YEAH = ["耶～答對了！", "太棒了！", "你是中文小星星！", "哇塞，太厲害！", "貼紙＋1！", "Bingo！不是，是中文 Bingo！"];
const OOPS = ["喔喔，差一點點～", "再想一下下～", "再猜一次嘛～", "這題在逗你玩！", "加油，下一題你會的！"];

export function cuteYeah() {
  return YEAH[Math.floor(Math.random() * YEAH.length)];
}

export function cuteOops() {
  return OOPS[Math.floor(Math.random() * OOPS.length)];
}

export function addStars(n = 1) {
  const next = Number(localStorage.getItem("xiaomo-stars") || 0) + n;
  localStorage.setItem("xiaomo-stars", String(next));
  return next;
}

export function getStars() {
  return Number(localStorage.getItem("xiaomo-stars") || 0);
}

export function pickSpawn(target, decoys = [], chance = 0.5, forceTarget = false) {
  const clean = decoys.filter((item) => item && item !== target);
  const isTarget = forceTarget || Math.random() < chance || !clean.length;
  const text = isTarget ? target : clean[Math.floor(Math.random() * clean.length)];
  return { text, isTarget: text === target };
}

export function trackTimers() {
  const ids = [];
  return {
    later(fn, ms) {
      const id = window.setTimeout(fn, ms);
      ids.push(id);
      return id;
    },
    every(fn, ms) {
      const id = window.setInterval(fn, ms);
      ids.push(id);
      return id;
    },
    clear() {
      while (ids.length) {
        const id = ids.pop();
        window.clearTimeout(id);
        window.clearInterval(id);
      }
    },
  };
}
