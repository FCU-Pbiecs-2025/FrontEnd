// filepath: c:\Users\陳俊諳\Desktop\FrontEnd\childcare\src\api\revokes.js
import http from './http'

// 將後端 DTO 轉成前端畫面所需的欄位
function mapDtoToItem(dto) {
  // 支援後端回傳欄位：
  // { cancellationID, cancellationDate, userID, userName, institutionID, institutionName, abandonReason, nationalID }
  const d = dto?.cancellationDate ? new Date(dto.cancellationDate) : null
  const yyyy = d ? d.getFullYear() : ''
  const mm = d ? String(d.getMonth() + 1).padStart(2, '0') : ''
  const dd = d ? String(d.getDate()).padStart(2, '0') : ''
  return {
    id: dto.cancellationID || dto.applicationID || '',
    Date: d ? `${yyyy}/${mm}/${dd}` : '', // 申請日期
    applicant: dto.userName || '未提供',   // 申請人
    institution: dto.institutionName || '未提供', // 機構
    reason: dto.abandonReason || '',       // 撤銷原因（新欄位）
    status: dto.abandonReason || dto.status || '', // 舊欄位維持相容
    nationalID: dto.nationalID || '',
    type: ''
  }
}

// 取得撤銷申請清單（分頁）- 參數 page 為 0-based
export async function fetchRevokedApplications(page = 0, size = 10) {
  const offset = page * size
  const res = await http.get('/revoke/applications', { params: { offset, size } })
  const data = res?.data || {}
  const content = Array.isArray(data.content) ? data.content : []
  const items = content.map(mapDtoToItem)
  return {
    items,
    totalPages: Number(data.totalPages) || 1,
    totalElements: Number(data.totalElements) || items.length,
    hasNext: Boolean(data.hasNext),
    size: Number(data.size) || size,
    offset: Number(data.offset) || offset
  }
}

// 新增：搜尋撤銷申請（server-side 分頁）
export async function searchRevokedApplications(cancellationID = '', nationalID = '', page = 0, size = 10) {
  const offset = page * size
  const params = { offset, size }
  if (cancellationID) params.cancellationID = cancellationID
  if (nationalID) params.nationalID = nationalID
  const res = await http.get('/revoke/applications/search', { params })
  const data = res?.data || {}
  const content = Array.isArray(data.content) ? data.content : []
  const items = content.map(mapDtoToItem)
  return {
    items,
    totalPages: Number(data.totalPages) || 1,
    totalElements: Number(data.totalElements) || items.length,
    hasNext: Boolean(data.hasNext),
    size: Number(data.size) || size,
    offset: Number(data.offset) || offset
  }
}

// 取得撤銷申請詳細資料（包含家長與幼兒資料）
export async function fetchRevokeDetails(cancellationID, nationalID) {
  if (!cancellationID) return null
  if (!nationalID) {
    console.warn('nationalID 缺失，無法呼叫 /revoke/details')
    return null
  }
  try {
    console.log('Fetching revoke details for ID:', cancellationID, 'nationalID:', nationalID)
    const body = { cancellationID, nationalID }
    const res = await http.post('/revoke/details', body)

    console.log('Raw API response:', res?.data)
    const data = res?.data || null
    if (!data) {
      console.log('No data returned from API')
      return null
    }

    // 處理撤銷基本資訊（後端欄位：cancellationID, cancellationDate, userName, institutionName, abandonReason, nationalID）
    const revokeInfo = data.revokeInfo || {}
    console.log('Raw revokeInfo:', revokeInfo)

    const mappedRevokeInfo = {
      id: revokeInfo.cancellationID || '',
      Date: revokeInfo.cancellationDate ? formatDate(revokeInfo.cancellationDate) : '',
      applicant: revokeInfo.userName || '未提供',
      institution: revokeInfo.institutionName || '未提供',
      reason: revokeInfo.abandonReason || '',
      nationalID: revokeInfo.nationalID || ''
    }
    console.log('Mapped revokeInfo:', mappedRevokeInfo)

    // 處理家長資料
    const parents = (data.parents || []).map((parent, index) => {
      console.log(`Raw parent ${index}:`, parent)
      const mappedParent = {
        id: parent.nationalID || '',
        name: parent.name || '',
        gender: parent.gender || '',
        relation: parent.relationShip || '',
        job: parent.occupation || '',
        phone: parent.phoneNumber || '',
        householdAddr: parent.householdAddress || '',
        contactAddr: parent.mailingAddress || '',
        email: parent.email || '',
        birth: parent.birthDate ? formatDate(parent.birthDate) : '',
        suspend: parent.isSuspended ? '是' : '否',
        suspendEnd: parent.suspendEnd ? formatDate(parent.suspendEnd) : '',
        participantType: parent.participantType === '1' ? '家長' : parent.participantType || ''
      }
      console.log(`Mapped parent ${index}:`, mappedParent)
      return mappedParent
    })

    // 處理幼兒資料
    const child = data.child || {}
    console.log('Raw child:', child)

    const mappedChild = {
      id: child.nationalID || '',
      name: child.name || '',
      gender: child.gender || '',
      birth: child.birthDate ? formatDate(child.birthDate) : '',
      householdAddr: child.householdAddress || '',
      contactAddr: child.mailingAddress || '',
      age: '' // 由前端計算
    }
    console.log('Mapped child:', mappedChild)

    const result = {
      revokeInfo: mappedRevokeInfo,
      parents,
      child: mappedChild
    }
    console.log('Final mapped result:', result)
    return result

  } catch (e) {
    console.error('取得撤銷申請詳細資料失敗:', e)
    console.error('Error details:', {
      message: e.message,
      stack: e.stack,
      cancellationID,
      nationalID
    })
    return null
  }
}

// 輔助函數：格式化日期
function formatDate(dateString) {
  if (!dateString) {
    console.log('Empty date string provided')
    return ''
  }

  console.log('Formatting date:', dateString)

  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) {
      console.log('Invalid date string:', dateString)
      return dateString // 返回原始字串
    }

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const formatted = `${yyyy}/${mm}/${dd}`

    console.log('Formatted date result:', formatted)
    return formatted
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString // 返回原始字串
  }
}
