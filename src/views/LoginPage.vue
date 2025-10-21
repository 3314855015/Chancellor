<template>
  <div class="cute-login">
    <!-- 可爱风格头部 -->
    <div class="cute-header">
      <div class="cute-title">
        <h1>🎯 Chancellor</h1>
        <p>✨ 省心，省时，省力的智能教育与就业平台 ✨</p>
      </div>
    </div>

    <!-- 登录表单区域 -->
    <div class="login-container">
      <div class="cute-card login-card">
        <div class="login-header">
          <div class="login-icon">🔐</div>
          <h2>欢迎回来！</h2>
          <p>请登录您的账户</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">👤 用户名</label>
            <input 
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              required
              class="cute-input"
            />
          </div>

          <div class="form-group">
            <label for="password">🔒 密码</label>
            <input 
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
              class="cute-input"
            />
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <button type="submit" class="cute-btn login-btn" :disabled="loading">
            <span v-if="loading">⏳ 登录中...</span>
            <span v-else>🚀 登录</span>
          </button>
        </form>

        <div class="login-footer">
          <p>还没有账户？
            <router-link to="/register" class="register-link">立即注册</router-link>
          </p>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="decoration">
        <div class="floating-icon">🌟</div>
        <div class="floating-icon">🎓</div>
        <div class="floating-icon">💼</div>
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

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('请填写用户名和密码')
    return
  }

  loading.value = true
  
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 登录成功，跳转到首页
    alert('登录成功！')
    router.push('/')
  } catch (error) {
    alert('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cute-login {
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

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  position: relative;
}

.login-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 35px rgba(135, 206, 235, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.login-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.login-header h2 {
  color: #4682B4;
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.login-header p {
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

.cute-input {
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

.cute-input:focus {
  outline: none;
  border-color: #4682B4;
  box-shadow: 0 0 0 3px rgba(70, 130, 180, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
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
  color: #4682B4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #5F9EA0;
  text-decoration: underline;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background: #5F9EA0;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.register-link {
  color: #4682B4;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.register-link:hover {
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
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-icon:nth-child(2) {
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.floating-icon:nth-child(3) {
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
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
  .login-card {
    padding: 25px 20px;
    margin: 0 10px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>