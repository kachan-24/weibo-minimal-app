import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostComposer from '../../src/components/PostComposer.vue'

function mountComposer(props = {}) {
  return mount(PostComposer, { props })
}

describe('PostComposer 渲染', () => {
  it('渲染输入框与发布按钮，并限制最大长度', () => {
    const wrapper = mountComposer()
    const textarea = wrapper.find('textarea')
    const button = wrapper.find('button')

    expect(textarea.attributes('placeholder')).toBe('分享新鲜事…')
    expect(textarea.attributes('maxlength')).toBe('500')
    expect(button.text()).toBe('发布')
  })

  it('输入为空时发布按钮不可用', () => {
    const wrapper = mountComposer()

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('输入内容后发布按钮可用', async () => {
    const wrapper = mountComposer()

    await wrapper.find('textarea').setValue('今天心情不错')

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('纯空格内容仍然不可发布', async () => {
    const wrapper = mountComposer()

    await wrapper.find('textarea').setValue('    ')

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})

describe('PostComposer 发布交互', () => {
  it('点击发布按钮时抛出 trim 后的内容并清空输入框', async () => {
    const wrapper = mountComposer()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('  第一条动态  ')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('submit')).toEqual([['第一条动态']])
    expect(textarea.element.value).toBe('')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('Ctrl + Enter 快捷发布', async () => {
    const wrapper = mountComposer()

    await wrapper.find('textarea').setValue('快捷键发布')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(wrapper.emitted('submit')).toEqual([['快捷键发布']])
  })

  it('Cmd + Enter 快捷发布（macOS）', async () => {
    const wrapper = mountComposer()

    await wrapper.find('textarea').setValue('Cmd 发布')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', metaKey: true })

    expect(wrapper.emitted('submit')).toEqual([['Cmd 发布']])
  })

  it('单独按 Enter 只换行，不发布', async () => {
    const wrapper = mountComposer()

    await wrapper.find('textarea').setValue('换行而已')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('空白内容走快捷键时给出错误提示且不发布', async () => {
    const wrapper = mountComposer()

    await wrapper.find('textarea').setValue('   ')
    await wrapper.find('textarea').trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('.composer__hint').text()).toBe('内容不能为空')
    expect(wrapper.find('.composer__hint').classes()).toContain('is-error')
  })

  it('用户重新输入后错误提示消失', async () => {
    const wrapper = mountComposer()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('   ')
    await textarea.trigger('keydown', { key: 'Enter', ctrlKey: true })
    expect(wrapper.find('.composer__hint').text()).toBe('内容不能为空')

    await textarea.setValue('恢复正常')

    expect(wrapper.find('.composer__hint').text()).toBe('')
  })
})

describe('PostComposer 外部错误提示', () => {
  it('展示父组件传入的存储错误信息', () => {
    const wrapper = mountComposer({ error: '保存失败：浏览器存储不可用，内容仅本次显示' })

    expect(wrapper.find('.composer__hint').text()).toContain('存储不可用')
    expect(wrapper.find('.composer__hint').classes()).toContain('is-error')
  })

  it('没有错误时提示区域为空', () => {
    const wrapper = mountComposer()

    expect(wrapper.find('.composer__hint').text()).toBe('')
    expect(wrapper.find('.composer__hint').classes()).not.toContain('is-error')
  })
})
