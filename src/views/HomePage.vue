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
          <button class="login-btn" @click="handleLogin">登录</button>
          <button class="register-btn" @click="handleRegister">注册</button>
          <div class="user-avatar" v-if="userAvatar">
            <img :src="userAvatar" alt="用户头像" />
          </div>
        </div>
      </div>
    </div>

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
      <!-- 角色选择卡片 -->
      <div class="role-section">
        <h2 class="cute-subtitle">🎭 选择您的身份角色</h2>
        <div class="role-grid">
          <div class="cute-card" @click="$router.push('/admin')">
            <div class="cute-icon">👑</div>
            <h3>管理员</h3>
            <p>生成企业密钥【请帖】和考官密钥【升官】</p>
            <div class="cute-badge">权限最高</div>
          </div>
          
          <div class="cute-card" @click="$router.push('/examiner')">
            <div class="cute-icon">📚</div>
            <h3>考官</h3>
            <p>发布任务、评审学生、分配能力点数</p>
            <div class="cute-badge">教师角色</div>
          </div>
          
          <div class="cute-card" @click="$router.push('/enterprise')">
            <div class="cute-icon">🏢</div>
            <h3>州牧</h3>
            <p>企业匹配学生、使用点数进行人才对接</p>
            <div class="cute-badge">企业角色</div>
          </div>
          
          <div class="cute-card" @click="$router.push('/student')">
            <div class="cute-icon">🎓</div>
            <h3>监生</h3>
            <p>接取任务、提升能力、寻求就业机会</p>
            <div class="cute-badge">学生角色</div>
          </div>
        </div>
      </div>

      <!-- 能力点展示 -->
      <div class="ability-section">
        <h2 class="cute-subtitle">🌟 能力点数系统</h2>
        <div class="ability-grid">
          <div class="ability-item" v-for="ability in abilities" :key="ability.name"
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

    <!-- 可爱风格底部 -->
    <div class="cute-footer">
      <p>💝 © 2024 就业画像系统 · 温暖可爱的设计风格</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WelcomeSection from '@/components/WelcomeSection.vue'

const abilityTooltip = ref('')
const userAvatar = ref('')

const abilities = ref([
  { name: '技术能力', icon: '💻', value: 7, description: '编程、技术应用等能力' },
  { name: '沟通能力', icon: '💬', value: 8, description: '表达、交流、协作能力' },
  { name: '团队协作', icon: '👥', value: 6, description: '团队合作和协调能力' },
  { name: '学习能力', icon: '📚', value: 9, description: '快速学习和适应能力' },
  { name: '创造力', icon: '🎨', value: 7, description: '创新思维和解决问题能力' },
  { name: '领导力', icon: '⭐', value: 5, description: '组织和领导团队能力' }
])

const handleLogin = () => {
  alert('跳转到登录页面')
}

const handleRegister = () => {
  alert('跳转到注册页面')
}

const showAbilityTooltip = (abilityName: string) => {
  abilityTooltip.value = abilityName
}

const hideAbilityTooltip = () => {
  abilityTooltip.value = ''
}
</script>

<style scoped>
.cute-home {
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
  
  .role-grid {
    grid-template-columns: 1fr;
  }
  
  .ability-grid {
    grid-template-columns: 1fr;
  }
  
  .cute-main {
    padding: 20px 15px;
  }
}
</style>