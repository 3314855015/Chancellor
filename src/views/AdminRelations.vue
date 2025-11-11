<template>
  <div class="admin-relations-page">
    <AdminNav 
      title="👨‍🏫 师生管理" 
      subtitle="师生关系查看与删除"
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
          <label>搜索学生:</label>
          <input 
            v-model="filters.studentName" 
            type="text" 
            placeholder="学生姓名"
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label>搜索考官:</label>
          <input 
            v-model="filters.teacherName" 
            type="text" 
            placeholder="考官姓名"
            class="filter-input"
          />
        </div>
        
        <button @click="loadRelations" class="filter-btn">
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
            <div class="stat-value">{{ stats.totalRelations }}</div>
            <div class="stat-label">总关系数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.uniqueStudents }}</div>
            <div class="stat-label">涉及学生</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👨‍🏫</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.uniqueTeachers }}</div>
            <div class="stat-label">涉及考官</div>
          </div>
        </div>
      </div>

      <!-- 关系列表 -->
      <div class="relations-section">
        <div class="section-header">
          <h3>师生关系列表</h3>
          <div class="section-actions">
            <button 
              @click="exportRelations" 
              class="action-btn"
              :disabled="relations.length === 0"
            >
              📥 导出CSV
            </button>
          </div>
        </div>
        
        <div class="relations-list">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <span>加载中...</span>
          </div>
          
          <div v-else-if="relations.length === 0" class="empty-state">
            <div class="empty-icon">👨‍🏫</div>
            <p>暂无师生关系记录</p>
          </div>
          
          <div v-else class="relation-items">
            <div 
              v-for="relation in paginatedRelations" 
              :key="relation.id"
              class="relation-item"
            >
              <div class="relation-header">
                <div class="relation-info">
                  <div class="user-pair">
                    <div class="user-card student">
                      <div class="user-avatar">{{ relation.student_name?.charAt(0) || 'S' }}</div>
                      <div class="user-details">
                        <strong>{{ relation.student_name || '未知学生' }}</strong>
                        <span class="user-type">学生</span>
                      </div>
                    </div>
                    <div class="relation-arrow">→</div>
                    <div class="user-card teacher">
                      <div class="user-avatar">{{ relation.teacher_name?.charAt(0) || 'T' }}</div>
                      <div class="user-details">
                        <strong>{{ relation.teacher_name || '未知考官' }}</strong>
                        <span class="user-type">考官</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="relation-actions">
                  <button 
                    @click="viewRelationDetails(relation)"
                    class="action-btn small"
                    title="查看详情"
                  >
                    👁️
                  </button>
                  <button 
                    @click="deleteRelation(relation)"
                    class="action-btn small danger"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div class="relation-content">
                <div class="relation-details">
                  <div class="detail-item">
                    <span class="label">学生邮箱:</span>
                    <span class="value">{{ relation.student_email || '未知' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">考官邮箱:</span>
                    <span class="value">{{ relation.teacher_email || '未知' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">创建时间:</span>
                    <span class="value">{{ formatTime(relation.created_at) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">更新时间:</span>
                    <span class="value">{{ formatTime(relation.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="relations.length > 0" class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ← 上一页
          </button>
          
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页 ({{ relations.length }} 条记录)
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
import adminStudentTeacherService from '@/services/adminStudentTeacherService'

interface Relation {
  id: number
  student_id: string
  teacher_id: string
  student_name?: string
  teacher_name?: string
  student_email?: string
  teacher_email?: string
  created_at: string
  updated_at: string
}

const showUserInfoModal = ref(false)
const loading = ref(false)
const relations = ref<Relation[]>([])
const currentPage = ref(1)
const pageSize = 8

const filters = ref({
  studentName: '',
  teacherName: ''
})

const stats = ref({
  totalRelations: 0,
  uniqueStudents: 0,
  uniqueTeachers: 0
})

const errorMessage = ref('')
const successMessage = ref('')

// 过滤后的关系列表
const filteredRelations = computed(() => {
  let filtered = relations.value
  
  if (filters.value.studentName) {
    filtered = filtered.filter(relation => 
      relation.student_name?.toLowerCase().includes(filters.value.studentName.toLowerCase())
    )
  }
  
  if (filters.value.teacherName) {
    filtered = filtered.filter(relation => 
      relation.teacher_name?.toLowerCase().includes(filters.value.teacherName.toLowerCase())
    )
  }
  
  return filtered
})

const totalPages = ref(1)

const paginatedRelations = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredRelations.value.slice(start, end)
})

// 格式化时间
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

// 加载关系数据
const loadRelations = async () => {
  loading.value = true
  try {
    const result = await adminStudentTeacherService.getStudentTeacherRelations({
      page: currentPage.value,
      pageSize: 8,
      searchStudentName: filters.value.studentName || undefined,
      searchTeacherName: filters.value.teacherName || undefined
    })
    
    if (result.success && result.data) {
      relations.value = result.data.relations
      updateStats()
      
      // 更新分页信息
      if (result.data.pagination) {
        totalPages.value = result.data.pagination.totalPages
      }
    } else {
      errorMessage.value = result.message || '加载关系数据失败'
    }
  } catch (error) {
    errorMessage.value = '加载关系数据异常'
    console.error('加载关系数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计信息
const updateStats = () => {
  stats.value.totalRelations = relations.value.length
  stats.value.uniqueStudents = new Set(relations.value.map(r => r.student_id)).size
  stats.value.uniqueTeachers = new Set(relations.value.map(r => r.teacher_id)).size
}

// 查看详情
const viewRelationDetails = (relation: Relation) => {
  const details = `
学生信息:
- 姓名: ${relation.student_name || '未知'}
- 邮箱: ${relation.student_email || '未知'}
- ID: ${relation.student_id}

考官信息:
- 姓名: ${relation.teacher_name || '未知'}
- 邮箱: ${relation.teacher_email || '未知'}
- ID: ${relation.teacher_id}

时间信息:
- 创建时间: ${formatTime(relation.created_at)}
- 更新时间: ${formatTime(relation.updated_at)}
  `
  alert(details)
}

// 删除关系
const deleteRelation = async (relation: Relation) => {
  if (!confirm(`确定要删除 ${relation.student_name} 和 ${relation.teacher_name} 的关系吗？此操作不可撤销。`)) {
    return
  }
  
  try {
    const result = await adminStudentTeacherService.deleteStudentTeacherRelation(relation.id)
    
    if (result.success) {
      successMessage.value = '关系删除成功！'
      await loadRelations()
    } else {
      errorMessage.value = result.message || '删除关系失败'
    }
  } catch (error) {
    errorMessage.value = '删除关系异常'
    console.error('删除关系失败:', error)
  }
}

// 导出关系数据
const exportRelations = () => {
  const csvContent = filteredRelations.value.map(relation => 
    `${relation.student_name},${relation.teacher_name},${relation.student_email},${relation.teacher_email},${relation.created_at}`
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relations_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// 重置过滤器
const resetFilters = () => {
  filters.value = {
    studentName: '',
    teacherName: ''
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
  loadRelations()
})
</script>

<style scoped>
.admin-relations-page {
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

.filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 200px;
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

.relations-section {
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

.relations-list {
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

.relation-items {
  padding: 0;
}

.relation-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.relation-item:hover {
  background-color: #f8f9fa;
}

.relation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.relation-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.user-pair {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.user-card.student {
  border: 1px solid #007bff;
}

.user-card.teacher {
  border: 1px solid #28a745;
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

.user-card.teacher .user-avatar {
  background: #28a745;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-type {
  color: #666;
  font-size: 0.9rem;
}

.relation-arrow {
  font-size: 1.5rem;
  color: #666;
  font-weight: bold;
}

.relation-actions {
  display: flex;
  gap: 8px;
}

.relation-content {
  margin-bottom: 12px;
}

.relation-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  
  .relation-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .user-pair {
    flex-direction: column;
    gap: 12px;
  }
  
  .relation-arrow {
    transform: rotate(90deg);
  }
  
  .relation-details {
    grid-template-columns: 1fr;
  }
}
</style>