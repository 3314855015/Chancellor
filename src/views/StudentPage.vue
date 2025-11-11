<template>
  <div class="student-page">
    <StudentNav 
      title="🎓 监生面板" 
      subtitle="接取任务 · 提升能力 · 寻求就业"
      @avatar-click="showUserInfoModal = true"
      @promotion-click="showPromotionModal = true"
      @invitation-click="showInvitationModal = true"
    />
    
    <StudentWelcome :student-status="studentInfo.status" />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <!-- 提交成果模态框 -->
      <Modal 
        :visible="showSubmitModal" 
        title="提交任务成果" 
        @close="closeSubmitModal"
      >
        <div class="submit-modal-content">
          <div class="task-info">
            <h4>{{ currentTask?.title }}</h4>
            <p class="task-description">{{ currentTask?.description }}</p>
            <div class="task-meta">
              <span class="meta-item">🎯 奖励：{{ currentTask?.reward }}点</span>
              <span class="meta-item">⏰ 截止：{{ formatTaskDate(currentTask?.deadline) }}</span>
            </div>
          </div>
          
          <div class="submission-form">
            <label for="submission-text">成果描述：</label>
            <textarea 
              id="submission-text"
              v-model="submissionText" 
              placeholder="请详细描述您的任务完成情况、遇到的问题、解决方案等..."
              rows="6"
              class="submission-textarea"
            ></textarea>
          </div>
          
          <!-- 模态框内的错误消息 -->
          <div v-if="modalErrorMessage" class="modal-error-message">
            {{ modalErrorMessage }}
          </div>
          
          <div class="modal-actions">
            <Button 
              label="取消" 
              variant="secondary" 
              @click="closeSubmitModal"
            />
            <Button 
              label="提交成果" 
              variant="primary" 
              @click="confirmSubmitTask"
              :loading="isSubmitting"
              :disabled="!submissionText.trim()"
            />
          </div>
        </div>
      </Modal>
      
      <!-- 个人信息与能力展示 -->
      <section class="section">
        <h2 class="section-title">👤 个人信息 & 💪 能力展示</h2>
        <div class="profile-abilities-container">
          <!-- 个人信息卡片 -->
          <Card class="profile-card">
            <div class="profile-content">
              <div class="profile-avatar">{{ studentInfo.emoji }}</div>
              <div class="profile-info">
                <h3>{{ studentInfo.name }}</h3>
                <p>状态：<span :class="studentInfo.status">{{ studentInfo.statusText }}</span></p>
                <p>当前任务：{{ studentInfo.currentTask || '无' }}</p>
                <div class="profile-stats">
                  <div class="stat-item">
                    <span class="stat-label">能力点数：</span>
                    <span class="stat-value">{{ studentInfo.abilityPoints }}点</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">完成任务：</span>
                    <span class="stat-value">{{ studentInfo.completedTasks }}个</span>
                  </div>
                </div>
                
                <!-- 教师绑定信息 -->
                <div class="teacher-section">
                  <div v-if="studentTeacher" class="teacher-info">
                    <h4>👨‍🏫 指导教师</h4>
                    <div class="teacher-details">
                      <div class="detail-item">
                        <span class="detail-label">👤 教师：</span>
                        <span class="detail-value">{{ studentTeacher.username }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">📧 邮箱：</span>
                        <span class="detail-value">{{ studentTeacher.email }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">📅 绑定时间：</span>
                        <span class="detail-value">{{ formatDate(studentTeacher.joinedAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="teacher-bind">
                    <h4>🔑 绑定教师</h4>
                    <p>请输入教师密钥来绑定指导教师</p>
                    <div class="bind-form">
                      <input 
                        v-model="teacherKeyInput" 
                        placeholder="请输入教师密钥" 
                        class="key-input"
                        :disabled="loading"
                      />
                      <Button 
                        label="🔗 绑定教师" 
                        @click="bindTeacher" 
                        :loading="loading"
                        :disabled="loading || !teacherKeyInput"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <!-- 能力展示卡片 -->
          <Card class="abilities-card">
            <h3 class="abilities-title">💪 能力展示</h3>
            <div class="abilities-grid">
              <div v-for="(ability, index) in abilities" :key="ability.name" class="ability-cell">
                <div class="ability-row">
                  <span class="ability-name">{{ ability.name }}</span>
                  <div class="battery-container">
                    <div class="battery-grid">
                      <div 
                        v-for="i in 10" 
                        :key="i"
                        class="battery-cell"
                        :class="{ 
                          'active': i <= ability.value, 
                          'temp': i > ability.value && i <= (ability.totalValue || ability.value),
                          'editable': !studentTeacher && !isUpdatingAbility
                        }"
                        @click="updateAbilityValue(index, i)"
                      ></div>
                    </div>
                    <span class="ability-score">
                      {{ ability.totalValue || ability.value }}/10
                      <span v-if="ability.tempValue > 0" class="temp-hint">({{ ability.value }} + {{ ability.tempValue }}临时)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <!-- 任务中心 -->
      <section class="section">
        <h2 class="section-title">📋 任务中心</h2>
        
        <!-- 教师绑定提示 -->
        <div v-if="!studentTeacher" class="teacher-bind-prompt">
          <div class="bind-prompt-content">
            <span class="prompt-icon">🔑</span>
            <div class="prompt-text">
              <h4>绑定教师后查看任务</h4>
              <p>请先绑定指导教师，才能查看和接取任务</p>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="tasks-tabs">
            <Button 
              label="可接任务" 
              :variant="activeTab === 'available' ? 'primary' : 'secondary'"
              @click="activeTab = 'available'; currentPage = 1" 
            />
            <Button 
              label="已接任务" 
              :variant="activeTab === 'accepted' ? 'primary' : 'secondary'"
              @click="activeTab = 'accepted'; currentPage = 1" 
            />
            <Button 
              label="已完成任务" 
              :variant="activeTab === 'completed' ? 'primary' : 'secondary'"
              @click="activeTab = 'completed'; currentPage = 1" 
            />
          </div>

          <!-- 任务列表 - 一行4个容器 -->
          <div class="tasks-grid-container">
            <div v-if="paginatedTasks.length === 0" class="no-tasks">
              <div class="no-tasks-content">
                <span class="no-tasks-icon">📭</span>
                <h4>暂无{{ getTabName(activeTab) }}</h4>
                <p>当前没有{{ getTabName(activeTab) }}，请等待教师发布新任务</p>
              </div>
            </div>
            
            <div v-else class="tasks-grid">
              <Card 
                v-for="task in paginatedTasks" 
                :key="task.id" 
                class="task-card" 
                hoverable
              >
                <div class="task-card-content">
                  <div class="task-header">
                    <h4 class="task-title">{{ task.title }}</h4>
                    <span class="task-status" :class="task.status">
                      {{ getTaskStatusText(task.status) }}
                    </span>
                  </div>
                  
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-meta-grid">
                    <div class="meta-item">
                      <span class="meta-icon">🎯</span>
                      <span class="meta-text">奖励：{{ task.reward }}点</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">⏰</span>
                      <span class="meta-text">{{ formatTaskDate(task.deadline) }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">👨‍🏫</span>
                      <span class="meta-text">{{ task.publisher }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-icon">📅</span>
                      <span class="meta-text">{{ formatTaskDate(task.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="task-actions">
                  <Button 
                    v-if="task.status === 'available'" 
                    label="接取任务" 
                    @click="acceptTask(task)"
                    size="small"
                  />
                  <Button 
                    v-if="task.status === 'accepted'" 
                    label="提交成果" 
                    variant="warning"
                    @click="submitTask(task)"
                    size="small"
                  />
                  <Button 
                    v-if="task.status === 'submitted'" 
                    label="待评审" 
                    variant="secondary"
                    disabled 
                    size="small"
                  />
                  <Button 
                    v-if="task.status === 'completed'" 
                    label="已完成" 
                    variant="secondary"
                    disabled 
                    size="small"
                  />
                </div>
              </Card>
            </div>
          </div>

          <!-- 分页栏 - 常态显示 -->
          <div v-if="filteredTasks.length > 0" class="pagination-container">
            <div class="pagination-info">
              共 {{ filteredTasks.length }} 个任务，第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
            </div>
            <div class="pagination-controls">
              <Button 
                label="上一页" 
                variant="secondary"
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage <= 1"
                size="small"
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
                <span v-if="showEllipsis" class="page-ellipsis">...</span>
              </div>
              
              <Button 
                label="下一页" 
                variant="secondary"
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                size="small"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 企业消息 -->
      <section class="section">
        <h2 class="section-title">✉️ 企业消息</h2>
        
        <!-- 消息加载状态 -->
        <div v-if="loadingMessages" class="messages-loading">
          <div class="loading-content">
            <span class="loading-icon">⏳</span>
            <p>正在加载企业消息...</p>
          </div>
        </div>
        
        <!-- 悬浮消息卡片容器 -->
        <div v-else-if="studentMessages.length > 0" class="floating-message-cards">
          <div class="cards-container">
            <div v-for="message in studentMessages" :key="message.messageId" class="message-card" :data-message-id="message.messageId">
              <div class="message-header">
                <div class="message-avatar">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div class="message-info">
                  <h3>{{ message.senderName }}</h3>
                  <p class="contact-info">📧 {{ message.senderEmail }}</p>
                </div>
                <div class="message-meta">
                  <span class="message-time">{{ formatMessageTime(message.createdAt) }}</span>
                  <span v-if="!message.isRead" class="unread-badge">新</span>
                </div>
              </div>
              <div class="message-content">
                <p>{{ message.messageContent }}</p>
              </div>
              
              <!-- 操作按钮 -->
              <div class="message-actions">
                <button 
                  class="accept-btn"
                  @click="handleAccept(message)"
                  :disabled="message.isProcessed"
                >
                  上任
                </button>
                <button 
                  class="reject-btn"
                  @click="handleReject(message)"
                  :disabled="message.isProcessed"
                >
                  拒绝
                </button>
              </div>
            </div>
          </div>
          
          <!-- 消息分页 -->
          <div class="messages-pagination">
            <div class="pagination-info">
              第 {{ messagesCurrentPage }} 页 / 共 {{ messagesTotalPages }} 页
            </div>
            <div class="pagination-controls">
              <Button 
                label="上一页" 
                variant="secondary"
                @click="loadMessages(messagesCurrentPage - 1)"
                :disabled="messagesCurrentPage <= 1"
                size="small"
              />
              
              <div class="page-numbers">
                <button 
                  v-for="page in visibleMessagePages" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: page === messagesCurrentPage }"
                  @click="loadMessages(page)"
                >
                  {{ page }}
                </button>
                <span v-if="showMessageEllipsis" class="page-ellipsis">...</span>
              </div>
              
              <Button 
                label="下一页" 
                variant="secondary"
                @click="loadMessages(messagesCurrentPage + 1)"
                :disabled="messagesCurrentPage >= messagesTotalPages"
                size="small"
              />
            </div>
          </div>
        </div>
        
        <!-- 无消息状态 -->
        <div v-else class="no-messages">
          <div class="no-messages-content">
            <span class="no-messages-icon">📭</span>
            <h4>暂无企业消息</h4>
            <p>目前没有企业发送的消息，请耐心等待机会</p>
          </div>
        </div>
      </section>

      <!-- 就业机会 -->
      <section class="section">
        <h2 class="section-title">💼 就业机会</h2>
        <div class="employment-list">
          <Card v-for="opportunity in employmentOpportunities" :key="opportunity.id" 
                class="opportunity-card" hoverable>
            <div class="opportunity-header">
              <h4>{{ opportunity.company }}</h4>
              <span class="opportunity-type">{{ opportunity.type }}</span>
            </div>
            <p class="opportunity-position">{{ opportunity.position }}</p>
            <div class="opportunity-requirements">
              <span>要求能力：{{ opportunity.requiredAbility }}+</span>
              <span>薪资：{{ opportunity.salary }}</span>
            </div>
            <Button 
              label="申请职位" 
              @click="applyOpportunity(opportunity)"
              :disabled="studentInfo.abilityPoints < opportunity.requiredAbility"
            />
          </Card>
        </div>
      </section>
    </main>

    <Footer />

    <!-- 用户信息模态框 -->
    <UserInfoModal 
      v-model:visible="showUserInfoModal"
      @close="showUserInfoModal = false"
    />

    <!-- 升官模态框 -->
    <PromotionModal 
      v-model:visible="showPromotionModal"
      @close="showPromotionModal = false"
      @success="handlePromotionSuccess"
    />

    <!-- 接受邀约模态框 -->
    <InvitationModal 
      v-model:visible="showInvitationModal"
      @close="showInvitationModal = false"
      @success="handleInvitationSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StudentNav from '@/components/Nav/StudentNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import StudentWelcome from '@/components/Welcome/StudentWelcome.vue'
import Modal from '@/components/Modals/BaseModal.vue'
import UserInfoModal from '@/components/Modals/UserInfoModal.vue'
import PromotionModal from '@/components/Modals/PromotionModal.vue'
import InvitationModal from '@/components/Modals/InvitationModal.vue'
import studentService from '@/services/studentService'

// 响应式数据
const activeTab = ref('available')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const teacherKeyInput = ref('')
const isUpdatingAbility = ref(false)
const currentPage = ref(1)
const pageSize = ref(8) // 每页显示8个任务（2行，每行4个）

// 提交成果模态框相关
const showSubmitModal = ref(false)
const isSubmitting = ref(false)
const currentTask = ref<any>(null)
const submissionText = ref('')
const modalErrorMessage = ref('')

// 学生信息
const studentInfo = ref({
  name: '',
  emoji: '👨‍🎓',
  status: '',
  statusText: '',
  abilityPoints: 0,
  completedTasks: 0,
  currentTask: ''
})

// 教师信息
const studentTeacher = ref<any>(null)

// 用户信息模态框
const showUserInfoModal = ref(false)

// 升官模态框
const showPromotionModal = ref(false)

// 接受邀约模态框
const showInvitationModal = ref(false)

// 处理升官成功
const handlePromotionSuccess = () => {
  // 身份升级成功，跳转到主页面（下次登录会直接进入对应角色页面）
  window.location.href = '/'
}

// 处理接受邀约成功
const handleInvitationSuccess = () => {
  // 身份升级成功，跳转到主页面（下次登录会直接进入对应角色页面）
  window.location.href = '/'
}

// 能力数据
const abilities = ref([
  { name: '前端开发', icon: '💻', value: 0, tempValue: 0, totalValue: 0 },
  { name: '安卓开发', icon: '📱', value: 0, tempValue: 0, totalValue: 0 },
  { name: '后端开发', icon: '⚙️', value: 0, tempValue: 0, totalValue: 0 },
  { name: '人工智能', icon: '🤖', value: 0, tempValue: 0, totalValue: 0 },
  { name: '沟通能力', icon: '💬', value: 0, tempValue: 0, totalValue: 0 },
  { name: '创造力', icon: '💡', value: 0, tempValue: 0, totalValue: 0 },
  { name: '领导力', icon: '👑', value: 0, tempValue: 0, totalValue: 0 }
])

// 任务数据
const tasks = ref<any[]>([])

// 就业机会数据
const employmentOpportunities = ref<any[]>([])

// 企业消息数据
const studentMessages = ref<any[]>([])
const loadingMessages = ref(false)
const messagesCurrentPage = ref(1)
const messagesPageSize = ref(3) // 每页显示3个消息
const messagesTotalPages = ref(1)

// 计算属性：根据标签过滤任务
const filteredTasks = computed(() => {
  if (activeTab.value === 'completed') {
    // 完成任务标签页显示已提交和已完成的任务
    return tasks.value.filter(task => task.status === 'submitted' || task.status === 'completed')
  }
  return tasks.value.filter(task => task.status === activeTab.value)
})

// 分页相关计算属性
const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / pageSize.value)
})

const paginatedTasks = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredTasks.value.slice(startIndex, endIndex)
})

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

const showEllipsis = computed(() => {
  return totalPages.value > visiblePages.value.length && 
         visiblePages.value[visiblePages.value.length - 1] < totalPages.value
})

// 消息相关的计算属性
const visibleMessagePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  let startPage = Math.max(1, messagesCurrentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(messagesTotalPages.value, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

const showMessageEllipsis = computed(() => {
  return messagesTotalPages.value > visibleMessagePages.value.length && 
         visibleMessagePages.value[visibleMessagePages.value.length - 1] < messagesTotalPages.value
})

// 获取学生状态文本
const getStatusText = (status: string | null) => {
  switch (status) {
    case 'wild': return '在野'
    case 'selected': return '中举'
    default: return '未知'
  }
}

// 获取任务状态文本
const getTaskStatusText = (status: string | null) => {
  switch (status) {
    case 'available': return '可接取'
    case 'accepted': return '已接取'
    case 'submitted': return '待评审'
    case 'completed': return '已完成'
    default: return '未知'
  }
}

// 获取标签名称
const getTabName = (tab: string) => {
  switch (tab) {
    case 'available': return '可接任务'
    case 'accepted': return '已接任务'
    case 'completed': return '已完成任务'
    default: return '任务'
  }
}

// 格式化任务日期
const formatTaskDate = (dateString: string) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return '已过期'
  } else if (diffDays === 0) {
    return '今天截止'
  } else if (diffDays === 1) {
    return '明天截止'
  } else if (diffDays <= 7) {
    return `${diffDays}天后截止`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 分页方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 网络请求函数

// 加载学生信息
const loadStudentInfo = async () => {
  try {
    const response = await studentService.getStudentInfo()
    if (response.success && response.data.student) {
      const student = response.data.student
      studentInfo.value = {
        name: student.username || '用户',
        emoji: '👨‍🎓',
        status: student.studentStatus || 'wild',
        statusText: getStatusText(student.studentStatus),
        abilityPoints: student.abilityPoints || 0,
        completedTasks: student.completedTasks || 0,
        currentTask: student.currentTask || '无'
      }
    }
  } catch (error) {
    console.error('加载学生信息失败:', error)
  }
}

// 加载教师信息
const loadStudentTeacher = async () => {
  try {
    const response = await studentService.getStudentTeacher()
    if (response.success) {
      studentTeacher.value = response.data.teacher
    }
  } catch (error) {
    console.error('加载教师信息失败:', error)
  }
}

// 加载能力数据
const loadStudentAbilities = async () => {
  try {
    // 使用新的RPC函数获取学生实际能力数据（包含基础值和临时值）
    const response = await studentService.getStudentActualAbilities()
    if (response.success) {
      // 确保返回的能力数据包含必需的属性
      abilities.value = response.data.abilities.map((ability: any) => ({
        ...ability,
        tempValue: ability.tempValue || 0,
        // 强制重新计算总值，确保正确计算基础值+临时值
        totalValue: (ability.value || 0) + (ability.tempValue || 0)
      }))
      
      // 更新学生总能力点数 - 使用总值（基础值+临时值）
      const totalPoints = abilities.value.reduce((sum, ability) => {
        const totalValue = ability.totalValue || (ability.value + (ability.tempValue || 0))
        return sum + totalValue
      }, 0)
      studentInfo.value.abilityPoints = totalPoints
    }
  } catch (error) {
    console.error('加载能力数据失败:', error)
  }
}

// 加载任务列表
const loadStudentTasks = async () => {
  try {
    const response = await studentService.getStudentTasks()
    if (response.success) {
      tasks.value = response.data.tasks
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
  }
}

// 加载就业机会
const loadEmploymentOpportunities = async () => {
  try {
    const response = await studentService.getEmploymentOpportunities()
    if (response.success) {
      employmentOpportunities.value = response.data.opportunities
    }
  } catch (error) {
    console.error('加载就业机会失败:', error)
  }
}

// 绑定教师
const bindTeacher = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    if (!teacherKeyInput.value.trim()) {
      throw new Error('请输入教师密钥')
    }
    
    const response = await studentService.bindTeacher(teacherKeyInput.value.trim())
    
    if (response.success && response.data.teacher) {
      studentTeacher.value = response.data.teacher
      successMessage.value = '教师绑定成功！'
      teacherKeyInput.value = ''
      
      // 绑定教师成功后立即重新加载所有相关数据
      await Promise.all([
        loadStudentInfo(),
        loadStudentTeacher(),
        loadStudentAbilities(),
        loadStudentTasks(),
        loadEmploymentOpportunities()
      ])
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '绑定教师失败'
  } finally {
    loading.value = false
  }
}

// 接取任务
const acceptTask = async (task: any) => {
  try {
    const response = await studentService.acceptTask(task.id)
    if (response.success) {
      // 重新加载任务列表
      await loadStudentTasks()
      // 重新加载学生信息
      await loadStudentInfo()
      successMessage.value = `已接取任务：${task.title}`
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '接取任务失败'
  }
}

// 打开提交成果模态框
const openSubmitModal = (task: any) => {
  currentTask.value = task
  submissionText.value = ''
  modalErrorMessage.value = ''
  showSubmitModal.value = true
}

// 关闭提交成果模态框
const closeSubmitModal = () => {
  showSubmitModal.value = false
  currentTask.value = null
  submissionText.value = ''
  isSubmitting.value = false
  modalErrorMessage.value = ''
}

// 确认提交任务
const confirmSubmitTask = async () => {
  if (!currentTask.value || !submissionText.value.trim()) return
  
  try {
    isSubmitting.value = true
    modalErrorMessage.value = ''
    
    const response = await studentService.submitTask(currentTask.value.id, submissionText.value.trim())
    if (response.success) {
      // 重新加载任务列表
      await loadStudentTasks()
      successMessage.value = `任务 ${currentTask.value.title} 已提交，等待教师评审`
      closeSubmitModal()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    // 在模态框内显示错误消息，而不是页面顶部
    modalErrorMessage.value = error instanceof Error ? error.message : '提交任务失败'
  } finally {
    isSubmitting.value = false
  }
}

// 提交任务（兼容旧代码，现在使用模态框）
const submitTask = async (task: any) => {
  openSubmitModal(task)
}

// 申请就业机会
const applyOpportunity = async (opportunity: any) => {
  try {
    if (studentInfo.value.abilityPoints < opportunity.requiredAbility) {
      errorMessage.value = `能力不足，需要 ${opportunity.requiredAbility} 点能力值，当前只有 ${studentInfo.value.abilityPoints} 点`
      return
    }
    
    const response = await studentService.applyEmploymentOpportunity(opportunity.id)
    if (response.success) {
      successMessage.value = `已申请 ${opportunity.company} 的 ${opportunity.position} 职位`
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '申请职位失败'
  }
}

// 更新能力值
const updateAbilityValue = async (abilityIndex: number, newValue: number) => {
  // 如果已绑定教师，不允许修改能力值
  if (studentTeacher.value) {
    errorMessage.value = '已绑定教师，能力值由教师评定'
    return
  }
  
  try {
    isUpdatingAbility.value = true
    
    // 更新本地能力值
    abilities.value[abilityIndex].value = newValue
    
    // 更新总能力点数
    const totalPoints = abilities.value.reduce((sum, ability) => sum + ability.value, 0)
    studentInfo.value.abilityPoints = totalPoints
    
    // 这里可以添加保存到数据库的逻辑
    // await studentService.updateStudentAbilities(abilities.value)
    
    successMessage.value = `${abilities.value[abilityIndex].name} 能力已更新为 ${newValue} 点`
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '更新能力值失败'
  } finally {
    isUpdatingAbility.value = false
  }
}

// 加载学生消息
const loadMessages = async (page: number) => {
  try {
    loadingMessages.value = true
    
    const response = await studentService.getStudentMessages(page, messagesPageSize.value)
    
    if (response.success) {
      studentMessages.value = response.data.messages.map((msg: any) => ({
        ...msg,
        isProcessed: false // 添加处理状态标记
      }))
      messagesCurrentPage.value = response.data.currentPage
      messagesTotalPages.value = response.data.totalPages
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    // 不显示错误消息，避免干扰用户体验
  } finally {
    loadingMessages.value = false
  }
}

// 格式化消息时间
const formatMessageTime = (timestamp: string) => {
  const now = new Date()
  const messageTime = new Date(timestamp)
  const diffMs = now.getTime() - messageTime.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return messageTime.toLocaleDateString('zh-CN')
  }
}

// 上任处理函数
const handleAccept = async (message: any) => {
  try {
    // 更新前端状态
    message.isProcessed = true
    
    // 使用RPC函数更新数据库状态
    const response = await studentService.updateStudentStatus('selected')
    
    if (response.success) {
      // 更新学生状态显示
      await loadStudentInfo()
      successMessage.value = '上任成功！您的状态已更新为中举'
      
      // 添加已处理样式
      const messageCard = document.querySelector(`.message-card[data-message-id="${message.messageId}"]`)
      if (messageCard) {
        messageCard.classList.add('processed')
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('上任处理失败:', error)
    // 恢复状态
    message.isProcessed = false
    errorMessage.value = error instanceof Error ? error.message : '上任处理失败'
  }
}

// 拒绝处理函数
const handleReject = (message: any) => {
  // 标记为已处理
  message.isProcessed = true
  
  // 在控制台输出
  console.log('已拒绝')
  
  // 添加已处理样式
  const messageCard = document.querySelector(`.message-card[data-message-id="${message.messageId}"]`)
  if (messageCard) {
    messageCard.classList.add('processed')
  }
  
  successMessage.value = '已拒绝该邀请'
}

// 组件挂载时加载所有数据
onMounted(async () => {
  await Promise.all([
    loadStudentInfo(),
    loadStudentTeacher(),
    loadStudentAbilities(),
    loadStudentTasks(),
    loadEmploymentOpportunities()
  ])
  loadMessages(1) // 加载第一页消息
})
</script>

<style scoped>
.student-page {
  min-height: 100vh;
  background: white;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px;
}

.section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 40px;
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  border-radius: 2px;
}

/* 个人信息与能力展示容器 */
.profile-abilities-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 35px;
  margin-top: 30px;
  align-items: stretch;
}

.profile-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 2px solid #f0f4f8;
  box-shadow: 0 8px 30px rgba(135, 206, 235, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(135, 206, 235, 0.25);
  border-color: #87CEEB;
}

.abilities-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 2px solid #f0f4f8;
  box-shadow: 0 8px 30px rgba(135, 206, 235, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.abilities-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(135, 206, 235, 0.25);
  border-color: #87CEEB;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 30px;
}

.profile-avatar {
  font-size: 3rem;
}

.profile-info h3 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.profile-info p {
  margin: 5px 0;
  color: #7f8c8d;
}

.profile-info .active {
  color: #4caf50;
  font-weight: bold;
}

.profile-stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #95a5a6;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #f57c00;
}

/* 教师绑定相关样式 */
.teacher-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.teacher-section h4 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.teacher-details {
  margin-top: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.detail-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.teacher-bind p {
  margin: 0 0 15px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.bind-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.key-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.key-input:focus {
  outline: none;
  border-color: #87CEEB;
  box-shadow: 0 0 0 2px rgba(135, 206, 235, 0.2);
}

.key-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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

/* 能力展示样式 */
.abilities-title {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 1.2rem;
  text-align: center;
}

.abilities-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  padding: 30px;
}

.ability-cell {
  padding: 12px 16px;
  border: 2px solid #f0f4f8;
  border-radius: 12px;
  background: #f8f9fa;
  min-height: 60px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.ability-cell:hover {
  border-color: #87CEEB;
  box-shadow: 0 4px 15px rgba(135, 206, 235, 0.2);
}

.ability-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
}

.ability-name {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
  min-width: 80px;
  text-align: left;
}

.battery-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 300px;
}

.battery-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
  flex: 1;
}

.battery-cell {
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 2px;
  background: #f5f5f5;
  transition: all 0.2s ease;
  cursor: pointer;
}

.battery-cell.active {
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  border-color: #87CEEB;
  box-shadow: 0 1px 2px rgba(135, 206, 235, 0.3);
}

.battery-cell.temp {
  background: linear-gradient(135deg, #ffc107 0%, #ffd54f 100%);
  border-color: #ffa000;
  box-shadow: 0 1px 2px rgba(255, 193, 7, 0.3);
}

.battery-cell.editable:hover {
  transform: scale(1.05);
  border-color: #87CEEB;
}

.battery-cell.editable:active {
  transform: scale(0.95);
}

.ability-score {
  font-size: 0.8rem;
  color: #95a5a6;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
}

.temp-hint {
  font-size: 0.7rem;
  color: #ffa000;
  font-weight: normal;
}

/* 教师绑定提示样式 */
.teacher-bind-prompt {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  margin: 20px 0;
}

.bind-prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.prompt-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.prompt-text h4 {
  margin: 0 0 8px;
  color: #495057;
  font-size: 1.2rem;
}

.prompt-text p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.tasks-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

/* 任务网格容器 */
.tasks-grid-container {
  min-height: 300px;
  background: white;
  border-radius: 16px;
  border: 2px solid #f0f4f8;
  box-shadow: 0 8px 30px rgba(135, 206, 235, 0.15);
  transition: all 0.3s ease;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.tasks-grid-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(135, 206, 235, 0.25);
  border-color: #87CEEB;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

/* 任务卡片样式 */
.task-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 2px solid #f0f4f8;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(135, 206, 235, 0.1);
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(135, 206, 235, 0.25);
  border-color: #87CEEB;
}

.task-card-content {
  flex: 1;
  padding: 25px;
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

.task-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 10px;
}

.task-status.available {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.task-status.accepted {
  background: rgba(255, 152, 0, 0.1);
  color: #f57c00;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.task-status.completed {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.3);
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

.task-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.task-actions {
  padding: 20px;
  border-top: 2px solid #f0f4f8;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
}

/* 无任务状态 */
.no-tasks {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 20px;
}

.no-tasks-content {
  text-align: center;
  max-width: 300px;
}

.no-tasks-icon {
  font-size: 4rem;
  opacity: 0.3;
  margin-bottom: 15px;
  display: block;
}

.no-tasks h4 {
  margin: 0 0 8px;
  color: #6c757d;
  font-size: 1.1rem;
}

.no-tasks p {
  margin: 0;
  color: #adb5bd;
  font-size: 0.9rem;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-top: 20px;
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

.page-ellipsis {
  padding: 6px 8px;
  color: #6c757d;
  font-size: 0.85rem;
}

.employment-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.opportunity-card {
  padding: 20px;
  text-align: left;
}

.opportunity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.opportunity-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.opportunity-type {
  background: rgba(135, 206, 235, 0.2);
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.opportunity-position {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.opportunity-requirements {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #95a5a6;
}

@media (max-width: 768px) {
  .profile-abilities-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .profile-content {
    flex-direction: column;
    text-align: center;
  }
  
  .ability-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .ability-progress {
    width: 100%;
    max-width: none;
  }
  
  .task-item {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .employment-list {
    grid-template-columns: 1fr;
  }
  
  .tasks-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  /* 任务网格响应式 */
  .tasks-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .task-card-content {
    padding: 15px;
  }
  
  .task-meta-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .pagination-container {
    padding: 15px;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .page-numbers {
    order: -1;
  }
}

@media (max-width: 480px) {
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-status {
    margin-left: 0;
    align-self: flex-start;
  }
}

/* 提交成果模态框样式 */
.submit-modal-content {
  padding: 20px;
}

.task-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
}

.task-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.task-info .task-description {
  margin: 0 0 15px 0;
  color: #6c757d;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #495057;
}

.submission-form {
  margin-bottom: 20px;
}

.submission-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.submission-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.submission-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.submission-textarea::placeholder {
  color: #adb5bd;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.modal-error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  padding: 12px;
  margin: 15px 0;
  font-size: 0.9rem;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .submit-modal-content {
    padding: 15px;
  }
  
  .task-info {
    padding: 15px;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
}

/* 企业消息样式 */
.messages-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.loading-content {
  text-align: center;
  color: #6c757d;
}

.loading-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  display: block;
}

/* 悬浮消息卡片样式 */
.floating-message-cards {
  position: relative;
  background: white;
  padding: 40px 20px;
  margin-bottom: 40px;
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  padding: 25px;
}

.cards-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #87CEEB;
}

.message-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  width: 100%;
  max-width: 380px;
}

.message-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.message-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.message-avatar svg {
  width: 40px;
  height: 40px;
  fill: #95a5a6;
}

.message-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: 600;
  flex: 1;
}

.contact-info {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  background: rgba(135, 206, 235, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.message-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
}

.message-time {
  color: #adb5bd;
  font-size: 0.8rem;
  white-space: nowrap;
}

.unread-badge {
  background: #87CEEB;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.message-content {
  margin-bottom: 0;
  line-height: 1.6;
  color: #5a6c7d;
  font-size: 0.95rem;
  background: rgba(135, 206, 235, 0.05);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #87CEEB;
  flex: 1;
  display: flex;
  align-items: flex-start;
  overflow-y: auto;
  max-height: 160px;
}

.no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  margin: 20px 0;
}

.no-messages-content {
  text-align: center;
}

.no-messages-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
  opacity: 0.7;
}

.no-messages h4 {
  margin: 0 0 10px;
  color: #495057;
  font-size: 1.2rem;
}

.no-messages p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.messages-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-top: 20px;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 企业消息响应式设计 */
@media (max-width: 768px) {
  .messages-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .message-meta {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
  
  .messages-pagination {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 1200px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .message-card {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .message-card {
    max-width: 100%;
  }
}

@media (max-width: 1200px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .message-card {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .message-card {
    max-width: 100%;
  }
}

/* 消息操作按钮样式 */
.message-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: space-between;
}

.accept-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.accept-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.accept-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.reject-btn {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.reject-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.reject-btn:disabled {
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 已处理消息的样式 */
.message-card.processed {
  opacity: 0.7;
  background: #f8f9fa;
}

.message-card.processed .message-actions {
  opacity: 0.5;
}

@media (max-width: 480px) {
  .message-card {
    padding: 15px;
  }
  
  .messages-pagination {
    padding: 15px;
  }
  
  .message-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .accept-btn,
  .reject-btn {
    width: 100%;
  }
}

</style>