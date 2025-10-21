<template>
  <header class="enterprise-nav">
    <div class="nav-content">
      <!-- 返回按钮 -->
      <BackButton />
      
      <!-- 标题区域 -->
      <div class="title-section">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      
      <!-- 头像区域 -->
      <div class="avatar-section">
        <Avatar />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import BackButton from '@/components/UI/BackButton.vue'
import Avatar from '@/components/UI/Avatar.vue'

interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<style scoped>
.enterprise-nav {
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(135, 206, 235, 0.3);
}

.nav-content {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-section h1 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

.title-section p {
  margin: 5px 0 0;
  color: #34495e;
  font-size: 1rem;
}

.avatar-section {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>