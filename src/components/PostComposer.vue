<script setup>
import { computed, ref } from 'vue'
import { MAX_CONTENT_LENGTH } from '../lib/constants'

const props = defineProps({
  /** 由父组件传入的持久化错误提示 */
  error: { type: String, default: '' },
  maxLength: { type: Number, default: MAX_CONTENT_LENGTH },
})

const emit = defineEmits(['submit'])

const content = ref('')
const localError = ref('')

const canSubmit = computed(() => content.value.trim().length > 0)
const hintText = computed(() => props.error || localError.value)
const hasError = computed(() => hintText.value !== '')

function submit() {
  const text = content.value.trim()

  if (!text) {
    localError.value = '内容不能为空'
    return
  }

  emit('submit', text)
  content.value = ''
  localError.value = ''
}

function handleInput() {
  if (localError.value) localError.value = ''
}

function handleKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit()
}
</script>

<template>
  <section class="composer card" aria-label="发布区">
    <textarea
      v-model="content"
      class="composer__input"
      rows="3"
      placeholder="分享新鲜事…"
      :maxlength="maxLength"
      aria-label="动态内容输入框"
      @input="handleInput"
      @keydown="handleKeydown"
    ></textarea>

    <div class="composer__footer">
      <span class="composer__hint" :class="{ 'is-error': hasError }" aria-live="polite">
        {{ hintText }}
      </span>
      <button class="btn btn--primary" type="button" :disabled="!canSubmit" @click="submit">
        发布
      </button>
    </div>
  </section>
</template>

<style scoped>
.composer {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fade-in 0.4s ease both;
}

.composer__input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
  resize: vertical;
  min-height: 88px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.composer__input::placeholder {
  color: var(--color-text-secondary);
}

.composer__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(29, 155, 240, 0.15);
}

.composer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.composer__hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  flex: 1;
  text-align: left;
}

.composer__hint.is-error {
  color: var(--color-danger);
}

.btn {
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 26px;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast),
    opacity var(--transition-fast);
}

.btn--primary {
  background: var(--color-primary);
  color: #ffffff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn--primary:disabled {
  background: var(--color-border);
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .composer {
    padding: 14px;
  }

  .btn {
    padding: 10px 22px;
  }
}
</style>
