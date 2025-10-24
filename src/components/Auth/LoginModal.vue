<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleClose">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>登录</h2>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <form @submit.prevent="handleSubmit" class="modal-form" novalidate>
          <div class="form-group">
            <label for="login-username">用户名</label>
            <input 
              id="login-username"
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="login-password">密码</label>
            <input 
              id="login-password"
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
            />
          </div>
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="formData.rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          <button type="submit" class="form-btn primary-btn" :disabled="loading">
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
        <div class="modal-footer">
          <p>还没有账户？ <a href="#" @click="handleSwitchToRegister">立即注册</a></p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotification } from '@/composables/useNotification'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'switch-to-register'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()
const { showError, showSuccess } = useNotification()

const loading = ref(false)
const formData = ref({
  username: '',
  password: '',
  rememberMe: false
})

// 锁定页面滚动
const lockBodyScroll = () => {
  document.body.classList.add('modal-open')
  document.body.style.overflow = 'hidden'
}

// 解锁页面滚动
const unlockBodyScroll = () => {
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
}

const handleClose = () => {
  emit('update:visible', false)
  formData.value = { username: '', password: '', rememberMe: false }
  unlockBodyScroll()
}

const handleSwitchToRegister = () => {
  emit('switch-to-register')
  handleClose()
}

const validateForm = () => {
  if (!formData.value.username || !formData.value.password) {
    showError('请填写用户名和密码')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // 调用真实的认证服务
    const result = await authStore.userLogin({
      username: formData.value.username,
      password: formData.value.password
    })
    
    if (result.success) {
      showSuccess('登录成功！')
      emit('success')
      handleClose()
      
      // 登录成功后，HomePage会自动根据用户角色跳转
      // 这里只需要触发success事件，跳转逻辑在HomePage中处理
    } else {
      showError(result.message || '登录失败，请检查用户名和密码')
    }
  } catch (error) {
    console.error('登录错误:', error)
    showError('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 监听visible变化，确保组件正确显示/隐藏
watch(() => props.visible, (newVal) => {
  if (newVal) {
    lockBodyScroll()
    // 模态框打开时立即清空表单数据，防止浏览器自动填充
    formData.value = { username: '', password: '', rememberMe: false }
    
    // 使用nextTick确保DOM更新后清除浏览器自动填充
    setTimeout(() => {
      const usernameInput = document.getElementById('login-username') as HTMLInputElement
      const passwordInput = document.getElementById('login-password') as HTMLInputElement
      
      if (usernameInput) usernameInput.value = ''
      if (passwordInput) passwordInput.value = ''
    }, 50)
  } else {
    unlockBodyScroll()
    formData.value = { username: '', password: '', rememberMe: false }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

/* 锁定背景页面滚动 */
body.modal-open {
  overflow: hidden;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 32px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
  border: 1px solid #e0e0e0;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  transition: color 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  color: #2c3e50;
  background: #f5f5f5;
}

.modal-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  cursor: pointer;
}

.remember-me input {
  width: 16px;
  height: 16px;
}

.forgot-password {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #2980b9;
  text-decoration: underline;
}

.form-btn {
  width: 100%;
  border: none;
  color: white;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  margin-bottom: 20px;
}

.primary-btn {
  background: #3498db;
}

.primary-btn:hover:not(:disabled) {
  background: #2980b9;
}

.primary-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.modal-footer {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.modal-footer a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.modal-footer a:hover {
  color: #2980b9;
  text-decoration: underline;
}
</style>