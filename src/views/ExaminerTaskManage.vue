<template>
  <div class="examiner-task-manage">
    <ExaminerNav 
      title="📋 任务管理" 
      subtitle="评审任务 · 修改信息 · 删除任务"
    />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <!-- 搜索和筛选区域 -->
      <div class="filter-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            placeholder="搜索任务标题或描述..." 
            class="search-input"
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" @change="filterTasks" class="filter-select">
            <option value="">全部状态</option>
            <option value="open">开放中</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="closed">已关闭</option>
          </select>
          
          <select v-model="sortBy" @change="sortTasks" class="filter-select">
            <option value="createdAt">创建时间</option>
            <option value="title">任务标题</option>
            <option value="participants">接取人数</option>
            <option value="reward">奖励点数</option>
          </select>
          
          <select v-model="sortOrder" @change="sortTasks" class="filter-select">
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <div class="main-layout">
        <!-- 左侧任务列表区域 (3/4) -->
        <div class="tasks-section">
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>暂无任务</h3>
            <p>当前没有符合条件的任务</p>
            <Button 
              label="➕ 发布新任务" 
              @click="$router.push('/examiner/task/create')"
              variant="primary"
            />
          </div>
          
          <div v-else class="tasks-grid">
            <Card 
              v-for="task in paginatedTasks" 
              :key="task.id" 
              class="task-card"
              hoverable
            >
              <div class="task-card-content">
                <!-- 任务头部 -->
                <div class="task-header">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <div class="task-status-badge" :class="task.status">
                    {{ getStatusText(task.status) }}
                  </div>
                </div>
                
                <!-- 任务描述 -->
                <p class="task-description">{{ task.description }}</p>
                
                <!-- 任务元信息 -->
                <div class="task-meta">
                  <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span class="meta-text">接取人数: {{ task.participants }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">🎯</span>
                    <span class="meta-text">奖励点数: {{ task.reward_points }}点</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">⏰</span>
                    <span class="meta-text">截止: {{ formatDate(task.deadline) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span class="meta-text">创建: {{ formatDate(task.createdAt) }}</span>
                  </div>
                </div>
                
                <!-- 进度信息（仅对进行中和已完成的任务） -->
                <div v-if="task.status === 'in_progress' || task.status === 'completed'" class="task-progress">
                  <div class="progress-info">
                    <span>已完成: {{ task.completedParticipants || 0 }}/{{ task.participants }}</span>
                    <span>待评审: {{ task.pendingReviews || 0 }}</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: getProgressPercentage(task) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- 任务操作按钮 -->
              <div class="task-actions">
                <Button 
                  v-if="task.status === 'in_progress'"
                  label="⏹️ 结束" 
                  size="small" 
                  variant="primary" 
                  @click="toggleTaskStatus(task)"
                />
                <Button 
                  v-if="task.status === 'open' || task.status === 'in_progress' || task.status === 'completed'"
                  :label="task.pendingReviews === 0 ? '📝 查看' : '📝 评审'" 
                  size="small" 
                  @click="reviewTask(task)"
                  :variant="task.pendingReviews === 0 ? 'secondary' : 'primary'"
                />
                <Button 
                  label="✏️ 编辑" 
                  size="small" 
                  variant="secondary" 
                  @click="editTask(task)"
                />
                <Button 
                  label="🗑️ 删除" 
                  size="small" 
                  variant="danger" 
                  @click="confirmDeleteTask(task)"
                />
              </div>
            </Card>
          </div>
          
          <!-- 分页控件 -->
          <div v-if="filteredTasks.length > 0" class="pagination-section">
            <div class="pagination-info">
              显示 {{ startIndex + 1 }}-{{ endIndex }} 条，共 {{ filteredTasks.length }} 条任务
            </div>
            <div class="pagination-controls">
              <Button 
                label="上一页" 
                size="small" 
                variant="secondary" 
                @click="prevPage"
                :disabled="currentPage === 1"
              />
              <div class="page-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>
              <Button 
                label="下一页" 
                size="small" 
                variant="secondary" 
                @click="nextPage"
                :disabled="currentPage >= totalPages"
              />
            </div>
          </div>
        </div>
        
        <!-- 右侧统计信息区域 (1/4) -->
        <div class="stats-sidebar">
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-icon">📋</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalTasks }}</div>
                <div class="stat-label">总任务数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalParticipants }}</div>
                <div class="stat-label">总参与人数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalRewardPoints }}</div>
                <div class="stat-label">总奖励点数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏰</div>
              <div class="stat-content">
                <div class="stat-value">{{ pendingReviews }}</div>
                <div class="stat-label">待评审任务</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 删除确认模态框 -->
    <Modal 
      :visible="showDeleteModal" 
      title="确认删除任务"
      @close="closeDeleteModal"
    >
      <div class="delete-modal-content">
        <div class="warning-icon">⚠️</div>
        <h4>您确定要删除这个任务吗？</h4>
        <p class="delete-warning">
          任务 "<strong>{{ taskToDelete?.title }}</strong>" 将被永久删除，此操作不可撤销！
        </p>
        <p v-if="taskToDelete?.participants > 0" class="participants-warning">
          ⚠️ 该任务已有 {{ taskToDelete?.participants }} 人接取，删除后这些学生将无法完成任务。
        </p>
        <div class="modal-actions">
          <Button 
            label="取消" 
            variant="secondary" 
            @click="closeDeleteModal"
          />
          <Button 
            label="确认删除" 
            variant="danger" 
            @click="deleteTask"
            :loading="isDeleting"
          />
        </div>
      </div>
    </Modal>
    
    <!-- 编辑任务模态框 -->
    <Modal 
      :visible="showEditModal" 
      title="编辑任务"
      @close="closeEditModal"
    >
      <div class="edit-modal-content">
        <form @submit.prevent="saveEdit" class="edit-form">
          <!-- 任务标题 -->
          <div class="form-group">
            <label for="edit-title">任务标题 *</label>
            <input 
              id="edit-title"
              v-model="editForm.title" 
              type="text" 
              placeholder="请输入任务标题"
              class="form-input"
              required
            >
          </div>
          
          <!-- 任务描述 -->
          <div class="form-group">
            <label for="edit-description">任务描述 *</label>
            <textarea 
              id="edit-description"
              v-model="editForm.description" 
              placeholder="请详细描述任务内容、要求和目标"
              class="form-textarea"
              rows="4"
              required
            ></textarea>
          </div>
          
          <!-- 奖励点数 -->
          <div class="form-group">
            <label for="edit-reward-points">奖励点数 *</label>
            <div class="points-selector">
              <label 
                v-for="point in [1, 2, 3, 4]" 
                :key="point"
                class="point-option"
                :class="{ selected: editForm.rewardPoints === point }"
              >
                <input 
                  type="radio" 
                  v-model="editForm.rewardPoints" 
                  :value="point"
                  class="radio-input"
                  required
                >
                <span class="point-value">{{ point }}点</span>
                <span class="point-desc">{{ getPointDescription(point) }}</span>
              </label>
            </div>
          </div>
          
          <!-- 截止时间 -->
          <div class="form-group">
            <label for="edit-deadline">截止时间 *</label>
            <input 
              id="edit-deadline"
              v-model="editForm.deadline" 
              type="datetime-local" 
              class="form-input"
              required
            >
            <p class="form-hint">任务提交的最后期限</p>
          </div>
          
          <!-- 点数过期时间 -->
          <div class="form-group">
            <label for="edit-expires-in">点数过期时间 *</label>
            <div class="expires-selector">
              <label 
                v-for="option in expiresOptions" 
                :key="option.value"
                class="expires-option"
                :class="{ selected: editForm.expiresInMonths === option.value }"
              >
                <input 
                  type="radio" 
                  v-model="editForm.expiresInMonths" 
                  :value="option.value"
                  class="radio-input"
                  required
                >
                <span class="expires-value">{{ option.label }}</span>
                <span class="expires-desc">{{ option.description }}</span>
              </label>
            </div>
          </div>
          
          <!-- 表单操作 -->
          <div class="modal-actions">
            <Button 
              label="取消" 
              variant="secondary" 
              @click="closeEditModal"
              :disabled="isEditing"
            />
            <Button 
              label="保存修改" 
              type="submit" 
              :loading="isEditing"
              :disabled="isEditing"
            />
          </div>
        </form>
      </div>
    </Modal>
    
    <!-- 评审任务模态框 -->
    <Modal 
      :visible="showReviewModal" 
      title="任务评审"
      @close="closeReviewModal"
      size="large"
      width="700px"
    >
      <div class="review-modal-content">
        <div class="review-header">
          <h3 class="task-title">{{ taskToReview?.title }}</h3>
          <p class="task-description">{{ taskToReview?.description }}</p>
        </div>
        
        <!-- 学生列表表格 -->
        <div class="student-table-container">
          <!-- 排序控制栏 -->
          <div class="sort-controls">
            <span class="sort-label">排序方式：</span>
            <div class="sort-buttons">
              <button 
                class="sort-btn" 
                :class="{ active: reviewSortField === 'username' }"
                @click="toggleReviewSort('username')"
              >
                姓名 <span class="sort-arrow" v-if="reviewSortField === 'username'">{{ reviewSortDirection === 'asc' ? '↑' : '↓' }}</span>
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: reviewSortField === 'email' }"
                @click="toggleReviewSort('email')"
              >
                邮箱 <span class="sort-arrow" v-if="reviewSortField === 'email'">{{ reviewSortDirection === 'asc' ? '↑' : '↓' }}</span>
              </button>
              <button 
                class="sort-btn" 
                :class="{ active: reviewSortField === 'submissionDate' }"
                @click="toggleReviewSort('submissionDate')"
              >
                提交时间 <span class="sort-arrow" v-if="reviewSortField === 'submissionDate'">{{ reviewSortDirection === 'asc' ? '↑' : '↓' }}</span>
              </button>
            </div>
          </div>
          
          <table class="student-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>提交时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 实际学生数据行 -->
              <tr v-for="student in paginatedReviewStudents" :key="student.id" class="student-row">
                <td class="student-name">{{ student.username }}</td>
                <td class="student-email">{{ student.email || '未设置' }}</td>
                <td class="submission-date">{{ formatDate(student.submissionDate) }}</td>
                <td class="review-status">
                  <span :class="getReviewStatusClass(student.status)">
                    {{ getReviewStatusText(student.status) }}
                  </span>
                </td>
                <td class="student-actions">
                  <Button 
                    v-if="student.status !== 'completed'"
                    label="❌ 退回" 
                    size="small" 
                    variant="danger" 
                    @click="rejectSubmission(student)"
                    :disabled="student.status === 'rejected'"
                  />
                  <Button 
                    v-if="student.status !== 'completed'"
                    label="✅ 通过" 
                    size="small" 
                    variant="success" 
                    @click="approveSubmission(student)"
                    :disabled="student.status === 'approved'"
                  />
                  <Button 
                    label="▶️ 查看" 
                    size="small" 
                    :variant="getPlayButtonVariant(student.status)"
                    @click="playSubmission(student)"
                    :disabled="!student.submissionUrl"
                  />
                </td>
              </tr>
              
              <!-- 空行填充，确保始终显示7行 -->
              <tr v-for="i in (7 - paginatedReviewStudents.length)" :key="`empty-${i}`" class="empty-row">
                <td colspan="5">&nbsp;</td>
              </tr>
            </tbody>
          </table>
          
          <!-- 分页控件 - 始终显示 -->
          <div class="pagination-controls">
            <Button 
              label="上一页" 
              size="small" 
              variant="secondary" 
              @click="prevReviewPage" 
              :disabled="reviewCurrentPage === 1"
            />
            <span class="page-info">第 {{ reviewCurrentPage }} 页 / 共 {{ reviewTotalPages }} 页</span>
            <Button 
              label="下一页" 
              size="small" 
              variant="secondary" 
              @click="nextReviewPage" 
              :disabled="reviewCurrentPage >= reviewTotalPages"
            />
          </div>
          
          <div v-if="reviewStudents.length === 0" class="empty-state">
            <div class="empty-icon">👨‍🎓</div>
            <p>暂无学生提交作品</p>
            <p class="empty-hint">等待学生提交作品后进行评审</p>
          </div>
        </div>
      </div>
    </Modal>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExaminerNav from '@/components/Nav/ExaminerNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import Modal from '@/components/Modals/BaseModal.vue'
import examinerService from '@/services/examinerService'

const router = useRouter()

// 响应式数据
const tasks = ref<any[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(8)
const errorMessage = ref('')
const successMessage = ref('')

// 删除相关
const showDeleteModal = ref(false)
const taskToDelete = ref<any>(null)
const isDeleting = ref(false)

// 编辑相关
const showEditModal = ref(false)
const taskToEdit = ref<any>(null)
const isEditing = ref(false)
const editForm = ref({
  title: '',
  description: '',
  rewardPoints: 2,
  deadline: '',
  expiresInMonths: '3'
})

// 评审相关
const showReviewModal = ref(false)
const taskToReview = ref<any>(null)
const reviewStudents = ref<any[]>([])
const reviewSortField = ref('submissionDate')
const reviewSortDirection = ref('desc')
const reviewCurrentPage = ref(1)
const reviewPageSize = ref(7)

// 过期时间选项
const expiresOptions = [
  { value: '1', label: '1个月', description: '短期任务' },
  { value: '3', label: '3个月', description: '标准任务' },
  { value: '6', label: '6个月', description: '长期任务' },
  { value: '12', label: '12个月', description: '年度任务' }
]

// 获取点数描述
const getPointDescription = (point: number) => {
  const descriptions = {
    1: '简单任务',
    2: '标准任务', 
    3: '挑战任务',
    4: '高难度任务'
  }
  return descriptions[point as keyof typeof descriptions] || ''
}

// 计算属性
const filteredTasks = computed(() => {
  let filtered = tasks.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(query) || 
      task.description.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }
  
  // 排序
  filtered.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    if (sortBy.value === 'createdAt' || sortBy.value === 'deadline') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (sortOrder.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
  
  return filtered
})

// 分页相关计算属性
const totalPages = computed(() => Math.ceil(filteredTasks.value.length / pageSize.value))
const paginatedTasks = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filteredTasks.value.slice(startIndex, startIndex + pageSize.value)
})
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredTasks.value.length))

// 统计信息
const totalTasks = computed(() => tasks.value.length)
const totalParticipants = computed(() => tasks.value.reduce((sum, task) => sum + task.participants, 0))
const totalRewardPoints = computed(() => tasks.value.reduce((sum, task) => sum + (task.reward_points || task.reward || 0), 0))
const pendingReviews = computed(() => 
  tasks.value.reduce((sum, task) => sum + (task.pendingReviews || task.pending_reviews || 0), 0)
)

// 可见页码
const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

// 评审相关计算属性
const sortedReviewStudents = computed(() => {
  const students = [...reviewStudents.value]
  
  return students.sort((a, b) => {
    let aVal = a[reviewSortField.value]
    let bVal = b[reviewSortField.value]
    
    if (reviewSortField.value === 'submissionDate') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    if (reviewSortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
})

const reviewTotalPages = computed(() => Math.ceil(reviewStudents.value.length / reviewPageSize.value))

const paginatedReviewStudents = computed(() => {
  const startIndex = (reviewCurrentPage.value - 1) * reviewPageSize.value
  return sortedReviewStudents.value.slice(startIndex, startIndex + reviewPageSize.value)
})

// 方法
const getStatusText = (status: string) => {
  const statusMap = {
    'open': '开放中',
    'in_progress': '进行中',
    'completed': '已完成',
    'closed': '已关闭'
  }
  return statusMap[status as keyof typeof statusMap] || '未知'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const getProgressPercentage = (task: any) => {
  if (!task.participants) return 0
  return Math.round(((task.completedParticipants || 0) / task.participants) * 100)
}

const handleSearch = () => {
  currentPage.value = 1
}

const filterTasks = () => {
  currentPage.value = 1
}

const sortTasks = () => {
  currentPage.value = 1
}

// 分页方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

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

// 任务操作
const reviewTask = async (task: any) => {
  console.log('评审按钮被点击了，任务ID:', task.id, '任务标题:', task.title)
  
  // 立即打开模态框，不等待任何异步操作
  taskToReview.value = task
  showReviewModal.value = true
  console.log('模态框状态已设置为打开')
  
  // 清空之前的学生数据
  reviewStudents.value = []
  
  // 异步加载学生数据，但不阻塞模态框显示
  setTimeout(async () => {
    try {
      console.log('开始异步加载学生列表...')
      const response = await examinerService.getTaskParticipants(task.id)
      console.log('学生列表加载完成:', response)
      
      if (response.success && response.data.students) {
        reviewStudents.value = response.data.students.map((student: any) => ({
          id: student.id,
          username: student.username,
          email: student.email,
          submissionDate: student.submission_date || student.submissionDate,
          submissionUrl: student.submission_url || student.submissionUrl,
          status: student.status // 直接使用RPC返回的状态字段
        }))
        console.log('学生列表已更新，数量:', reviewStudents.value.length)
      } else {
        reviewStudents.value = []
        console.warn('获取学生列表失败:', response.message)
      }
    } catch (error) {
      console.error('加载学生列表时发生错误:', error)
      reviewStudents.value = []
    }
  }, 0)
}
// 评审相关方法
const toggleReviewSort = (field: string) => {
  if (reviewSortField.value === field) {
    reviewSortDirection.value = reviewSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    reviewSortField.value = field
    reviewSortDirection.value = 'desc'
  }
}

const getReviewStatusText = (status: string) => {
  const statusMap = {
    'pending': '待评审',
    'approved': '已通过',
    'rejected': '已拒绝',
    'completed': '已完成'
  }
  return statusMap[status as keyof typeof statusMap] || '未知'
}

const getReviewStatusClass = (status: string) => {
  const classMap = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'completed': 'status-approved'
  }
  return classMap[status as keyof typeof classMap] || 'status-unknown'
}

const getPlayButtonVariant = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
  const variantMap: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
    'pending': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'completed': 'success'
  }
  return variantMap[status] || 'secondary'
}

const playSubmission = (student: any) => {
  if (student.submissionUrl) {
    window.open(student.submissionUrl, '_blank')
  } else {
    errorMessage.value = '该学生尚未提交作品'
  }
}

const approveSubmission = async (student: any) => {
  try {
    const response = await examinerService.approveSubmission(student.id, taskToReview.value.id)
    if (response.success) {
      // 更新本地状态
      const studentIndex = reviewStudents.value.findIndex(s => s.id === student.id)
      if (studentIndex !== -1) {
        reviewStudents.value[studentIndex].status = 'approved'
      }
      successMessage.value = '作品已通过评审'
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '评审操作失败'
  }
}

const rejectSubmission = async (student: any) => {
  try {
    const response = await examinerService.rejectSubmission(student.id, taskToReview.value.id)
    if (response.success) {
      // 更新本地状态
      const studentIndex = reviewStudents.value.findIndex(s => s.id === student.id)
      if (studentIndex !== -1) {
        reviewStudents.value[studentIndex].status = 'rejected'
      }
      successMessage.value = '作品已拒绝'
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '评审操作失败'
  }
}

const closeReviewModal = () => {
  showReviewModal.value = false
  taskToReview.value = null
  reviewStudents.value = []
  reviewCurrentPage.value = 1
}

const prevReviewPage = () => {
  if (reviewCurrentPage.value > 1) {
    reviewCurrentPage.value--
  }
}

const nextReviewPage = () => {
  if (reviewCurrentPage.value < reviewTotalPages.value) {
    reviewCurrentPage.value++
  }
}

const editTask = (task: any) => {
  // 打开编辑模态框
  taskToEdit.value = task
  editForm.value = {
    title: task.title,
    description: task.description,
    rewardPoints: task.reward_points || task.reward || 2,
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    expiresInMonths: task.expires_in_months ? task.expires_in_months.toString() : '3'
  }
  showEditModal.value = true
}

const toggleTaskStatus = async (task: any) => {
  try {
    const newStatus = task.status === 'open' ? 'in_progress' : 'completed'
    const response = await examinerService.updateTaskStatus(task.id, newStatus)
    
    if (response.success) {
      // 更新本地任务状态
      const taskIndex = tasks.value.findIndex(t => t.id === task.id)
      if (taskIndex !== -1) {
        tasks.value[taskIndex].status = newStatus
      }
      successMessage.value = `任务状态已更新为 ${getStatusText(newStatus)}`
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '更新任务状态失败'
  }
}

const confirmDeleteTask = (task: any) => {
  taskToDelete.value = task
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  taskToDelete.value = null
  isDeleting.value = false
}

const deleteTask = async () => {
  if (!taskToDelete.value) return
  
  try {
    isDeleting.value = true
    const response = await examinerService.deleteTask(taskToDelete.value.id)
    
    if (response.success) {
      // 从本地任务列表中移除
      tasks.value = tasks.value.filter(t => t.id !== taskToDelete.value.id)
      successMessage.value = `任务 "${taskToDelete.value.title}" 已删除`
      closeDeleteModal()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '删除任务失败'
  } finally {
    isDeleting.value = false
  }
}

// 编辑相关方法
const closeEditModal = () => {
  showEditModal.value = false
  taskToEdit.value = null
  isEditing.value = false
}

const saveEdit = async () => {
  if (!taskToEdit.value) return
  
  if (!editForm.value.title.trim() || !editForm.value.description.trim()) {
    errorMessage.value = '请填写完整的任务信息'
    return
  }

  isEditing.value = true
  errorMessage.value = ''
  
  try {
    const response = await examinerService.updateTaskDetails(taskToEdit.value.id, {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim(),
      reward_points: editForm.value.rewardPoints,
      deadline: editForm.value.deadline,
      expires_in_months: parseInt(editForm.value.expiresInMonths)
    })
    
    if (response.success) {
      // 更新本地任务数据
      const taskIndex = tasks.value.findIndex(t => t.id === taskToEdit.value.id)
      if (taskIndex !== -1) {
        tasks.value[taskIndex] = {
          ...tasks.value[taskIndex],
          title: editForm.value.title.trim(),
          description: editForm.value.description.trim(),
          reward_points: editForm.value.rewardPoints,
          deadline: editForm.value.deadline,
          expires_in_months: parseInt(editForm.value.expiresInMonths)
        }
      }
      
      successMessage.value = '任务修改成功！'
      closeEditModal()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '任务修改失败'
  } finally {
    isEditing.value = false
  }
}

// 加载任务列表
const loadTasks = async () => {
  try {
    const response = await examinerService.getExaminerTasks()
    if (response.success && response.data.tasks) {
      tasks.value = response.data.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        participants: task.participants || 0,
        completedParticipants: task.completedParticipants || task.completed_participants || 0,
        pendingReviews: task.pendingReviews || task.pending_reviews || 0,
        reward_points: task.reward_points || task.reward || 0,
        status: task.status,
        deadline: task.deadline,
        createdAt: task.created_at || task.createdAt,
        expires_in_months: task.expires_in_months || 0
      }))
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    errorMessage.value = '加载任务列表失败'
  }
}

// 组件挂载时加载任务列表
onMounted(async () => {
  await loadTasks()
})
</script>

<style scoped>
.examiner-task-manage {
  min-height: 100vh;
  background: white;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
  align-items: start;
}

/* 搜索和筛选区域 */
.filter-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #87CEEB;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #95a5a6;
}

.filter-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #87CEEB;
}

/* 右侧统计信息区域 */
.stats-sidebar {
  position: sticky;
  top: 20px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #2c3e50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #87CEEB;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
  font-weight: 500;
}

/* 任务列表区域 */
.tasks-section {
  min-height: 400px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.task-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #87CEEB;
}

.task-card-content {
  flex: 1;
  padding: 20px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.task-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
}

.task-status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 10px;
  white-space: nowrap;
}

.task-status-badge.open {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.task-status-badge.in_progress {
  background: rgba(255, 152, 0, 0.1);
  color: #f57c00;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.task-status-badge.completed {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.task-status-badge.closed {
  background: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
  border: 1px solid rgba(158, 158, 158, 0.3);
}

.task-description {
  margin: 0 0 20px;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.meta-icon {
  font-size: 0.9rem;
  opacity: 0.7;
}

.meta-text {
  color: #6c757d;
  font-weight: 500;
}

/* 进度条 */
.task-progress {
  margin-top: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #6c757d;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #87CEEB, #2196f3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 任务操作按钮 */
.task-actions {
  padding: 15px 20px;
  border-top: 1px solid #f1f3f4;
  background: #f8f9fa;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分页区域 */
.pagination-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.page-btn.active {
  background: #87CEEB;
  color: white;
  border-color: #87CEEB;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state h3 {
  margin: 0 0 10px;
  color: #6c757d;
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0 0 20px;
  color: #adb5bd;
  font-size: 0.9rem;
}

/* 删除确认模态框 */
.delete-modal-content {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.delete-modal-content h4 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1.2rem;
}

.delete-warning {
  margin: 0 0 15px;
  color: #6c757d;
  line-height: 1.5;
}

.participants-warning {
  margin: 0 0 20px;
  color: #e74c3c;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 消息样式 */
.message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.message.error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.message.success {
  background-color: #efe;
  color: #363;
  border: 1px solid #cfc;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tasks-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stats-sidebar {
    position: static;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .tasks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-status-badge {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .task-meta {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .task-actions {
    flex-direction: column;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-numbers {
    order: -1;
  }
}

/* 编辑模态框样式 */
.edit-modal-content {
  padding: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-input, .form-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 4px 0 0;
}

.points-selector, .expires-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.point-option, .expires-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.point-option:hover, .expires-option:hover {
  border-color: #bdc3c7;
}

.point-option.selected, .expires-option.selected {
  border-color: #3498db;
  background-color: #f8fafc;
}

.radio-input {
  display: none;
}

.point-value, .expires-value {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}

.point-desc, .expires-desc {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .points-selector, .expires-selector {
    grid-template-columns: 1fr;
  }
  
  .point-option, .expires-option {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
  
  .point-desc, .expires-desc {
    margin-top: 0;
  }
}

/* 评审模态框样式 */
.review-modal-content {
  padding: 0;
}

.review-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.review-header .task-title {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.review-header .task-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 学生表格样式 */
.student-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.sort-controls {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.sort-buttons {
  display: flex;
  gap: 10px;
}

.sort-btn {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.sort-btn.active {
  background: #87CEEB;
  color: white;
  border-color: #87CEEB;
}

.sort-arrow {
  margin-left: 4px;
  font-weight: bold;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
}

.student-table th {
  background: #f1f3f4;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
  border-bottom: 1px solid #e9ecef;
}

.student-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f3f4;
  font-size: 0.85rem;
}

.student-row:hover {
  background: #f8f9fa;
}

.student-name {
  font-weight: 500;
  color: #2c3e50;
}

.student-email {
  color: #6c757d;
}

.submission-date {
  color: #6c757d;
  font-size: 0.8rem;
}

.review-status {
  font-weight: 500;
  font-size: 0.8rem;
}

.status-pending {
  color: #ff9800;
}

.status-approved {
  color: #4caf50;
}

.status-rejected {
  color: #f44336;
}

.student-actions {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: space-between;
  min-width: 280px;
}

.empty-row {
  background: #fafafa;
}

.empty-row td {
  height: 48px;
}

/* 分页控件 */
.pagination-controls {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.page-info {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.3;
}

.empty-state p {
  margin: 0 0 10px;
  color: #6c757d;
  font-size: 1rem;
}

.empty-hint {
  font-size: 0.9rem;
  color: #adb5bd;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sort-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .sort-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .student-table {
    font-size: 0.8rem;
  }
  
  .student-table th,
  .student-table td {
    padding: 8px 10px;
  }
  
  .student-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
}
</style>