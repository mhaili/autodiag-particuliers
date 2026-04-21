<template>
  <div class="q-page">
    <AppHeader :show-progress="true" :progress="overallProgressPct" :section="currentSectionName" />

    <!-- ===== Section transition overlay ===== -->
    <Transition name="overlay-fade">
      <div v-if="showOverlay" class="section-overlay">
        <div class="section-overlay__card">
          <div class="section-overlay__icon">
            <i :class="sectionIconMap[completedSectionName] || 'ri-shield-check-line'"></i>
          </div>
          <p class="section-overlay__title">Section complétée !</p>
          <p class="section-overlay__name">{{ completedSectionName }}</p>
          <div class="section-overlay__pts">
            <i class="ri-award-line"></i>
            +{{ sectionPoints }} point{{ sectionPoints !== 1 ? 's' : '' }} obtenus
          </div>
        </div>
      </div>
    </Transition>

    <main id="main-content" class="q-main">

      <!-- ===== Section stepper ===== -->
      <div class="q-stepper" role="navigation" aria-label="Étapes du questionnaire">
        <div
          v-for="(sec, i) in sectionNames"
          :key="sec"
          class="q-step"
          :class="{
            'q-step--done': i < currentSectionIdx,
            'q-step--active': i === currentSectionIdx,
          }"
        >
          <div class="q-step__dot">
            <i v-if="i < currentSectionIdx" class="ri-check-line"></i>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="q-step__label">{{ sec }}</span>
        </div>
      </div>

      <!-- ===== Score chip ===== -->
      <div class="q-score">
        <i class="ri-star-fill"></i>
        <span><strong>{{ currentScore }}</strong> / {{ maxPossible }} points</span>
      </div>

      <!-- ===== Section heading ===== -->
      <div class="q-section-head">
        <i :class="sectionIconMap[currentSectionName] || 'ri-folder-open-line'" aria-hidden="true"></i>
        <h2>{{ currentSectionName }}</h2>
        <span class="q-section-head__count">{{ currentSectionIdx + 1 }} / {{ sectionNames.length }}</span>
      </div>

      <!-- ===== Questions list ===== -->
      <div class="q-list">
        <TransitionGroup name="q-appear">
          <div
            v-for="q in visibleQuestions"
            :key="q.id"
            :id="`q-${q.id}`"
            class="q-card"
            :class="{
              'q-card--done': !!answers[q.id],
              'q-card--active': !answers[q.id],
            }"
          >
            <!-- Answered: compact row -->
            <div v-if="answers[q.id]" class="q-done-row">
              <i class="ri-checkbox-circle-fill q-done-row__check" aria-hidden="true"></i>
              <span class="q-done-row__text">{{ q.text }}</span>
              <span
                class="q-done-row__ans"
                :class="`q-done-row__ans--${answers[q.id].value}`"
              >
                {{ answerLabel(answers[q.id].value) }}
              </span>
            </div>

            <!-- Active: full question -->
            <div v-else class="q-active-inner">
              <p class="q-active-inner__text">{{ q.text }}</p>

              <div v-if="q.info" class="q-active-inner__info">
                <i class="ri-information-line" aria-hidden="true"></i>
                <p>{{ q.info }}</p>
              </div>

              <div
                class="q-btns"
                :class="{ 'q-btns--3': q.type === 'yesno_sais_pas' }"
                role="group"
                :aria-label="`Répondre à : ${q.text}`"
              >
                <button
                  type="button"
                  class="q-btn q-btn--yes"
                  @click="selectAnswer(q, 'oui')"
                >
                  <i class="ri-checkbox-circle-line" aria-hidden="true"></i>
                  Oui
                </button>
                <button
                  type="button"
                  class="q-btn q-btn--no"
                  @click="selectAnswer(q, 'non')"
                >
                  <i class="ri-close-circle-line" aria-hidden="true"></i>
                  Non
                </button>
                <button
                  v-if="q.type === 'yesno_sais_pas'"
                  type="button"
                  class="q-btn q-btn--neutral"
                  @click="selectAnswer(q, 'sais_pas')"
                >
                  <i class="ri-question-line" aria-hidden="true"></i>
                  Je ne sais pas
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- ===== Section done: continue button ===== -->
      <Transition name="q-appear-single">
        <div v-if="sectionDone && !showOverlay" class="q-next">
          <button
            type="button"
            class="fr-btn fr-btn--lg q-next__btn"
            @click="goNext"
          >
            {{ isLastSection ? 'Voir mes résultats' : 'Section suivante' }}
            <i class="ri-arrow-right-line" aria-hidden="true"></i>
          </button>

          <div v-if="completedSections.length" class="q-badges">
            <span v-for="sec in completedSections" :key="sec" class="q-badge">
              <i class="ri-checkbox-circle-fill" aria-hidden="true"></i>
              {{ sec }}
            </span>
          </div>
        </div>
      </Transition>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionnaire } from '@/composables/useQuestionnaire.js'
import AppHeader from '@/components/AppHeader.vue'
import maisonData from '@/data/maison.json'
import appartementData from '@/data/appartement.json'

const router = useRouter()
const { state, answer, completeSection, setTotalPossible, finishQuestionnaire, score } = useQuestionnaire()

// ──────────────────────────────────────────────
// Data helpers
// ──────────────────────────────────────────────
const allQuestions = computed(() =>
  state.logementType === 'maison' ? maisonData : appartementData
)

const questionById = computed(() => {
  const m = {}
  allQuestions.value.forEach(q => { m[q.id] = q })
  return m
})

const sectionNames = computed(() => {
  const seen = []
  allQuestions.value.forEach(q => {
    if (!seen.includes(q.section)) seen.push(q.section)
  })
  return seen
})

const sectionIconMap = {
  'Extérieurs': 'ri-landscape-line',
  'Façades & Intérieur': 'ri-door-open-line',
  'Votre Quotidien': 'ri-calendar-check-line',
  'Immeuble': 'ri-building-2-line',
  "Accès à l'immeuble": 'ri-key-line',
  'Votre Logement': 'ri-home-heart-line',
}

function answerLabel(value) {
  if (value === 'oui') return 'Oui'
  if (value === 'non') return 'Non'
  return 'Je ne sais pas'
}

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
const currentSectionIdx = ref(0)
const visibleQuestions = ref([])
const sectionDone = ref(false)
const isFinishing = ref(false)
const nextSectionFirstId = ref(null)
const completedSections = ref([])

// Overlay
const showOverlay = ref(false)
const completedSectionName = ref('')
const sectionPoints = ref(0)
const lastSectionScore = ref(0)

// ──────────────────────────────────────────────
// Computed
// ──────────────────────────────────────────────
const currentSectionName = computed(() => sectionNames.value[currentSectionIdx.value] || '')
const isLastSection = computed(() => currentSectionIdx.value === sectionNames.value.length - 1)
const currentScore = computed(() => score.value)
const maxPossible = computed(() => state.totalPossible)
const answers = computed(() => state.answers)

const overallProgressPct = computed(() => {
  const total = allQuestions.value.length
  const answered = Object.keys(state.answers).filter(
    id => id !== 'type_eclairage' && id !== 'type_videoprotection'
  ).length
  return Math.round((answered / total) * 100)
})

// ──────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────
onMounted(() => {
  if (!state.logementType) {
    router.replace('/type')
    return
  }
  setTotalPossible(allQuestions.value.length + 2)
  initSection(allQuestions.value[0].id)
})

function initSection(firstId) {
  sectionDone.value = false
  isFinishing.value = false
  nextSectionFirstId.value = null
  const q = questionById.value[firstId]
  visibleQuestions.value = q ? [q] : []
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

// ──────────────────────────────────────────────
// Answer logic
// ──────────────────────────────────────────────
function selectAnswer(q, key) {
  const opt = q.options[key]
  if (!opt) return

  answer(q.id, key, opt.points, `${q.text} → ${key}`)

  const nextId = opt.nextId

  // End of entire questionnaire
  if (q.isLast || nextId === null) {
    sectionDone.value = true
    isFinishing.value = true
    return
  }

  const nextQ = questionById.value[nextId]
  if (!nextQ) {
    sectionDone.value = true
    isFinishing.value = true
    return
  }

  if (nextQ.section === currentSectionName.value) {
    // Stay in same section: reveal next question
    visibleQuestions.value.push(nextQ)
    nextTick(() => {
      const el = document.getElementById(`q-${nextQ.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  } else {
    // Next question is in a different section
    nextSectionFirstId.value = nextId
    sectionDone.value = true
  }
}

// ──────────────────────────────────────────────
// Go to next section
// ──────────────────────────────────────────────
function goNext() {
  completedSectionName.value = currentSectionName.value
  sectionPoints.value = score.value - lastSectionScore.value
  lastSectionScore.value = score.value
  completeSection(currentSectionName.value)
  completedSections.value = [...completedSections.value, currentSectionName.value]

  showOverlay.value = true

  setTimeout(() => {
    showOverlay.value = false

    if (isFinishing.value) {
      finishQuestionnaire()
      router.push('/resultat')
    } else {
      currentSectionIdx.value++
      initSection(nextSectionFirstId.value)
    }
  }, 1000)
}
</script>

<style scoped>
/* ── Page shell ───────────────────────────────── */
.q-page {
  min-height: 100vh;
  background: #f5f5fe;
}

.q-main {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}

/* ── Section stepper ──────────────────────────── */
.q-stepper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.q-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 70px;
  position: relative;
}

.q-step::before {
  content: '';
  position: absolute;
  top: 14px;
  left: calc(-50% + 15px);
  right: calc(50% + 15px);
  height: 2px;
  background: #d0d0e0;
}
.q-step:first-child::before { display: none; }
.q-step--done::before,
.q-step--active::before { background: #000091; }

.q-step__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #d0d0e0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #aaa;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.q-step--done .q-step__dot {
  background: #000091;
  border-color: #000091;
  color: #fff;
}
.q-step--active .q-step__dot {
  border-color: #000091;
  background: #f0f0ff;
  color: #000091;
  box-shadow: 0 0 0 4px rgba(0, 0, 144, 0.12);
}

.q-step__label {
  font-size: 0.65rem;
  text-align: center;
  color: #aaa;
  line-height: 1.2;
}
.q-step--done .q-step__label,
.q-step--active .q-step__label {
  color: #000091;
  font-weight: 600;
}

/* ── Score chip ───────────────────────────────── */
.q-score {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff;
  border: 1px solid #e0e0f0;
  border-radius: 20px;
  padding: 0.3rem 0.9rem;
  font-size: 0.875rem;
  color: #444;
  margin-bottom: 1.5rem;
}
.q-score i { color: #ffd700; font-size: 1rem; }

/* ── Section heading ──────────────────────────── */
.q-section-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}
.q-section-head i {
  font-size: 1.4rem;
  color: #000091;
}
.q-section-head h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #161616;
  flex: 1;
}
.q-section-head__count {
  font-size: 0.8rem;
  color: #999;
  white-space: nowrap;
}

/* ── Question cards ───────────────────────────── */
.q-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.q-card {
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.q-card--done {
  border-left: 3px solid #1f8d49;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}
.q-card--active {
  border-left: 3px solid #000091;
  box-shadow: 0 4px 20px rgba(0, 0, 144, 0.11);
}

/* Answered: compact row */
.q-done-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
}
.q-done-row__check {
  font-size: 1.1rem;
  color: #1f8d49;
  flex-shrink: 0;
}
.q-done-row__text {
  flex: 1;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
}
.q-done-row__ans {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  white-space: nowrap;
}
.q-done-row__ans--oui     { background: #e8f5e9; color: #1a5c33; }
.q-done-row__ans--non     { background: #fce9e9; color: #8d0000; }
.q-done-row__ans--sais_pas { background: #ededfd; color: #000091; }

/* Active question */
.q-active-inner {
  padding: 1.5rem;
}
.q-active-inner__text {
  font-size: 1.05rem;
  font-weight: 600;
  color: #161616;
  margin: 0 0 1rem;
  line-height: 1.55;
}
.q-active-inner__info {
  background: #e8f0fb;
  border-left: 3px solid #000091;
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1rem;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #1e2587;
  line-height: 1.6;
}
.q-active-inner__info i { flex-shrink: 0; margin-top: 0.1rem; }
.q-active-inner__info p { margin: 0; }

/* Answer buttons */
.q-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.q-btns--3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.q-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 2px solid #d0d0e0;
  background: #fafafa;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #444;
  transition: all 0.15s ease;
}
.q-btn i { font-size: 1.15rem; }

.q-btn--yes:hover,
.q-btn--yes:focus-visible {
  border-color: #1f8d49;
  background: #e8f5e9;
  color: #1a5c33;
  outline: none;
}
.q-btn--no:hover,
.q-btn--no:focus-visible {
  border-color: #ce0500;
  background: #fce9e9;
  color: #8d0000;
  outline: none;
}
.q-btn--neutral:hover,
.q-btn--neutral:focus-visible {
  border-color: #6a6af4;
  background: #ededfd;
  color: #000091;
  outline: none;
}

/* ── Section done / next ─────────────────────── */
.q-next {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.q-next__btn {
  min-width: 280px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.q-next__btn i { font-size: 1.1rem; }

/* ── Completed section badges ────────────────── */
.q-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.q-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #e8f5e9;
  color: #1a5c33;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
}

/* ── Section transition overlay ──────────────── */
.section-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 80, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.section-overlay__card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  max-width: 320px;
  width: 90%;
  animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.section-overlay__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f8d49, #099a3d);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #fff;
  font-size: 2rem;
}
.section-overlay__title { font-weight: 700; font-size: 1.1rem; color: #1f8d49; margin: 0 0 0.25rem; }
.section-overlay__name  { color: #555; font-size: 0.95rem; margin: 0 0 0.75rem; }
.section-overlay__pts {
  background: #f5f5fe;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #000091;
}

/* ── Transitions ─────────────────────────────── */
.q-appear-enter-active { transition: all 0.35s ease; }
.q-appear-enter-from   { opacity: 0; transform: translateY(14px); }

.q-appear-single-enter-active { transition: all 0.4s ease; }
.q-appear-single-enter-from   { opacity: 0; transform: translateY(16px); }

.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.3s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

@keyframes pop {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 520px) {
  .q-step__label { font-size: 0.58rem; }
  .q-btns        { grid-template-columns: 1fr 1fr; }
  .q-btns--3     { grid-template-columns: 1fr; }
  .q-active-inner { padding: 1.25rem; }
  .q-next__btn   { min-width: unset; width: 100%; }
}
</style>
