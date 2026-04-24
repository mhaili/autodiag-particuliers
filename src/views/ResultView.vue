<template>
  <div class="result-page">
    <AppHeader />

    <main id="main-content" class="fr-container result-main">

      <!-- Score display -->
      <div class="result-hero" :class="`result-hero--${level}`">
        <div class="result-hero__mascot">
          <div class="mascot" :class="`mascot--${level}`">
            <img :src="mascotSrc" :alt="`Mascotte ${level}`" class="mascot__img" />
          </div>
        </div>

        <div class="result-hero__content">
          <div class="result-hero__label">Votre score</div>
          <div class="result-hero__score">
            <span class="result-score-num">{{ score }}</span>
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

      <!-- CTA contact if score faible -->
      <div v-if="level === 'faible'" class="result-contact-cta">
        <div class="contact-cta-icon"><i class="ri-customer-service-2-line"></i></div>
        <div>
          <p class="contact-cta-title">Besoin d'accompagnement ?</p>
          <p class="contact-cta-desc">Votre niveau de sécurité est insuffisant. Nous vous invitons à vous rapprocher de votre brigade de gendarmerie pour un accompagnement personnalisé.</p>
          <a href="https://www.masecurite.interieur.gouv.fr/fr/trouver-un-commissariat-une-gendarmerie" target="_blank" rel="noopener noreferrer" class="fr-link" style="display:block;margin-bottom:0.4rem">
            Trouver ma brigade
          </a>
          <a href="https://www.masecurite.interieur.gouv.fr/" target="_blank" rel="noopener noreferrer" class="fr-link">
            Accéder à MaSécurité
          </a>
        </div>
      </div>

      <!-- Actions -->
      <div class="result-actions">
        <DsfrButton
          label="Voir les préconisations"
          icon="ri-book-open-line"
          :icon-right="true"
          @click="$router.push('/preconisations')"
        />
        <DsfrButton
          label="Opération Tranquillité Vacances"
          icon="ri-external-link-line"
          :icon-right="true"
          :secondary="true"
          @click="openOTV"
        />
        <DsfrButton
          label="Recommencer le diagnostic"
          icon="ri-restart-line"
          :secondary="true"
          @click="restart"
        />
      </div>

      <!-- Download -->
      <div class="result-download">
        <DsfrButton
          :label="isGenerating ? 'Génération en cours…' : 'Télécharger mon diagnostic (PDF)'"
          :icon="isGenerating ? 'ri-loader-4-line' : 'ri-download-2-line'"
          :disabled="isGenerating"
          size="lg"
          class="result-download__btn"
          @click="downloadDiagnostic"
        />
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionnaire } from '@/composables/useQuestionnaire.js'
import AppHeader from '@/components/AppHeader.vue'
import conseils from '@/data/conseils.json'
import recommendations from '@/data/recommendations.json'

const router = useRouter()
const { state, score, scorePct, scoreLevel, allQuestions, reset } = useQuestionnaire()
const isGenerating = ref(false)

onMounted(() => {
  if (!state.finished) {
    router.replace('/')
  }
})

const level = computed(() => scoreLevel.value)
const sectionBadges = computed(() => state.sectionBadges)

const mascotSrc = computed(() => `${import.meta.env.BASE_URL}images/mascotte-${level.value}.png`)

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
  window.open('https://www.masecurite.interieur.gouv.fr/fr/demarches-en-ligne/operation-tranquillite-vacances?hl=OTV', '_blank', 'noopener,noreferrer')
}

function restart() {
  reset()
  router.push('/')
}

async function downloadDiagnostic() {
  if (isGenerating.value) return
  isGenerating.value = true

  try {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const questions = allQuestions.value
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    const logementLabel = { maison: 'Maison individuelle', appartement: 'Appartement' }[state.logementType] || '—'
    const locLabel = { ville: 'Ville', petite_commune: 'Petite commune', campagne: 'Campagne', lotissement: 'Lotissement' }[state.localisation] || '—'
    const levelLabel = { excellent: 'Bonne sécurité', moyen: 'Sécurité moyenne', faible: 'Sécurité insuffisante' }[level.value] || '—'
    const levelRgb = { excellent: [31, 141, 73], moyen: [179, 64, 0], faible: [206, 5, 0] }[level.value] || [0, 0, 145]
    const ansLabel = v => v === 'oui' ? 'Oui' : v === 'non' ? 'Non' : 'Je ne sais pas'

    // ── Fetch images as base64 ───────────────────────────────────
    async function toB64(url) {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        return await new Promise(resolve => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result)
          fr.readAsDataURL(blob)
        })
      } catch { return null }
    }
    const base = `${window.location.origin}${import.meta.env.BASE_URL}images/`
    const [logoB64, mascotB64, sigB64] = await Promise.all([
      toB64(base + 'logo-cptm.png'),
      toB64(base + `mascotte-${level.value}.png`),
      toB64(base + 'signature.png'),
    ])

    // ── Init document ────────────────────────────────────────────
    // ── Load Marianne font (WOFF → TTF) ──────────────────────────
    async function woffToTtf(woffBuf) {
      const view = new DataView(woffBuf)
      if (view.getUint32(0) !== 0x774F4646) throw new Error('Not a WOFF file')
      const flavor = view.getUint32(4)
      const numTables = view.getUint16(12)
      const tables = []
      for (let i = 0; i < numTables; i++) {
        const o = 44 + i * 20
        tables.push({ tag: view.getUint32(o), offset: view.getUint32(o + 4), compLength: view.getUint32(o + 8), origLength: view.getUint32(o + 12), checksum: view.getUint32(o + 16) })
      }
      const decomp = await Promise.all(tables.map(async t => {
        const raw = new Uint8Array(woffBuf, t.offset, t.compLength)
        if (t.compLength === t.origLength) return { ...t, data: raw }
        const ds = new DecompressionStream('deflate')
        const writer = ds.writable.getWriter()
        const reader = ds.readable.getReader()
        const CHUNK = 65536
        for (let i = 0; i < raw.length; i += CHUNK) await writer.write(raw.subarray(i, Math.min(i + CHUNK, raw.length)))
        writer.close()
        const chunks = []
        for (;;) { const { value, done } = await reader.read(); if (done) break; chunks.push(value) }
        const out = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0))
        let pos = 0; for (const c of chunks) { out.set(c, pos); pos += c.length }
        return { ...t, data: out }
      }))
      const n = numTables
      const pow2 = Math.pow(2, Math.floor(Math.log2(n)))
      let dataStart = 12 + n * 16
      const offsets = decomp.map(t => { const o = dataStart; dataStart += Math.ceil(t.origLength / 4) * 4; return o })
      const ttf = new ArrayBuffer(dataStart)
      const ov = new DataView(ttf); const ob = new Uint8Array(ttf)
      ov.setUint32(0, flavor); ov.setUint16(4, n)
      ov.setUint16(6, pow2 * 16); ov.setUint16(8, Math.floor(Math.log2(n))); ov.setUint16(10, n * 16 - pow2 * 16)
      for (let i = 0; i < n; i++) {
        const t = decomp[i]; const d = 12 + i * 16
        ov.setUint32(d, t.tag); ov.setUint32(d + 4, t.checksum)
        ov.setUint32(d + 8, offsets[i]); ov.setUint32(d + 12, t.origLength)
        ob.set(t.data.subarray(0, t.origLength), offsets[i])
      }
      return ttf
    }
    function bufToB64(buf) {
      const b = new Uint8Array(buf); let s = ''
      for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
      return btoa(s)
    }
    const fontBase = `${window.location.origin}${import.meta.env.BASE_URL}fonts/`
    const [marianneRegB64, marianneBoldB64] = await Promise.all([
      fetch(fontBase + 'Marianne-Regular.woff').then(r => r.arrayBuffer()).then(woffToTtf).then(bufToB64).catch(() => null),
      fetch(fontBase + 'Marianne-Bold.woff').then(r => r.arrayBuffer()).then(woffToTtf).then(bufToB64).catch(() => null),
    ])

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

    // Register Marianne — fallback to helvetica if loading failed
    let fontName = 'helvetica'
    if (marianneRegB64 && marianneBoldB64) {
      doc.addFileToVFS('Marianne-Regular.ttf', marianneRegB64)
      doc.addFont('Marianne-Regular.ttf', 'Marianne', 'normal')
      doc.addFileToVFS('Marianne-Bold.ttf', marianneBoldB64)
      doc.addFont('Marianne-Bold.ttf', 'Marianne', 'bold')
      fontName = 'Marianne'
    }
    const M = 14        // margin
    const W = 182       // content width (210 - 2*14)
    const PH = 297      // page height

    let y = 0

    function check(needed = 20) {
      if (y + needed > PH - M - 12) {
        doc.addPage()
        y = M
      }
    }

    // ── HEADER ───────────────────────────────────────────────────
    doc.setFillColor(0, 0, 145)
    doc.rect(0, 0, 210, 26, 'F')
    if (logoB64) doc.addImage(logoB64, 'PNG', M, 3, 18, 18)
    const txX = logoB64 ? M + 22 : M
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6.5); doc.setFont(fontName, 'normal')
    doc.text('GENDARMERIE NATIONALE · PRÉVENTION TECHNIQUE DE LA MALVEILLANCE', txX, 8.5)
    doc.setFontSize(15); doc.setFont(fontName, 'bold')
    doc.text('Auto-diagnostic Sûreté Habitation', txX, 16)
    doc.setFontSize(7.5); doc.setFont(fontName, 'normal')
    doc.text(`Réalisé le ${date} — Document confidentiel`, txX, 22)

    y = 32

    // ── INFO ROW (3 cells) ───────────────────────────────────────
    const bW = W / 3
    const bH = 18
    // Cell 1
    doc.setFillColor(245, 245, 254); doc.setDrawColor(220, 220, 240)
    doc.rect(M, y, bW, bH, 'FD')
    doc.setTextColor(130, 130, 160); doc.setFontSize(6.5); doc.setFont(fontName, 'normal')
    doc.text('LOGEMENT', M + 3, y + 5)
    doc.setTextColor(22, 22, 22); doc.setFontSize(10); doc.setFont(fontName, 'bold')
    doc.text(logementLabel, M + 3, y + 13)
    // Cell 2
    doc.setFillColor(245, 245, 254); doc.setDrawColor(220, 220, 240)
    doc.rect(M + bW, y, bW, bH, 'FD')
    doc.setTextColor(130, 130, 160); doc.setFontSize(6.5); doc.setFont(fontName, 'normal')
    doc.text('LOCALISATION', M + bW + 3, y + 5)
    doc.setTextColor(22, 22, 22); doc.setFontSize(10); doc.setFont(fontName, 'bold')
    doc.text(locLabel, M + bW + 3, y + 13)
    // Cell 3 (niveau — colored)
    doc.setFillColor(levelRgb[0], levelRgb[1], levelRgb[2])
    doc.rect(M + bW * 2, y, bW, bH, 'F')
    if (mascotB64) doc.addImage(mascotB64, 'PNG', M + bW * 2 + 2, y + 1, 13, 13)
    const lvlTxX = mascotB64 ? M + bW * 2 + 17 : M + bW * 2 + 3
    doc.setTextColor(255, 255, 255); doc.setFontSize(6.5); doc.setFont(fontName, 'normal')
    doc.text('NIVEAU DE SÉCURITÉ', lvlTxX, y + 6)
    doc.setFontSize(9); doc.setFont(fontName, 'bold')
    doc.text(levelLabel, lvlTxX, y + 13)

    y += bH + 8

    // ── COLLECT DATA ─────────────────────────────────────────────
    const personalRecs = []
    ;['type_eclairage', 'type_videoprotection'].forEach(id => {
      const ans = state.answers[id]
      if (ans && ans.points === 0 && conseils[id])
        personalRecs.push({ section: 'Infos générales', conseil: conseils[id] })
    })

    const bySection = {}
    const sectionOrder = []
    const eclairage = state.answers['type_eclairage']
    const video = state.answers['type_videoprotection']
    if (eclairage || video) {
      bySection['Informations générales'] = []
      sectionOrder.push('Informations générales')
      if (eclairage) bySection['Informations générales'].push({ text: 'Éclairage public dans la rue', value: eclairage.value, points: eclairage.points })
      if (video)     bySection['Informations générales'].push({ text: 'Vidéo-protection dans la commune', value: video.value, points: video.points })
    }
    questions.forEach(q => {
      const ans = state.answers[q.id]
      if (!ans) return
      if (!bySection[q.section]) { bySection[q.section] = []; sectionOrder.push(q.section) }
      bySection[q.section].push({ text: q.text, value: ans.value, points: ans.points })
      if (ans.points === 0 && conseils[q.id])
        personalRecs.push({ section: q.section, conseil: conseils[q.id] })
    })

    // ── PERSONAL RECS ────────────────────────────────────────────
    check(18)
    doc.setFillColor(252, 233, 233); doc.setDrawColor(206, 5, 0); doc.setLineWidth(0.4)
    doc.rect(M, y, W, 7, 'F'); doc.line(M, y, M, y + 7)
    doc.setLineWidth(0.2)
    doc.setTextColor(141, 0, 0); doc.setFontSize(9.5); doc.setFont(fontName, 'bold')
    doc.text('Vos axes d\'amélioration personnalisés', M + 4, y + 5)
    y += 8

    if (personalRecs.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Section', 'Conseil']],
        body: personalRecs.map(r => [r.section, r.conseil]),
        theme: 'plain',
        headStyles: { fillColor: [252, 233, 233], textColor: [141, 0, 0], fontSize: 7.5, fontStyle: 'bold', font: fontName },
        columnStyles: { 0: { cellWidth: 36, fontSize: 8, textColor: [141, 0, 0], fontStyle: 'bold', overflow: 'linebreak' }, 1: { fontSize: 8, overflow: 'linebreak' } },
        styles: { lineColor: [245, 225, 225], lineWidth: 0.25, overflow: 'linebreak', font: fontName },
        tableWidth: W,
        margin: { left: M, right: M },
      })
      y = doc.lastAutoTable.finalY + 8
    } else {
      doc.setTextColor(31, 141, 73); doc.setFontSize(9); doc.setFont(fontName, 'bold')
      doc.text('Aucun axe d\'amélioration — Excellent niveau de sécurité !', M, y + 4)
      y += 12
    }

    // ── ANSWERS BY SECTION ───────────────────────────────────────
    check(15)
    doc.setFillColor(240, 240, 255); doc.setDrawColor(0, 0, 145); doc.setLineWidth(0.4)
    doc.rect(M, y, W, 7, 'F'); doc.line(M, y, M, y + 7)
    doc.setLineWidth(0.2)
    doc.setTextColor(0, 0, 145); doc.setFontSize(9.5); doc.setFont(fontName, 'bold')
    doc.text('Vos réponses par section', M + 4, y + 5)
    y += 8

    for (const sec of sectionOrder) {
      check(20)
      autoTable(doc, {
        startY: y,
        head: [[{ content: sec, colSpan: 2, styles: { fillColor: [240, 240, 255], textColor: [0, 0, 145], fontStyle: 'bold', fontSize: 8.5 } }]],
        body: bySection[sec].map(item => {
          const missed = item.points === 0
          const ansC = item.value === 'oui' ? [26, 92, 51] : item.value === 'non' ? [141, 0, 0] : [90, 90, 150]
          return [
            { content: item.text, styles: { textColor: missed ? [107, 51, 0] : [50, 50, 50], fontStyle: missed ? 'bold' : 'normal', fillColor: missed ? [255, 244, 229] : [255, 255, 255], fontSize: 8 } },
            { content: ansLabel(item.value), styles: { textColor: ansC, fontStyle: 'bold', fillColor: missed ? [255, 244, 229] : [255, 255, 255], halign: 'center', fontSize: 8 } },
          ]
        }),
        columnStyles: { 0: { overflow: 'linebreak' }, 1: { cellWidth: 28, halign: 'center' } },
        styles: { lineColor: [220, 220, 235], lineWidth: 0.25, overflow: 'linebreak', font: fontName },
        tableWidth: W,
        margin: { left: M, right: M },
      })
      y = doc.lastAutoTable.finalY + 4
    }

    y += 4

    // ── GENERAL RECOMMENDATIONS ──────────────────────────────────
    check(15)
    doc.setFillColor(240, 240, 255); doc.setDrawColor(0, 0, 145); doc.setLineWidth(0.4)
    doc.rect(M, y, W, 7, 'F'); doc.line(M, y, M, y + 7)
    doc.setLineWidth(0.2)
    doc.setTextColor(0, 0, 145); doc.setFontSize(9.5); doc.setFont(fontName, 'bold')
    doc.text('Préconisations générales — Gendarmerie Nationale', M + 4, y + 5)
    y += 13

    recommendations.forEach(sec => {
      check(14)
      doc.setTextColor(0, 0, 145); doc.setFontSize(8.5); doc.setFont(fontName, 'bold')
      doc.text(sec.titre, M, y); y += 6
      sec.contenu.forEach(item => {
        check(6)
        const plain = item.replace(/<[^>]+>/g, '')
        const lines = doc.splitTextToSize(`• ${plain}`, W - 4)
        doc.setTextColor(70, 70, 70); doc.setFontSize(8); doc.setFont(fontName, 'normal')
        lines.forEach(line => { check(5); doc.text(line, M + 3, y); y += 4.5 })
      })
      y += 5
    })

    // ── BRIGADE ALERT ────────────────────────────────────────────
    if (level.value === 'faible') {
      check(28)
      doc.setFillColor(255, 244, 229); doc.setDrawColor(228, 106, 38); doc.setLineWidth(0.4)
      doc.rect(M, y, W, 26, 'FD')
      doc.setTextColor(107, 51, 0); doc.setFontSize(9.5); doc.setFont(fontName, 'bold')
      doc.text('Votre niveau de sécurité est insuffisant', M + 4, y + 7)
      doc.setFontSize(8); doc.setFont(fontName, 'normal')
      const alertLines = doc.splitTextToSize(
        'Rapprochez-vous de votre brigade de gendarmerie pour un accompagnement personnalisé. Trouvez votre brigade sur masecurite.interieur.gouv.fr',
        W - 8
      )
      alertLines.forEach((l, i) => doc.text(l, M + 4, y + 14 + i * 5))
      y += 32
    }

    // ── SIGNATURE ────────────────────────────────────────────────
    if (sigB64) {
      // Get natural dimensions to preserve aspect ratio
      const sigDims = await new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
        img.onerror = () => resolve({ w: 200, h: 80 })
        img.src = sigB64
      })
      const maxW = 65
      const ratio = sigDims.h / sigDims.w
      const sW = maxW
      const sH = Math.round(maxW * ratio)
      check(sH + 8)
      doc.addImage(sigB64, 'PNG', (210 - sW) / 2, y, sW, sH)
      y += sH + 6
    }

    // ── FOOTER on every page ─────────────────────────────────────
    const total = doc.internal.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      doc.setPage(i)
      doc.setDrawColor(200, 200, 215); doc.setLineWidth(0.25)
      doc.line(M, PH - 11, 210 - M, PH - 11)
      doc.setTextColor(160, 160, 175); doc.setFontSize(6.5); doc.setFont(fontName, 'normal')
      doc.text('Document confidentiel à usage personnel — Ne constitue pas un rapport officiel', 105, PH - 8, { align: 'center' })
      doc.text(`masecurite.interieur.gouv.fr  ·  Urgences : 17  ·  Page ${i} / ${total}`, 105, PH - 5, { align: 'center' })
    }

    // ── SAVE ─────────────────────────────────────────────────────
    doc.save(`diagnostic-surete-${new Date().toISOString().split('T')[0]}.pdf`)

  } finally {
    isGenerating.value = false
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
  width: 110px;
  height: 110px;
  flex-shrink: 0;
  animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mascot__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

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
  text-align: center;
  margin-bottom: 1.5rem;
}

.result-download__btn {
  width: 100%;
  justify-content: center;
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
  margin-bottom: 1.5rem;
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
