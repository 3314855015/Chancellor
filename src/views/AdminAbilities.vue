<template>
  <div class="admin-abilities-page">
    <AdminNav 
      title="🎯 能力管理" 
      subtitle="查看和删除用户能力记录"
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
      
      <!-- 过滤器区域 -->
      <div class="filter-section">
        <div class="filter-group">
          <label>用户类型:</label>
          <select v-model="filters.userType" class="filter-select">
            <option value="">全部</option>
            <option value="student">学生</option>
            <option value="examiner">考官</option>
            <option value="enterprise">企业</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>能力状态:</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">全部</option>
            <option value="active">活跃</option>
            <option value="expired">已过期</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>搜索用户:</label>
          <input 
            v-model="filters.username" 
            type="text" 
            placeholder="用户名"
            class="filter-input"
          />
        </div>
        
        <button @click="loadAbilities" class="filter-btn">
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
            <div class="stat-value">{{ stats.totalAbilities }}</div>
            <div class="stat-label">总能力记录</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeAbilities }}</div>
            <div class="stat-label">活跃能力</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.expiringSoon }}</div>
            <div class="stat-label">即将过期</div>
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

      <!-- 能力列表 -->
      <div class="abilities-section">
        <div class="section-header">
          <h3>能力记录列表</h3>
          <div class="section-actions">
            <button 
              @click="exportAbilities" 
              class="action-btn"
              :disabled="abilities.length === 0"
            >
              📥 导出CSV
            </button>
          </div>
        </div>
        
        <div class="abilities-list">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="abilities.length === 0" class="empty-state">
            <div class="empty-icon">🎯</div>
            <p>暂无能力记录</p>
          </div>
          
          <div v-else class="ability-items">
            <div 
              v-for="ability in paginatedAbilities" 
              :key="ability.id"
              class="ability-item"
              :class="getAbilityStatusClass(ability.status)"
            >
              <div class="ability-header">
                <div class="ability-info">
                  <div class="user-avatar">{{ ability.userName.charAt(0) }}</div>
                  <div class="user-details">
                    <strong>{{ ability.userName }}</strong>
                    <span class="user-type">{{ getUserTypeLabel(ability.userType) }}</span>
                  </div>
                </div>
                <div class="ability-actions">
                  <button 
                    @click="deleteAbility(ability)"
                    class="action-btn small danger"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div class="ability-content">
                <div class="ability-details">
                  <div class="detail-item">
                    <span class="label">能力类型:</span>
                    <span class="value">{{ ability.abilityType }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">掌握程度:</span>
                    <span class="value">{{ ability.masteryLevel }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">有效期:</span>
                    <span class="value">{{ formatDateRange(ability.validFrom, ability.validTo) }}</span>
                  </div>
                </div>
                
                <div class="ability-status">
                  <span class="status-badge" :class="getAbilityStatusClass(ability.status)">
                    {{ getStatusLabel(ability.status) }}
                  </span>
                  <span class="remaining-days" v-if="ability.daysRemaining !== undefined && ability.status === 'active'">
                    {{ ability.daysRemaining }}天后过期
                  </span>
                </div>
              </div>
              
              <div class="ability-footer">
                <span class="created-time">
                  分配时间: {{ formatTime(ability.createdAt) }}
                </span>
                <span class="allocated-by">
                  分配者: {{ ability.allocatedBy }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="abilities.length > 0" class="pagination">
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
import adminAbilityService from '@/services/adminAbilityService'

interface Ability {
  id: string
  userId: string
  userName: string
  userType: string
  abilityType: string
  masteryLevel: string
  validFrom: string
  validTo: string
  status: 'active' | 'expired'
  createdAt: string
  allocatedBy: string
  description?: string
  daysRemaining?: number
}

const showUserInfoModal = ref(false)
const loading = ref(false)
const abilities = ref<Ability[]>([])
const currentPage = ref(1)
const pageSize = 10

const filters = ref({
  userType: '',
  status: '',
  username: ''
})

const stats = ref({
  totalAbilities: 0,
  activeAbilities: 0,
  expiringSoon: 0,
  uniqueUsers: 0
})

const errorMessage = ref('')
const successMessage = ref('')

// 过滤后的能力列表
const filteredAbilities = computed(() => {
  let filtered = abilities.value
  
  if (filters.value.userType) {
    filtered = filtered.filter(ability => ability.userType === filters.value.userType)
  }
  
  if (filters.value.status) {
    filtered = filtered.filter(ability => ability.status === filters.value.status)
  }
  
  if (filters.value.username) {
    filtered = filtered.filter(ability => 
      ability.userName.toLowerCase().includes(filters.value.username.toLowerCase())
    )
  }
  
  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredAbilities.value.length / pageSize)
)

const paginatedAbilities = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredAbilities.value.slice(start, end)
})

// 获取用户类型标签
const getUserTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    student: '学生',
    examiner: '考官',
    enterprise: '企业'
  }
  return labels[type] || type
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '活跃',
    expired: '已过期'
  }
  return labels[status] || status
}

// 获取能力状态样式
const getAbilityStatusClass = (status: string) => {
  return `status-${status}`
}

// 格式化日期范围
const formatDateRange = (from: string, to: string) => {
  return `${new Date(from).toLocaleDateString('zh-CN')} - ${new Date(to).toLocaleDateString('zh-CN')}`
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 加载能力数据
const loadAbilities = async () => {
  loading.value = true
  try {
    const result = await adminAbilityService.getAbilityRecords({
      userId: filters.value.username,
      abilityType: filters.value.userType,
      status: filters.value.status as 'active' | 'expired',
      page: currentPage.value,
      pageSize: pageSize
    })
    
    if (result.success && result.data) {
      abilities.value = result.data.records.map(record => ({
        id: record.id,
        userId: record.user_id,
        userName: record.user_name || '未知用户',
        userType: record.source_type,
        abilityType: record.ability_type,
        masteryLevel: record.points ? `${record.points}点` : '未评级',
        validFrom: record.obtained_at,
        validTo: record.expires_at || '永久',
        status: record.is_active ? 'active' : 'expired',
        createdAt: record.created_at,
        allocatedBy: record.source_type,
        description: record.description,
        daysRemaining: record.expires_at ? Math.ceil((new Date(record.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined
      }))
      updateStats()
    } else {
      errorMessage.value = result.message || '加载能力数据失败'
    }
  } catch (error) {
    errorMessage.value = '加载能力数据异常'
    console.error('加载能力数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计信息
const updateStats = () => {
  stats.value.totalAbilities = abilities.value.length
  stats.value.activeAbilities = abilities.value.filter(a => a.status === 'active').length
  stats.value.expiringSoon = abilities.value.filter(a => 
    a.status === 'active' && a.daysRemaining && a.daysRemaining <= 30
  ).length
  stats.value.uniqueUsers = new Set(abilities.value.map(a => a.userId)).size
}

// 删除能力
const deleteAbility = async (ability: Ability) => {
  if (!confirm(`确定要删除用户 ${ability.userName} 的 ${ability.abilityType} 能力记录吗？`)) {
    return
  }
  
  try {
    const result = await adminAbilityService.deleteAbilityRecord(ability.id)
    
    if (result.success) {
      successMessage.value = '能力记录删除成功！'
      await loadAbilities()
    } else {
      errorMessage.value = result.message || '删除能力记录失败'
    }
  } catch (error) {
    errorMessage.value = '删除能力记录异常'
    console.error('删除能力记录失败:', error)
  }
}

// 导出能力数据
const exportAbilities = () => {
  const csvContent = filteredAbilities.value.map(ability => 
    `${ability.userName},${ability.userType},${ability.abilityType},${ability.masteryLevel},${ability.validFrom},${ability.validTo},${ability.status}`
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `abilities_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 重置过滤器
const resetFilters = () => {
  filters.value = {
    userType: '',
    status: '',
    username: ''
  }
  currentPage.value = 1
  loadAbilities()
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
  loadAbilities()
})
</script>

<style scoped>
.admin-abilities-page {
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

.abilities-section {
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

.action-btn.small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.action-btn.danger {
  background: #dc3545;
  border-color: #dc3545;
}

.action-btn:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.abilities-list {
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

.ability-items {
  padding: 0;
}

.ability-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.ability-item:hover {
  background-color: #f8f9fa;
}

.ability-item.status-active {
  border-left: 4px solid #28a745;
}

.ability-item.status-expired {
  border-left: 4px solid #6c757d;
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ability-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-type {
  color: #666;
  font-size: 0.9rem;
}

.ability-actions {
  display: flex;
  gap: 8px;
}

.ability-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ability-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
}

.detail-item .value {
  color: #2c3e50;
}

.ability-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.status-active {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-expired {
  background: #f8f9fa;
  color: #6c757d;
}

.remaining-days {
  color: #dc3545;
  font-size: 0.8rem;
}

.ability-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
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

.message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ability-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .ability-status {
    align-items: flex-start;
  }
  
  .ability-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>