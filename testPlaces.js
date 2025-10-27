// 若未設 "type": "module"，可用下行兼容載入 node-fetch
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const API_KEY = "AIzaSyCnYXwrH4Mf1Jt7y5aeOENCTQ9Yp47QSoo"; // ← 換成你的金鑰
const placeName = "國立自然科學博物館 台中";

async function assertOk(res) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
    }
}

async function getPlaceId() {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const body = {
        textQuery: placeName
        // 先移除 locationBias，避免影響；等能通再加
    };

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress"
        },
        body: JSON.stringify(body)
    });

    await assertOk(res);
    const data = await res.json();
    console.log("Raw places response:", JSON.stringify(data, null, 2));

    if (!data.places || !data.places.length) {
        throw new Error("找不到這個地點，請確認名稱或金鑰限制設置");
    }
    const place = data.places[0];
    console.log("✅ 找到地點：", place.displayName.text, "→", place.id);
    return place.id;
}

async function getRating(placeId) {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": "rating,userRatingCount,displayName,googleMapsUri"
        }
    });
    await assertOk(res);
    const data = await res.json();
    console.log("🏆 評分結果：", JSON.stringify(data, null, 2));
}

(async () => {
    try {
        const placeId = await getPlaceId();
        await getRating(placeId);
    } catch (err) {
        console.error("❌ 錯誤：", err.message);
    }
})();
