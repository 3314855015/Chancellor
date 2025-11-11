<template>
  <div class="admin-page">
    <AdminNav 
      title="👑 管理员面板" 
      subtitle="生成密钥 · 管理系统安全"
      @avatar-click="showUserInfoModal = true"
    />
    
    <AdminWelcome 
      @invite-enterprise="handleInviteEnterprise"
      @appoint-examiner="handleAppointExaminer"
    />
    
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
              <h3>《请帖》</h3>
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
              <h3>《升官》</h3>
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
              <div class="card-icon">📝</div>
              <h3>任务管理</h3>
            </template>
            <p>创建、分配和管理任务</p>
            <template #footer>
              <Button label="任务管理" @click="manageTasks" />
            </template>
          </Card>
          
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">🎯</div>
              <h3>能力管理</h3>
            </template>
            <p>查看和管理用户能力点</p>
            <template #footer>
              <Button label="能力管理" @click="manageAbilities" />
            </template>
          </Card>
          
          <Card class="manage-card" hoverable>
            <template #header>
              <div class="card-icon">👨‍🏫</div>
              <h3>师生管理</h3>
            </template>
            <p>管理师生关系和匹配</p>
            <template #footer>
              <Button label="师生管理" @click="manageRelations" />
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

    <!-- 用户管理模态框 -->
    <UserManagementModal 
      v-model:visible="showUserManagementModal"
      @close="showUserManagementModal = false"
    />

    <!-- 用户信息模态框 -->
    <UserInfoModal 
      v-model:visible="showUserInfoModal"
      @close="showUserInfoModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminNav from '@/components/Nav/AdminNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import AdminWelcome from '@/components/Welcome/AdminWelcome.vue'
import UserManagementModal from '@/components/Modals/UserManagementModal.vue'
import UserInfoModal from '@/components/Modals/UserInfoModal.vue'
import adminService from '@/services/adminService'
import authService from '@/services/authService'

const router = useRouter()

const enterpriseKey = ref('')
const examinerKey = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const enterpriseButtonDisabled = ref(false)
const examinerButtonDisabled = ref(false)
const enterpriseButtonCooldown = ref(0)
const examinerButtonCooldown = ref(0)
const showUserInfoModal = ref(false)



// 滚动到密钥生成区域
const scrollToKeySection = () => {
  const keySection = document.querySelector('.section')
  if (keySection) {
    keySection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 设置按钮冷却时间
const setButtonCooldown = (type: 'enterprise' | 'examiner', seconds: number) => {
  if (type === 'enterprise') {
    enterpriseButtonDisabled.value = true
    enterpriseButtonCooldown.value = seconds
    
    const interval = setInterval(() => {
      enterpriseButtonCooldown.value--
      if (enterpriseButtonCooldown.value <= 0) {
        enterpriseButtonDisabled.value = false
        clearInterval(interval)
      }
    }, 1000)
  } else {
    examinerButtonDisabled.value = true
    examinerButtonCooldown.value = seconds
    
    const interval = setInterval(() => {
      examinerButtonCooldown.value--
      if (examinerButtonCooldown.value <= 0) {
        examinerButtonDisabled.value = false
        clearInterval(interval)
      }
    }, 1000)
  }
}

// 处理欢迎组件的按钮点击
const handleInviteEnterprise = () => {
  if (enterpriseButtonDisabled.value) return
  setButtonCooldown('enterprise', 3) // 3秒冷却时间
  scrollToKeySection()
  generateEnterpriseKey()
}

const handleAppointExaminer = () => {
  if (examinerButtonDisabled.value) return
  setButtonCooldown('examiner', 3) // 3秒冷却时间
  scrollToKeySection()
  generateExaminerKey()
}

// 获取当前用户ID
const getCurrentUserId = () => {
  const user = authService.getCurrentUser()
  return user?.id || ''
}

const generateEnterpriseKey = async () => {
  try {
    if (enterpriseButtonDisabled.value) return
    
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
    if (examinerButtonDisabled.value) return
    
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

// 用户管理模态框相关
const showUserManagementModal = ref(false)

const manageUsers = () => {
  showUserManagementModal.value = true
}





const manageTasks = () => {
  router.push('/admin/tasks')
}

const manageAbilities = () => {
  router.push('/admin/abilities')
}

const manageRelations = () => {
  router.push('/admin/relations')
}

const securitySettings = () => {
  router.push('/admin/security')
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

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
  text-align: center;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 12px;
  font-weight: 500;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  opacity: 0.8;
}

.stat-breakdown span {
  display: flex;
  justify-content: space-between;
}

/* 不同统计卡片颜色变体 */
.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>