/**
 * 时间格式化工具
 */

function isValidTimestamp(timestamp) {
  return typeof timestamp === 'number' && Number.isFinite(timestamp)
}

/**
 * 格式化为「YYYY年M月D日 HH:mm」，与旧版原生实现保持一致。
 * @param {number} timestamp
 * @returns {string} 非法时间戳返回空字符串
 */
export function formatDisplayTime(timestamp) {
  if (!isValidTimestamp(timestamp)) return ''

  const date = new Date(timestamp)
  const pad = (value) => String(value).padStart(2, '0')

  return (
    `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

/**
 * 转换为 `<time datetime="...">` 所需的 ISO 字符串。
 * @param {number} timestamp
 * @returns {string}
 */
export function toDateTimeAttr(timestamp) {
  if (!isValidTimestamp(timestamp)) return ''

  return new Date(timestamp).toISOString()
}
