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
        <span class="star">⭐️</span>
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
        <p v-if="matchMeta?.distanceMeters !== null">距離提供座標：約 {{ matchMeta.distanceMeters }} 公尺（候選 {{ matchMeta.candidates }} 筆）</p>
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
  latitude: { type: Number },  // 機構緯度
  longitude: { type: Number }, // 機構經度
  inline: { type: Boolean, default: false },
  fallbackText: { type: String, default: '無評分' }
});

const emit = defineEmits(['success', 'error']);

const localPlaceName = ref(props.placeName || '');
const loading = ref(false);
const error = ref('');
const details = ref(null);
const matchMeta = ref(null); // track which place was picked

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
  matchMeta.value = null;

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

      // 如果提供了經緯度，使用寬鬆的位置偏好（不是嚴格限制）
      const searchOptions = {};
      if (typeof props.latitude === 'number' && typeof props.longitude === 'number') {
        searchOptions.lat = props.latitude;
        searchOptions.lng = props.longitude;
        searchOptions.radius = 5000; // 擴大到 5 公里範圍
        searchOptions.strict = false; // 使用 locationBias 而非 locationRestriction
      }
      searchOptions.returnAll = true;

      const results = await searchPlaceByText(localPlaceName.value, apiKeyUsed.value, searchOptions);
      const targetCoords = (typeof props.latitude === 'number' && typeof props.longitude === 'number')
        ? { lat: props.latitude, lng: props.longitude }
        : null;
      const best = pickBestPlace(results, targetCoords, localPlaceName.value);
      if (!best) {
        throw new Error('搜尋不到符合的地點');
      }
      const place = best.place;
      matchMeta.value = {
        chosenId: place.id || place.placeId,
        displayName: place.displayName?.text || place.displayName,
        formattedAddress: place.formattedAddress,
        distanceMeters: Number.isFinite(best.dist) ? Math.round(best.dist) : null,
        candidates: results.length
      };
      console.log('[PlaceRating] best match', matchMeta.value, place);
      id = matchMeta.value.chosenId;
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

// Calculates distance in meters between two lat/lng pairs using the haversine formula
function distanceMeters(a, b) {
  if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' || typeof b.lat !== 'number' || typeof b.lng !== 'number') {
    return Number.POSITIVE_INFINITY;
  }
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function pickBestPlace(places, targetCoords, targetName) {
  if (!Array.isArray(places) || !places.length) return null;

  // Score by name similarity + distance when available. Lower score is better.
  const normalizedTarget = targetName?.trim().toLowerCase();

  const candidates = places
    .map((p) => {
      const coord = p.location?.latLng || p.location;
      const dist = targetCoords ? distanceMeters(targetCoords, coord) : Number.POSITIVE_INFINITY;
      const name = p.displayName?.text || p.displayName || '';
      const normalizedName = name.trim().toLowerCase();

      // 更靈活的名稱匹配邏輯
      let namePenalty = 1.0; // 預設完全不匹配
      let matchQuality = 0; // 匹配品質分數（0-1，越高越好）

      if (normalizedTarget && normalizedName) {
        // 完全包含（雙向檢查）
        if (normalizedName.includes(normalizedTarget) || normalizedTarget.includes(normalizedName)) {
          namePenalty = 0;
          matchQuality = 1.0; // 完美匹配
        }
        // 檢查關鍵詞匹配（提取主要名稱部分）
        else {
          const targetWords = normalizedTarget.split(/[\s\-、]+/).filter(w => w.length >= 2);
          const nameWords = normalizedName.split(/[\s\-、]+/).filter(w => w.length >= 2);

          if (targetWords.length > 0) {
            const matchCount = targetWords.filter(tw =>
              nameWords.some(nw => nw.includes(tw) || tw.includes(nw))
            ).length;

            // 計算匹配率
            const matchRatio = matchCount / targetWords.length;

            if (matchCount > 0) {
              namePenalty = 0.3 - (matchCount * 0.1); // 有部分匹配，降低懲罰
              matchQuality = matchRatio; // 匹配品質 = 匹配的關鍵詞比例
            }
          }
        }
      }

      // 降低距離權重，優先考慮名稱匹配
      const score = (Number.isFinite(dist) ? dist * 0.5 : 1_000_000) + namePenalty * 10_000;
      return { place: p, score, dist, matchQuality, normalizedName };
    })
    .sort((a, b) => a.score - b.score);

  const best = candidates[0];

  // 增加匹配品質門檻：如果最佳匹配的品質太低（< 0.3），則拒絕
  // 這可以避免顯示完全不相關的地點評分（例如「東正花藝店」vs「東正社區公共托育家園」）
  if (best.matchQuality < 0.3) {
    console.warn('[PlaceRating] 最佳匹配品質太低，拒絕使用', {
      targetName: targetName,
      foundName: best.normalizedName,
      matchQuality: best.matchQuality
    });
    return null;
  }

  return best;
}
</script>

<style scoped>
/* Block (full) mode chrome */
.place-rating { padding: 8px; border-radius: 8px; background: #fff; }
.place-rating .controls { display:flex; gap:8px; margin-bottom:8px }
.place-rating input { flex:1; padding:8px 10px; border:1px solid #ddd; border-radius:6px }
.place-rating button { padding:8px 12px; border: none; border-radius: 6px; background:#f9afae; color:#fff; font-weight:600; cursor:pointer }
.place-rating button:disabled { opacity: .6; cursor: not-allowed }
.error { color: #b00020 }
.result h3 { margin:0 0 6px 0 }

/* Inline (compact) mode — 柔和圓弧背景，無 border 無漸層 */
.place-rating.is-inline { border: none; padding: 0; display: inline; background: transparent }
.pr-inline {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1;
  padding: 12px 12px;
  background: rgba(111, 227, 159, 0.5);
  border-radius: 50px;


  font-size: 1rem;
}





@keyframes starPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.pr-inline .num {
  color: #047857;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-size: 1.1em;
}

.pr-inline.pr-fallback {
  background: rgba(148, 163, 184, 0.3);
  color: #475569;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.15);
}

.pr-inline.pr-error {
  /* 統一使用灰色，避免讓使用者感到緊張 */
  background: rgba(148, 163, 184, 0.3);
  color: #475569;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.15);
}

/* Tiny loading dots - 適配柔和背景 */
.pr-loading {
  background: rgba(134, 239, 172, 0.3);
  padding: 12px 24px;
}

.pr-loading .dot {
  width: 6px;
  height: 6px;
  margin: 0 2px;
  background: #22c55e;
  border-radius: 50%;
  display: inline-block;
  animation: pr-blink 1s infinite ease-in-out;
}

.pr-loading .dot:nth-child(2){ animation-delay: .2s }
.pr-loading .dot:nth-child(3){ animation-delay: .4s }
@keyframes pr-blink { 0%, 80%, 100% { opacity:.3 } 40% { opacity:1 } }
</style>
