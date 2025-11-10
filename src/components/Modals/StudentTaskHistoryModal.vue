<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📋 学生最新任务</h3>
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

        <!-- 最新任务 -->
        <div class="task-history-section">
          <h4>最新完成的任务</h4>
          
          <div v-if="latestTask" class="latest-task">
            <div class="task-item">
              <div class="task-header">
                <h5 class="task-title">{{ latestTask.task_title }}</h5>
                <span class="task-status status-completed">
                  已完成
                </span>
              </div>
              
              <div class="task-details">
                <div class="task-info">
                  <span class="task-publisher">发布者: {{ latestTask.examiner_username }}</span>
                  <span class="task-reward">奖励: {{ latestTask.reward_points }}点</span>
                  <span class="task-ability">能力类型: {{ getAbilityText(latestTask.ability_type) }}</span>
                </div>
                
                <div v-if="latestTask.submission_date" class="submission-info">
                  <span class="submission-date">提交时间: {{ formatDate(latestTask.submission_date) }}</span>
                </div>
                
                <div v-if="latestTask.completion_date" class="review-info">
                  <span class="review-date">完成时间: {{ formatDate(latestTask.completion_date) }}</span>
                </div>
                
                <div v-if="latestTask.awarded_points" class="awarded-points">
                  <span class="points-label">获得点数:</span>
                  <span class="points-value">{{ latestTask.awarded_points }}点</span>
                </div>
              </div>
              
              <div v-if="latestTask.task_description" class="task-description">
                <p class="description-label">任务描述:</p>
                <p class="description-content">{{ latestTask.task_description }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="no-tasks">
            <p>该学生暂无已完成任务记录</p>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <LoadingSpinner />
          <p>正在加载任务信息...</p>
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
import { supabase } from '@/lib/supabase.client'
import enterpriseService from '@/services/enterpriseService'
import type { StudentInfo } from '@/services/enterpriseService'

interface Props {
  studentId: string
}

interface Emits {
  (e: 'close'): void
}

interface LatestTask {
  task_id: string
  task_title: string
  task_description: string
  examiner_username: string
  examiner_email: string
  ability_type: string
  reward_points: number
  submission_date: string
  completion_date: string
  awarded_points: number
  task_status: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const studentInfo = ref<StudentInfo | null>(null)
const latestTask = ref<LatestTask | null>(null)
const loading = ref(true)
const error = ref<string>('')

onMounted(async () => {
  await loadStudentData()
})

const loadStudentData = async () => {
  try {
    loading.value = true
    error.value = ''

    // 并行加载学生信息和最新任务
    const [infoResult, latestTaskResult] = await Promise.all([
      enterpriseService.getStudentInfo(props.studentId),
      getStudentLatestTask(props.studentId)
    ])

    studentInfo.value = infoResult
    
    if (latestTaskResult.success && latestTaskResult.data?.latest_task) {
      latestTask.value = latestTaskResult.data.latest_task
    }

    if (!infoResult) {
      error.value = '未找到学生信息'
    }
  } catch (err) {
    console.error('加载学生数据失败:', err)
    error.value = '加载任务信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const getStudentLatestTask = async (studentId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_enterprise_student_latest_task', {
      p_student_id: studentId
    })

    if (error) {
      console.error('调用RPC函数失败:', error)
      return { success: false, data: null }
    }

    // RPC函数返回的是完整的JSON对象，需要直接返回
    return data
  } catch (err) {
    console.error('获取学生最新任务异常:', err)
    return { success: false, data: null }
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
    default: return status
  }
}

const getAbilityText = (abilityType: string) => {
  switch (abilityType?.toLowerCase()) {
    case 'frontend': return '前端开发'
    case 'android': return '安卓开发'
    case 'backend': return '后端开发'
    case 'ai': return '人工智能'
    case 'communication': return '沟通能力'
    case 'creativity': return '创造力'
    case 'leadership': return '领导力'
    case 'general': return '通用能力'
    default: return abilityType || '通用能力'
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

        .latest-task {
          display: block;
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
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .task-publisher,
        .task-reward,
        .task-ability {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .task-ability {
          color: #3498db;
          font-weight: 600;
        }

        .awarded-points {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
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
          margin-bottom: 8px;
        }

        .task-description {
          border-top: 1px solid #f0f0f0;
          padding-top: 15px;
          margin-top: 15px;
        }

        .description-label {
          margin: 0 0 8px 0;
          color: #7f8c8d;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .description-content {
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