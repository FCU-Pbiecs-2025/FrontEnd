import http from "./http.js";
import { mockAuth } from "./mockAuth.js";

// 開發環境使用模擬 API，生產環境使用真實 API
const USE_MOCK_API = true; // 設為 true 時使用模擬 API 進行測試

export function register(userData) {
    if (USE_MOCK_API) {
        return mockAuth.register(userData);
    }
    return http.post("/auth/register", userData);
}

// 檢查帳號是否已存在
export function checkAccountExists(account) {
    if (USE_MOCK_API) {
        return mockAuth.checkAccountExists(account);
    }
    return http.get(`/auth/check-account/${account}`);
}

// 檢查電子信箱是否已存在
export function checkEmailExists(email) {
    if (USE_MOCK_API) {
        return mockAuth.checkEmailExists(email);
    }
    return http.get(`/auth/check-email/${email}`);
}
