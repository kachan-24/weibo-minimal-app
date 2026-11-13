import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePostsStore } from '../../src/stores/posts'
import { STORAGE_KEY } from '../../src/lib/storage'
import { MAX_CONTENT_LENGTH } from '../../src/lib/constants'

const OLD_POSTS = [
  { id: 'p1', content: '较早的动态', createdAt: 1700000000000 },
  { id: 'p3', content: '最新的动态', createdAt: 1700000003000 },
  { id: 'p2', content: '中间的动态', createdAt: 1700000001000 },
]

function seedStorage(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function readStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePostsStore 初始状态', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('初始时列表为空且未加载', () => {
    const store = usePostsStore()

    expect(store.posts).toEqual([])
    expect(store.isLoaded).toBe(false)
    expect(store.isEmpty).toBe(true)
    expect(store.errorMessage).toBe('')
  })
})

describe('usePostsStore.load', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('从 Local Storage 载入历史动态并标记为已加载', () => {
    seedStorage(OLD_POSTS)

    const store = usePostsStore()
    store.load()

    expect(store.isLoaded).toBe(true)
    expect(store.posts).toHaveLength(3)
    expect(store.isEmpty).toBe(false)
  })

  it('存储损坏时不抛错并回退为空列表', () => {
    localStorage.setItem(STORAGE_KEY, '{损坏的数据')

    const store = usePostsStore()

    expect(() => store.load()).not.toThrow()
    expect(store.posts).toEqual([])
    expect(store.isLoaded).toBe(true)
  })

  it('重复调用不会重复堆叠数据', () => {
    seedStorage(OLD_POSTS)
    const store = usePostsStore()

    store.load()
    store.load()

    expect(store.posts).toHaveLength(3)
  })
})

describe('usePostsStore.sortedPosts', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('按创建时间倒序排列', () => {
    seedStorage(OLD_POSTS)
    const store = usePostsStore()
    store.load()

    expect(store.sortedPosts.map((post) => post.id)).toEqual(['p3', 'p2', 'p1'])
  })

  it('不会改变原始 posts 数组的顺序（纯计算属性）', () => {
    seedStorage(OLD_POSTS)
    const store = usePostsStore()
    store.load()

    store.sortedPosts

    expect(store.posts.map((post) => post.id)).toEqual(['p1', 'p3', 'p2'])
  })
})

describe('usePostsStore.addPost', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('发布成功返回 true，写入列表并持久化', () => {
    const store = usePostsStore()
    store.load()

    const accepted = store.addPost('今天天气不错')

    expect(accepted).toBe(true)
    expect(store.posts).toHaveLength(1)
    expect(store.posts[0].content).toBe('今天天气不错')
    expect(store.posts[0].id).toEqual(expect.any(String))
    expect(store.posts[0].createdAt).toEqual(expect.any(Number))
    expect(readStorage()).toHaveLength(1)
    expect(store.errorMessage).toBe('')
  })

  it('自动去除首尾空白', () => {
    const store = usePostsStore()
    store.load()

    store.addPost('  首尾都有空格  ')

    expect(store.posts[0].content).toBe('首尾都有空格')
  })

  it('空白内容被拒绝，且不写入存储', () => {
    const store = usePostsStore()
    store.load()

    expect(store.addPost('')).toBe(false)
    expect(store.addPost('   \n\t ')).toBe(false)
    expect(store.addPost(null)).toBe(false)
    expect(store.posts).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('超过长度上限的内容被拒绝', () => {
    const store = usePostsStore()
    store.load()
    const tooLong = 'a'.repeat(MAX_CONTENT_LENGTH + 1)

    expect(store.addPost(tooLong)).toBe(false)
    expect(store.posts).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('恰好达到长度上限的内容可以发布', () => {
    const store = usePostsStore()
    store.load()

    expect(store.addPost('a'.repeat(MAX_CONTENT_LENGTH))).toBe(true)
    expect(store.posts[0].content).toHaveLength(MAX_CONTENT_LENGTH)
  })

  it('新发布的动态排在列表首位', () => {
    seedStorage(OLD_POSTS)
    const store = usePostsStore()
    store.load()

    store.addPost('刚发布的一条')

    expect(store.sortedPosts[0].content).toBe('刚发布的一条')
    expect(store.sortedPosts).toHaveLength(4)
  })

  it('存储不可用时降级为仅内存展示，并给出提示', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    })
    const store = usePostsStore()
    store.load()

    const accepted = store.addPost('写不进去也要显示')

    expect(accepted).toBe(true)
    expect(store.posts).toHaveLength(1)
    expect(store.posts[0].content).toBe('写不进去也要显示')
    expect(store.errorMessage).toContain('存储不可用')

    vi.unstubAllGlobals()
  })

  it('clearError 清空提示信息', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    })
    const store = usePostsStore()
    store.load()

    store.addPost('触发一次写入失败')
    expect(store.errorMessage).not.toBe('')

    store.clearError()

    expect(store.errorMessage).toBe('')
    vi.unstubAllGlobals()
  })
})
