import { reactive, computed } from 'vue'
import maisonData from '@/data/maison.json'
import appartementData from '@/data/appartement.json'

const state = reactive({
  logementType: null, // 'maison' | 'appartement'
  localisation: null,
  answers: {},        // { questionId: { value, points, label } }
  sectionBadges: [],  // sections completed
  finished: false,
  totalPossible: 0,
})

function setLogementType(type) {
  state.logementType = type
  state.answers = {}
  state.sectionBadges = []
  state.finished = false
}

function setLocalisation(localisation) {
  state.localisation = localisation
}

function answer(questionId, value, points, label) {
  state.answers[questionId] = { value, points, label }
}

function completeSection(section) {
  if (!state.sectionBadges.includes(section)) {
    state.sectionBadges.push(section)
  }
}

function unAnswer(questionIds) {
  questionIds.forEach(id => {
    delete state.answers[id]
  })
}

function setTotalPossible(n) {
  state.totalPossible = n
}

function finishQuestionnaire() {
  state.finished = true
}

function unfinish() {
  state.finished = false
}

function reset() {
  state.logementType = null
  state.localisation = null
  state.answers = {}
  state.sectionBadges = []
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

const allQuestions = computed(() =>
  state.logementType === 'maison' ? maisonData : appartementData
)

export function useQuestionnaire() {
  return {
    state,
    score,
    scorePct,
    scoreLevel,
    allQuestions,
    setLogementType,
    setLocalisation,
    answer,
    unAnswer,
    completeSection,
    setTotalPossible,
    finishQuestionnaire,
    unfinish,
    reset,
  }
}
