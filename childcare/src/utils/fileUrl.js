/**
 * Utilities for turning backend-returned file paths into safe, browser-loadable URLs.
 *
 * Handles:
 * - Windows absolute paths (e.g. C:\...\IdentityResource\{appId}\file.png)
 * - Windows backslashes
 * - Spaces + Chinese filenames (URI encoding)
 * - Already-absolute URLs
 *
 * The backend is expected to expose files under:
 *   http(s)://{backendOrigin}/identity-files/{applicationId}/{fileName}
 * or sometimes return relative URLs that already begin with /identity-files/...
 */

export const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8080'

const isAbsoluteHttpUrl = (s) => /^https?:\/\//i.test(s || '')

/**
 * 對路徑的每個段落進行 URL 編碼，但保留斜線
 * 例如：a b/c d.png -> a%20b/c%20d.png
 */
const encodePathPreservingSlashes = (path) => {
  return String(path)
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/')
}

/**
 * 將後端返回的路徑標準化為可在瀏覽器中使用的 URL
 *
 * @param {string} rawPath - 後端返回的路徑或 URL
 * @param {object} [opts] - 選項
 * @param {string} [opts.backendOrigin] - 後端來源，默認為 http://localhost:8080
 * @returns {string} 標準化的 URL
 *
 * @example
 * // Windows 絕對路徑
 * buildIdentityFileUrl('C:\\Users\\...\\IdentityResource\\{appId}\\file.png')
 * // => 'http://localhost:8080/identity-files/{appId}/file.png'
 *
 * // 相對路徑
 * buildIdentityFileUrl('{appId}/file.png')
 * // => 'http://localhost:8080/identity-files/{appId}/file.png'
 *
 * // 已經是完整 URL
 * buildIdentityFileUrl('http://example.com/file.png')
 * // => 'http://example.com/file.png'
 */
export const buildIdentityFileUrl = (rawPath, opts = {}) => {
  const backendOrigin = opts.backendOrigin || DEFAULT_BACKEND_ORIGIN
  if (!rawPath) return ''

  const trimmed = String(rawPath).trim()
  if (!trimmed) return ''

  // 1) 已經是完整的 HTTP(S) URL
  if (isAbsoluteHttpUrl(trimmed)) return trimmed

  // 2) 將 Windows 反斜線轉換為正斜線
  const slashed = trimmed.replace(/\\/g, '/')

  // 3) 如果後端已經返回暴露路徑 /identity-files/...
  if (slashed.startsWith('/identity-files/')) {
    return `${backendOrigin}${encodePathPreservingSlashes(slashed)}`
  }

  // 4) 如果是其他以 / 開頭的路徑，直接拼接到後端來源
  if (slashed.startsWith('/')) {
    return `${backendOrigin}${encodePathPreservingSlashes(slashed)}`
  }

  // 5) 如果後端返回 Windows 絕對路徑，包含 IdentityResource
  // 例如：C:/Users/.../IdentityResource/{applicationId}/{fileName}
  // 我們需要提取 {applicationId}/{fileName} 部分
  const marker = '/identityresource/'
  const lower = slashed.toLowerCase()
  const idx = lower.indexOf(marker)
  if (idx !== -1) {
    const tail = slashed.slice(idx + marker.length) // 提取 {applicationId}/{fileName}
    return `${backendOrigin}/identity-files/${encodePathPreservingSlashes(tail)}`
  }

  // 6) 其他情況：假設是相對路徑（{applicationId}/{fileName} 或單純檔名）
  return `${backendOrigin}/identity-files/${encodePathPreservingSlashes(slashed)}`
}

/**
 * 為 URL 添加緩存破壞參數，用於強制重新載入圖片
 */
export const withCacheBust = (url, version = Date.now()) => {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(version)}`
}

