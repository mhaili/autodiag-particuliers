<template>
  <div class="result-page">
    <AppHeader />

    <main id="main-content" class="fr-container result-main">

      <!-- Score display -->
      <div class="result-hero" :class="`result-hero--${level}`">
        <div class="result-hero__mascot">
          <div class="mascot" :class="`mascot--${level}`">
            <i :class="mascotIcon"></i>
          </div>
        </div>

        <div class="result-hero__content">
          <div class="result-hero__label">Votre score</div>
          <div class="result-hero__score">
            <span class="result-score-num">{{ scoreValue }}</span>
            <span class="result-score-total">/ {{ state.totalPossible }}</span>
          </div>
          <div class="result-hero__pct">
            <div class="result-pct-bar">
              <div class="result-pct-fill" :style="{ width: scorePct + '%' }" :class="`result-pct-fill--${level}`"></div>
            </div>
            <span class="result-pct-label">{{ scorePct }}%</span>
          </div>
          <h1 class="result-hero__title">{{ resultMessage.title }}</h1>
          <p class="result-hero__desc">{{ resultMessage.desc }}</p>
        </div>
      </div>

      <!-- Badges won -->
      <div v-if="sectionBadges.length" class="result-badges">
        <h2 class="result-section-title"><i class="ri-award-line"></i> Sections complétées</h2>
        <div class="badges-row">
          <div v-for="badge in sectionBadges" :key="badge" class="badge-item">
            <i class="ri-checkbox-circle-fill"></i>
            <span>{{ badge }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="result-actions">
        <button
          type="button"
          class="fr-btn"
          @click="$router.push('/preconisations')"
        >
          Voir les préconisations
          <i class="ri-book-open-line" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="fr-btn fr-btn--secondary"
          @click="openOTV"
        >
          Opération Tranquillité Vacances
          <i class="ri-external-link-line" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="fr-btn fr-btn--secondary"
          @click="restart"
        >
          <i class="ri-restart-line" aria-hidden="true"></i>
          Recommencer le diagnostic
        </button>
      </div>

      <!-- Download -->
      <div class="result-download">
        <button
          type="button"
          class="result-download__btn"
          @click="downloadDiagnostic"
        >
          <i class="ri-download-2-line" aria-hidden="true"></i>
          Télécharger mon diagnostic (PDF)
        </button>
        <p class="result-download__hint">
          <i class="ri-information-line" aria-hidden="true"></i>
          Une fenêtre d'impression s'ouvre — choisissez « Enregistrer en PDF »
        </p>
      </div>

      <!-- CTA contact if score faible -->
      <div v-if="level === 'faible'" class="result-contact-cta">
        <div class="contact-cta-icon"><i class="ri-customer-service-2-line"></i></div>
        <div>
          <p class="contact-cta-title">Besoin d'accompagnement ?</p>
          <p class="contact-cta-desc">Prenez contact avec votre correspondant sûreté via l'application <strong>MaSécurité</strong>.</p>
          <a href="https://www.masecurite.interieur.gouv.fr/" target="_blank" rel="noopener noreferrer" class="fr-link">
            Accéder à MaSécurité <i class="ri-external-link-line"></i>
          </a>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionnaire } from '@/composables/useQuestionnaire.js'
import AppHeader from '@/components/AppHeader.vue'
import maisonData from '@/data/maison.json'
import appartementData from '@/data/appartement.json'
import conseils from '@/data/conseils.json'
import recommendations from '@/data/recommendations.json'

const router = useRouter()
const { state, score, scorePct, scoreLevel, reset } = useQuestionnaire()

onMounted(() => {
  if (!state.finished) {
    router.replace('/')
  }
})

const scoreValue = computed(() => score.value)
const level = computed(() => scoreLevel.value)
const sectionBadges = computed(() => state.sectionBadges)

const mascotIcon = computed(() => {
  if (level.value === 'excellent') return 'ri-emotion-happy-line'
  if (level.value === 'moyen') return 'ri-emotion-normal-line'
  return 'ri-emotion-unhappy-line'
})

const resultMessages = {
  excellent: {
    title: 'Excellent ! Votre habitation est bien sécurisée.',
    desc: 'Vous avez adopté les bonnes pratiques. Consultez les préconisations pour maintenir ce niveau de sûreté et découvrir les dernières recommandations.',
  },
  moyen: {
    title: 'Des améliorations sont possibles.',
    desc: 'Vous avez de bonnes bases, mais certains points méritent attention. Consultez les préconisations générales pour renforcer votre sécurité.',
  },
  faible: {
    title: 'Attention, votre habitation est vulnérable.',
    desc: 'Des actions sont urgentes pour sécuriser votre domicile. Nous vous invitons à consulter les préconisations et à contacter un correspondant sûreté.',
  },
}

const resultMessage = computed(() => resultMessages[level.value])

function openOTV() {
  window.open('https://www.masecurite.interieur.gouv.fr/', '_blank', 'noopener,noreferrer')
}

function restart() {
  reset()
  router.push('/')
}

function downloadDiagnostic() {
  const allQuestions = state.logementType === 'maison' ? maisonData : appartementData

  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const logementLabel = { maison: 'Maison individuelle', appartement: 'Appartement' }[state.logementType] || '—'
  const locLabel    = { ville: 'Ville', petite_commune: 'Petite commune', campagne: 'Campagne', lotissement: 'Lotissement' }[state.localisation] || '—'
  const levelLabel  = { excellent: 'Bonne sécurité', moyen: 'Sécurité moyenne', faible: 'Sécurité insuffisante' }[level.value] || '—'
  const levelColor  = { excellent: '#1f8d49', moyen: '#b34000', faible: '#ce0500' }[level.value] || '#000091'

  const ansLabel = v => v === 'oui' ? 'Oui' : v === 'non' ? 'Non' : 'Je ne sais pas'
  const ansColor = v => v === 'oui' ? '#1f8d49' : v === 'non' ? '#ce0500' : '#666'

  // ── Recommandations personnalisées ─────────────────────────────
  // Collect all 0-point answers that have a conseil
  const personalRecs = []

  // Check TypeView answers first
  const specialIds = ['type_eclairage', 'type_videoprotection']
  specialIds.forEach(id => {
    const ans = state.answers[id]
    if (ans && ans.points === 0 && conseils[id]) {
      personalRecs.push({ section: 'Informations générales', conseil: conseils[id] })
    }
  })

  // Walk JSON questions in order
  const sectionOrder = []
  const bySection = {}
  allQuestions.forEach(q => {
    const ans = state.answers[q.id]
    if (!ans) return
    // Collect Q&A for the second part
    if (!bySection[q.section]) { bySection[q.section] = []; sectionOrder.push(q.section) }
    bySection[q.section].push({ text: q.text, value: ans.value, points: ans.points })
    // Collect recommendations for 0-point answers
    if (ans.points === 0 && conseils[q.id]) {
      personalRecs.push({ section: q.section, conseil: conseils[q.id] })
    }
  })

  // ── HTML blocks ────────────────────────────────────────────────
  const recRows = personalRecs.map(r =>
    `<tr>
      <td style="width:22%;padding:6px 10px;border-bottom:1px solid #f5e6e6;font-size:9pt;color:#8d0000;font-weight:600;vertical-align:top">${r.section}</td>
      <td style="width:78%;padding:6px 10px;border-bottom:1px solid #f5e6e6;font-size:10pt;color:#333;vertical-align:top">${r.conseil}</td>
    </tr>`
  ).join('')

  const sectionsHTML = sectionOrder.map(sec => {
    const rows = bySection[sec].map(item =>
      `<tr>
        <td style="width:70%;padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:9.5pt">${item.text}</td>
        <td style="width:15%;padding:4px 8px;border-bottom:1px solid #f0f0f0;font-weight:700;color:${ansColor(item.value)};font-size:9.5pt">${ansLabel(item.value)}</td>
        <td style="width:15%;padding:4px 8px;border-bottom:1px solid #f0f0f0;color:#888;font-size:9.5pt">${item.points} pt</td>
      </tr>`
    ).join('')
    return `
      <div style="margin-bottom:16px">
        <div style="background:#f0f0ff;border-left:4px solid #000091;padding:6px 12px;font-weight:700;color:#000091;font-size:10.5pt;margin-bottom:4px">${sec}</div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#fafafa">
            <th style="padding:5px 8px;text-align:left;font-size:8.5pt;color:#777;border-bottom:2px solid #e0e0e0">Question</th>
            <th style="padding:5px 8px;text-align:left;font-size:8.5pt;color:#777;border-bottom:2px solid #e0e0e0">Réponse</th>
            <th style="padding:5px 8px;text-align:left;font-size:8.5pt;color:#777;border-bottom:2px solid #e0e0e0">Points</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
  }).join('')

  const generalRecs = recommendations.map(sec =>
    `<div style="margin-bottom:14px">
      <div style="font-weight:700;color:#000091;font-size:10pt;margin-bottom:4px">${sec.titre}</div>
      <ul style="margin:0;padding-left:16px">
        ${sec.contenu.map(c => `<li style="font-size:9pt;color:#444;margin-bottom:3px;line-height:1.5">${c.replace(/https?:\/\/[^\s]+/, '').trim()}</li>`).join('')}
      </ul>
    </div>`
  ).join('')

  const eclairage = state.answers['type_eclairage']
  const video = state.answers['type_videoprotection']
  const infoRows = [
    eclairage ? `<tr><td style="padding:4px 8px;border-bottom:1px solid #f0f0f0;font-size:9.5pt;width:70%">Éclairage public dans la rue</td><td style="font-weight:700;color:${ansColor(eclairage.value)};font-size:9.5pt;padding:4px 8px;border-bottom:1px solid #f0f0f0;width:15%">${ansLabel(eclairage.value)}</td><td style="color:#888;font-size:9.5pt;padding:4px 8px;border-bottom:1px solid #f0f0f0;width:15%">${eclairage.points} pt</td></tr>` : '',
    video ? `<tr><td style="padding:4px 8px;font-size:9.5pt;width:70%">Vidéo-protection dans la commune</td><td style="font-weight:700;color:${ansColor(video.value)};font-size:9.5pt;padding:4px 8px;width:15%">${ansLabel(video.value)}</td><td style="color:#888;font-size:9.5pt;padding:4px 8px;width:15%">${video.points} pt</td></tr>` : '',
  ].join('')

  // ── Full HTML document ─────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Diagnostic Sûreté Habitation — ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #333; padding: 24px; font-size: 11pt; }
    h2 { font-size: 13pt; color: #000091; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid #000091; }
    h3 { font-size: 11pt; font-weight: 700; color: #555; margin: 18px 0 8px; }
    @page { margin: 1.5cm; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>

  <!-- En-tête -->
  <div style="background:#000091;color:#fff;padding:18px 22px;margin-bottom:20px">
    <div style="font-size:8pt;opacity:.7;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px">Gendarmerie Nationale · Prévention Technique de la Malveillance</div>
    <div style="font-size:20pt;font-weight:900">Auto-diagnostic Sûreté Habitation</div>
    <div style="font-size:9pt;opacity:.75;margin-top:6px">Réalisé le ${date} — Document personnel confidentiel</div>
  </div>

  <!-- Résumé + score -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <tr>
      <td style="width:33%;padding:10px 14px;background:#f5f5fe;border:1px solid #e0e0f0;vertical-align:top">
        <div style="font-size:8pt;color:#777;text-transform:uppercase;letter-spacing:.08em">Logement</div>
        <div style="font-size:12pt;font-weight:700;color:#161616;margin-top:3px">${logementLabel}</div>
      </td>
      <td style="width:33%;padding:10px 14px;background:#f5f5fe;border:1px solid #e0e0f0;border-left:none;vertical-align:top">
        <div style="font-size:8pt;color:#777;text-transform:uppercase;letter-spacing:.08em">Localisation</div>
        <div style="font-size:12pt;font-weight:700;color:#161616;margin-top:3px">${locLabel}</div>
      </td>
      <td style="width:34%;padding:10px 14px;background:#000091;color:#fff;vertical-align:top;text-align:center">
        <div style="font-size:8pt;opacity:.75;text-transform:uppercase;letter-spacing:.08em">Score obtenu</div>
        <div style="font-size:26pt;font-weight:900;line-height:1;margin-top:2px">${score.value}<span style="font-size:13pt;opacity:.7"> / ${state.totalPossible}</span></div>
        <div style="font-size:11pt;font-weight:700">${scorePct.value}%</div>
        <div style="display:inline-block;background:#fff;color:${levelColor};font-weight:700;font-size:10pt;padding:2px 10px;border-radius:3px;margin-top:5px">${levelLabel}</div>
      </td>
    </tr>
  </table>

  <!-- Informations générales -->
  ${infoRows ? `
  <div style="margin-bottom:20px">
    <div style="background:#f0f0ff;border-left:4px solid #000091;padding:6px 12px;font-weight:700;color:#000091;font-size:10.5pt;margin-bottom:4px">Informations générales</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#fafafa">
        <th style="padding:5px 8px;text-align:left;font-size:8.5pt;color:#777;border-bottom:2px solid #e0e0e0">Question</th>
        <th style="padding:5px 8px;text-align:left;font-size:8.5pt;color:#777;border-bottom:2px solid #e0e0e0">Réponse</th>
        <th style="padding:5px 8px;text-align:left;font-size:8.5pt;color:#777;border-bottom:2px solid #e0e0e0">Points</th>
      </tr></thead>
      <tbody>${infoRows}</tbody>
    </table>
  </div>` : ''}

  <!-- ★ Recommandations personnalisées ★ -->
  ${recRows ? `
  <h2 style="color:#ce0500;border-bottom-color:#ce0500">Vos axes d'amélioration personnalisés</h2>
  <p style="font-size:9pt;color:#888;margin-bottom:10px">Les points suivants sont issus de vos réponses et nécessitent une attention particulière.</p>
  <table style="width:100%;border-collapse:collapse;margin-bottom:22px;background:#fff9f9;border:1px solid #fce0e0;border-radius:4px">
    <thead><tr style="background:#fce9e9">
      <th style="padding:6px 10px;text-align:left;font-size:8.5pt;color:#8d0000;border-bottom:2px solid #f5e6e6;width:22%">Section</th>
      <th style="padding:6px 10px;text-align:left;font-size:8.5pt;color:#8d0000;border-bottom:2px solid #f5e6e6;width:78%">Conseil</th>
    </tr></thead>
    <tbody>${recRows}</tbody>
  </table>` : `<p style="margin-bottom:20px;color:#1f8d49;font-weight:700">Aucun axe d'amélioration majeur identifié — Excellent niveau de sécurité !</p>`}

  <!-- Réponses complètes -->
  <h2>Vos réponses par section</h2>
  <div style="margin-bottom:22px">${sectionsHTML}</div>

  <!-- Préconisations générales -->
  <h2>Préconisations générales — Gendarmerie Nationale</h2>
  <div style="margin-bottom:16px">${generalRecs}</div>

  <!-- Pied de page -->
  <div style="border-top:1px solid #e0e0e0;padding-top:10px;margin-top:10px;font-size:8.5pt;color:#999;text-align:center">
    <p>Document confidentiel à usage personnel — Ne constitue pas un rapport officiel</p>
    <p style="margin-top:3px">Pour toute assistance : <strong>masecurite.interieur.gouv.fr</strong> · Composez le <strong>17</strong> en cas d'urgence</p>
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=920,height=750')
  if (win) {
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f5f5fe;
}

.result-main {
  padding: 2rem 1rem;
  max-width: 680px;
  margin: 0 auto;
}

/* Hero */
.result-hero {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,144,0.1);
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  border-top: 4px solid #000091;
}

.result-hero--excellent { border-top-color: #1f8d49; }
.result-hero--moyen { border-top-color: #b34000; }
.result-hero--faible { border-top-color: #ce0500; }

.result-hero__mascot {
  flex-shrink: 0;
}

.mascot {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mascot--excellent { background: #e8f5e9; color: #1f8d49; }
.mascot--moyen { background: #fff4e0; color: #b34000; }
.mascot--faible { background: #fce9e9; color: #ce0500; }

.result-hero__content {
  flex: 1;
}

.result-hero__label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 0.25rem;
}

.result-hero__score {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.result-score-num {
  font-size: 3rem;
  font-weight: 800;
  color: #000091;
  animation: countUp 0.8s ease;
}

.result-score-total {
  font-size: 1.25rem;
  color: #aaa;
}

.result-hero__pct {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.result-pct-bar {
  flex: 1;
  height: 8px;
  background: #e0e0f0;
  border-radius: 4px;
  overflow: hidden;
}

.result-pct-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-pct-fill--excellent { background: linear-gradient(90deg, #1f8d49, #099a3d); }
.result-pct-fill--moyen { background: linear-gradient(90deg, #e46a26, #b34000); }
.result-pct-fill--faible { background: linear-gradient(90deg, #e1000f, #ce0500); }

.result-pct-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #555;
  white-space: nowrap;
}

.result-hero__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #161616;
  margin: 0 0 0.5rem 0;
}

.result-hero__desc {
  font-size: 0.9rem;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

/* Badges */
.result-badges {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,144,0.07);
}

.result-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #161616;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.result-section-title i {
  color: #000091;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.badge-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #e8f5e9;
  color: #1a5c33;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.4rem 0.875rem;
  border-radius: 20px;
}

.badge-item i {
  font-size: 1rem;
}

/* Actions */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

/* Download block */
.result-download {
  background: #fff;
  border: 2px dashed #b0b0d0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.result-download__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 2rem;
  background: #0a0a5c;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
  margin-bottom: 0.6rem;
}

.result-download__btn:hover {
  background: #000091;
}

.result-download__btn i {
  font-size: 1.2rem;
}

.result-download__hint {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

/* Contact CTA */
.result-contact-cta {
  background: linear-gradient(135deg, #fff4e0, #fff8ec);
  border: 1px solid #f6c87e;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-cta-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #fff3cd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #b34000;
  flex-shrink: 0;
}

.contact-cta-title {
  font-weight: 700;
  font-size: 1rem;
  color: #161616;
  margin: 0 0 0.25rem 0;
}

.contact-cta-desc {
  font-size: 0.875rem;
  color: #555;
  margin: 0 0 0.5rem 0;
}

@keyframes bounceIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .result-hero {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .result-hero__pct {
    justify-content: center;
  }
}
</style>
