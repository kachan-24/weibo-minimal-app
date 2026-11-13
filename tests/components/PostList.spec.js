import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostList from '../../src/components/PostList.vue'
import PostItem from '../../src/components/PostItem.vue'

const POSTS = [
  { id: 'p2', content: '更新的动态', createdAt: 1700000002000 },
  { id: 'p1', content: '更早的动态', createdAt: 1700000000000 },
]

describe('PostList', () => {
  it('列表为空时展示空状态引导文案', () => {
    const wrapper = mount(PostList, { props: { posts: [] } })

    expect(wrapper.find('.feed__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('还没有内容，快去发布第一条吧')
    expect(wrapper.findAll('.feed__item')).toHaveLength(0)
  })

  it('有内容时隐藏空状态', () => {
    const wrapper = mount(PostList, { props: { posts: POSTS } })

    expect(wrapper.find('.feed__empty').exists()).toBe(false)
  })

  it('按传入顺序逐条渲染动态', () => {
    const wrapper = mount(PostList, { props: { posts: POSTS } })
    const items = wrapper.findAllComponents(PostItem)

    expect(items).toHaveLength(2)
    expect(items[0].props('post').id).toBe('p2')
    expect(items[1].props('post').id).toBe('p1')
  })
})
