<template>
  <div class="admin-tasks-page">
    <AdminNav 
      title="📝 任务管理" 
      subtitle="任务查看与删除"
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
          <label>任务状态:</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">全部</option>
            <option value="active">活跃</option>
            <option value="expired">已过期</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>能力类型:</label>
          <select v-model="filters.abilityType" class="filter-select">
            <option value="">全部</option>
            <option value="frontend">前端</option>
            <option value="android">安卓</option>
            <option value="backend">后端</option>
            <option value="ai">AI</option>
            <option value="communication">沟通</option>
            <option value="creativity">创造力</option>
            <option value="leadership">领导力</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>搜索任务:</label>
          <input 
            v-model="filters.taskTitle" 
            type="text" 
            placeholder="任务标题"
            class="filter-input"
          />
        </div>
        
        <button @click="loadTasks" class="filter-btn">
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
            <div class="stat-value">{{ stats.totalTasks }}</div>
            <div class="stat-label">总任务数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeTasks }}</div>
            <div class="stat-label">活跃任务</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.expiredTasks }}</div>
            <div class="stat-label">已过期</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completedTasks }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-section">
        <div class="section-header">
          <h3>任务列表</h3>
          <div class="section-actions">
            <button 
              @click="exportTasks" 
              class="action-btn"
              :disabled="tasks.length === 0"
            >
              📥 导出CSV
            </button>
          </div>
        </div>
        
        <div class="tasks-list">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="tasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无任务记录</p>
          </div>
          
          <div v-else class="task-items">
            <div 
              v-for="task in paginatedTasks" 
              :key="task.id"
              class="task-item"
              :class="getTaskStatusClass(task)"
            >
              <div class="task-header">
                <div class="task-info">
                  <div class="task-title">
                    <h4>{{ task.title }}</h4>
                    <span class="task-id">#{{ task.id }}</span>
                  </div>
                  
                  <div class="task-meta">
                    <span class="task-type">{{ getAbilityTypeLabel(task.ability_type) }}</span>
                    <span class="task-reward">🎯 {{ task.reward_points }} 积分</span>
                  </div>
                </div>
                
                <div class="task-actions">
                  <button 
                    @click="viewTaskDetails(task)"
                    class="action-btn small"
                    title="查看详情"
                  >
                    👁️
                  </button>
                  <button 
                    @click="deleteTask(task)"
                    class="action-btn small danger"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div class="task-content">
                <div class="task-description">
                  {{ task.description || '暂无描述' }}
                </div>
                
                <div class="task-details">
                  <div class="detail-item">
                    <span class="label">发布者:</span>
                    <span class="value">{{ task.examiner_name || '未知考官' }}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="label">截止时间:</span>
                    <span class="value" :class="{ overdue: isOverdue(task) }">
                      {{ task.deadline ? formatDate(task.deadline) : '无限制' }}
                    </span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="label">创建时间:</span>
                    <span class="value">{{ formatTime(task.created_at) }}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="label">有效期:</span>
                    <span class="value">{{ task.expires_in_months || '无限制' }} 个月</span>
                  </div>
                </div>
              </div>
              
              <div class="task-footer">
                <span class="task-status" :class="getTaskStatusClass(task)">
                  {{ getStatusLabel(task) }}
                </span>
                <span class="remaining-time" v-if="getRemainingDays(task) !== undefined">
                  {{ getRemainingDays(task) > 0 ? `${getRemainingDays(task)}天后截止` : '已截止' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="tasks.length > 0" class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ← 上一页
          </button>
          
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页 ({{ tasks.length }} 条记录)
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
import adminTaskService from '@/services/adminTaskService'

interface Task {
  id: string
  examiner_id: string
  title: string
  description?: string
  ability_type: string
  reward_points: number
  expires_in_months?: number
  deadline?: string
  status: string
  created_at: string
  updated_at: string
  examiner_name?: string
}

const showUserInfoModal = ref(false)
const loading = ref(false)
const tasks = ref<Task[]>([])
const currentPage = ref(1)
const pageSize = 8

const filters = ref({
  status: '',
  abilityType: '',
  taskTitle: ''
})

const stats = ref({
  totalTasks: 0,
  activeTasks: 0,
  expiredTasks: 0,
  completedTasks: 0
})

const errorMessage = ref('')
const successMessage = ref('')

// 过滤后的任务列表
const filteredTasks = computed(() => {
  let filtered = tasks.value
  
  if (filters.value.status) {
    filtered = filtered.filter(task => getStatusLabel(task) === filters.value.status)
  }
  
  if (filters.value.abilityType) {
    filtered = filtered.filter(task => task.ability_type === filters.value.abilityType)
  }
  
  if (filters.value.taskTitle) {
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(filters.value.taskTitle.toLowerCase())
    )
  }
  
  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredTasks.value.length / pageSize)
)

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredTasks.value.slice(start, end)
})

// 获取能力类型标签
const getAbilityTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    frontend: '前端',
    android: '安卓',
    backend: '后端',
    ai: 'AI',
    communication: '沟通',
    creativity: '创造力',
    leadership: '领导力'
  }
  return labels[type] || type
}

// 获取任务状态标签
const getStatusLabel = (task: Task) => {
  if (task.status === 'completed') return '已完成'
  if (isOverdue(task)) return '已过期'
  return '活跃'
}

// 获取任务状态样式
const getTaskStatusClass = (task: Task) => {
  if (task.status === 'completed') return 'status-completed'
  if (isOverdue(task)) return 'status-expired'
  return 'status-active'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

// 检查是否逾期
const isOverdue = (task: Task) => {
  if (!task.deadline) return false
  return new Date(task.deadline) < new Date() && task.status !== 'completed'
}

// 获取剩余天数
const getRemainingDays = (task: Task) => {
  if (!task.deadline) return undefined
  const deadline = new Date(task.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 加载任务数据
const loadTasks = async () => {
  loading.value = true
  try {
    const result = await adminTaskService.getTasks({
      page: currentPage.value,
      pageSize: 100 // 加载更多数据用于前端过滤
    })
    
    if (result.success && result.data) {
      tasks.value = result.data.tasks
      updateStats()
    } else {
      errorMessage.value = result.message || '加载任务数据失败'
    }
  } catch (error) {
    errorMessage.value = '加载任务数据异常'
    console.error('加载任务数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计信息
const updateStats = () => {
  stats.value.totalTasks = tasks.value.length
  stats.value.activeTasks = tasks.value.filter(t => getStatusLabel(t) === '活跃').length
  stats.value.expiredTasks = tasks.value.filter(t => getStatusLabel(t) === '已过期').length
  stats.value.completedTasks = tasks.value.filter(t => getStatusLabel(t) === '已完成').length
}

// 查看任务详情
const viewTaskDetails = (task: Task) => {
  const details = `
任务详情:
- 标题: ${task.title}
- 描述: ${task.description || '暂无描述'}
- 能力类型: ${getAbilityTypeLabel(task.ability_type)}
- 奖励积分: ${task.reward_points}
- 有效期: ${task.expires_in_months || '无限制'} 个月
- 截止时间: ${task.deadline ? formatDate(task.deadline) : '无限制'}
- 发布者: ${task.examiner_name || '未知考官'}
- 状态: ${getStatusLabel(task)}
- 创建时间: ${formatTime(task.created_at)}
- 更新时间: ${formatTime(task.updated_at)}
  `
  alert(details)
}

// 删除任务
const deleteTask = async (task: Task) => {
  if (!confirm(`确定要删除任务 "${task.title}" 吗？此操作不可撤销。`)) {
    return
  }
  
  try {
    const result = await adminTaskService.deleteTask(task.id)
    
    if (result.success) {
      successMessage.value = '任务删除成功！'
      await loadTasks()
    } else {
      errorMessage.value = result.message || '删除任务失败'
    }
  } catch (error) {
    errorMessage.value = '删除任务异常'
    console.error('删除任务失败:', error)
  }
}

// 导出任务数据
const exportTasks = () => {
  const csvContent = filteredTasks.value.map(task => 
    `${task.title},${getAbilityTypeLabel(task.ability_type)},${task.reward_points},${getStatusLabel(task)},${task.examiner_name || '未知'},${task.deadline || '无限制'}`
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 重置过滤器
const resetFilters = () => {
  filters.value = {
    status: '',
    abilityType: '',
    taskTitle: ''
  }
  currentPage.value = 1
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
  loadTasks()
})
</script>

<style scoped>
.admin-tasks-page {
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

.tasks-section {
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
  margin-left: 8px;
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

.tasks-list {
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

.task-items {
  padding: 0;
}

.task-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.task-item:hover {
  background-color: #f8f9fa;
}

.task-item.status-active {
  border-left: 4px solid #28a745;
}

.task-item.status-expired {
  border-left: 4px solid #dc3545;
}

.task-item.status-completed {
  border-left: 4px solid #6c757d;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.task-info {
  flex: 1;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-title h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.task-id {
  color: #666;
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 12px;
}

.task-type {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.task-reward {
  background: #fff3cd;
  color: #856404;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-content {
  margin-bottom: 16px;
}

.task-description {
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.task-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-item .label {
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

.detail-item .value {
  color: #2c3e50;
  font-size: 0.9rem;
}

.detail-item .value.overdue {
  color: #dc3545;
  font-weight: bold;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.task-status.status-active {
  background: #d4edda;
  color: #155724;
}

.task-status.status-expired {
  background: #f8d7da;
  color: #721c24;
}

.task-status.status-completed {
  background: #f8f9fa;
  color: #6c757d;
}

.remaining-time {
  color: #666;
  font-size: 0.8rem;
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
  
  .task-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .task-details {
    grid-template-columns: 1fr;
  }
  
  .task-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>