<template>
  <footer class="app-footer">
    <div class="fr-container">
      <p>© {{ year }} Gendarmerie Nationale · Cellule de Prévention Technique de la Malveillance</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  background: #0b0b52;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  font-size: 0.78rem;
  padding: 1.1rem 1rem;
}

.app-footer p { margin: 0; }
</style>
