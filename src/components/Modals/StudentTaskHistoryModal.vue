<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📋 学生任务历史</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 学生基本信息 -->
        <div class="student-info-section">
          <div class="student-avatar">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="student-details">
            <h4>{{ studentInfo?.username || '未知学生' }}</h4>
            <p class="student-email">{{ studentInfo?.email || '暂无邮箱' }}</p>
            <p class="student-status">状态: {{ getStatusText(studentInfo?.studentStatus) }}</p>
            <p class="join-date">加入时间: {{ formatDate(studentInfo?.createdAt) }}</p>
          </div>
        </div>

        <!-- 任务历史 -->
        <div class="task-history-section">
          <h4>任务记录</h4>
          
          <div v-if="taskHistory && taskHistory.length > 0" class="task-list">
            <div 
              v-for="task in taskHistory" 
              :key="task.assignment.id"
              class="task-item"
            >
              <div class="task-header">
                <h5 class="task-title">{{ task.task.title }}</h5>
                <span class="task-status" :class="getStatusClass(task.assignment.status)">
                  {{ getStatusText(task.assignment.status) }}
                </span>
              </div>
              
              <div class="task-details">
                <div class="task-info">
                  <span class="task-publisher">发布者: {{ task.task.publisher }}</span>
                  <span class="task-reward">奖励: {{ task.task.reward }}点</span>
                  <span class="task-deadline">截止: {{ formatDate(task.task.deadline) }}</span>
                </div>
                
                <div v-if="task.assignment.awardedPoints" class="awarded-points">
                  <span class="points-label">获得点数:</span>
                  <span class="points-value">{{ task.assignment.awardedPoints }}点</span>
                </div>
                
                <div v-if="task.assignment.submittedAt" class="submission-info">
                  <span class="submission-date">提交时间: {{ formatDate(task.assignment.submittedAt) }}</span>
                </div>
                
                <div v-if="task.assignment.reviewedAt" class="review-info">
                  <span class="review-date">审核时间: {{ formatDate(task.assignment.reviewedAt) }}</span>
                </div>
              </div>
              
              <div v-if="task.assignment.submission" class="task-submission">
                <p class="submission-label">提交内容:</p>
                <p class="submission-content">{{ task.assignment.submission }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="no-tasks">
            <p>该学生暂无任务记录</p>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <LoadingSpinner />
          <p>正在加载任务历史...</p>
        </div>

        <!-- 错误状态 -->
        <div v-if="error" class="error-section">
          <p class="error-message">{{ error }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <Button label="关闭" @click="closeModal" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/Button.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import enterpriseService from '@/services/enterpriseService'
import type { StudentInfo, StudentTaskHistory } from '@/services/enterpriseService'

interface Props {
  studentId: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const studentInfo = ref<StudentInfo | null>(null)
const taskHistory = ref<StudentTaskHistory[] | null>(null)
const loading = ref(true)
const error = ref<string>('')

onMounted(async () => {
  await loadStudentData()
})

const loadStudentData = async () => {
  try {
    loading.value = true
    error.value = ''

    // 并行加载学生信息和任务历史
    const [infoResult, historyResult] = await Promise.all([
      enterpriseService.getStudentInfo(props.studentId),
      enterpriseService.getStudentTaskHistory(props.studentId)
    ])

    studentInfo.value = infoResult
    taskHistory.value = historyResult

    if (!infoResult) {
      error.value = '未找到学生信息'
    }
  } catch (err) {
    console.error('加载学生数据失败:', err)
    error.value = '加载任务历史失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
}

const getStatusText = (status: string | null) => {
  if (!status) return '未知'
  
  switch (status.toLowerCase()) {
    case 'wild': return '在野'
    case 'selected': return '中举'
    case 'assigned': return '已分配'
    case 'submitted': return '已提交'
    case 'completed': return '已完成'
    case 'reviewed': return '已审核'
    default: return status
  }
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'reviewed':
      return 'status-completed'
    case 'submitted':
      return 'status-submitted'
    case 'assigned':
      return 'status-assigned'
    default:
      return 'status-default'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '未设置'
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #95a5a6;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: #f8f9fa;
  color: #2c3e50;
}

.modal-body {
  padding: 25px;
}

.student-info-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.student-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.student-avatar svg {
  width: 50px;
  height: 50px;
  fill: #95a5a6;
}

.student-details h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.student-email,
.student-status,
.join-date {
  margin: 4px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.task-history-section h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: #87CEEB;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.2);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.task-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-submitted {
  background: #fff3cd;
  color: #856404;
}

.status-assigned {
  background: #d1ecf1;
  color: #0c5460;
}

.status-default {
  background: #f8f9fa;
  color: #6c757d;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.task-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.task-publisher,
.task-reward,
.task-deadline {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.awarded-points {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.points-value {
  color: #f57c00;
  font-weight: 600;
  font-size: 1rem;
}

.submission-info,
.review-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.task-submission {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.submission-label {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 600;
}

.submission-content {
  margin: 0;
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.4;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #87CEEB;
}

.no-tasks {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.loading-section,
.error-section {
  text-align: center;
  padding: 40px 20px;
}

.error-message {
  color: #e74c3c;
  font-size: 1rem;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
  text-align: right;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .student-info-section {
    flex-direction: column;
    text-align: center;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .task-info {
    flex-direction: column;
    gap: 8px;
  }

  .task-submission {
    margin-top: 15px;
  }
}
</style>