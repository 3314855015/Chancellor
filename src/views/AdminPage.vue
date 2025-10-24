<template>
  <div class="admin-page">
    <AdminNav 
      title="👑 管理员面板" 
      subtitle="生成密钥 · 管理系统安全"
    />
    
    <AdminWelcome />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
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
              <Button 
                label="请帖" 
                @click="generateEnterpriseKey" 
                :loading="loading"
                :disabled="loading"
              />
              <div v-if="enterpriseKey" class="key-display">
                <p><strong>生成的密钥：</strong></p>
                <code class="key-value">{{ enterpriseKey }}</code>
                <Button label="复制" size="small" @click="copyKey(enterpriseKey)" />
              </div>
            </template>
          </Card>
          
          <Card class="key-card" hoverable>
            <template #header>
              <div class="card-icon">📈</div>
              <h3>考官密钥【升官】</h3>
            </template>
            <p>用于考官身份认证和注册</p>
            <template #footer>
              <Button 
                label="升官" 
                @click="generateExaminerKey" 
                :loading="loading"
                :disabled="loading"
              />
              <div v-if="examinerKey" class="key-display">
                <p><strong>生成的密钥：</strong></p>
                <code class="key-value">{{ examinerKey }}</code>
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
              <div class="card-icon">🔑</div>
              <h3>密钥管理</h3>
            </template>
            <p>查看和管理所有生成的密钥</p>
            <template #footer>
              <Button label="密钥管理" @click="manageKeys" />
            </template>
          </Card>
          
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">👥</div>
              <h3>用户管理</h3>
            </template>
            <p>查看和管理所有用户账户</p>
            <template #footer>
              <Button label="用户管理" @click="manageUsers" />
            </template>
          </Card>
          
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">📊</div>
              <h3>数据统计</h3>
            </template>
            <p>查看系统使用情况和统计数据</p>
            <template #footer>
              <Button label="数据统计" @click="viewStatistics" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminNav from '@/components/AdminNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import AdminWelcome from '@/components/AdminWelcome.vue'
import adminService from '@/services/adminService'
import authService from '@/services/authService'

const router = useRouter()

const enterpriseKey = ref('')
const examinerKey = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 获取当前用户ID
const getCurrentUserId = () => {
  const user = authService.getCurrentUser()
  return user?.id || ''
}

const generateEnterpriseKey = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    const creatorId = getCurrentUserId()
    if (!creatorId) {
      throw new Error('用户未登录')
    }
    
    const response = await adminService.generateKey({
      keyType: 'invitation',
      maxUses: 1,
      expiresInDays: 30,
      description: '企业邀请密钥 - 用于企业身份认证'
    }, creatorId)
    
    if (response.success && response.data.key) {
      enterpriseKey.value = response.data.key.keyValue
      successMessage.value = '企业密钥生成成功！'
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成密钥失败'
  } finally {
    loading.value = false
  }
}

const generateExaminerKey = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    const creatorId = getCurrentUserId()
    if (!creatorId) {
      throw new Error('用户未登录')
    }
    
    const response = await adminService.generateKey({
      keyType: 'promotion',
      maxUses: 1,
      expiresInDays: 30,
      description: '考官晋升密钥 - 用于考官身份认证'
    }, creatorId)
    
    if (response.success && response.data.key) {
      examinerKey.value = response.data.key.keyValue
      successMessage.value = '考官密钥生成成功！'
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成密钥失败'
  } finally {
    loading.value = false
  }
}

const copyKey = (key: string) => {
  navigator.clipboard.writeText(key)
  successMessage.value = '密钥已复制到剪贴板'
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const manageKeys = () => {
  router.push('/admin/keys')
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

// 自动清除消息
onMounted(() => {
  setInterval(clearMessages, 5000)
})
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
  padding: 20px;
}

/* 消息样式 */
.message {
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
}

.message.error {
  background-color: #ffe6e6;
  color: #d63031;
  border: 1px solid #fab1a0;
}

.message.success {
  background-color: #e8f8f5;
  color: #00b894;
  border: 1px solid #55efc4;
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
  font-weight: bold;
}

.key-value {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 10px 0;
  word-break: break-all;
  border: 1px solid #e9ecef;
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