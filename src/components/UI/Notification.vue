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
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  width: 320px;
  max-width: calc(100vw - 48px);
  border-radius: 16px;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  animation: slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(16px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transform-origin: bottom right;
}

.notification.hiding {
  transform: translateY(120%) scale(0.9);
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
  padding: 20px 24px;
  position: relative;
  min-height: 80px;
}

.notification-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.6) 0%, 
    rgba(255, 255, 255, 0.8) 50%, 
    rgba(255, 255, 255, 0.6) 100%);
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}

.notification-message {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding-right: 8px;
}

.notification-close {
  background: rgba(255, 255, 255, 0.25);
  border: none;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
  margin-left: 16px;
  padding: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: 0.9;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.notification-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.notification-close:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .notification {
    bottom: 16px;
    right: 16px;
    left: 16px;
    width: auto;
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