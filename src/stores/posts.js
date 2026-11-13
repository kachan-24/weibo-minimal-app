import { defineStore } from 'pinia'
import { postStorage } from '../lib/storage'
import { createPostId } from '../lib/id'
import { MAX_CONTENT_LENGTH } from '../lib/constants'

/** 存储不可用时的提示文案（仅内存降级） */
export const STORAGE_UNAVAILABLE_MESSAGE =
  '保存失败：浏览器存储不可用，内容仅本次显示'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    /** @type {Array<{id: string, content: string, createdAt: number}>} */
    posts: [],
    /** 是否已从 Local Storage 完成首次加载 */
    isLoaded: false,
    /** 发布过程中的错误提示 */
    errorMessage: '',
  }),

  getters: {
    /** 按发布时间倒序的只读视图 */
    sortedPosts: (state) =>
      [...state.posts].sort((a, b) => b.createdAt - a.createdAt),

    isEmpty: (state) => state.posts.length === 0,

    total: (state) => state.posts.length,
  },

  actions: {
    /** 从 Local Storage 载入动态（重复调用为覆盖式加载） */
    load() {
      this.posts = postStorage.read()
      this.isLoaded = true
    },

    /**
     * 发布一条动态
     * @param {string} rawContent
     * @returns {boolean} 是否成功发布（存储不可用但已进入内存也算发布成功）
     */
    addPost(rawContent) {
      const content = typeof rawContent === 'string' ? rawContent.trim() : ''

      if (!content || content.length > MAX_CONTENT_LENGTH) return false

      this.posts.push({
        id: createPostId(),
        content,
        createdAt: Date.now(),
      })

      const persisted = postStorage.write(this.posts)
      this.errorMessage = persisted ? '' : STORAGE_UNAVAILABLE_MESSAGE

      return true
    },

    clearError() {
      this.errorMessage = ''
    },
  },
})
