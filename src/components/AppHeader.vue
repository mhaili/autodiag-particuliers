<template>
  <header class="app-header">
    <div class="app-header__inner fr-container">
      <router-link to="/" class="app-header__brand" aria-label="Retour à l'accueil">
        <img src="/images/logo-cptm.png" alt="Prévention Sûreté — Gendarmerie Nationale" class="app-header__logo" />
        <div class="app-header__brand-text">
          <span class="app-header__org">Gendarmerie Nationale</span>
          <span class="app-header__title">Auto-diagnostic Sûreté</span>
        </div>
      </router-link>

      <div v-if="showProgress" class="app-header__progress">
        <div class="progress-section">
          <i class="ri-folder-open-line"></i>
          <span>{{ section }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-pct">{{ progress }}%</span>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  showProgress: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  section: { type: String, default: '' },
})
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #0b0b52 0%, #000091 100%);
  padding: 1.1rem 0;
  box-shadow: 0 3px 14px rgba(0, 0, 144, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 3px solid #ffd700;
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  flex-shrink: 0;
}

.app-header__logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.app-header__brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.app-header__org {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.13em;
  text-transform: uppercase;
  font-weight: 500;
}

.app-header__title {
  font-size: 1.05rem;
  color: #fff;
  font-weight: 700;
  line-height: 1.2;
}

/* Progress bar */
.app-header__progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  max-width: 340px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-section i {
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 7px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffaa00);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-pct {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .app-header__logo {
    width: 48px;
    height: 48px;
  }

  .app-header__progress {
    max-width: 160px;
  }

  .progress-section {
    display: none;
  }
}
</style>
