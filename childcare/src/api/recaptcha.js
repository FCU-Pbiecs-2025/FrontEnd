// Google reCAPTCHA v2/v3 整合模組
class ReCaptchaService {
  constructor() {
    // 從環境變數或配置文件讀取
    this.siteKeyV2 = import.meta.env.VITE_RECAPTCHA_SITE_KEY_V2 || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // 測試用 key
    this.siteKeyV3 = import.meta.env.VITE_RECAPTCHA_SITE_KEY_V3 || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // 測試用 key
    this.secretKeyV2 = import.meta.env.VITE_RECAPTCHA_SECRET_KEY_V2
    this.secretKeyV3 = import.meta.env.VITE_RECAPTCHA_SECRET_KEY_V3
    this.isV2Loaded = false
    this.isV3Loaded = false
    this.v2Callback = null
    this.v3Callback = null
  }

  // 載入 reCAPTCHA v2 腳本
  loadReCaptchaV2() {
    return new Promise((resolve, reject) => {
      if (this.isV2Loaded || window.grecaptcha) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?onload=onReCaptchaV2Load&render=explicit`
      script.async = true
      script.defer = true

      // 設定全域回調函數
      window.onReCaptchaV2Load = () => {
        this.isV2Loaded = true
        resolve()
      }

      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA v2 script'))
      }

      document.head.appendChild(script)
    })
  }

  // 載入 reCAPTCHA v3 腳本
  loadReCaptchaV3() {
    return new Promise((resolve, reject) => {
      if (this.isV3Loaded) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKeyV3}`
      script.async = true
      script.defer = true

      script.onload = () => {
        this.isV3Loaded = true
        // 等待 grecaptcha.ready
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            resolve()
          })
        } else {
          setTimeout(() => resolve(), 1000)
        }
      }

      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA v3 script'))
      }

      document.head.appendChild(script)
    })
  }

  // 渲染 reCAPTCHA v2 widget
  renderV2(containerId, callback, theme = 'light', size = 'normal') {
    return new Promise(async (resolve, reject) => {
      try {
        await this.loadReCaptchaV2()

        if (!window.grecaptcha || !window.grecaptcha.render) {
          reject(new Error('reCAPTCHA v2 not loaded'))
          return
        }

        const widgetId = window.grecaptcha.render(containerId, {
          sitekey: this.siteKeyV2,
          callback: (token) => {
            if (callback) callback(token)
          },
          'expired-callback': () => {
            console.log('reCAPTCHA v2 expired')
          },
          'error-callback': () => {
            console.error('reCAPTCHA v2 error')
          },
          theme: theme, // light 或 dark
          size: size  // normal, compact, invisible
        })

        resolve(widgetId)
      } catch (error) {
        reject(error)
      }
    })
  }

  // 執行 reCAPTCHA v3 驗證
  executeV3(action = 'submit') {
    return new Promise(async (resolve, reject) => {
      try {
        await this.loadReCaptchaV3()

        if (!window.grecaptcha || !window.grecaptcha.execute) {
          reject(new Error('reCAPTCHA v3 not loaded'))
          return
        }

        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(this.siteKeyV3, { action: action })
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

  // 重置 reCAPTCHA v2
  resetV2(widgetId) {
    if (window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset(widgetId)
    }
  }

  // 取得 reCAPTCHA v2 回應
  getV2Response(widgetId) {
    if (window.grecaptcha && window.grecaptcha.getResponse) {
      return window.grecaptcha.getResponse(widgetId)
    }
    return null
  }

  // 後端驗證 reCAPTCHA token
  async verifyToken(token, version = 'v2') {
    const secretKey = version === 'v3' ? this.secretKeyV3 : this.secretKeyV2

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('reCAPTCHA verification error:', error)
      return { success: false, error: error.message }
    }
  }

  // 清理資源
  cleanup() {
    // 移除載入的腳本（如果需要）
    const scripts = document.querySelectorAll('script[src*="recaptcha"]')
    scripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    })

    this.isV2Loaded = false
    this.isV3Loaded = false

    // 清理全域變數
    if (window.grecaptcha) {
      delete window.grecaptcha
    }
    if (window.onReCaptchaV2Load) {
      delete window.onReCaptchaV2Load
    }
  }
}

// 建立單例實例
export const reCaptchaService = new ReCaptchaService()

// 匯出便捷函數
export const loadReCaptchaV2 = () => reCaptchaService.loadReCaptchaV2()
export const loadReCaptchaV3 = () => reCaptchaService.loadReCaptchaV3()
export const renderReCaptchaV2 = (containerId, callback, theme, size) =>
  reCaptchaService.renderV2(containerId, callback, theme, size)
export const executeReCaptchaV3 = (action) => reCaptchaService.executeV3(action)
export const resetReCaptchaV2 = (widgetId) => reCaptchaService.resetV2(widgetId)
export const getReCaptchaV2Response = (widgetId) => reCaptchaService.getV2Response(widgetId)
export const verifyReCaptchaToken = (token, version) => reCaptchaService.verifyToken(token, version)
