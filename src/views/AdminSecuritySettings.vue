<template>
  <div class="admin-security-page">
    <AdminNav 
      title="🔒 安全设置" 
      subtitle="系统安全参数配置与管理"
      @avatar-click="showUserInfoModal = true"
    />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <!-- 密码策略设置 -->
      <section class="section">
        <h2 class="section-title">🔐 密码策略</h2>
        <div class="settings-grid">
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">🔢</div>
              <h3>最小密码长度</h3>
            </div>
            <p>设置用户密码的最小长度要求</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.minPasswordLength" 
                min="6" 
                max="20"
                class="input-field"
              />
              <span class="unit">位</span>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">🔄</div>
              <h3>密码过期时间</h3>
            </div>
            <p>设置密码需要更换的时间间隔</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.passwordExpiryDays" 
                min="30" 
                max="365"
                class="input-field"
              />
              <span class="unit">天</span>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">🚫</div>
              <h3>密码历史记录</h3>
            </div>
            <p>禁止使用最近几次使用过的密码</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.passwordHistoryCount" 
                min="3" 
                max="10"
                class="input-field"
              />
              <span class="unit">次</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 会话管理 -->
      <section class="section">
        <h2 class="section-title">💻 会话管理</h2>
        <div class="settings-grid">
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">⏰</div>
              <h3>会话超时时间</h3>
            </div>
            <p>用户无操作后自动登出的时间</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.sessionTimeoutMinutes" 
                min="15" 
                max="480"
                class="input-field"
              />
              <span class="unit">分钟</span>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">📱</div>
              <h3>最大并发会话</h3>
            </div>
            <p>单个用户同时登录的设备数量限制</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.maxConcurrentSessions" 
                min="1" 
                max="10"
                class="input-field"
              />
              <span class="unit">个</span>
            </div>
          </div>
        </div>
      </section>

      <!-- API访问控制 -->
      <section class="section">
        <h2 class="section-title">🔗 API访问控制</h2>
        <div class="settings-grid">
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">📊</div>
              <h3>N8N API调用限制</h3>
            </div>
            <p>每小时内N8N API的最大调用次数</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.n8nApiRateLimit" 
                min="100" 
                max="10000"
                class="input-field"
              />
              <span class="unit">次/小时</span>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">⚡</div>
              <h3>Supabase API调用限制</h3>
            </div>
            <p>每小时内Supabase API的最大调用次数</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.supabaseApiRateLimit" 
                min="1000" 
                max="100000"
                class="input-field"
              />
              <span class="unit">次/小时</span>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">🔐</div>
              <h3>API密钥轮换周期</h3>
            </div>
            <p>系统自动轮换API密钥的时间间隔</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.apiKeyRotationDays" 
                min="30" 
                max="365"
                class="input-field"
              />
              <span class="unit">天</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 审计日志设置 -->
      <section class="section">
        <h2 class="section-title">📋 审计日志</h2>
        <div class="settings-grid">
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">📝</div>
              <h3>日志保留时间</h3>
            </div>
            <p>系统审计日志的保存期限</p>
            <div class="setting-control">
              <input 
                type="number" 
                v-model="securitySettings.logRetentionDays" 
                min="30" 
                max="730"
                class="input-field"
              />
              <span class="unit">天</span>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="setting-header">
              <div class="setting-icon">🔍</div>
              <h3>敏感操作日志</h3>
            </div>
            <p>是否记录所有敏感操作</p>
            <div class="setting-control">
              <label class="toggle">
                <input type="checkbox" v-model="securitySettings.logSensitiveOperations" />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">{{ securitySettings.logSensitiveOperations ? '开启' : '关闭' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <section class="section">
        <div class="action-buttons">
          <Button 
            label="保存设置" 
            @click="saveSettings" 
            :loading="saving"
            class="save-button"
          />
          <Button 
            label="重置为默认" 
            @click="resetToDefault" 
            variant="outline"
          />
          <Button 
            label="查看审计日志" 
            @click="viewAuditLogs" 
            variant="outline"
          />
        </div>
      </section>
    </main>

    <Footer />

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
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import UserInfoModal from '@/components/Modals/UserInfoModal.vue'
import authService from '@/services/authService'
import securityService, { type SecuritySettings } from '@/services/securityService'
import sessionService from '@/services/sessionService'
import apiRateLimitService from '@/services/apiRateLimitService'


const router = useRouter()

const errorMessage = ref('')
const successMessage = ref('')
const saving = ref(false)
const showUserInfoModal = ref(false)

// 安全设置数据
const securitySettings = ref<SecuritySettings>({
  // 密码策略
  minPasswordLength: 8,
  passwordExpiryDays: 90,
  passwordHistoryCount: 5,
  
  // 会话管理
  sessionTimeoutMinutes: 60,
  maxConcurrentSessions: 3,
  
  // API访问控制
  n8nApiRateLimit: 1000,
  supabaseApiRateLimit: 5000,
  apiKeyRotationDays: 90,
  
  // 审计日志
  logRetentionDays: 180,
  logSensitiveOperations: true
})

// 保存设置
const saveSettings = async () => {
  try {
    saving.value = true
    errorMessage.value = ''
    
    // 调用安全服务保存设置
    const result = await securityService.saveSecuritySettings(securitySettings.value)
    
    if (result.success) {
      successMessage.value = '安全设置已保存成功！'
      
      // 动态更新其他服务的设置
      await updateDynamicSettings()
      
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      errorMessage.value = result.error || '保存设置失败'
    }
    
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存设置失败'
  } finally {
    saving.value = false
  }
}

// 重置为默认设置
const resetToDefault = async () => {
  try {
    const result = await securityService.resetToDefaultSettings()
    
    if (result.success) {
      // 重新加载设置
      await loadSettings()
      successMessage.value = '设置已重置为默认值'
    } else {
      errorMessage.value = result.error || '重置设置失败'
    }
  } catch (error) {
    errorMessage.value = '重置设置失败'
  }
}

// 查看审计日志
const viewAuditLogs = () => {
  router.push('/admin/audit-logs')
}

// 动态更新其他服务的设置
const updateDynamicSettings = async () => {
  try {
    // 更新会话超时设置
    await sessionService.updateSessionTimeout(securitySettings.value.sessionTimeoutMinutes)
    
    // 更新API限制设置
    await apiRateLimitService.updateRateLimits({
      n8n: securitySettings.value.n8nApiRateLimit,
      supabase: securitySettings.value.supabaseApiRateLimit
    })
    
    console.log('动态安全设置已更新')
  } catch (error) {
    console.error('更新动态设置失败:', error)
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    const result = await securityService.getSecuritySettings()
    
    if (result.success && result.data) {
      securitySettings.value = result.data
    } else {
      console.error('加载安全设置失败:', result.error)
    }
  } catch (error) {
    console.error('加载安全设置异常:', error)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.admin-security-page {
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

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
  border-bottom: 2px solid #f1f3f4;
  padding-bottom: 10px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.setting-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.setting-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.setting-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.setting-icon {
  font-size: 2rem;
  margin-right: 12px;
}

.setting-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.setting-card p {
  color: #6c757d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  width: 120px;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.unit {
  color: #6c757d;
  font-weight: 500;
}

/* 切换开关样式 */
.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #007bff;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  margin-left: 8px;
  font-weight: 500;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 40px 0;
}

.save-button {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
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

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .main-content {
    padding: 10px;
  }
}
</style>