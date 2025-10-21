<template>
  <div class="welcome-section">
    <div class="welcome-content">
      <h1 class="welcome-title">{{ appStore.appTitle }}</h1>
      <p class="welcome-subtitle">Chancellor，一站式智能招聘平台！</p>
      <div class="theme-info">
        <span class="theme-label">当前主题：</span>
        <span class="theme-value">{{ appStore.theme === 'light' ? '浅色' : '深色' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

/**
 * 欢迎区域组件
 * 显示应用标题和基本信息
 */

// 使用应用状态管理
const appStore = useAppStore()
</script>

<style scoped>
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.welcome-content {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.5);
  }
}

.welcome-subtitle {
  font-size: 1.5rem;
  margin: 0 0 3rem 0;
  opacity: 0.95;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  font-weight: 400;
  line-height: 1.6;
}

.theme-info {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem 2rem;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.theme-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.theme-label {
  font-weight: 500;
  font-size: 1.1rem;
}

.theme-value {
  font-weight: 700;
  font-size: 1.2rem;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6);
  }
}

/* 深色主题适配 */
.dark-theme .welcome-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 100%);
}

.dark-theme .welcome-title {
  background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-section {
    padding: 4rem 1rem;
  }
  
  .welcome-title {
    font-size: 2.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  .theme-info {
    padding: 0.8rem 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 3rem 1rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
  }
  
  .theme-info {
    padding: 0.7rem 1.2rem;
  }
  
  .theme-label,
  .theme-value {
    font-size: 1rem;
  }
}
</style>