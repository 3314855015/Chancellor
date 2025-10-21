<template>
  <div class="cute-register">
    <!-- 可爱风格头部 -->
    <div class="cute-header">
      <div class="cute-title">
        <h1>🎯 Chancellor</h1>
        <p>✨ 省心，省时，省力的智能教育与就业平台 ✨</p>
      </div>
    </div>

    <!-- 注册表单区域 -->
    <div class="register-container">
      <div class="cute-card register-card">
        <div class="register-header">
          <div class="register-icon">🎉</div>
          <h2>加入我们！</h2>
          <p>创建您的专属账户</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="username">👤 用户名</label>
            <input 
              id="username"
              v-model="registerForm.username"
              type="text"
              placeholder="请输入用户名"
              required
              class="cute-input"
            />
          </div>

          <div class="form-group">
            <label for="email">📧 邮箱地址</label>
            <input 
              id="email"
              v-model="registerForm.email"
              type="email"
              placeholder="请输入邮箱地址"
              required
              class="cute-input"
            />
          </div>

          <div class="form-group">
            <label for="password">🔒 密码</label>
            <input 
              id="password"
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少8位）"
              required
              minlength="8"
              class="cute-input"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">✅ 确认密码</label>
            <input 
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              required
              class="cute-input"
            />
          </div>

          <div class="form-group">
            <label for="role">🎭 选择身份</label>
            <select 
              id="role"
              v-model="registerForm.role"
              required
              class="cute-select"
            >
              <option value="">请选择您的身份</option>
              <option value="student">🎓 监生（学生）</option>
              <option value="examiner">📚 考官（教师）</option>
              <option value="enterprise">🏢 州牧（企业）</option>
            </select>
          </div>

          <div class="form-options">
            <label class="agree-terms">
              <input type="checkbox" v-model="registerForm.agreeTerms" required />
              <span>我已阅读并同意 <a href="#" class="terms-link">服务条款</a> 和 <a href="#" class="terms-link">隐私政策</a></span>
            </label>
          </div>

          <button type="submit" class="cute-btn register-btn" :disabled="loading">
            <span v-if="loading">⏳ 注册中...</span>
            <span v-else>🚀 立即注册</span>
          </button>
        </form>

        <div class="register-footer">
          <p>已有账户？
            <router-link to="/login" class="login-link">立即登录</router-link>
          </p>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="decoration">
        <div class="floating-icon">🌟</div>
        <div class="floating-icon">🎓</div>
        <div class="floating-icon">💼</div>
        <div class="floating-icon">📚</div>
      </div>
    </div>

    <!-- 可爱风格底部 -->
    <div class="cute-footer">
      <p>💝 © 2024 就业画像系统 · 温暖可爱的设计风格</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  agreeTerms: false
})

const validateForm = () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return false
  }
  
  if (registerForm.value.password.length < 8) {
    alert('密码长度至少为8位')
    return false
  }
  
  if (!registerForm.value.agreeTerms) {
    alert('请同意服务条款和隐私政策')
    return false
  }
  
  return true
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  
  try {
    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 注册成功，跳转到登录页面
    alert('注册成功！请登录您的账户')
    router.push('/login')
  } catch (error) {
    alert('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cute-register {
  min-height: 100vh;
  background: white;
  color: #2d3748;
  font-family: 'Comic Sans MS', 'Yuanti SC', 'YouYuan', sans-serif;
}

.cute-header {
  background: #87CEEB; /* 天蓝色 */
  border-bottom: none;
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(135, 206, 235, 0.3);
}

.cute-title h1 {
  margin: 0;
  font-size: 2rem;
  color: white;
  text-shadow: 2px 2px 0 #4682B4;
}

.cute-title p {
  margin: 5px 0 0;
  color: white;
  font-size: 1rem;
  font-weight: bold;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  position: relative;
}

.register-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
  transition: all 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 35px rgba(135, 206, 235, 0.4);
}

.register-header {
  text-align: center;
  margin-bottom: 25px;
}

.register-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.register-header h2 {
  color: #4682B4;
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.register-header p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4682B4;
  font-weight: bold;
  font-size: 0.9rem;
}

.cute-input, .cute-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E6F3FF;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.cute-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234682B4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.cute-input:focus, .cute-select:focus {
  outline: none;
  border-color: #4682B4;
  box-shadow: 0 0 0 3px rgba(70, 130, 180, 0.1);
}

.form-options {
  margin-bottom: 25px;
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
  color: #4682B4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #5F9EA0;
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  background: #4682B4;
  border: 1px solid transparent;
  color: white;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(70, 130, 180, 0.2);
}

.register-btn:hover:not(:disabled) {
  background: #5F9EA0;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
}

.register-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.register-footer {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-link {
  color: #4682B4;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #5F9EA0;
  text-decoration: underline;
}

.decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.floating-icon {
  position: absolute;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

.floating-icon:nth-child(1) {
  top: 15%;
  left: 8%;
  animation-delay: 0s;
}

.floating-icon:nth-child(2) {
  top: 40%;
  right: 12%;
  animation-delay: 1s;
}

.floating-icon:nth-child(3) {
  bottom: 25%;
  left: 15%;
  animation-delay: 2s;
}

.floating-icon:nth-child(4) {
  bottom: 60%;
  right: 8%;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.cute-footer {
  background: #87CEEB;
  border-top: none;
  padding: 15px;
  text-align: center;
  color: white;
  font-weight: bold;
}

@media (max-width: 480px) {
  .register-card {
    padding: 25px 20px;
    margin: 0 10px;
  }
  
  .agree-terms {
    font-size: 0.85rem;
  }
}
</style>