<template>
  <div class="admin-page">
    <Header 
      title="👑 管理员面板" 
      subtitle="生成密钥 · 管理系统安全"
      :navigation="navigation"
    />
    
    <AdminWelcome />
    
    <main class="main-content">
      <!-- 密钥生成区域 -->
      <section class="section">
        <h2 class="section-title">🔑 密钥生成</h2>
        <div class="grid">
          <Card class="key-card" hoverable>
            <template #header>
              <div class="card-icon">📨</div>
              <h3>企业密钥【请帖】</h3>
            </template>
            <p>用于企业身份认证和注册</p>
            <template #footer>
              <Button label="请帖" @click="generateEnterpriseKey" />
              <div v-if="enterpriseKey" class="key-display">
                <p>生成的密钥：{{ enterpriseKey }}</p>
                <Button label="复制" size="small" @click="copyKey(enterpriseKey)" />
              </div>
            </template>
          </Card>
          
          <Card class="key-card" hoverable>
            <template #header>
              <div class="card-icon">📈</div>
              <h3>考官密钥【升官】</h3>
            </template>
            <p>用于教师身份认证和注册</p>
            <template #footer>
              <Button label="升官" @click="generateExaminerKey" />
              <div v-if="examinerKey" class="key-display">
                <p>生成的密钥：{{ examinerKey }}</p>
                <Button label="复制" size="small" @click="copyKey(examinerKey)" />
              </div>
            </template>
          </Card>
        </div>
      </section>

      <!-- 系统管理 -->
      <section class="section">
        <h2 class="section-title">⚙️ 系统管理</h2>
        <div class="grid">
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">👥</div>
              <h3>用户管理</h3>
            </template>
            <p>查看和管理所有用户账户</p>
            <template #footer>
              <Button label="进入管理" @click="manageUsers" />
            </template>
          </Card>
          
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">📊</div>
              <h3>数据统计</h3>
            </template>
            <p>查看系统使用情况和统计数据</p>
            <template #footer>
              <Button label="查看统计" @click="viewStatistics" />
            </template>
          </Card>
          
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">🔒</div>
              <h3>安全设置</h3>
            </template>
            <p>配置系统安全参数和权限</p>
            <template #footer>
              <Button label="安全设置" @click="securitySettings" />
            </template>
          </Card>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import AdminWelcome from '@/components/AdminWelcome.vue'

const navigation = [
  { icon: '🏠', label: '首页', path: '/' },
  { icon: '📖', label: '关于', path: '/about' }
]

const enterpriseKey = ref('')
const examinerKey = ref('')

const generateEnterpriseKey = () => {
  enterpriseKey.value = 'QT_' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const generateExaminerKey = () => {
  examinerKey.value = 'SJ_' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const copyKey = (key: string) => {
  navigator.clipboard.writeText(key)
  alert('密钥已复制到剪贴板')
}

const manageUsers = () => {
  alert('进入用户管理功能')
}

const viewStatistics = () => {
  alert('查看数据统计功能')
}

const securitySettings = () => {
  alert('进入安全设置功能')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: white;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.key-card,
.manage-card {
  text-align: center;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.key-card h3,
.manage-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.key-card p,
.manage-card p {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.key-display {
  margin-top: 15px;
  padding: 15px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(135, 206, 235, 0.3);
}

.key-display p {
  margin: 0 0 10px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}
</style>