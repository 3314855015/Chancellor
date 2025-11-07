<template>
  <div class="cute-home">
    <!-- 可爱风格头部 -->
    <div class="cute-header">
      <div class="cute-title">
        <h1>🎯 Chancellor</h1>
        <p>✨ 省心，省时，省力的智能教育与就业平台 ✨</p>
      </div>
      <div class="cute-nav">
        <div class="user-actions">
          <button class="login-btn" @click="showLoginModal" v-if="!isAuthenticated">登录</button>
          <button class="register-btn" @click="showRegisterModal" v-if="!isAuthenticated">注册</button>
          <div class="user-info" v-if="isAuthenticated">
            <span class="welcome-text">欢迎，{{ user?.username }}</span>
            <button class="logout-btn" @click="handleLogout">退出</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录模态框组件 -->
    <LoginModal 
      v-model:visible="showLogin" 
      @success="handleLoginSuccess"
      @switch-to-register="handleSwitchToRegister"
    />

    <!-- 注册模态框组件 -->
    <RegisterModal 
      v-model:visible="showRegister" 
      @success="handleRegisterSuccess"
      @switch-to-login="handleSwitchToLogin"
    />

    <!-- 通知组件 -->
    <Notification 
      v-model:visible="notification.visible"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="hideNotification"
    />

    <!-- 左下角悬浮关于小球 -->
    <div class="floating-about">
      <button class="floating-btn about-btn" @click="$router.push('/about')" title="关于">
        📖
      </button>
    </div>

    <!-- 欢迎区域 -->
    <WelcomeSection />
    
    <!-- 主要内容区域 -->
    <div class="cute-main">
      <!-- 登录提示区域 -->
      <div class="login-prompt" v-if="!isAuthenticated">
        <h2 class="cute-subtitle">🚀 开始您的智能教育与就业之旅</h2>
        <p class="prompt-description">请先登录您的账户，系统将根据您的身份自动跳转到相应页面</p>
        <div class="prompt-actions">
          <button class="primary-btn" @click="showLoginModal">立即登录</button>
          <button class="secondary-btn" @click="showRegisterModal">注册新账户</button>
        </div>
      </div>

      <!-- 已登录用户信息展示 -->
      <div class="user-dashboard" v-if="isAuthenticated">
        <h2 class="cute-subtitle">🎯 欢迎回来！</h2>
        <div class="user-role-info">
          <div class="role-badge" :class="user?.role">
            {{ getRoleDisplayName(user?.role) }}
          </div>
          <p class="role-description">{{ getRoleDescription(user?.role) }}</p>
        </div>
        
        <!-- 能力点展示 -->
        <div class="ability-section">
          <h3 class="ability-title">🌟 您的能力点数</h3>
          <div class="ability-grid">
            <div class="ability-item" v-for="ability in userAbilities" :key="ability.name"
                 @mouseenter="showAbilityTooltip(ability.name)" @mouseleave="hideAbilityTooltip">
              <div class="ability-icon">{{ ability.icon }}</div>
              <div class="ability-info">
                <div class="ability-name">{{ ability.name }}</div>
                <div class="ability-dots">
                  <span v-for="n in 10" :key="n" 
                        :class="['ability-dot', n <= ability.value ? 'active' : '']"></span>
                </div>
                <div class="ability-value">{{ ability.value }}/10</div>
              </div>
              <div v-if="abilityTooltip === ability.name" class="ability-tooltip">
                {{ ability.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 可爱风格底部 -->
    <div class="cute-footer">
      <p>💝 © Chancellor · 用对的时间，遇上对的人</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeSection from '@/components/WelcomeSection.vue'
import LoginModal from '@/components/Auth/LoginModal.vue'
import RegisterModal from '@/components/Auth/RegisterModal.vue'
import Notification from '@/components/UI/Notification.vue'
import { useNotification } from '@/composables/useNotification'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// 通知系统
const { notification, hideNotification } = useNotification()

// 模态框状态
const showLogin = ref(false)
const showRegister = ref(false)

const abilityTooltip = ref('')

// 认证状态
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// 用户能力数据
const userAbilities = computed(() => {
  const abilities = authStore.abilities
  return [
    { name: '前端能力', icon: '💻', value: abilities?.frontendPoints || 0, description: '前端开发技术能力' },
    { name: '安卓能力', icon: '📱', value: abilities?.androidPoints || 0, description: '安卓应用开发能力' },
    { name: '后端能力', icon: '⚙️', value: abilities?.backendPoints || 0, description: '后端服务开发能力' },
    { name: 'AI能力', icon: '🤖', value: abilities?.aiPoints || 0, description: '人工智能技术能力' },
    { name: '沟通能力', icon: '💬', value: abilities?.communicationPoints || 0, description: '表达、交流、协作能力' },
    { name: '创造力', icon: '🎨', value: abilities?.creativityPoints || 0, description: '创新思维和解决问题能力' },
    { name: '领导力', icon: '⭐', value: abilities?.leadershipPoints || 0, description: '组织和领导团队能力' }
  ]
})

// 角色显示名称映射
const getRoleDisplayName = (role: string | undefined) => {
  switch (role) {
    case 'admin': return '管理员'
    case 'examiner': return '考官'
    case 'enterprise': return '州牧'
    case 'student': return '监生'
    default: return '用户'
  }
}

// 角色描述映射
const getRoleDescription = (role: string | undefined) => {
  switch (role) {
    case 'admin': return '生成企业密钥【请帖】和考官密钥【升官】'
    case 'examiner': return '发布任务、评审学生、分配能力点数'
    case 'enterprise': return '企业匹配学生、使用点数进行人才对接'
    case 'student': return '接取任务、提升能力、寻求就业机会'
    default: return '智能教育与就业平台用户'
  }
}

// 模态框控制函数
const showLoginModal = () => {
  showLogin.value = true
  showRegister.value = false
}

const showRegisterModal = () => {
  showRegister.value = true
  showLogin.value = false
}

// 处理登录成功
const handleLoginSuccess = async () => {
  console.log('登录成功')
  
  // 等待Pinia状态更新完成
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 添加延时机制，让用户有时间看到成功提示
  // 2秒延时，给用户良好的视觉体验
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 根据用户角色自动跳转到相应页面
  redirectToRolePage()

  // 刷新页面，
  window.location.reload()
}

// 处理注册成功
const handleRegisterSuccess = () => {
  console.log('注册成功')
  // 注册成功后自动显示登录模态框
  showLoginModal()
}

// 处理切换到注册
const handleSwitchToRegister = () => {
  showRegisterModal()
}

// 处理切换到登录
const handleSwitchToLogin = () => {
  showLoginModal()
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await authStore.userLogout()
    // 确保数据完全清除后再进行跳转，延时2秒让用户看到加载动画
    await new Promise(resolve => setTimeout(resolve, 2000))
    // 强制刷新页面，确保所有状态完全重置
    window.location.href = '/'
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 根据用户角色跳转到相应页面
const redirectToRolePage = () => {
  if (!user.value) return
  
  switch (user.value.role) {
    case 'admin':
      router.push('/admin')
      break
    case 'examiner':
      router.push('/examiner')
      break
    case 'enterprise':
      router.push('/enterprise')
      break
    case 'student':
      router.push('/student')
      break
    default:
      router.push('/')
  }
}

const showAbilityTooltip = (abilityName: string) => {
  abilityTooltip.value = abilityName
}

const hideAbilityTooltip = () => {
  abilityTooltip.value = ''
}

// 组件挂载时检查认证状态
onMounted(async () => {
  await authStore.initializeAuth()
  
  // 如果已登录，根据角色跳转
  if (isAuthenticated.value && user.value) {
    redirectToRolePage()
  }
})
</script>

<style scoped>
.cute-home {
  min-height: 100vh;
  background: white;
  color: #2d3748;
  font-family: 'Comic Sans MS', 'Yuanti SC', 'YouYuan', sans-serif;
}

/* 模态框样式 */
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
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.modal-content:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
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
  margin-bottom: 25px;
}

.modal-header h2 {
  color: #4682B4;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  transition: color 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #4682B4;
  background: rgba(70, 130, 180, 0.1);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.remember-me, .agree-terms {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  cursor: pointer;
}

.remember-me input, .agree-terms input {
  width: 16px;
  height: 16px;
}

.forgot-password, .terms-link {
  color: #4682B4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover, .terms-link:hover {
  color: #5F9EA0;
  text-decoration: underline;
}

.modal-btn {
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

.modal-btn:hover:not(:disabled) {
  background: #5F9EA0;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
}

.modal-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.modal-footer {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.modal-footer a {
  color: #4682B4;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.modal-footer a:hover {
  color: #5F9EA0;
  text-decoration: underline;
}

.cute-header {
  background: #87CEEB; /* 天蓝色 */
  border-bottom: none;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
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

.cute-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.login-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid transparent;
  color: #4682B4;
  padding: 8px 20px;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(70, 130, 180, 0.2);
}

.login-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(70, 130, 180, 0.3);
}

.register-btn {
  background: #4682B4;
  border: 1px solid transparent;
  color: white;
  padding: 8px 20px;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(70, 130, 180, 0.2);
}

.register-btn:hover {
  background: #5F9EA0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(70, 130, 180, 0.3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 左下角悬浮关于小球 */
.floating-about {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
}

.floating-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.about-btn {
  background: rgba(255, 255, 255, 0.8);
  color: #4682B4;
}

.floating-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.cute-btn {
  background: #4682B4;
  border: 1px solid transparent;
  color: white;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(70, 130, 180, 0.2);
}

.cute-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
  background: #5F9EA0;
}

.cute-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.role-section {
  margin-bottom: 40px;
}

.cute-subtitle {
  text-align: center;
  font-size: 1.5rem;
  color: #4682B4;
  margin-bottom: 25px;
  text-shadow: 1px 1px 0 #B0E0E6;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.cute-card {
  background: white;
  border: 2px solid transparent;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  border-radius: 15px;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.1);
}

.cute-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
  border-color: transparent;
}

.cute-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.cute-card h3 {
  color: #4682B4;
  margin: 8px 0;
  font-size: 1.2rem;
}

.cute-card p {
  color: #5d4037;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.cute-badge {
  background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
  color: white;
  padding: 3px 8px;
  font-size: 0.7rem;
  border-radius: 10px;
  display: inline-block;
}

.cute-tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #5d4037;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.cute-tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px 5px 0;
  border-style: solid;
  border-color: #5d4037 transparent transparent;
}

.ability-section {
  background: white;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 20px;
  margin-top: 30px;
  box-shadow: 0 2px 12px rgba(135, 206, 235, 0.1);
  transition: all 0.3s ease;
}

.ability-section:hover {
  box-shadow: 0 6px 20px rgba(135, 206, 235, 0.2);
}

.ability-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 15px;
}

.ability-item {
  display: flex;
  align-items: center;
  background: #F0F8FF;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px;
  position: relative;
  transition: all 0.3s ease;
  height: 60px;
  box-shadow: 0 1px 4px rgba(135, 206, 235, 0.1);
}

.ability-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(135, 206, 235, 0.3);
  background: #E6F3FF;
}

.ability-icon {
  font-size: 1.8rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.ability-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ability-name {
  font-size: 0.9rem;
  color: #5d4037;
  font-weight: bold;
  margin-bottom: 5px;
}

.ability-dots {
  display: flex;
  gap: 3px;
  margin-bottom: 3px;
}

.ability-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffccbc;
  transition: all 0.3s ease;
}

.ability-dot.active {
  background: #4682B4;
  transform: scale(1.2);
}

.ability-value {
  font-size: 0.8rem;
  color: #8d6e63;
  font-family: 'Courier New', monospace;
}

.ability-tooltip {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: #5d4037;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.welcome-text {
  font-weight: 600;
  font-size: 1rem;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 登录提示区域 */
.login-prompt {
  text-align: center;
  background: linear-gradient(135deg, #F0F8FF 0%, #E6F3FF 100%);
  border: 2px solid #87CEEB;
  border-radius: 20px;
  padding: 40px 30px;
  margin: 30px 0;
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.2);
}

.prompt-description {
  color: #5d4037;
  font-size: 1.1rem;
  margin: 15px 0 25px;
  line-height: 1.5;
}

.prompt-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn {
  background: #4682B4;
  border: 1px solid transparent;
  color: white;
  padding: 12px 24px;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(70, 130, 180, 0.2);
}

.primary-btn:hover {
  background: #5F9EA0;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(70, 130, 180, 0.3);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #4682B4;
  color: #4682B4;
  padding: 12px 24px;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.secondary-btn:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(70, 130, 180, 0.2);
}

/* 用户仪表板 */
.user-dashboard {
  background: white;
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 30px;
  margin: 30px 0;
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.1);
}

.user-role-info {
  text-align: center;
  margin-bottom: 30px;
}

.role-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-badge.admin {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: white;
}

.role-badge.examiner {
  background: linear-gradient(135deg, #4ECDC4 0%, #6EE7B7 100%);
  color: white;
}

.role-badge.enterprise {
  background: linear-gradient(135deg, #45B7D1 0%, #96C8FB 100%);
  color: white;
}

.role-badge.student {
  background: linear-gradient(135deg, #A8E6CF 0%, #DCEDC1 100%);
  color: #5d4037;
}

.role-description {
  color: #5d4037;
  font-size: 1rem;
  margin: 0;
}

.ability-title {
  text-align: center;
  font-size: 1.3rem;
  color: #4682B4;
  margin-bottom: 20px;
}

.cute-footer {
  background: #87CEEB;
  border-top: none;
  padding: 15px;
  text-align: center;
  color: white;
  margin-top: 40px;
  font-weight: bold;
}



@media (max-width: 768px) {
  .cute-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .user-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .prompt-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .role-grid {
    grid-template-columns: 1fr;
  }
  
  .ability-grid {
    grid-template-columns: 1fr;
  }
  
  .cute-main {
    padding: 20px 15px;
  }
  
  .login-prompt {
    padding: 30px 20px;
    margin: 20px 0;
  }
  
  .user-dashboard {
    padding: 20px 15px;
    margin: 20px 0;
  }
}
</style>