import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostItem from '../../src/components/PostItem.vue'

const POST = {
  id: 'p1',
  content: '记录你的每一刻',
  createdAt: new Date(2024, 2, 5, 9, 7).getTime(),
}

describe('PostItem', () => {
  it('渲染动态内容与中文格式的时间', () => {
    const wrapper = mount(PostItem, { props: { post: POST } })

    expect(wrapper.text()).toContain('记录你的每一刻')
    expect(wrapper.find('.feed__time').text()).toBe('2024年3月5日 09:07')
  })

  it('为时间提供语义化的 datetime 属性', () => {
    const wrapper = mount(PostItem, { props: { post: POST } })

    expect(wrapper.find('time').attributes('datetime')).toBe(
      new Date(POST.createdAt).toISOString(),
    )
  })

  it('内容以纯文本渲染，HTML 不会被解析执行（防 XSS）', () => {
    const wrapper = mount(PostItem, {
      props: { post: { id: 'x', content: '<b>加粗</b><script>alert(1)</script>', createdAt: 1700000000000 } },
    })

    expect(wrapper.find('.feed__content').text()).toBe('<b>加粗</b><script>alert(1)</script>')
    expect(wrapper.find('.feed__content b').exists()).toBe(false)
    expect(wrapper.find('script').exists()).toBe(false)
  })
})
