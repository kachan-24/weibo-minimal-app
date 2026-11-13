import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import App from '../src/App.vue'
import { STORAGE_KEY } from '../src/lib/storage'

const SEEDED = [
  { id: 'p1', content: '更早的一条', createdAt: 1700000000000 },
  { id: 'p2', content: '更新的一条', createdAt: 1700000002000 },
]

function mountApp() {
  return mount(App, { global: { plugins: [createPinia()] } })
}

async function publish(wrapper, text) {
  await wrapper.find('textarea').setValue(text)
  await wrapper.find('button').trigger('click')
  await nextTick()
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App 首屏', () => {
  it('渲染页头、发布区与空状态', async () => {
    const wrapper = mountApp()
    await nextTick()

    expect(wrapper.find('h1').text()).toBe('随记广场')
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('.feed__empty').text()).toContain('还没有内容')
  })

  it('从 Local Storage 读取历史动态并按时间倒序展示', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEEDED))

    const wrapper = mountApp()
    await nextTick()

    const items = wrapper.findAll('.feed__item')
    expect(items).toHaveLength(2)
    expect(items[0].find('.feed__content').text()).toBe('更新的一条')
    expect(items[1].find('.feed__content').text()).toBe('更早的一条')
    expect(wrapper.find('.feed__empty').exists()).toBe(false)
  })
})

describe('App 发布流程', () => {
  it('发布后新动态出现在列表首位并写入 Local Storage', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEEDED))
    const wrapper = mountApp()
    await nextTick()

    await publish(wrapper, '刚发布的动态')

    const items = wrapper.findAll('.feed__item')
    expect(items).toHaveLength(3)
    expect(items[0].find('.feed__content').text()).toBe('刚发布的动态')
    expect(wrapper.find('textarea').element.value).toBe('')
    expect(wrapper.find('.composer__hint').text()).toBe('')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toHaveLength(3)
    expect(stored.some((post) => post.content === '刚发布的动态')).toBe(true)
  })

  it('重新打开页面（全新的 Pinia 实例）后数据依然存在', async () => {
    const first = mountApp()
    await nextTick()
    await publish(first, '刷新也要还在')
    first.unmount()

    const second = mountApp()
    await nextTick()

    expect(second.findAll('.feed__item')).toHaveLength(1)
    expect(second.find('.feed__content').text()).toBe('刷新也要还在')
  })

  it('空白内容不会产生新的动态', async () => {
    const wrapper = mountApp()
    await nextTick()

    await wrapper.find('textarea').setValue('   ')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', ctrlKey: true })
    await nextTick()

    expect(wrapper.findAll('.feed__item')).toHaveLength(0)
    expect(wrapper.find('.feed__empty').exists()).toBe(true)
  })

  it('存储不可用时降级为内存展示，并提示保存失败', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {},
    })
    const wrapper = mountApp()
    await nextTick()

    await publish(wrapper, '写不进存储也要显示')

    expect(wrapper.find('.feed__content').text()).toBe('写不进存储也要显示')
    expect(wrapper.find('.composer__hint').text()).toContain('存储不可用')
  })
})
