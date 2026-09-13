<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { GAME_TYPES, GRADES } from "../data/catalog";
import KidButton from "../components/KidButton.vue";
import { deleteCustomGame, listCustomGames, saveCustomGame } from "../lib/studio";
import {
  countReady,
  emptyRow,
  labelsFor,
  payloadFromRows,
  rowsFromBuiltin,
  rowsFromGame,
  setupKind,
} from "../lib/builder";

const router = useRouter();
const games = ref(listCustomGames());
const saved = ref(null);
const copied = ref(false);
const error = ref("");
const editingCode = ref("");

const form = reactive({
  title: "我的中文關卡",
  grade: 1,
  type: "choice",
  rows: [emptyRow("choice"), emptyRow("choice"), emptyRow("choice")],
});

const kind = computed(() => setupKind(form.type));
const labels = computed(() => labelsFor(form.type));
const meta = computed(() => GAME_TYPES.find((item) => item.id === form.type));
const readyCount = computed(() => countReady(form.type, form.rows));
const arcadeGames = computed(() => GAME_TYPES.filter((item) => item.arcade));
const radicalGames = computed(() => GAME_TYPES.filter((item) => item.radical));
const brainGames = computed(() => GAME_TYPES.filter((item) => !item.arcade && !item.radical));
const gameName = computed(() => GAME_TYPES.find((item) => item.id === saved.value?.type)?.name || "");

function reload() {
  games.value = listCustomGames();
}

function chooseType(type) {
  if (form.type === type) return;
  form.type = type;
  form.rows = [emptyRow(type), emptyRow(type), emptyRow(type)];
  editingCode.value = "";
  saved.value = null;
  error.value = "";
}

function addRow() {
  form.rows.push(emptyRow(form.type));
}

function removeRow(index) {
  if (form.rows.length <= 1) {
    form.rows[0] = emptyRow(form.type);
    return;
  }
  form.rows.splice(index, 1);
}

function fillExample() {
  form.rows = rowsFromBuiltin(form.grade, form.type);
  error.value = "";
}

function publish() {
  error.value = "";
  const payload = payloadFromRows(form.title, form.grade, form.type, form.rows);
  if (!payload) {
    error.value = "至少要完成一題才能產生房間碼。空的格子會被略過。";
    return;
  }
  const record = saveCustomGame({ ...payload, code: editingCode.value || undefined });
  saved.value = record;
  editingCode.value = record.code;
  copied.value = false;
  reload();
}

function editGame(game) {
  form.title = game.title || "我的中文關卡";
  form.grade = game.grade || 1;
  form.type = game.type;
  const rows = rowsFromGame(game);
  form.rows = rows.length ? rows : [emptyRow(game.type)];
  editingCode.value = game.code;
  saved.value = null;
  error.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function remove(code) {
  deleteCustomGame(code);
  if (editingCode.value === code) {
    editingCode.value = "";
    saved.value = null;
  }
  reload();
}

async function copyCode() {
  if (!saved.value?.code) return;
  try {
    await navigator.clipboard.writeText(saved.value.code);
    copied.value = true;
  } catch {
    copied.value = false;
  }
}

function optionLabel(i) {
  return ["A", "B", "C", "D"][i] || i + 1;
}
</script>

<template>
  <div class="space-y-6">
    <KidButton color="bg-white !text-ink" @click="router.push('/')">← 回首頁</KidButton>
    <header class="sticker-card bg-ink p-5 text-white md:p-6">
      <h1 class="font-display text-3xl">老師魔法工坊</h1>
      <p class="mt-2 font-bold leading-relaxed text-white/80">
        選年級、選遊戲，一題一題填就好。完成後會得到四碼房間碼，給孩子在首頁輸入。
      </p>
    </header>

    <section class="sticker-card space-y-5 p-5 md:p-6">
      <div class="grid gap-4 md:grid-cols-[2fr_1fr]">
        <label class="block font-black">
          關卡名稱
          <input v-model="form.title" class="studio-input mt-1" placeholder="例如：週末注音練習" />
        </label>
        <div>
          <p class="font-black">給幾年級玩？</p>
          <div class="mt-1 grid grid-cols-6 gap-2">
            <button
              v-for="grade in GRADES"
              :key="grade.id"
              type="button"
              class="h-11 rounded-2xl font-black shadow-chunky"
              :class="form.grade === grade.id ? 'bg-sun text-ink' : 'bg-cream text-ink/70'"
              @click="form.grade = grade.id"
            >
              {{ grade.id }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <p class="font-black">選一種遊戲</p>
        <p class="mt-1 text-sm font-bold text-ink/50">{{ labels.help }}</p>
        <div class="mt-3 space-y-3">
          <div v-for="group in [
            { title: '動腦筋', items: brainGames },
            { title: '學部首', items: radicalGames },
            { title: '動一動', items: arcadeGames },
          ]" :key="group.title">
            <p class="mb-2 text-sm font-black text-ink/50">{{ group.title }}</p>
            <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
              <button
                v-for="game in group.items"
                :key="game.id"
                type="button"
                class="flex items-center gap-2 rounded-2xl px-3 py-2 text-left font-black shadow-chunky"
                :class="form.type === game.id ? 'bg-grape text-white' : 'bg-cream text-ink'"
                @click="chooseType(game.id)"
              >
                <span class="text-xl leading-none">{{ game.emoji }}</span>
                <span class="min-w-0 truncate text-sm">{{ game.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="sticker-card space-y-4 p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-2xl">{{ meta?.emoji }} 出題 · {{ labels.title }}</h2>
          <p class="font-bold text-ink/50">已完成 {{ readyCount }} 題，空的題會自動略過</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <KidButton color="bg-sky" @click="fillExample">帶入{{ form.grade }}年級範例</KidButton>
          <KidButton color="bg-ink" @click="addRow">＋ 再加一題</KidButton>
        </div>
      </div>

      <article v-for="(row, index) in form.rows" :key="index" class="rounded-[1.6rem] bg-cream/80 p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <p class="font-display text-lg">第 {{ index + 1 }} 題</p>
          <button type="button" class="text-sm font-black text-berry" @click="removeRow(index)">刪這題</button>
        </div>

        <div v-if="kind === 'quiz'" class="space-y-3">
          <input v-model="row.q" class="studio-input" :placeholder="labels.q" />
          <div class="grid gap-2 sm:grid-cols-2">
            <label v-for="(_, i) in row.options" :key="i" class="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
              <input v-model.number="row.answer" type="radio" :value="i" class="h-4 w-4 accent-grape" />
              <span class="w-6 font-black text-ink/40">{{ optionLabel(i) }}</span>
              <input v-model="row.options[i]" class="min-w-0 flex-1 bg-transparent font-bold outline-none" :placeholder="`${labels.option} ${optionLabel(i)}`" />
            </label>
          </div>
          <p class="text-xs font-bold text-ink/40">點左邊圓圈，選出正確答案</p>
        </div>

        <div v-else-if="kind === 'listen'" class="grid gap-2 sm:grid-cols-2">
          <input v-model="row.speak" class="studio-input sm:col-span-2" :placeholder="labels.speak" />
          <input v-for="(_, i) in row.wrong" :key="i" v-model="row.wrong[i]" class="studio-input" :placeholder="`${labels.wrong} ${i + 1}`" />
        </div>

        <div v-else-if="kind === 'pair'" class="grid gap-2 sm:grid-cols-2">
          <input v-model="row.left" class="studio-input" :placeholder="labels.left" />
          <input v-model="row.right" class="studio-input" :placeholder="labels.right" />
        </div>

        <div v-else-if="kind === 'order'" class="grid gap-2 sm:grid-cols-2">
          <input v-model="row.word" class="studio-input" :placeholder="labels.word" />
          <input v-model="row.hint" class="studio-input" :placeholder="labels.hint" />
        </div>

        <div v-else-if="kind === 'target'" class="grid gap-2 sm:grid-cols-2">
          <input v-model="row.target" class="studio-input sm:col-span-2" :placeholder="labels.target" />
          <input v-for="(_, i) in row.decoys" :key="i" v-model="row.decoys[i]" class="studio-input" :placeholder="`${labels.decoy} ${i + 1}`" />
        </div>

        <div v-else-if="kind === 'odd'" class="space-y-3">
          <div class="grid gap-2 sm:grid-cols-2">
            <label v-for="(_, i) in row.options" :key="i" class="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
              <input v-model.number="row.answer" type="radio" :value="i" class="h-4 w-4 accent-berry" />
              <input v-model="row.options[i]" class="min-w-0 flex-1 bg-transparent font-bold outline-none" :placeholder="i === 0 ? '可以當小壞蛋的字' : `選項 ${i + 1}`" />
            </label>
          </div>
          <input v-model="row.why" class="studio-input" :placeholder="labels.why" />
          <p class="text-xs font-bold text-ink/40">點圓圈選出「不一樣」的那個</p>
        </div>

        <div v-else class="space-y-3">
          <div class="grid gap-2 sm:grid-cols-2">
            <input v-model="row.radical" class="studio-input" :placeholder="labels.radical" />
            <input v-model="row.mark" class="studio-input" :placeholder="labels.mark" />
          </div>
          <p class="text-xs font-black text-ink/50">正確的字（至少兩個）</p>
          <div class="grid grid-cols-3 gap-2">
            <input v-for="(_, i) in row.answers" :key="'a' + i" v-model="row.answers[i]" class="studio-input" :placeholder="`${labels.answer} ${i + 1}`" />
          </div>
          <p class="text-xs font-black text-ink/50">搗蛋字</p>
          <div class="grid grid-cols-3 gap-2">
            <input v-for="(_, i) in row.decoys" :key="'d' + i" v-model="row.decoys[i]" class="studio-input" :placeholder="`${labels.decoy} ${i + 1}`" />
          </div>
        </div>
      </article>

      <p v-if="error" class="font-black text-berry">{{ error }}</p>
      <div class="flex flex-wrap items-center gap-3">
        <KidButton color="bg-grape" :disabled="readyCount === 0" @click="publish">
          {{ editingCode ? "更新房間碼" : "產生房間碼" }}
        </KidButton>
        <span class="font-bold text-ink/50">{{ editingCode && !saved ? `正在改 ${editingCode}` : "" }}</span>
      </div>
    </section>

    <section v-if="saved" class="sticker-card bg-grape p-5 text-center text-white md:p-6">
      <p class="font-bold text-white/80">孩子在首頁輸入這個房間碼就能玩</p>
      <p class="mt-2 font-display text-5xl tracking-[0.2em]">{{ saved.code }}</p>
      <p class="mt-2 font-bold">{{ saved.title }} · {{ saved.grade }}年級 · {{ gameName }}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <KidButton color="bg-sun" @click="copyCode">{{ copied ? "已複製！" : "複製房間碼" }}</KidButton>
        <KidButton color="bg-ink" @click="router.push(`/play/${saved.code}`)">先試玩</KidButton>
      </div>
    </section>

    <section>
      <h2 class="mb-3 font-display text-2xl">我搭建過的關卡</h2>
      <div class="space-y-3">
        <article
          v-for="game in games"
          :key="game.code"
          class="sticker-card flex flex-wrap items-center justify-between gap-3 p-4"
        >
          <div class="min-w-0">
            <p class="truncate text-xl font-black">{{ game.title }}</p>
            <p class="font-bold text-ink/50">
              {{ game.code }} · {{ game.grade }}年級 · {{ GAME_TYPES.find((item) => item.id === game.type)?.name || game.type }}
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            <KidButton color="bg-sky" @click="router.push(`/play/${game.code}`)">玩</KidButton>
            <KidButton color="bg-sun !text-ink" @click="editGame(game)">改</KidButton>
            <KidButton color="bg-berry" @click="remove(game.code)">刪</KidButton>
          </div>
        </article>
        <p v-if="!games.length" class="font-bold text-ink/50">還沒有自訂關卡，上面填完就能產生。</p>
      </div>
    </section>
  </div>
</template>
