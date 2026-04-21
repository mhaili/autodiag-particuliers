<template>
  <DsfrSkipLinks :links="skipLinks" />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
const skipLinks = [{ id: 'main-content', label: 'Contenu principal' }]
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Skip links : masqué visuellement, accessible au focus clavier */
.fr-skiplinks {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  margin: -1px;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.fr-skiplinks:focus-within {
  clip: auto;
  width: auto;
  height: auto;
  margin: 0;
  position: static;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

/* ─── DSFR core manquant : fr-container ─────── */
.fr-container {
  max-width: 78rem;
  margin-right: auto;
  margin-left: auto;
  padding-right: 1.5rem;
  padding-left: 1.5rem;
}

/* ─── DSFR core manquant : fr-btn ───────────── */
.fr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background-color: #000091;
  color: #fff;
  border: 1px solid #000091;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  line-height: 1.5;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}
.fr-btn:hover,
.fr-btn:focus-visible {
  background-color: #1212ff;
  border-color: #1212ff;
  color: #fff;
  outline: none;
}
.fr-btn:active {
  background-color: #0000c8;
}
.fr-btn:disabled,
.fr-btn[disabled] {
  background-color: #e7e7f0;
  border-color: #e7e7f0;
  color: #929292;
  cursor: not-allowed;
}
.fr-btn--secondary {
  background-color: transparent;
  color: #000091;
  border: 1px solid #000091;
}
.fr-btn--secondary:hover,
.fr-btn--secondary:focus-visible {
  background-color: #f0f0ff;
  color: #000091;
  border-color: #000091;
}
.fr-btn--secondary:disabled,
.fr-btn--secondary[disabled] {
  background-color: transparent;
  border-color: #929292;
  color: #929292;
  cursor: not-allowed;
}
.fr-btn--lg {
  padding: 0.65rem 2rem;
  font-size: 1.0625rem;
}

/* ─── DSFR core manquant : fr-link ──────────── */
.fr-link {
  color: #000091;
  text-decoration: underline;
}
.fr-link:hover {
  color: #1212ff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
