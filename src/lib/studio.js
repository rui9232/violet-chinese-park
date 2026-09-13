const STORAGE_KEY = "xiaomo-custom-games";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function listCustomGames() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomGame(game) {
  const games = listCustomGames();
  const code = game.code || randomCode();
  const record = {
    ...game,
    code,
    updatedAt: new Date().toISOString(),
  };
  const index = games.findIndex((item) => item.code === code);
  if (index >= 0) games[index] = record;
  else games.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games.slice(0, 40)));
  return record;
}

export function getCustomGame(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return listCustomGames().find((item) => item.code === normalized) || null;
}

export function deleteCustomGame(code) {
  const games = listCustomGames().filter((item) => item.code !== code);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function speakChinese(text) {
  if (!text || !window.speechSynthesis) return;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-TW";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
