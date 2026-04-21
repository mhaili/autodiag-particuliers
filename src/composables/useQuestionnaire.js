import { reactive, computed } from 'vue'

const state = reactive({
  logementType: null, // 'maison' | 'appartement'
  localisation: null,
  answers: {},        // { questionId: { value, points, label } }
  currentSection: '',
  sectionBadges: [],  // sections completed
  started: false,
  finished: false,
  totalPossible: 0,
})

function setLogementType(type) {
  state.logementType = type
  state.answers = {}
  state.sectionBadges = []
  state.finished = false
  state.started = true
}

function setLocalisation(localisation) {
  state.localisation = localisation
}

function answer(questionId, value, points, label) {
  state.answers[questionId] = { value, points, label }
}

function setSection(section) {
  state.currentSection = section
}

function completeSection(section) {
  if (!state.sectionBadges.includes(section)) {
    state.sectionBadges.push(section)
  }
}

function setTotalPossible(n) {
  state.totalPossible = n
}

function finishQuestionnaire() {
  state.finished = true
}

function reset() {
  state.logementType = null
  state.localisation = null
  state.answers = {}
  state.currentSection = ''
  state.sectionBadges = []
  state.started = false
  state.finished = false
  state.totalPossible = 0
}

const score = computed(() => {
  return Object.values(state.answers).reduce((sum, a) => sum + (a.points || 0), 0)
})

const scorePct = computed(() => {
  if (!state.totalPossible) return 0
  return Math.round((score.value / state.totalPossible) * 100)
})

const scoreLevel = computed(() => {
  const pct = scorePct.value
  if (pct >= 70) return 'excellent'
  if (pct >= 40) return 'moyen'
  return 'faible'
})

export function useQuestionnaire() {
  return {
    state,
    score,
    scorePct,
    scoreLevel,
    setLogementType,
    setLocalisation,
    answer,
    setSection,
    completeSection,
    setTotalPossible,
    finishQuestionnaire,
    reset,
  }
}
