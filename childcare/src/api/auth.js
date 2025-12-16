import http from "./http.js";
import { mockAuth } from "./mockAuth.js";

// 開發環境使用模擬 API，生產環境使用真實 API
const USE_MOCK_API = false; // 設為 false 時使用真實後端 API（包含 SMTP）
const SMTP_SERVER_URL = 'http://localhost:3001'; // SMTP 服務器地址

export function login(account, password, captcha) {
    if (USE_MOCK_API) {
        return mockAuth.login(account, password, captcha);
    }
    return http.post("/auth/login", { account, password, captcha });
}

export function logout() {
    if (USE_MOCK_API) {
        return mockAuth.logout();
    }

    // 清除 localStorage 中的 token
    try {
        localStorage.removeItem('token');
        console.log('JWT Token 已清除');
    } catch (error) {
        console.error('清除 token 失敗:', error);
    }

    return http.post("/auth/logout");
}

export function getUserInfo() {
    if (USE_MOCK_API) {
        // Disabled: don't read token from localStorage in mock mode
        return mockAuth.getUserInfo(/* no token */)
    }
    return http.get("/auth/me")
}

export function forgotPassword(email, recaptchaToken = null) {
    if (USE_MOCK_API) {
        return mockAuth.forgotPassword(email, recaptchaToken);
    }
    // 真實的 SMTP 服務${SMTP_SERVER_URL}替換http://localhost:8080
    return fetch(`http://localhost:8080/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, recaptchaToken })
    }).then(response => response.json());
}

export function resetPassword(email, resetToken, newPassword) {
    if (USE_MOCK_API) {
        return mockAuth.resetPassword(email, resetToken, newPassword);
    }
    // 真實的 SMTP 服務${SMTP_SERVER_URL}替換http://localhost:8080
    return fetch(`http://localhost:8080/api/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Server expects field name 'token'
        body: JSON.stringify({ email, token: resetToken, newPassword })
    }).then(response => response.json());
}

export function verifyResetToken(email, resetToken) {
    if (USE_MOCK_API) {
        return mockAuth.verifyResetToken(email, resetToken);
    }
    // http://localhost:8080之後替換掉為真實的 SMTP 服務
    return fetch(`http://localhost:8080/api/auth/verify-reset-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token: resetToken })
    }).then(response => response.json());
}

// 更新個人資料
export function updateUserProfile(profileData) {
    if (USE_MOCK_API) {
        return mockAuth.updateUserProfile(profileData);
    }
    return http.put("/auth/profile", profileData);
}

// 獲取個人資料
export function getUserProfile() {
    if (USE_MOCK_API) {
        return mockAuth.getUserProfile();
    }
    return http.get("/auth/profile");
}

// 修改密碼
export function changePassword(account, oldPassword, newPassword) {
    if (USE_MOCK_API) {
        return mockAuth.changePassword(account, oldPassword, newPassword);
    }
    return http.post("/auth/change-password", { account, oldPassword, newPassword });
}

// 登入 API
export const loginUser = async (account, password, recaptchaToken) => {
    try {
        const response = await fetch('http://localhost:8080/Login/Verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account, password, recaptchaToken }),
        });
        const result = await response.json()

        // 如果登入成功且有 token，儲存到 localStorage
        if (result.success && result.token) {
            localStorage.setItem('token', result.token)
            console.log('JWT Token 已儲存')
        }

        return result
    } catch (error) {
        console.error('登入失敗:', error)
        return { success: false, message: '伺服器連線失敗' }
    }
}

// 登入 API
export const loginadmin = async (account, password) => {
    try {
        const response = await fetch('http://localhost:8080/Login/Verify2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ account, password })
        })
        const result = await response.json()

        // 如果登入成功且有 token，儲存到 localStorage
        if (result.success && result.token) {
            localStorage.setItem('token', result.token)
            console.log('JWT Token 已儲存')
        }

        return result
    } catch (error) {
        console.error('登入失敗:', error)
        return { success: false, message: '伺服器連線失敗' }
    }
}

// Token 管理工具函數
export const getToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('讀取 token 失敗:', error);
        return null;
    }
}

export const setToken = (token) => {
    try {
        localStorage.setItem('token', token);
        console.log('JWT Token 已設定');
    } catch (error) {
        console.error('設定 token 失敗:', error);
    }
}

export const removeToken = () => {
    try {
        localStorage.removeItem('token');
        console.log('JWT Token 已移除');
    } catch (error) {
        console.error('移除 token 失敗:', error);
    }
}

// 檢查 token 是否存在
export const hasToken = () => {
    return !!getToken();
}

