<template>
  <div id="app" :class="{ 'dark-theme': appStore.theme === 'dark' }">

    <!-- 主要内容区域 -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <!-- 加载指示器 -->
    <LoadingSpinner v-if="appStore.isLoading" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

// 使用应用状态管理
const appStore = useAppStore()
</script>

<style lang="scss">
/* 全局样式重置和基础样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.7;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content {
  flex: 1;
  animation: fadeInUp 0.8s ease-out;
}

/* 深色主题样式 */
.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
  color: #f1f5f9 !important;
}

.dark-theme body {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  body {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 14px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.dark-theme ::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
}

.dark-theme ::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
}

.dark-theme ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

/* 选择文本样式 */
::selection {
  background: rgba(102, 126, 234, 0.3);
  color: inherit;
}

.dark-theme ::selection {
  background: rgba(129, 140, 248, 0.4);
}

/* 焦点样式 */
*:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.dark-theme *:focus {
  outline-color: #818cf8;
}

/* 平滑过渡 */
* {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
</style>