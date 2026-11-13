/**
 * 动态 ID 生成：36 进制时间戳 + 6 位后缀（3 位随机 + 3 位自增序号）
 * 自增序号保证同一毫秒内连续生成也不会重复。
 */

let sequence = 0

export function createPostId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 5).padEnd(3, '0')
  const counter = (sequence++ % 46656).toString(36).padStart(3, '0')

  return `${timestamp}-${random}${counter}`
}
