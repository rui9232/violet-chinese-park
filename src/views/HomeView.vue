<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { GRADES } from "../data/catalog";
import KidButton from "../components/KidButton.vue";
import Mascot from "../components/Mascot.vue";
import { getStars, sfxTap } from "../lib/fun";

const router = useRouter();
const code = ref("");
const stars = ref(getStars());

onMounted(() => {
  stars.value = getStars();
});

function go(path) {
  sfxTap();
  router.push(path);
}

function goCode() {
  const value = code.value.trim().toUpperCase();
  if (value.length >= 4) go(`/play/${value}`);
}
</script>

<template>
  <div class="space-y-6">
    <header class="sticker-card relative overflow-hidden p-5 md:flex md:items-center md:gap-6 md:p-7">
      <div class="tape" />
      <div class="flex justify-center md:shrink-0">
        <Mascot mood="happy" size="lg" say="來玩嘛～" />
      </div>
      <div class="mt-3 text-center md:mt-0 md:text-left">
        <p class="font-display text-lg text-berry">Violet的中文樂園</p>
        <h1 class="mt-1 font-display text-4xl leading-tight md:text-5xl">今天想去哪個島玩？</h1>
        <p class="mx-auto mt-3 max-w-xl text-base font-bold leading-relaxed text-ink/70 md:mx-0">
          一到六年級都有關卡。想學部首就去猜部首、找一家人、當部首獵人！
        </p>
        <p class="mt-3 inline-flex h-9 items-center rounded-full bg-sun px-4 font-black">你的星星罐 ⭐ {{ stars }}</p>
      </div>
    </header>

    <section>
      <h2 class="mb-3 font-display text-3xl">探險地圖</h2>
      <div class="card-grid">
        <button
          v-for="(grade, i) in GRADES"
          :key="grade.id"
          class="island flex min-h-[10.5rem] flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 text-left text-white bounce-in"
          :class="grade.color"
          :style="{ animationDelay: `${i * 60}ms` }"
          @click="go(`/grade/${grade.id}`)"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="inline-flex h-8 items-center rounded-full bg-white/20 px-3 text-sm font-black">
              第 {{ grade.id }} 島
            </span>
            <span class="text-4xl leading-none">{{ grade.emoji }}</span>
          </div>
          <div>
            <h3 class="font-display text-3xl leading-tight">{{ grade.theme }}</h3>
            <p class="mt-1 font-bold leading-snug text-white/90">{{ grade.title }} · {{ grade.blurb }}</p>
          </div>
        </button>
      </div>
    </section>

    <section class="card-grid">
      <div class="sticker-card flex min-h-[12rem] flex-col p-5">
        <h2 class="font-display text-2xl">有秘密房間碼？</h2>
        <p class="mt-1 font-bold leading-snug text-ink/60">老師蓋好的關卡，輸入四碼就能闖關。</p>
        <div class="mt-auto flex items-stretch gap-2 pt-4">
          <input
            v-model="code"
            maxlength="6"
            class="min-w-0 flex-1 rounded-2xl border-4 border-dashed border-berry/40 bg-cream px-3 py-2 text-center font-display text-2xl uppercase tracking-[0.25em]"
            placeholder="ABCD"
            @keyup.enter="goCode"
          />
          <KidButton color="bg-berry" @click="goCode">衝！</KidButton>
        </div>
      </div>
      <div class="sticker-card flex min-h-[12rem] flex-col bg-ink p-5 text-white">
        <h2 class="font-display text-2xl">老師魔法工坊</h2>
        <p class="mt-1 font-bold leading-snug text-white/80">一題一題填，選正確答案，就能變成孩子的闖關碼。</p>
        <div class="mt-auto pt-4">
          <KidButton color="bg-sun" @click="go('/studio')">去蓋關卡</KidButton>
        </div>
      </div>
    </section>
  </div>
</template>
