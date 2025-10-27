<template>
  <div :class="['place-rating', { 'is-inline': inline }]">
    <div v-if="!apiKey && !hasEnvKey && !inline" class="error">API 金鑰未提供 (prop: apiKey 或 VITE_GOOGLE_MAPS_API_KEY)</div>

    <!-- Inline compact view (no outer chrome) -->
    <template v-if="inline">
      <span v-if="loading" class="pr-inline pr-loading" aria-label="讀取中">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </span>
      <span v-else-if="error" class="pr-inline pr-error" :title="error">{{ fallbackText }}</span>
      <span v-else-if="inlineRating !== ''" class="pr-inline" aria-label="評分">
        <span class="star">★</span>
        <span class="num">{{ inlineRating }}</span>
      </span>
      <span v-else class="pr-inline pr-fallback">{{ fallbackText }}</span>
      <slot name="after" :details="details"></slot>
    </template>

    <!-- Full view -->
    <template v-else>
      <div class="controls">
        <input v-model="localPlaceName" placeholder="輸入地點名稱 (或傳 placeId prop)" />
        <button @click="fetchRating" :disabled="loading || (!apiKey && !hasEnvKey)">取得評分</button>
      </div>

      <div v-if="loading">讀取中…</div>

      <div v-if="error" class="error">錯誤：{{ error }}</div>

      <div v-if="details" class="result">
        <h3>{{ details.displayName?.text || details.displayName }}</h3>
        <p v-if="details.formattedAddress">地址：{{ details.formattedAddress }}</p>
        <p v-if="details.rating !== undefined">評分：{{ details.rating }} （{{ details.userRatingCount || 0 }} 則評分）</p>
        <p v-if="details.googleMapsUri">地圖連結： <a :href="details.googleMapsUri.uri || details.googleMapsUri" target="_blank">在 Google Maps 開啟</a></p>
      </div>

      <slot name="after" :details="details"></slot>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { searchPlaceByText, getPlaceDetails } from '../api/places.js';

// Props: apiKey optional; optional placeName or placeId; inline mode for compact display
const props = defineProps({
  apiKey: { type: String, required: false },
  placeName: { type: String, required: false },
  placeId: { type: String, required: false },
  inline: { type: Boolean, default: false },
  fallbackText: { type: String, default: '無評分' }
});

const emit = defineEmits(['success', 'error']);

const localPlaceName = ref(props.placeName || '');
const loading = ref(false);
const error = ref('');
const details = ref(null);

const hasEnvKey = Boolean(import.meta.env?.VITE_GOOGLE_MAPS_API_KEY);
const apiKeyUsed = computed(() => props.apiKey || import.meta.env?.VITE_GOOGLE_MAPS_API_KEY);

function formatRatingValue(r) {
  if (r === null || r === undefined) return '';
  const n = Number(r);
  if (Number.isNaN(n)) return '';
  return (Math.round(n * 10) / 10).toFixed(1);
}

// compute inlineRating from details in a robust way
const inlineRating = computed(() => {
  const d = details.value;
  if (!d) return '';
  const candidates = [
    d.rating,
    d.result?.rating,
    d.place?.rating,
    d.properties?.rating,
    d.result?.place?.rating
  ];
  const found = candidates.find(v => v !== undefined && v !== null);
  return found !== undefined && found !== null ? formatRatingValue(found) : '';
});

// Expose fetchRating for parent via template ref if desired
async function fetchRating() {
  error.value = '';
  details.value = null;

  if (!apiKeyUsed.value) {
    error.value = 'apiKey is required';
    emit('error', error.value);
    return;
  }

  try {
    loading.value = true;
    let id = props.placeId;

    if (!id) {
      if (!localPlaceName.value) {
        error.value = '請輸入 placeName 或傳入 placeId';
        emit('error', error.value);
        return;
      }
      const place = await searchPlaceByText(localPlaceName.value, /*apiKey*/ apiKeyUsed.value);
      console.log('[PlaceRating] searchPlaceByText result for', localPlaceName.value, place);
      id = place.id || place.placeId || place.result?.placeId || place.result?.id || place.place?.id;
    }

    details.value = await getPlaceDetails(id, apiKeyUsed.value);
    console.log('[PlaceRating] getPlaceDetails result for', id, details.value);
    emit('success', details.value);
  } catch (err) {
    error.value = err.message || String(err);
    emit('error', error.value);
  } finally {
    loading.value = false;
  }
}

// Allow parent to call fetchRating via a template ref
defineExpose({ fetchRating });

// Auto-fetch behavior:
// - If inline mode and placeName provided, auto-fetch rating to display compactly.
// - If placeId is provided, auto-fetch on mount.
watch(() => props.placeName, (v) => {
  if (v) {
    localPlaceName.value = v;
    if (props.inline && apiKeyUsed.value) {
      // small delay to ensure component mounted
      Promise.resolve().then(() => fetchRating());
    }
  }
});

if (props.placeId && apiKeyUsed.value) {
  Promise.resolve().then(() => fetchRating());
}

// Ensure inline + initial placeName also triggers a fetch on mount
if (props.inline && props.placeName && apiKeyUsed.value) {
  Promise.resolve().then(() => fetchRating());
}

</script>

<style scoped>
/* Block (full) mode chrome */
.place-rating { border: 1px solid #eee; padding: 12px; border-radius: 8px; background: #fff; }
.place-rating .controls { display:flex; gap:8px; margin-bottom:8px }
.place-rating input { flex:1; padding:8px 10px; border:1px solid #ddd; border-radius:6px }
.place-rating button { padding:8px 12px; border: none; border-radius: 6px; background:#f9afae; color:#fff; font-weight:600; cursor:pointer }
.place-rating button:disabled { opacity: .6; cursor: not-allowed }
.error { color: #b00020 }
.result h3 { margin:0 0 6px 0 }

/* Inline (compact) mode — no chrome, sits nicely inside badges */
.place-rating.is-inline { border: none; padding: 0; display: inline; background: transparent }
.pr-inline { display:inline-flex; align-items:center; gap:6px; font-weight:700; line-height:1; }
.pr-inline .star { color:#f5a623; font-size:1em; line-height:1 }
.pr-inline .num { color:#333; font-weight:700; font-variant-numeric: tabular-nums }
.pr-inline.pr-fallback { color:#666; font-weight:600 }
.pr-inline.pr-error { color:#b00020; font-weight:600 }

/* Tiny loading dots */
.pr-loading .dot { width:5px; height:5px; margin:0 1px; background:#999; border-radius:50%; display:inline-block; animation: pr-blink 1s infinite ease-in-out }
.pr-loading .dot:nth-child(2){ animation-delay: .2s }
.pr-loading .dot:nth-child(3){ animation-delay: .4s }
@keyframes pr-blink { 0%, 80%, 100% { opacity:.2 } 40% { opacity:1 } }
</style>
