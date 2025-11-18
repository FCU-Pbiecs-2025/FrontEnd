import http from "./http.js";
import { mockAuth } from "./mockAuth.js";

// 開發環境使用模擬 API，生產環境使用真實 API
const USE_MOCK_API = false; // 設為 false 時使用真實後端 API

export function register(userData) {
    if (USE_MOCK_API) {
        return mockAuth.register(userData);
    }
    return http.post("/users/new-member", userData);
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
