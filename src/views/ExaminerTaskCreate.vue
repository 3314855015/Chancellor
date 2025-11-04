<template>
  <div class="examiner-task-create">
    <ExaminerNav 
      title="📝 发布新任务" 
      subtitle="创建任务 · 设置点数 · 管理过期时间"
    />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <div class="layout-container">
        <!-- 任务发布表单 -->
        <div class="task-form-section">
          <div class="form-container">
            <div class="form-header">
              <h2>📋 任务信息</h2>
              <p>填写任务详细信息，设置奖励点数和过期时间</p>
            </div>
            
            <form @submit.prevent="submitTask" class="task-form">
              <!-- 任务标题 -->
              <div class="form-group">
                <label for="task-title">任务标题 *</label>
                <input 
                  id="task-title"
                  v-model="taskForm.title" 
                  type="text" 
                  placeholder="请输入任务标题"
                  class="form-input"
                  required
                >
              </div>
              
              <!-- 任务描述 -->
              <div class="form-group">
                <label for="task-description">任务描述 *</label>
                <textarea 
                  id="task-description"
                  v-model="taskForm.description" 
                  placeholder="请详细描述任务内容、要求和目标"
                  class="form-textarea"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <!-- 奖励点数 -->
              <div class="form-group">
                <label for="reward-points">奖励点数 *</label>
                <div class="points-selector">
                  <label 
                    v-for="point in [1, 2, 3, 4]" 
                    :key="point"
                    class="point-option"
                    :class="{ selected: taskForm.rewardPoints === point }"
                  >
                    <input 
                      type="radio" 
                      v-model="taskForm.rewardPoints" 
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
                <label for="task-deadline">截止时间 *</label>
                <input 
                  id="task-deadline"
                  v-model="taskForm.deadline" 
                  type="datetime-local" 
                  class="form-input"
                  :min="minDeadline"
                  required
                >
                <p class="form-hint">任务提交的最后期限</p>
              </div>
              
              <!-- 点数过期时间 -->
              <div class="form-group">
                <label for="expires-in">点数过期时间 *</label>
                <div class="expires-selector">
                  <label 
                    v-for="option in expiresOptions" 
                    :key="option.value"
                    class="expires-option"
                    :class="{ selected: taskForm.expiresInMonths === option.value }"
                  >
                    <input 
                      type="radio" 
                      v-model="taskForm.expiresInMonths" 
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
              <div class="form-actions">
                <Button 
                  label="📤 发布任务" 
                  type="submit" 
                  :loading="loading"
                  :disabled="loading"
                  class="submit-btn"
                />
                <Button 
                  label="↩️ 返回" 
                  variant="secondary" 
                  @click="goBack"
                  class="back-btn"
                />
              </div>
            </form>
          </div>
        </div>
        
        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="preview-container">
            <h3>👀 任务预览</h3>
            <div class="task-preview">
              <div class="preview-header">
                <h4>{{ taskForm.title || '任务标题' }}</h4>
                <span class="preview-status">待发布</span>
              </div>
              <p class="preview-description">{{ taskForm.description || '任务描述将显示在这里' }}</p>
              <div class="preview-info">
                <div class="info-item">
                  <span class="info-label">奖励点数:</span>
                  <span class="info-value">{{ taskForm.rewardPoints || 0 }}点</span>
                </div>
                <div class="info-item">
                  <span class="info-label">截止时间:</span>
                  <span class="info-value">{{ formatDeadlinePreview(taskForm.deadline) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">点数过期:</span>
                  <span class="info-value">{{ getExpiresLabel(taskForm.expiresInMonths) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExaminerNav from '@/components/Nav/ExaminerNav.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import examinerService from '@/services/examinerService'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 任务表单数据
const taskForm = ref({
  title: '',
  description: '',
  rewardPoints: 2,
  deadline: '',
  expiresInMonths: '3'
})

// 过期时间选项
const expiresOptions = [
  { value: '1', label: '1个月', description: '短期任务' },
  { value: '3', label: '3个月', description: '标准任务' },
  { value: '6', label: '6个月', description: '长期任务' },
  { value: '12', label: '12个月', description: '年度任务' }
]

// 最小截止时间（当前时间+1小时）
const minDeadline = ref('')

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

// 获取过期时间标签
const getExpiresLabel = (value: string) => {
  const option = expiresOptions.find(opt => opt.value === value)
  return option ? option.label : '未设置'
}

// 格式化截止时间预览
const formatDeadlinePreview = (deadline: string) => {
  if (!deadline) return '未设置'
  const date = new Date(deadline)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 提交任务
const submitTask = async () => {
  if (!taskForm.value.title.trim() || !taskForm.value.description.trim()) {
    errorMessage.value = '请填写完整的任务信息'
    return
  }

  loading.value = true
  errorMessage.value = ''
  
  try {
    // 调用后端API发布任务
    await examinerService.createTask({
      title: taskForm.value.title.trim(),
      description: taskForm.value.description.trim(),
      reward_points: taskForm.value.rewardPoints,
      deadline: taskForm.value.deadline,
      expires_in_months: parseInt(taskForm.value.expiresInMonths),
      status: 'open'
    })
    
    successMessage.value = '任务发布成功！'
    
    // 2秒后返回教师页面
    setTimeout(() => {
      router.push('/examiner')
    }, 2000)
    
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '任务发布失败'
  } finally {
    loading.value = false
  }
}

// 返回教师页面
const goBack = () => {
  router.push('/examiner')
}

// 设置默认截止时间
const setDefaultDeadline = () => {
  const now = new Date()
  now.setDate(now.getDate() + 3) // 默认3天后
  
  // 格式化为YYYY-MM-DDTHH:mm格式
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  taskForm.value.deadline = `${year}-${month}-${day}T${hours}:${minutes}`
  
  // 设置最小截止时间（当前时间+1小时）
  const minDate = new Date()
  minDate.setHours(minDate.getHours() + 1)
  const minYear = minDate.getFullYear()
  const minMonth = String(minDate.getMonth() + 1).padStart(2, '0')
  const minDay = String(minDate.getDate()).padStart(2, '0')
  const minHours = String(minDate.getHours()).padStart(2, '0')
  const minMinutes = String(minDate.getMinutes()).padStart(2, '0')
  
  minDeadline.value = `${minYear}-${minMonth}-${minDay}T${minHours}:${minMinutes}`
}

onMounted(() => {
  setDefaultDeadline()
})
</script>

<style scoped>
.examiner-task-create {
  min-height: 100vh;
  background: #f8f9fa;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.layout-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

/* 表单样式 */
.form-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.form-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #87CEEB;
}

.form-hint {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* 点数选择器 */
.points-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.point-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.point-option:hover {
  border-color: #bdc3c7;
}

.point-option.selected {
  border-color: #87CEEB;
  background: #f0f9ff;
}

.point-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.point-desc {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-top: 4px;
}

/* 过期时间选择器 */
.expires-selector {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.expires-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.expires-option:hover {
  border-color: #bdc3c7;
}

.expires-option.selected {
  border-color: #87CEEB;
  background: #f0f9ff;
}

.expires-value {
  font-weight: 600;
  color: #2c3e50;
}

.expires-desc {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.submit-btn {
  flex: 1;
}

.back-btn {
  flex: 0 0 auto;
}

/* 预览区域 */
.preview-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
}

.preview-container h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #2c3e50;
  text-align: center;
}

.task-preview {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.preview-status {
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.preview-description {
  margin: 0 0 16px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* 消息样式 */
.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.message.error {
  background: #ffeaea;
  color: #e74c3c;
  border: 1px solid #fadbd8;
}

.message.success {
  background: #e8f6ef;
  color: #27ae60;
  border: 1px solid #d4efdf;
}

/* 隐藏单选按钮 */
.radio-input {
  display: none;
}

@media (max-width: 768px) {
  .layout-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .points-selector {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>