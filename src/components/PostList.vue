<script setup>
import PostItem from './PostItem.vue'

defineProps({
  /** 已排序的动态列表（倒序由 store 提供） */
  posts: { type: Array, default: () => [] },
})
</script>

<template>
  <ul v-if="posts.length" class="feed" aria-live="polite">
    <PostItem v-for="post in posts" :key="post.id" :post="post" />
  </ul>

  <div v-else class="feed__empty">
    <svg class="feed__empty-icon" viewBox="0 0 64 64" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-dasharray="6 8"
      />
      <path
        d="M20 34 Q28 44 44 28"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <circle cx="24" cy="26" r="2.5" fill="currentColor" />
      <circle cx="40" cy="22" r="2.5" fill="currentColor" />
    </svg>
    <p>还没有内容，快去发布第一条吧</p>
  </div>
</template>

<style scoped>
.feed {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed__empty {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 48px 16px;
  animation: fade-in 0.4s ease both;
}

.feed__empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-border);
  margin-bottom: 12px;
}

.feed__empty p {
  font-size: 14px;
}
</style>
