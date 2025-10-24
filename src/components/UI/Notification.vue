<template>
  <Teleport to="body">
    <div v-if="visible" class="notification" :class="type">
      <div class="notification-content">
        <span class="notification-message">{{ message }}</span>
        <button class="notification-close" @click="close">×</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000
})

const emit = defineEmits<Emits>()

const visible = ref(props.visible)
let timer: ReturnType<typeof setTimeout> | null = null

const close = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  visible.value = false
  emit('update:visible', false)
  emit('close')
}

const startTimer = () => {
  if (timer) {
    clearTimeout(timer)
  }
  
  timer = setTimeout(() => {
    close()
  }, props.duration)
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  visible.value = newVal
  if (newVal) {
    startTimer()
  }
})

// 监听message变化，重新显示通知
watch(() => props.message, () => {
  if (visible.value) {
    startTimer()
  }
})

// 组件挂载时启动定时器
import { onMounted } from 'vue'
onMounted(() => {
  if (visible.value) {
    startTimer()
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  min-width: 320px;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.notification.hiding {
  transform: translateX(120%);
  opacity: 0;
}

.notification.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.notification.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.notification.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.notification.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: relative;
}

.notification-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
}

.notification-message {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.notification-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.1rem;
  color: white;
  cursor: pointer;
  margin-left: 16px;
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  opacity: 0.8;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.notification-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.notification-close:active {
  transform: scale(0.95);
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .notification {
    top: 16px;
    right: 16px;
    left: 16px;
    min-width: auto;
    max-width: none;
    border-radius: 8px;
  }
  
  .notification-content {
    padding: 12px 16px;
  }
  
  .notification-message {
    font-size: 0.9rem;
  }
}
</style>