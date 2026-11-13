<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from './components/AppHeader.vue'
import PostComposer from './components/PostComposer.vue'
import PostList from './components/PostList.vue'
import { usePostsStore } from './stores/posts'

const store = usePostsStore()
const { sortedPosts, errorMessage } = storeToRefs(store)

function handleSubmit(content) {
  store.addPost(content)
}

onMounted(() => {
  store.load()
})
</script>

<template>
  <AppHeader />

  <main class="app-main">
    <PostComposer :error="errorMessage" @submit="handleSubmit" />

    <section aria-label="动态列表">
      <PostList :posts="sortedPosts" />
    </section>
  </main>
</template>

<style scoped>
.app-main {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 480px) {
  .app-main {
    padding: 14px 12px 40px;
  }
}
</style>
