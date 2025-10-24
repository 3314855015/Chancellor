<template>
  <button class="back-btn" @click="goBack">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="#2c3e50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = async () => {
  try {
    // 直接清空本地存储，避免触发任何通知系统
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_abilities')
    
    // 添加短暂延时，确保存储清除完成
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // 使用replace而不是push，避免浏览器历史记录问题
    router.replace('/')
  } catch (error) {
    console.error('返回首页失败:', error)
    // 即使失败也跳转到首页
    router.replace('/')
  }
}
</script>

<style scoped>
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.8);
}
</style>