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

    return http.get(`/users/check-account/${account}`);
}

// 檢查電子信箱是否已存在
export function checkEmailExists(email) {

    return http.get(`/users/check-email/${email}`);
}
