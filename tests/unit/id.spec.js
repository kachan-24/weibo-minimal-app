import { describe, it, expect } from 'vitest'
import { createPostId } from '../../src/lib/id'

describe('createPostId', () => {
  it('由 36 进制时间戳与 6 位随机后缀组成', () => {
    expect(createPostId()).toMatch(/^[0-9a-z]+-[0-9a-z]{6}$/)
  })

  it('同一毫秒内连续生成也不会重复', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createPostId()))

    expect(ids.size).toBe(500)
  })
})
