// 通知管理器
import { ref } from 'vue'

export interface NotificationOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const notification = ref({
  visible: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  duration: 5000
})

export const useNotification = () => {
  const showNotification = (options: NotificationOptions) => {
    notification.value = {
      visible: true,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 5000
    }
  }

  const hideNotification = () => {
    notification.value.visible = false
  }

  const showSuccess = (message: string, duration?: number) => {
    showNotification({ message, type: 'success', duration })
  }

  const showError = (message: string, duration?: number) => {
    showNotification({ message, type: 'error', duration })
  }

  const showWarning = (message: string, duration?: number) => {
    showNotification({ message, type: 'warning', duration })
  }

  const showInfo = (message: string, duration?: number) => {
    showNotification({ message, type: 'info', duration })
  }

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}