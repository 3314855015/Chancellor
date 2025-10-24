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
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 500px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  transform: translateX(0);
  transition: transform 0.3s ease-out;
}

.notification.hiding {
  transform: translateX(100%);
}

.notification.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.notification.warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.notification.info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.notification-message {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: inherit;
  cursor: pointer;
  margin-left: 12px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
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
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>