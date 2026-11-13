import { describe, it, expect } from 'vitest'
import { createPostStorage, STORAGE_KEY, defaultStorage } from '../../src/lib/storage'

/** 构造一个可控的内存版 Storage，用于替代真实 Local Storage */
function createFakeStorage(initialEntries = {}) {
  const map = new Map(Object.entries(initialEntries))

  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value))
    },
    removeItem: (key) => {
      map.delete(key)
    },
    dump: () => Object.fromEntries(map),
  }
}

describe('STORAGE_KEY', () => {
  it('沿用旧版 key，保证历史数据可以直接复用', () => {
    expect(STORAGE_KEY).toBe('mini-feed-posts')
  })
})

describe('createPostStorage().read', () => {
  it('存储为空时返回空数组', () => {
    const storage = createPostStorage(createFakeStorage())

    expect(storage.read()).toEqual([])
  })

  it('读取并解析已保存的动态', () => {
    const raw = JSON.stringify([
      { id: 'a-1', content: '第一条', createdAt: 1700000000000 },
      { id: 'b-2', content: '第二条', createdAt: 1700000001000 },
    ])
    const storage = createPostStorage(createFakeStorage({ [STORAGE_KEY]: raw }))

    expect(storage.read()).toEqual([
      { id: 'a-1', content: '第一条', createdAt: 1700000000000 },
      { id: 'b-2', content: '第二条', createdAt: 1700000001000 },
    ])
  })

  it('内容损坏（非法 JSON）时回退为空数组而不抛错', () => {
    const storage = createPostStorage(createFakeStorage({ [STORAGE_KEY]: '{不是 JSON' }))

    expect(storage.read()).toEqual([])
  })

  it('存储结构不是数组时回退为空数组', () => {
    const storage = createPostStorage(createFakeStorage({ [STORAGE_KEY]: '{"content":"x"}' }))

    expect(storage.read()).toEqual([])
  })

  it('过滤掉结构不完整的脏数据', () => {
    const dirty = JSON.stringify([
      null,
      'str',
      { content: '缺少 createdAt' },
      { createdAt: 1700000000000 },
      { id: 'x', content: 42, createdAt: 1700000000000 },
      { id: 'y', content: '   ', createdAt: 1700000000000 },
      { id: 'ok', content: '合法动态', createdAt: 1700000000000 },
    ])
    const storage = createPostStorage(createFakeStorage({ [STORAGE_KEY]: dirty }))

    expect(storage.read()).toEqual([
      { id: 'ok', content: '合法动态', createdAt: 1700000000000 },
    ])
  })

  it('缺少 id 的历史数据会被补齐 id', () => {
    const legacy = JSON.stringify([{ content: '老数据', createdAt: 1700000000000 }])
    const storage = createPostStorage(createFakeStorage({ [STORAGE_KEY]: legacy }))

    const [post] = storage.read()

    expect(typeof post.id).toBe('string')
    expect(post.id.length).toBeGreaterThan(0)
    expect(post.content).toBe('老数据')
  })

  it('读取时遇到异常（如隐私模式）返回空数组', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {},
    }
    const storage = createPostStorage(throwingStorage)

    expect(storage.read()).toEqual([])
  })
})

describe('createPostStorage().write', () => {
  it('写入成功返回 true，并能被 read 读回', () => {
    const fake = createFakeStorage()
    const storage = createPostStorage(fake)
    const posts = [{ id: 'a-1', content: '你好', createdAt: 1700000000000 }]

    expect(storage.write(posts)).toBe(true)
    expect(JSON.parse(fake.dump()[STORAGE_KEY])).toEqual(posts)
    expect(storage.read()).toEqual(posts)
  })

  it('存储不可用时返回 false，且不向调用方抛错', () => {
    const throwingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const storage = createPostStorage(throwingStorage)

    expect(() => storage.write([{ id: 'a', content: 'x', createdAt: 1 }])).not.toThrow()
    expect(storage.write([{ id: 'a', content: 'x', createdAt: 1 }])).toBe(false)
  })

  it('storage 参数缺省时使用全局 localStorage', () => {
    localStorage.removeItem(STORAGE_KEY)
    const storage = createPostStorage()
    const posts = [{ id: 'g-1', content: '全局存储', createdAt: 1700000000000 }]

    expect(storage.write(posts)).toBe(true)
    expect(storage.read()).toEqual(posts)
  })
})

describe('defaultStorage', () => {
  it('返回浏览器 localStorage（不可用时返回 null）', () => {
    expect(defaultStorage()).toBe(localStorage)
  })
})
