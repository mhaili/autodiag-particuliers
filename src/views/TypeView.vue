<template>
  <div class="type-page">
    <AppHeader />

    <main id="main-content" class="fr-container type-main">
      <div class="type-card">
        <div class="type-card__step">Étape 1 sur 2 · Localisation</div>
        <h2 class="type-card__title">Quel type de logement avez-vous ?</h2>
        <p class="type-card__desc">Sélectionnez votre situation pour commencer le questionnaire adapté.</p>

        <div class="type-choices">
          <button
            v-for="option in logementOptions"
            :key="option.value"
            class="type-choice"
            :class="{ 'type-choice--selected': selectedType === option.value }"
            :aria-pressed="selectedType === option.value"
            @click="select(option.value)"
          >
            <i :class="option.icon" class="type-choice__icon"></i>
            <span class="type-choice__label">{{ option.label }}</span>
            <span class="type-choice__desc">{{ option.desc }}</span>
          </button>
        </div>

        <Transition name="slide-up">
          <div v-if="selectedType" class="type-localisation">
            <h3 class="type-loc__title">Votre environnement</h3>

            <div class="type-loc__group">
              <label class="type-loc__label">Situation géographique</label>
              <div class="type-choices type-choices--small">
                <button
                  v-for="loc in localisationOptions"
                  :key="loc.value"
                  class="type-choice type-choice--small"
                  :class="{ 'type-choice--selected': selectedLocalisation === loc.value }"
                  @click="selectedLocalisation = loc.value"
                >
                  <i :class="loc.icon" class="type-choice__icon"></i>
                  <span class="type-choice__label">{{ loc.label }}</span>
                </button>
              </div>
            </div>

            <div class="type-loc__questions">
              <div class="type-loc__q">
                <span class="type-loc__q-text"><i class="ri-lightbulb-line"></i> La rue est-elle équipée d'un éclairage public ?</span>
                <div class="type-yesno">
                  <button class="yn-btn" :class="{ 'yn-btn--on': eclairage === 'oui' }" @click="eclairage = 'oui'">Oui</button>
                  <button class="yn-btn" :class="{ 'yn-btn--off': eclairage === 'non' }" @click="eclairage = 'non'">Non</button>
                </div>
              </div>
              <div class="type-loc__q">
                <span class="type-loc__q-text"><i class="ri-camera-line"></i> La commune est-elle équipée de vidéo-protection ?</span>
                <div class="type-yesno">
                  <button class="yn-btn" :class="{ 'yn-btn--on': videoprotection === 'oui' }" @click="videoprotection = 'oui'">Oui</button>
                  <button class="yn-btn" :class="{ 'yn-btn--off': videoprotection === 'non' }" @click="videoprotection = 'non'">Non</button>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="fr-btn fr-btn--lg type-cta"
              :disabled="!canContinue"
              @click="continuer"
            >
              Continuer le questionnaire
              <i class="ri-arrow-right-line" aria-hidden="true"></i>
            </button>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionnaire } from '@/composables/useQuestionnaire.js'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const { setLogementType, setLocalisation, answer } = useQuestionnaire()

const selectedType = ref(null)
const selectedLocalisation = ref(null)
const eclairage = ref(null)
const videoprotection = ref(null)

const logementOptions = [
  { value: 'maison', label: 'Maison individuelle', icon: 'ri-home-2-line', desc: 'Maison avec ou sans jardin' },
  { value: 'appartement', label: 'Appartement', icon: 'ri-building-2-line', desc: 'En immeuble collectif' },
]

const localisationOptions = [
  { value: 'ville', label: 'Ville', icon: 'ri-building-4-line' },
  { value: 'petite_commune', label: 'Petite commune', icon: 'ri-community-line' },
  { value: 'campagne', label: 'Campagne', icon: 'ri-tree-line' },
  { value: 'lotissement', label: 'Lotissement', icon: 'ri-layout-grid-line' },
]

const canContinue = computed(() => selectedLocalisation.value && eclairage.value && videoprotection.value)

function select(type) {
  selectedType.value = type
}

function continuer() {
  setLogementType(selectedType.value)
  setLocalisation(selectedLocalisation.value)
  answer('type_eclairage', eclairage.value, eclairage.value === 'oui' ? 1 : 0, `Éclairage public : ${eclairage.value}`)
  answer('type_videoprotection', videoprotection.value, videoprotection.value === 'oui' ? 1 : 0, `Vidéo-protection : ${videoprotection.value}`)
  router.push('/questionnaire')
}
</script>

<style scoped>
.type-page {
  min-height: 100vh;
  background: #f5f5fe;
}

.type-main {
  padding: 2rem 1rem;
  max-width: 700px;
  margin: 0 auto;
}

.type-card {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,144,0.1);
  border-top: 4px solid #000091;
}

.type-card__step {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #000091;
  margin-bottom: 0.5rem;
}

.type-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #161616;
  margin: 0 0 0.5rem 0;
}

.type-card__desc {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.type-choices {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.type-choices--small {
  margin-bottom: 0;
}

.type-choice {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.25rem 1rem;
  border: 2px solid #e0e0f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.type-choice:hover {
  border-color: #000091;
  background: #f0f0ff;
}

.type-choice--selected {
  border-color: #000091;
  background: #f0f0ff;
  box-shadow: 0 0 0 3px rgba(0, 0, 145, 0.15);
}

.type-choice--small {
  min-width: 110px;
  padding: 0.875rem 0.75rem;
}

.type-choice__icon {
  font-size: 1.75rem;
  color: #000091;
}

.type-choice__label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #161616;
}

.type-choice__desc {
  font-size: 0.8rem;
  color: #888;
}

.type-localisation {
  border-top: 1px solid #e0e0f0;
  padding-top: 1.5rem;
}

.type-loc__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #161616;
}

.type-loc__group {
  margin-bottom: 1.25rem;
}

.type-loc__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.6rem;
}

.type-loc__questions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.type-loc__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #f5f5fe;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  flex-wrap: wrap;
}

.type-loc__q-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  flex: 1;
}

.type-loc__q-text i {
  color: #000091;
  flex-shrink: 0;
}

.type-yesno {
  display: flex;
  gap: 0.5rem;
}

.yn-btn {
  padding: 0.35rem 1rem;
  border-radius: 20px;
  border: 2px solid #d0d0e0;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s;
  color: #555;
}

.yn-btn--on {
  border-color: #1f8d49;
  background: #e8f5e9;
  color: #1a5c33;
}

.yn-btn--off {
  border-color: #ce0500;
  background: #fce9e9;
  color: #8d0000;
}

.type-cta {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.slide-up-leave-to {
  opacity: 0;
}
</style>
