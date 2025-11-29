/**
 * 檔案處理工具函數
 * 用於處理檔案上傳、下載、中文檔名編碼等功能
 */

/**
 * 從 UUID_filename 格式中提取原始檔名
 * @param {string} attachmentPath - 格式如 "9794f4d4-6fdb-4087-801b-cc63445c10d8_陳俊諳.pdf"
 * @returns {string} 原始檔名
 */
export function extractOriginalFilename(attachmentPath) {
  if (!attachmentPath) return ''

  const underscoreIdx = attachmentPath.indexOf('_')
  if (underscoreIdx > 0 && underscoreIdx < attachmentPath.length - 1) {
    return attachmentPath.substring(underscoreIdx + 1)
  }

  return attachmentPath
}

/**
 * 從 Content-Disposition header 中提取檔名
 * 支援 filename 和 filename* (RFC 5987) 兩種格式
 * @param {string} contentDisposition - Content-Disposition header 值
 * @returns {string} 檔名
 */
export function parseFilenameFromContentDisposition(contentDisposition) {
  if (!contentDisposition) return null

  // 先嘗試解析 filename*=UTF-8''encoded-name (RFC 5987)
  const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/i)
  if (filenameStarMatch && filenameStarMatch[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1])
    } catch (e) {
      console.warn('Failed to decode filename*:', e)
    }
  }

  // 嘗試解析 filename="name" 或 filename=name
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(?:["']([^"']+)["']|([^;\n]+))/i)
  if (filenameMatch) {
    const filename = filenameMatch[1] || filenameMatch[2]
    try {
      // 嘗試 URL decode，處理可能的編碼
      return decodeURIComponent(filename.trim())
    } catch (e) {
      // 如果 decode 失敗，直接返回原始值
      return filename.trim()
    }
  }

  return null
}

/**
 * 下載檔案
 * @param {string} url - 檔案 URL
 * @param {string} filename - 預設檔名（可選）
 */
export async function downloadFile(url, filename = null) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
    })

    if (!response.ok) {
      throw new Error(`下載失敗: ${response.status} ${response.statusText}`)
    }

    // 嘗試從 Content-Disposition 取得檔名
    const contentDisposition = response.headers.get('Content-Disposition')
    const serverFilename = parseFilenameFromContentDisposition(contentDisposition)

    // 優先使用伺服器提供的檔名，否則使用傳入的檔名
    const finalFilename = serverFilename || filename || 'download'

    // 取得檔案內容
    const blob = await response.blob()

    // 建立下載連結
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = finalFilename

    // 觸發下載
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)

    return true
  } catch (error) {
    console.error('下載檔案失敗:', error)
    throw error
  }
}

/**
 * 取得檔案副檔名
 * @param {string} filename - 檔名
 * @returns {string} 副檔名（小寫）
 */
export function getFileExtension(filename) {
  if (!filename) return ''
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

/**
 * 格式化檔案大小
 * @param {number} bytes - 檔案大小（bytes）
 * @returns {string} 格式化後的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 驗證檔案類型
 * @param {File} file - 檔案物件
 * @param {string[]} allowedTypes - 允許的 MIME types
 * @returns {boolean} 是否為允許的類型
 */
export function validateFileType(file, allowedTypes) {
  if (!file || !allowedTypes || allowedTypes.length === 0) return true
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2)
      return file.type.startsWith(prefix)
    }
    return file.type === type
  })
}

/**
 * 驗證檔案大小
 * @param {File} file - 檔案物件
 * @param {number} maxSizeMB - 最大大小（MB）
 * @returns {boolean} 是否符合大小限制
 */
export function validateFileSize(file, maxSizeMB) {
  if (!file || !maxSizeMB) return true
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

