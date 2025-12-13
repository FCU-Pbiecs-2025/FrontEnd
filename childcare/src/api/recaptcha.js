// Google reCAPTCHA 整合模組 (原生實作)
class ReCaptchaService {
  constructor() {
    // 從環境變數讀取 Site Key
    this.siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    this.isLoaded = false
  }

  // 載入 reCAPTCHA v3 腳本
  load() {
    return new Promise((resolve, reject) => {
      if (this.isLoaded || window.grecaptcha) {
        resolve()
        return
      }

      if (!this.siteKey) {
        reject(new Error('reCAPTCHA Site Key not found in environment variables'))
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`
      script.async = true
      script.defer = true

      script.onload = () => {
        this.isLoaded = true
        // 等待 grecaptcha.ready
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            resolve()
          })
        } else {
          // 如果 ready 還沒準備好，稍微等一下
          setTimeout(() => resolve(), 500)
        }
      }

      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'))
      }

      document.head.appendChild(script)
    })
  }

  // 執行 reCAPTCHA v3 驗證
  execute(action = 'submit') {
    return new Promise(async (resolve, reject) => {
      try {
        await this.load()

        if (!window.grecaptcha || !window.grecaptcha.execute) {
          reject(new Error('reCAPTCHA v3 not loaded'))
          return
        }

        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(this.siteKey, { action: action })
            .then((token) => {
              resolve(token)
            })
            .catch((error) => {
              reject(error)
            })
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

// v2 相關：載入與渲染
let v2ScriptLoaded = false
const loadReCaptchaV2Script = (siteKeyV2) => {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      resolve()
      return
    }
    if (v2ScriptLoaded) {
      // 已嘗試載入，稍等 ready
      const tryReady = () => {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          resolve()
        } else {
          setTimeout(tryReady, 200)
        }
      }
      tryReady()
      return
    }
    if (!siteKeyV2) {
      reject(new Error('reCAPTCHA v2 Site Key not found (VITE_RECAPTCHA_V2_SITE_KEY)'))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit'
    script.async = true
    script.defer = true
    v2ScriptLoaded = true

    // 建立全域 onload callback 以符合 v2 需求
    window.onloadCallback = () => {
      resolve()
    }

    script.onerror = () => reject(new Error('Failed to load reCAPTCHA v2 script'))
    document.head.appendChild(script)
  })
}

// 渲染 v2 widget 並返回 widgetId
export const renderReCaptchaV2 = async (containerId, onSuccess, theme = 'light', size = 'normal') => {
  const siteKeyV2 = import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || import.meta.env.VITE_RECAPTCHA_SITE_KEY // 允許共用同一 key
  await loadReCaptchaV2Script(siteKeyV2)
  return new Promise((resolve, reject) => {
    try {
      const widgetId = window.grecaptcha.render(containerId, {
        sitekey: siteKeyV2,
        theme,
        size,
        callback: (token) => {
          try { onSuccess && onSuccess(token) } catch (e) { /* ignore */ }
        }
      })
      resolve(widgetId)
    } catch (e) {
      reject(e)
    }
  })
}

// 重置 v2 widget
export const resetReCaptchaV2 = (widgetId) => {
  try {
    if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
      window.grecaptcha.reset(widgetId)
    }
  } catch (e) {
    // ignore
  }
}

// v3 代理：提供 ForgotPassword.vue 匯入的函式
export const executeReCaptchaV3 = async (action = 'submit') => {
  return await new ReCaptchaService().execute(action)
}

export default new ReCaptchaService()
