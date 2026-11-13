import { describe, it, expect } from 'vitest'
import { formatDisplayTime, toDateTimeAttr } from '../../src/lib/time'

describe('formatDisplayTime', () => {
  it('输出「YYYY年M月D日 HH:mm」的中文格式', () => {
    const timestamp = new Date(2024, 2, 5, 9, 7).getTime()

    expect(formatDisplayTime(timestamp)).toBe('2024年3月5日 09:07')
  })

  it('小时与分钟补零，月份与日期不补零', () => {
    const timestamp = new Date(2025, 0, 1, 0, 0).getTime()

    expect(formatDisplayTime(timestamp)).toBe('2025年1月1日 00:00')
  })

  it('非法时间戳返回空字符串，而不是 Invalid Date', () => {
    expect(formatDisplayTime(Number.NaN)).toBe('')
    expect(formatDisplayTime('不是时间')).toBe('')
    expect(formatDisplayTime(null)).toBe('')
  })
})

describe('toDateTimeAttr', () => {
  it('返回可直接用于 <time datetime> 的 ISO 字符串', () => {
    const timestamp = Date.UTC(2024, 2, 5, 1, 7)

    expect(toDateTimeAttr(timestamp)).toBe('2024-03-05T01:07:00.000Z')
  })

  it('非法时间戳返回空字符串', () => {
    expect(toDateTimeAttr(undefined)).toBe('')
    expect(toDateTimeAttr(Number.NaN)).toBe('')
  })
})
