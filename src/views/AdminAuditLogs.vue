<template>
  <div class="admin-audit-page">
    <AdminNav 
      title="📋 审计日志" 
      subtitle="系统操作记录与安全审计"
      @avatar-click="showUserInfoModal = true"
    />
    
    <main class="main-content">
      <!-- 过滤器区域 -->
      <div class="filter-section">
        <div class="filter-group">
          <label>操作类型:</label>
          <select v-model="filters.actionType" class="filter-select">
            <option value="">全部</option>
            <option value="login">登录</option>
            <option value="register">注册</option>
            <option value="security_change">安全设置变更</option>
            <option value="user_management">用户管理</option>
            <option value="system">系统操作</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>时间范围:</label>
          <select v-model="filters.timeRange" class="filter-select">
            <option value="24h">最近24小时</option>
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="all">全部</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>用户:</label>
          <input 
            v-model="filters.username" 
            type="text" 
            placeholder="搜索用户名"
            class="filter-input"
          />
        </div>
        
        <button @click="loadLogs" class="filter-btn">
          🔍 搜索
        </button>
        
        <button @click="resetFilters" class="filter-btn outline">
          🔄 重置
        </button>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalLogs }}</div>
            <div class="stat-label">总日志数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔐</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.securityChanges }}</div>
            <div class="stat-label">安全变更</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.uniqueUsers }}</div>
            <div class="stat-label">涉及用户</div>
          </div>
        </div>
      </div>

      <!-- 日志列表 -->
      <div class="logs-section">
        <div class="section-header">
          <h3>操作日志</h3>
          <div class="section-actions">
            <button 
              @click="exportLogs" 
              class="action-btn"
              :disabled="logs.length === 0"
            >
              📥 导出CSV
            </button>
          </div>
        </div>
        
        <div class="logs-list">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="logs.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无审计日志记录</p>
          </div>
          
          <div v-else class="log-items">
            <div 
              v-for="log in filteredLogs" 
              :key="log.id"
              class="log-item"
              :class="getLogLevelClass(log.level)"
            >
              <div class="log-header">
                <div class="log-action">
                  <span class="log-icon">{{ getActionIcon(log.actionType) }}</span>
                  <strong>{{ log.actionType }}</strong>
                </div>
                <div class="log-time">{{ formatTime(log.timestamp) }}</div>
              </div>
              
              <div class="log-content">
                <div class="log-user">
                  <span class="user-icon">👤</span>
                  {{ log.username }}
                </div>
                <div class="log-description">
                  {{ log.description }}
                </div>
                <div v-if="log.details" class="log-details">
                  <details>
                    <summary>详细信息</summary>
                    <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
                  </details>
                </div>
              </div>
              
              <div class="log-footer">
                <span class="log-level" :class="getLogLevelClass(log.level)">
                  {{ log.level }}
                </span>
                <span class="log-ip">IP: {{ log.ipAddress }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="logs.length > 0" class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ← 上一页
          </button>
          
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </span>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            下一页 →
          </button>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import AdminNav from '@/components/Nav/AdminNav.vue'
import Footer from '@/components/Footer.vue'
import UserInfoModal from '@/components/Modals/UserInfoModal.vue'
import securityService from '@/services/securityService'

interface AuditLog {
  id: number
  timestamp: string
  username: string
  actionType: string
  description: string
  level: 'info' | 'warning' | 'error'
  ipAddress: string
  details?: any
}

const showUserInfoModal = ref(false)
const loading = ref(false)
const logs = ref<AuditLog[]>([])
const currentPage = ref(1)
const pageSize = 20

const filters = ref({
  actionType: '',
  timeRange: '7d',
  username: ''
})

const stats = ref({
  totalLogs: 0,
  securityChanges: 0,
  uniqueUsers: 0
})

// 模拟审计日志数据（实际项目中应该从API获取）
const mockLogs: AuditLog[] = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    username: 'admin',
    actionType: 'security_change',
    description: '修改了最小密码长度设置',
    level: 'info',
    ipAddress: '192.168.1.100',
    details: { minPasswordLength: 8 }
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    username: 'user1',
    actionType: 'login',
    description: '用户登录成功',
    level: 'info',
    ipAddress: '192.168.1.101'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    username: 'user2',
    actionType: 'register',
    description: '新用户注册',
    level: 'info',
    ipAddress: '192.168.1.102'
  }
]

// 过滤后的日志
const filteredLogs = computed(() => {
  let filtered = logs.value
  
  if (filters.value.actionType) {
    filtered = filtered.filter(log => log.actionType === filters.value.actionType)
  }
  
  if (filters.value.username) {
    filtered = filtered.filter(log => 
      log.username.toLowerCase().includes(filters.value.username.toLowerCase())
    )
  }
  
  // 时间范围过滤（简化实现）
  const now = new Date()
  if (filters.value.timeRange === '24h') {
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    filtered = filtered.filter(log => new Date(log.timestamp) > dayAgo)
  } else if (filters.value.timeRange === '7d') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(log => new Date(log.timestamp) > weekAgo)
  } else if (filters.value.timeRange === '30d') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(log => new Date(log.timestamp) > monthAgo)
  }
  
  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredLogs.value.length / pageSize)
)

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredLogs.value.slice(start, end)
})

// 获取操作图标
const getActionIcon = (actionType: string) => {
  const icons: Record<string, string> = {
    login: '🔑',
    register: '👤',
    security_change: '🔒',
    user_management: '👥',
    system: '⚙️'
  }
  return icons[actionType] || '📝'
}

// 获取日志级别样式
const getLogLevelClass = (level: string) => {
  return `level-${level}`
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 加载日志
const loadLogs = async () => {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 实际项目中应该调用 securityService.getAuditLogs()
    logs.value = mockLogs
    
    // 计算统计信息
    updateStats()
    
  } catch (error) {
    console.error('加载审计日志失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计信息
const updateStats = () => {
  stats.value.totalLogs = logs.value.length
  stats.value.securityChanges = logs.value.filter(
    log => log.actionType === 'security_change'
  ).length
  stats.value.uniqueUsers = new Set(logs.value.map(log => log.username)).size
}

// 重置过滤器
const resetFilters = () => {
  filters.value = {
    actionType: '',
    timeRange: '7d',
    username: ''
  }
  currentPage.value = 1
  loadLogs()
}

// 导出日志
const exportLogs = () => {
  const csvContent = filteredLogs.value.map(log => 
    `${log.timestamp},${log.username},${log.actionType},${log.description},${log.level}`
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 分页操作
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.admin-audit-page {
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

.filter-section {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 120px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.filter-btn.outline {
  background: white;
  color: #007bff;
}

.filter-btn:hover {
  opacity: 0.8;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.logs-section {
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #28a745;
  background: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.logs-list {
  min-height: 400px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.log-items {
  padding: 0;
}

.log-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.log-item:hover {
  background-color: #f8f9fa;
}

.log-item.level-warning {
  border-left: 4px solid #ffc107;
}

.log-item.level-error {
  border-left: 4px solid #dc3545;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-icon {
  font-size: 1.2rem;
}

.log-time {
  color: #666;
  font-size: 0.9rem;
}

.log-content {
  margin-bottom: 12px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #666;
}

.log-description {
  color: #2c3e50;
  line-height: 1.4;
}

.log-details summary {
  cursor: pointer;
  color: #007bff;
  font-size: 0.9rem;
  margin-top: 8px;
}

.log-details pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 0.8rem;
  overflow-x: auto;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
}

.log-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.level-info {
  background: #e3f2fd;
  color: #1976d2;
}

.level-warning {
  background: #fff3e0;
  color: #f57c00;
}

.level-error {
  background: #ffebee;
  color: #d32f2f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .log-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>