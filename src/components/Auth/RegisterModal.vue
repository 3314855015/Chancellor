<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="handleClose">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>注册监生账号</h2>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        <div class="role-info">
          <p class="role-description">注册成为监生（学生），后续可通过密钥升级为考官或州牧</p>
        </div>
        <form @submit.prevent="handleSubmit" class="modal-form" novalidate>
          <div class="form-group">
            <label for="register-username">用户名</label>
            <input 
              id="register-username"
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="register-email">邮箱地址</label>
            <input 
              id="register-email"
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱地址"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="register-password">密码</label>
            <input 
              id="register-password"
              v-model="formData.password"
              type="password"
              placeholder="请输入密码（至少8位）"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="register-confirmPassword">确认密码</label>
            <input 
              id="register-confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              class="form-input"
            />
          </div>
          <div class="form-options">
            <label class="agree-terms">
              <input type="checkbox" v-model="formData.agreeTerms" required />
              <span>我已阅读并同意 <a href="#" class="terms-link">服务条款</a> 和 <a href="#" class="terms-link">隐私政策</a></span>
            </label>
          </div>
          <button type="submit" class="form-btn primary-btn" :disabled="loading">
            <span v-if="loading">注册中...</span>
            <span v-else>注册监生账号</span>
          </button>
        </form>
        <div class="modal-footer">
          <p>已有账户？ <a href="#" @click="handleSwitchToLogin">立即登录</a></p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'switch-to-login'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const { showError, showSuccess } = useNotification()

const loading = ref(false)
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student', // 固定为监生身份
  agreeTerms: false
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
  formData.value = { 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    role: 'student', // 保持为监生身份
    agreeTerms: false 
  }
  unlockBodyScroll()
}

const handleSwitchToLogin = () => {
  emit('switch-to-login')
  handleClose()
}

const validateForm = () => {
  // 检查必填字段
  if (!formData.value.username.trim()) {
    showError('请输入用户名')
    return false
  }
  
  if (!formData.value.email.trim()) {
    showError('请输入邮箱地址')
    return false
  }
  
  if (!formData.value.password) {
    showError('请输入密码')
    return false
  }
  
  if (!formData.value.confirmPassword) {
    showError('请确认密码')
    return false
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    showError('请输入有效的邮箱地址')
    return false
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    showError('两次输入的密码不一致')
    return false
  }
  
  if (formData.value.password.length < 8) {
    showError('密码长度至少为8位')
    return false
  }
  
  if (!formData.value.agreeTerms) {
    showError('请同意服务条款和隐私政策')
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // 调用真实的认证存储注册服务
    const result = await authStore.userRegister({
      username: formData.value.username.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password,
      confirmPassword: formData.value.confirmPassword,
      role: 'student',
      agreeTerms: formData.value.agreeTerms
    })

    if (result.success) {
      showSuccess(result.message || '注册成功！请登录您的账户')
      emit('success')
      handleClose()
    } else {
      showError(result.message || '注册失败，请稍后重试')
    }
  } catch (error) {
    console.error('注册过程中发生错误:', error)
    showError('注册失败，请检查网络连接或稍后重试')
  } finally {
    loading.value = false
  }
}

// 监听visible变化，确保组件正确显示/隐藏
watch(() => props.visible, (newVal) => {
  if (newVal) {
    lockBodyScroll()
  } else {
    unlockBodyScroll()
    formData.value = { 
      username: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      role: 'student', // 保持为监生身份
      agreeTerms: false 
    }
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
  max-width: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
  border: 1px solid #e0e0e0;
  max-height: 80vh;
  overflow-y: auto;
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
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.role-info {
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #3498db;
}

.role-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
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

.form-input, .form-select {
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

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%232c3e50' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.form-options {
  margin-bottom: 24px;
}

.agree-terms {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  line-height: 1.4;
}

.agree-terms input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.terms-link {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
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