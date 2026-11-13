<script setup>
import { computed } from 'vue'
import { formatDisplayTime, toDateTimeAttr } from '../lib/time'

const props = defineProps({
  post: { type: Object, required: true },
})

const displayTime = computed(() => formatDisplayTime(props.post.createdAt))
const datetime = computed(() => toDateTimeAttr(props.post.createdAt))
</script>

<template>
  <li class="feed__item">
    <!-- 使用插值渲染，等价于 textContent，天然防 XSS -->
    <p class="feed__content">{{ post.content }}</p>
    <time class="feed__time" :datetime="datetime">{{ displayTime }}</time>
  </li>
</template>

<style scoped>
.feed__item {
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 16px;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  animation: fade-in 0.35s ease both;
}

.feed__item:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.feed__content {
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.feed__time {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

@media (max-width: 480px) {
  .feed__item {
    padding: 14px;
  }
}
</style>
