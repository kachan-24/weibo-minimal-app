import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../../src/components/AppHeader.vue'

describe('AppHeader', () => {
  it('渲染应用标题与副标题', () => {
    const wrapper = mount(AppHeader)

    expect(wrapper.find('h1').text()).toBe('随记广场')
    expect(wrapper.find('.app-title p').text()).toBe('记录你的每一刻')
  })

  it('装饰性 logo 对屏幕阅读器隐藏', () => {
    const wrapper = mount(AppHeader)

    expect(wrapper.find('.app-logo').attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('.app-logo__dot').length).toBeGreaterThan(0)
  })
})
