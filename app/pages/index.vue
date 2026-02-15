<template>
  <div class="rsvp-page" :class="{ 'is-ready': introResolved }">
    <!-- ============================================ -->
    <!-- INTRO + INPUT (shared DOM — box morphs)      -->
    <!-- ============================================ -->
    <section
      v-if="phase !== 'playing'"
      class="rsvp-intro"
      @click="closeSettings"
    >
      <div class="intro-wrapper" ref="wrapperRef">
        <!-- Action buttons row (hidden during logo, revealed after) -->
        <div ref="actionRowRef" class="action-row">
          <button class="action-btn" @click="pasteFromClipboard">
            <Iconography name="copy" />
            <span>Paste text</span>
          </button>
          <button class="action-btn" @click="triggerFileSelect">
            <Iconography name="document" />
            <span>{{ isLoadingFile ? "Loading..." : "Select file" }}</span>
          </button>
        </div>

        <!-- The box: starts as logo container, becomes textarea -->
        <div ref="boxRef" class="the-box">
          <!-- RSVP logo letters as SVGs (overlay, fade out after animation) -->
          <div ref="logoLettersRef" class="logo-letters">
            <svg viewBox="12 12.85 38.45 119.3" class="logo-letter">
              <path
                d="M50.445 132.148H44.67C42.855 127.033 42.195 115.483 42.195 110.203L42.03 90.7325C41.865 77.3675 39.72 72.9125 27.84 72.9125H17.775V132.148H12V12.8525H29.82C46.155 12.8525 47.97 26.8775 47.97 42.5525C47.97 55.0925 45.825 67.4675 35.43 69.7775C45.495 71.9225 47.805 77.8625 47.805 90.0725C47.805 101.623 47.97 109.873 47.97 109.873C47.97 115.153 48.63 126.703 50.445 132.148ZM28.5 17.9675H17.775V67.7975H27.84C41.04 67.7975 42.03 54.2675 42.03 42.5525C42.03 29.3525 41.535 17.9675 28.5 17.9675Z"
                fill="currentColor"
              />
            </svg>
            <svg viewBox="619.14 10.87 37.12 123.26" class="logo-letter">
              <path
                d="M656.262 111.027C656.262 123.897 652.632 134.128 638.112 134.128C620.457 134.128 619.137 121.423 619.137 104.923C618.972 104.758 619.137 102.283 619.137 102.118H624.912C624.912 102.283 624.912 104.592 624.912 104.757C624.912 118.123 625.407 129.177 638.112 129.177C648.177 129.177 650.487 120.927 650.487 111.027C650.487 102.282 646.857 93.5375 642.897 85.2875L624.252 47.0075C621.117 40.4075 619.962 35.2925 620.457 29.1875C621.447 16.8125 628.047 10.8725 637.782 10.8725C653.952 10.8725 655.602 24.7325 655.602 39.2525C655.602 39.4175 655.602 40.9025 655.602 41.0675H649.827V39.5825C649.827 26.7125 648.837 15.8225 637.782 15.8225C630.192 15.8225 626.067 21.4325 626.067 32.3225C626.067 37.4375 627.222 41.7275 631.512 49.9775L648.342 82.8125C652.962 91.8875 656.262 101.457 656.262 111.027Z"
                fill="currentColor"
              />
            </svg>
            <svg viewBox="1224.88 12.85 46.2 119.3" class="logo-letter">
              <path
                d="M1271.08 12.8525L1251.45 132.148H1244.68L1224.88 12.8525H1230.99C1234.45 31.0025 1248.15 121.753 1248.15 121.753L1265.31 12.8525H1271.08Z"
                fill="currentColor"
              />
            </svg>
            <svg viewBox="1839.7 12.85 36.3 119.3" class="logo-letter">
              <path
                d="M1876 47.3375C1876 67.4675 1874.35 77.6975 1856.86 77.6975H1845.47V132.148H1839.7V12.8525H1857.68C1874.35 12.8525 1876 27.0425 1876 47.3375ZM1870.22 47.3375C1870.22 29.1875 1869.23 17.9675 1856.69 17.9675H1845.47V72.4175H1856.53C1869.23 72.4175 1870.22 63.6725 1870.22 47.3375Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <!-- Textarea (overlay, fades in after logo) -->
          <textarea
            ref="textareaRef"
            v-model="inputText"
            placeholder="Enter text here..."
            class="rsvp-textarea"
          ></textarea>
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".txt,.md,.pdf"
        @change="handleFileSelect"
        class="sr-only"
      />

      <!-- Bottom controls: appear when text is entered -->
      <div
        class="bottom-bar"
        :class="{ 'is-visible': inputText.trim() && inputReady }"
        @click.stop
      >
        <!-- Settings panel -->
        <div ref="settingsPanelRef" class="settings-panel">
          <div class="settings-inner">
            <div class="setting-row">
              <div class="setting-label">Speed</div>
              <div class="setting-value setting-value--input">
                <input
                  type="number"
                  :value="wpm"
                  @input="
                    wpm = clampWpm(+($event.target as HTMLInputElement).value)
                  "
                  min="50"
                  max="1000"
                  step="25"
                />
                <span class="setting-suffix">wpm</span>
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Prosody</div>
              <div class="setting-value setting-value--input">
                <input
                  type="number"
                  :value="punctuationDelay"
                  @input="
                    punctuationDelay = clampProsody(
                      +($event.target as HTMLInputElement).value,
                    )
                  "
                  min="0"
                  max="2000"
                  step="50"
                />
                <span class="setting-suffix">ms</span>
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Font</div>
              <div class="setting-value setting-value--select">
                <select v-model="fontChoice">
                  <option value="sans">Sans</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                  <option value="dyslexia">Dyslexia</option>
                </select>
                <Iconography name="arrow" />
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Size</div>
              <div class="setting-value setting-value--select">
                <select v-model="sizeChoice">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <Iconography name="arrow" />
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Theme</div>
              <div class="setting-value setting-value--select">
                <select v-model="themeChoice">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
                <Iconography name="arrow" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom action buttons -->
        <div class="bottom-actions">
          <button class="bottom-btn bottom-btn--primary" @click="startReading">
            <Iconography name="play" />
            <span>Begin reading</span>
          </button>
          <button
            class="bottom-btn"
            :class="{ 'bottom-btn--active': settingsOpen }"
            @click="settingsOpen = !settingsOpen"
          >
            <Iconography name="settings" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- PLAYER PHASE                                 -->
    <!-- ============================================ -->
    <section
      v-if="phase === 'playing'"
      class="rsvp-player"
      :class="[`font-${fontChoice}`, `size-${sizeChoice}`]"
      @click="onPlayerClick"
      @mousemove="handleMouseMove"
    >
      <!-- Word display -->
      <div class="word-container">
        <div class="guide-lines">
          <div class="guide-line guide-line--top"></div>
          <div class="guide-line guide-line--bottom"></div>
          <div class="focus-marker"></div>
        </div>

        <div class="word-display">
          <span class="word-before">{{
            currentWord.slice(0, currentORP)
          }}</span>
          <span class="word-focus">{{ currentWord[currentORP] }}</span>
          <span class="word-after">{{
            currentWord.slice(currentORP + 1)
          }}</span>
        </div>
      </div>

      <!-- Player bottom controls -->
      <div
        class="player-bottom"
        :class="{
          'is-idle': !isPaused && !showControls && !playerSettingsOpen,
        }"
        @click.stop
        @mouseenter="showControls = true"
        @mouseleave="handleMouseMove"
      >
        <!-- Settings panel (in player) -->
        <div ref="playerSettingsPanelRef" class="settings-panel">
          <div class="settings-inner">
            <div class="setting-row">
              <div class="setting-label">Speed</div>
              <div class="setting-value setting-value--input">
                <input
                  type="number"
                  :value="wpm"
                  @input="
                    wpm = clampWpm(+($event.target as HTMLInputElement).value)
                  "
                  min="50"
                  max="1000"
                  step="25"
                />
                <span class="setting-suffix">wpm</span>
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Prosody</div>
              <div class="setting-value setting-value--input">
                <input
                  type="number"
                  :value="punctuationDelay"
                  @input="
                    punctuationDelay = clampProsody(
                      +($event.target as HTMLInputElement).value,
                    )
                  "
                  min="0"
                  max="2000"
                  step="50"
                />
                <span class="setting-suffix">ms</span>
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Font</div>
              <div class="setting-value setting-value--select">
                <select v-model="fontChoice">
                  <option value="sans">Sans</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                  <option value="dyslexia">Dyslexia</option>
                </select>
                <Iconography name="arrow" />
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Size</div>
              <div class="setting-value setting-value--select">
                <select v-model="sizeChoice">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
                <Iconography name="arrow" />
              </div>
            </div>
            <div class="setting-row">
              <div class="setting-label">Theme</div>
              <div class="setting-value setting-value--select">
                <select v-model="themeChoice">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
                <Iconography name="arrow" />
              </div>
            </div>
          </div>
        </div>

        <div class="player-controls">
          <button
            class="player-btn"
            :class="{ 'player-btn--active': !isPaused }"
            @click="togglePlayPause"
          >
            <Iconography :name="isPaused ? 'play' : 'pause'" />
            <span>{{ isPaused ? "Resume" : "Pause" }}</span>
          </button>
          <button
            class="player-btn"
            :class="{ 'player-btn--settings-active': playerSettingsOpen }"
            @click="playerSettingsOpen = !playerSettingsOpen"
          >
            <Iconography name="settings" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({
  seoMeta: {
    title: "RSVP • Speed reading tool",
    description:
      "Paste text or upload a file and read in a steady, word-by-word stream. Built by Design Business Company.",
    image: "/images/og.png",
  },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// ============================================
// Phase management
// ============================================
type Phase = "logo" | "input" | "playing";
const phase = ref<Phase>("logo");
const inputReady = ref(false);
const introResolved = ref(false);

// ============================================
// Refs
// ============================================
const wrapperRef = ref<HTMLElement | null>(null);
const boxRef = ref<HTMLElement | null>(null);
const logoLettersRef = ref<HTMLElement | null>(null);
const actionRowRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const settingsPanelRef = ref<HTMLElement | null>(null);
const playerSettingsPanelRef = ref<HTMLElement | null>(null);

// ============================================
// Input state
// ============================================
const inputText = ref("");
const settingsOpen = ref(false);
const isLoadingFile = ref(false);
const fileName = ref("");

// ============================================
// Settings
// ============================================
const wpm = ref(300);
const punctuationDelay = ref(400);
const fontChoice = ref<"sans" | "serif" | "mono" | "dyslexia">("sans");
const sizeChoice = ref<"small" | "medium" | "large">("medium");
const themeChoice = ref<"dark" | "light">("dark");

function clampWpm(v: number) {
  return Math.min(1000, Math.max(50, Math.round(v) || 300));
}

function clampProsody(v: number) {
  return Math.min(2000, Math.max(0, Math.round(v) || 0));
}

// ============================================
// Player state
// ============================================
const words = ref<string[]>([]);
const currentIndex = ref(0);
const isPaused = ref(false);
const showControls = ref(false);
const playerSettingsOpen = ref(false);

let playbackTimer: ReturnType<typeof setTimeout> | null = null;
let hideControlsTimer: ReturnType<typeof setTimeout> | null = null;

// ============================================
// LocalStorage persistence
// ============================================
const LS_KEY = "rsvp-state";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.inputText) inputText.value = saved.inputText;
    if (saved.wpm) wpm.value = clampWpm(saved.wpm);
    if (saved.punctuationDelay != null)
      punctuationDelay.value = clampProsody(saved.punctuationDelay);
    if (saved.fontChoice) fontChoice.value = saved.fontChoice;
    if (saved.sizeChoice) sizeChoice.value = saved.sizeChoice;
    if (saved.themeChoice) themeChoice.value = saved.themeChoice;
  } catch {
    // ignore corrupt data
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        inputText: inputText.value,
        wpm: wpm.value,
        punctuationDelay: punctuationDelay.value,
        fontChoice: fontChoice.value,
        sizeChoice: sizeChoice.value,
        themeChoice: themeChoice.value,
      }),
    );
  } catch {
    // storage full or unavailable
  }
}

watch(
  [inputText, wpm, punctuationDelay, fontChoice, sizeChoice, themeChoice],
  saveToStorage,
  { deep: true },
);

// ============================================
// Logo → Input animation (GSAP)
// ============================================
const INTRO_SEEN_KEY = "rsvp-intro-seen";

onMounted(() => {
  loadFromStorage();
  window.addEventListener("keydown", handleKeydown);

  if (sessionStorage.getItem(INTRO_SEEN_KEY)) {
    skipIntro();
  } else {
    nextTick(() => runIntroSequence());
  }
});

function skipIntro() {
  const box = boxRef.value;
  const letters = logoLettersRef.value;
  const actionRow = actionRowRef.value;
  const textarea = textareaRef.value;

  if (!box || !letters || !actionRow || !textarea) return;

  // Jump straight to input-ready state
  gsap.set(letters, { display: "none" });
  gsap.set(box, { width: "var(--rsvp-width)" });
  gsap.set(textarea, { opacity: 1 });
  gsap.set(actionRow, { opacity: 1, y: 0 });

  introResolved.value = true;
  phase.value = "input";
  inputReady.value = true;
  nextTick(() => textarea.focus());
}

function runIntroSequence() {
  const box = boxRef.value;
  const letters = logoLettersRef.value;
  const actionRow = actionRowRef.value;
  const textarea = textareaRef.value;

  if (!box || !letters || !actionRow || !textarea) return;

  const svgLetters = letters.querySelectorAll(".logo-letter");

  // Compute target width as a pixel value (GSAP can't tween CSS min())
  const targetWidth = Math.min(426, window.innerWidth - 32);

  // Initial state — lock everything before revealing the page
  gsap.set(box, { width: window.innerWidth, height: "auto" });
  gsap.set(svgLetters, { opacity: 0 });
  gsap.set(actionRow, { opacity: 0, y: -8 });
  gsap.set(textarea, { opacity: 0 });

  // Reveal page now that GSAP has set initial state
  introResolved.value = true;

  const tl = gsap.timeline();

  // 1) Letters fade in while box holds at full width
  tl.to(svgLetters, {
    opacity: 0.3,
    duration: 0.5,
    stagger: 0.06,
    ease: "power2.out",
    delay: 0.3,
  });

  // 2) Box shrinks to container width
  tl.to(box, {
    width: targetWidth,
    duration: 1.4,
    ease: "power2.inOut",
  });

  // 3) Lock box height, then fade letters out
  tl.call(() => {
    const currentHeight = box.getBoundingClientRect().height;
    gsap.set(box, { height: currentHeight, minHeight: currentHeight });
  });

  tl.to(svgLetters, {
    opacity: 0,
    duration: 0.35,
    stagger: 0.02,
    ease: "power2.in",
    delay: 0.3,
  });

  // 4) Collapse logo letters, fade in textarea
  tl.to(letters, {
    height: 0,
    overflow: "hidden",
    duration: 0.3,
    ease: "power2.inOut",
  });

  tl.to(
    textarea,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.2",
  );

  // 5) Action buttons fade in
  tl.to(
    actionRow,
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.2",
  );

  // 6) Mark input as ready, restore responsive width
  tl.call(() => {
    gsap.set(box, { width: "var(--rsvp-width)" });
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    phase.value = "input";
    inputReady.value = true;
    textarea.focus();
  });
}

// ============================================
// ORP + word rendering
// ============================================
function getORP(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 3) return 1;
  return Math.round((len - 1) * 0.4);
}

const currentORP = computed(() => {
  if (words.value.length === 0 || currentIndex.value >= words.value.length)
    return 0;
  return getORP(words.value[currentIndex.value]);
});

const currentWord = computed(() => {
  if (words.value.length === 0 || currentIndex.value >= words.value.length)
    return "";
  return words.value[currentIndex.value] ?? "";
});

// ============================================
// Playback timing
// ============================================
function getDelay(word: string): number {
  const baseDelay = 60000 / wpm.value;
  if (/[.!?]$/.test(word)) return baseDelay + punctuationDelay.value;
  if (/[,;:]$/.test(word)) return baseDelay + punctuationDelay.value * 0.5;
  if (word.length > 8) return baseDelay * 1.2;
  return baseDelay;
}

function parseText(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function scheduleNextWord() {
  if (playbackTimer) clearTimeout(playbackTimer);
  if (isPaused.value || currentIndex.value >= words.value.length) {
    if (currentIndex.value >= words.value.length) isPaused.value = true;
    return;
  }
  const delay = getDelay(words.value[currentIndex.value]);
  playbackTimer = setTimeout(() => {
    currentIndex.value++;
    scheduleNextWord();
  }, delay);
}

function startReading() {
  words.value = parseText(inputText.value);
  if (words.value.length === 0) return;
  currentIndex.value = 0;
  isPaused.value = false;
  settingsOpen.value = false;
  phase.value = "playing";
  nextTick(() => scheduleNextWord());
}

function togglePlayPause() {
  if (playerSettingsOpen.value) return;
  isPaused.value = !isPaused.value;
  if (!isPaused.value) {
    if (currentIndex.value >= words.value.length) currentIndex.value = 0;
    scheduleNextWord();
  }
}

function closeSettings() {
  if (settingsOpen.value) settingsOpen.value = false;
  if (playerSettingsOpen.value) playerSettingsOpen.value = false;
}

function onPlayerClick() {
  if (playerSettingsOpen.value) {
    playerSettingsOpen.value = false;
    return;
  }
  togglePlayPause();
}

function stopReading() {
  if (playbackTimer) clearTimeout(playbackTimer);
  isPaused.value = false;
  words.value = [];
  currentIndex.value = 0;
  playerSettingsOpen.value = false;
  phase.value = "input";
}

// ============================================
// Mouse / keyboard
// ============================================
function handleMouseMove() {
  if (isPaused.value) return;
  showControls.value = true;
  if (hideControlsTimer) clearTimeout(hideControlsTimer);
  hideControlsTimer = setTimeout(() => {
    showControls.value = false;
  }, 2000);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.code === "Space" && phase.value === "playing") {
    event.preventDefault();
    togglePlayPause();
  }
  if (event.code === "Escape" && phase.value === "playing") {
    stopReading();
  }
}

// ============================================
// File + clipboard
// ============================================
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    fileName.value = "";
  } catch (err) {
    console.error("Failed to read clipboard:", err);
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isLoadingFile.value = true;
  fileName.value = file.name;

  try {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      inputText.value = await extractTextFromPDF(file);
    } else {
      inputText.value = await file.text();
    }
  } catch (err) {
    console.error("Failed to read file:", err);
    fileName.value = "";
    inputText.value = "";
  } finally {
    isLoadingFile.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText.trim();
}

// ============================================
// Watchers + cleanup
// ============================================
watch(wpm, () => {
  if (!isPaused.value && phase.value === "playing") scheduleNextWord();
});

// ============================================
// Settings panel stagger animation
// ============================================
function animateSettingsPanel(panelEl: HTMLElement | null, opening: boolean) {
  if (!panelEl) return;

  const rows = panelEl.querySelectorAll(".setting-row");
  if (!rows.length) return;

  // Kill any in-flight tweens on these rows
  gsap.killTweensOf(rows);

  if (opening) {
    // Show panel, then snap rows on bottom-to-top
    gsap.set(panelEl, { display: "block" });
    const reversed = Array.from(rows).reverse();
    gsap.set(reversed, { opacity: 0 });
    reversed.forEach((row, i) => {
      gsap.set(row, { opacity: 1, delay: i * 0.1 });
    });
  } else {
    // Snap rows off top-to-bottom, then hide panel
    const arr = Array.from(rows);
    arr.forEach((row, i) => {
      gsap.set(row, { opacity: 0, delay: i * 0.1 });
    });
    setTimeout(() => {
      gsap.set(panelEl, { display: "none" });
    }, arr.length * 100);
  }
}

watch(settingsOpen, (val) => {
  nextTick(() => animateSettingsPanel(settingsPanelRef.value, val));
});

watch(playerSettingsOpen, (val) => {
  nextTick(() => animateSettingsPanel(playerSettingsPanelRef.value, val));
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (playbackTimer) clearTimeout(playbackTimer);
  if (hideControlsTimer) clearTimeout(hideControlsTimer);
});
</script>

<style lang="scss" scoped>
// ============================================
// PAGE COLOR PALETTE (warm browns from Figma)
// ============================================
.rsvp-page {
  --rsvp-bg: #1e1814;
  --rsvp-surface: #2c281e;
  --rsvp-button: #393428;
  --rsvp-text: #d3ccc1;
  --rsvp-text-dim: #aba59d;
  --rsvp-text-muted: rgba(211, 204, 193, 0.3);
  --rsvp-accent: #b33a3a;
  --rsvp-red: #c44040;
  --rsvp-width: min(426px, calc(100vw - 32px));

  min-height: 100vh;
  background: var(--rsvp-bg);
  color: var(--rsvp-text);
  font-family:
    "Metaphor",
    system-ui,
    -apple-system,
    sans-serif;
  visibility: hidden;

  &.is-ready {
    visibility: visible;
  }
}

// ============================================
// SCREEN READER ONLY
// ============================================
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

// ============================================
// INTRO + INPUT (unified section)
// ============================================
.rsvp-intro {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rsvp-bg);
}

.intro-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 100%;
}

// The morphing box
.the-box {
  background: var(--rsvp-surface);
  width: 100vw; // GSAP will override this
  min-height: 155px;
  position: relative;
  overflow: hidden;
}

// Logo letters (SVGs in a flex row — justify-between does the spacing)
.logo-letters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  color: var(--rsvp-text);
  pointer-events: none;
}

.logo-letter {
  height: 140px;
  width: auto;
  opacity: 0; // GSAP reveals these
  flex-shrink: 0;
}

// Textarea (overlays the same box)
.rsvp-textarea {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--rsvp-text);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  padding: 12px 12px;
  resize: none;
  font-family: inherit;
  opacity: 0; // GSAP will reveal this

  &::placeholder {
    color: var(--rsvp-text-dim);
  }
}

// Action buttons row
.action-row {
  display: flex;
  gap: 1px;
  width: var(--rsvp-width);
  opacity: 0; // GSAP will reveal this
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 16px;
  background: var(--rsvp-button);
  border: none;
  color: var(--rsvp-text);
  font-size: 14px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background: lighten(#393428, 5%);
  }
}

// ============================================
// BOTTOM BAR (input phase)
// ============================================
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: var(--rsvp-width);
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease;

  &.is-visible {
    opacity: 1;
    pointer-events: auto;
  }
}

// Settings panel — visibility controlled by GSAP
.settings-panel {
  display: none;
}

// Setting rows — two-tone cells separated by 1px gaps
// Rows start invisible; GSAP handles staggered reveal
.setting-row {
  display: flex;
  gap: 1px;
  height: 34px;
  opacity: 0;

  & + .setting-row {
    margin-top: 1px;
  }
}

.setting-label {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: var(--rsvp-button);
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--rsvp-text);
}

.setting-value {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: var(--rsvp-surface);
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--rsvp-text-dim);
  border: none;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background: lighten(#2e281f, 4%);
  }
}

.setting-value--input {
  gap: 4px;
  cursor: text;

  input {
    appearance: textfield;
    -moz-appearance: textfield;
    background: transparent;
    border: none;
    color: var(--rsvp-text-dim);
    font-size: 14px;
    font-family: inherit;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    outline: none;
    width: 48px;
    text-align: left;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &:focus {
      color: var(--rsvp-text);
    }
  }
}

.setting-suffix {
  color: var(--rsvp-text-muted);
  font-size: 14px;
  letter-spacing: 0.02em;
  pointer-events: none;
  user-select: none;
}

.setting-value--select {
  position: relative;
  gap: 8px;
  cursor: default;

  &:hover {
    background: lighten(#2e281f, 4%);
  }

  select {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--rsvp-text-dim);
    font-size: 14px;
    font-family: inherit;
    letter-spacing: 0.02em;
    cursor: pointer;
    outline: none;
    flex: 1;
    min-width: 0;
  }

  .icon {
    flex-shrink: 0;
    pointer-events: none;
    opacity: 0.5;
  }
}

// Bottom action buttons
.bottom-actions {
  display: flex;
  gap: 1px;
  margin-top: 1px;
}

.bottom-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 16px;
  background: var(--rsvp-button);
  border: none;
  color: var(--rsvp-text);
  font-size: 14px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  .icon {
    flex-shrink: 0;
  }

  &:hover {
    background: lighten(#393428, 5%);
  }

  &--primary {
    background: #aa2925;

    &:hover {
      background: lighten(#aa2925, 6%);
    }
  }

  // Active / inverted state when settings open
  &--active {
    background: var(--rsvp-text);
    color: var(--rsvp-button);

    .icon {
      filter: brightness(0);
    }

    &:hover {
      background: darken(#d3ccc1, 6%);
    }
  }
}

// ============================================
// PLAYER PHASE
// ============================================
.rsvp-player {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rsvp-bg);
  cursor: pointer;

  &.font-sans {
    .word-display {
      transform: translateY(10%);
      font-family:
        "Theinhardt",
        system-ui,
        -apple-system,
        sans-serif;
    }
  }
  &.font-serif {
    .word-display {
      font-family: "Garamond", "Times New Roman", serif;
    }
  }
  &.font-mono {
    .word-display {
      font-family: "Mono", "SF Mono", Menlo, monospace;
    }
  }
  &.font-dyslexia {
    .word-display {
      font-family: "Dyslexia", system-ui, sans-serif;
    }
  }

  &.size-small .word-display {
    font-size: clamp(24px, 5vw, 48px);
    letter-spacing: 0.03em;
  }
  &.size-medium .word-display {
    font-size: clamp(48px, 10vw, 96px);
    letter-spacing: 0.01em;
  }
  &.size-large .word-display {
    font-size: clamp(64px, 14vw, 128px);
  }
}

.word-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  padding: 96px 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.guide-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  transition: opacity 250ms ease;
}

.guide-line {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 50%;
  max-width: 280px;
  height: 1px;
  background: var(--rsvp-text-muted);

  &--top {
    top: 32px;
  }

  &--bottom {
    bottom: 32px;
  }
}

.focus-marker {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  top: 41px;
  bottom: 41px;
  width: 1px;
  background: var(--rsvp-red);
  opacity: 0.35;
}

.word-display {
  position: relative;
  font-size: clamp(48px, 10vw, 96px);
  line-height: 1.2;
  letter-spacing: -0.02em;
  white-space: nowrap;
  display: flex;
  align-items: baseline;
  justify-content: center;
  color: var(--rsvp-text);
  width: 100%;
}

// The focus letter sits at dead center; before/after flank it
.word-before {
  display: inline-block;
  text-align: right;
  // Fixed width so the focus char always lands at container center
  width: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.word-focus {
  color: var(--rsvp-red);
  flex-shrink: 0;
}

.word-after {
  display: inline-block;
  text-align: left;
  width: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

// ============================================
// PLAYER BOTTOM CONTROLS
// ============================================
.player-bottom {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: var(--rsvp-width);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1px;
  transition: opacity 400ms ease;

  @media (hover: hover) {
    &.is-idle {
      opacity: 0;
      pointer-events: none;
    }
  }
}

.player-controls {
  display: flex;
  gap: 1px;
}

.player-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 16px;
  background: var(--rsvp-button);
  border: none;
  color: var(--rsvp-text-dim);
  font-size: 14px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;
  white-space: nowrap;

  &:hover {
    color: var(--rsvp-text);
    background: lighten(#393428, 5%);
  }

  &--active {
    color: var(--rsvp-text);
  }

  &--settings-active {
    background: var(--rsvp-text);
    color: var(--rsvp-button);

    .icon {
      filter: brightness(0);
    }

    &:hover {
      background: darken(#d3ccc1, 6%);
      color: var(--rsvp-button);
    }
  }
}
</style>
