<template>
  <header class="student-nav">
    <div class="nav-content">
      <!-- 标题区域 - 左侧 -->
      <div class="title-section">
        <h1 class="student-title">
          <span class="title-text">{{ title }}</span>
        </h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      
      <!-- 按钮区域 - 右侧 -->
      <div class="action-section">
        <button class="action-btn" @click="$emit('promotion-click')">
          <span class="btn-icon">📈</span>
          <span class="btn-text">升官</span>
        </button>
        <button class="action-btn" @click="$emit('invitation-click')">
          <span class="btn-icon">📨</span>
          <span class="btn-text">接受邀约</span>
        </button>
        <Avatar @click="$emit('avatar-click')" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import Avatar from '@/components/UI/Avatar.vue'

interface Props {
  title: string
  subtitle: string
}

interface Emits {
  (e: 'avatar-click'): void
  (e: 'promotion-click'): void
  (e: 'invitation-click'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* 导航栏基础样式 */
.student-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: static;
}

.student-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.nav-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

/* 标题区域 - 左侧 */
.title-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.student-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.title-text {
  position: relative;
  z-index: 2;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(255, 255, 255, 0.3),
    0 0 20px rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
}

/* 悬浮动画效果 */
.student-title:hover {
  transform: translateY(-3px) scale(1.05);
}

.student-title:hover .title-text {
  color: rgba(255, 255, 255, 0.2);
  text-shadow: 
    0 0 1px rgba(255, 255, 255, 0.9),
    0 0 3px rgba(255, 255, 255, 0.7),
    0 0 8px rgba(255, 255, 255, 0.5),
    0 0 15px rgba(255, 255, 255, 0.3),
    0 0 25px rgba(255, 255, 255, 0.2),
    0 0 40px rgba(255, 255, 255, 0.1);
  animation: glow 2s ease-in-out infinite alternate;
}

/* 发光动画 */
@keyframes glow {
  from {
    text-shadow: 
      0 0 1px rgba(255, 255, 255, 0.9),
      0 0 3px rgba(255, 255, 255, 0.7),
      0 0 8px rgba(255, 255, 255, 0.5),
      0 0 15px rgba(255, 255, 255, 0.3),
      0 0 25px rgba(255, 255, 255, 0.2),
      0 0 40px rgba(255, 255, 255, 0.1);
  }
  to {
    text-shadow: 
      0 0 2px rgba(255, 255, 255, 1),
      0 0 6px rgba(255, 255, 255, 0.8),
      0 0 12px rgba(255, 255, 255, 0.6),
      0 0 20px rgba(255, 255, 255, 0.4),
      0 0 35px rgba(255, 255, 255, 0.3),
      0 0 50px rgba(255, 255, 255, 0.2);
  }
}

/* 副标题样式 */
.subtitle {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

/* 按钮区域 - 右侧 */
.action-section {
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #2c3e50;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.9);
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-text {
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .student-nav {
    padding: 15px 20px;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .title-section {
    align-items: center;
  }
  
  .student-title {
    font-size: 2rem;
  }
  
  .student-title:hover {
    transform: translateY(-2px) scale(1.03);
  }
}

@media (max-width: 480px) {
  .student-title {
    font-size: 1.8rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}
</style>