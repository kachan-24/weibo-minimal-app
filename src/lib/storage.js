/**
 * Local Storage 持久化适配层
 * 负责数据的序列化、脏数据清洗以及存储不可用时的降级。
 */
import { createPostId } from './id'
import { STORAGE_KEY } from './constants'

// 沿用旧版 key，保证历史数据可以直接复用
export { STORAGE_KEY }

/**
 * 获取全局 localStorage；在隐私模式等场景下访问本身可能抛错。
 * @returns {Storage | null}
 */
export function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/**
 * 将任意数据规整为合法的动态对象，非法返回 null。
 * @param {unknown} post
 * @returns {{ id: string, content: string, createdAt: number } | null}
 */
function normalizePost(post) {
  if (!post || typeof post !== 'object') return null

  const { id, content, createdAt } = post

  if (typeof content !== 'string' || content.trim() === '') return null
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null

  return {
    id: typeof id === 'string' && id !== '' ? id : createPostId(),
    content,
    createdAt,
  }
}

/**
 * 创建存储适配器
 * @param {Storage | (() => Storage | null)} [storageOrGetter] 存储实现，缺省使用 localStorage
 */
export function createPostStorage(storageOrGetter = defaultStorage) {
  const resolve = () =>
    typeof storageOrGetter === 'function' ? storageOrGetter() : storageOrGetter

  return {
    /** @returns {Array<{id: string, content: string, createdAt: number}>} */
    read() {
      try {
        const storage = resolve()
        if (!storage) return []

        const raw = storage.getItem(STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []

        return parsed.map(normalizePost).filter(Boolean)
      } catch {
        // 存储损坏或不可访问时回退为空列表
        return []
      }
    },

    /**
     * @param {Array<{id: string, content: string, createdAt: number}>} posts
     * @returns {boolean} 是否成功持久化
     */
    write(posts) {
      try {
        const storage = resolve()
        if (!storage) return false

        storage.setItem(STORAGE_KEY, JSON.stringify(posts))
        return true
      } catch {
        return false
      }
    },
  }
}

/** 面向应用的单例（每次读写时惰性解析 localStorage） */
export const postStorage = createPostStorage()
