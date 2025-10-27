<template>
  <div class="examiner-page">
    <ExaminerNav 
      title="📚 考官面板" 
      subtitle="发布任务 · 评审学生 · 分配点数"
    />
    
    <ExaminerWelcome />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <!-- 教师密钥生成区域 -->
      <section class="section">
        <h2 class="section-title">🔑 教师密钥生成</h2>
        <div class="controls">
          <Button 
            label="🔑 生成教师密钥" 
            @click="generateTeacherKey" 
            :loading="loading"
            :disabled="loading"
          />
          <Button label="➕ 发布新任务" @click="showCreateTask = true" />
        </div>
        
        <!-- 生成的密钥显示 -->
        <div v-if="teacherKey" class="key-display">
          <Card class="key-card" hoverable>
            <template #header>
              <div class="card-icon">🔑</div>
              <h3>教师密钥【拜师】</h3>
            </template>
            <p>用于学生绑定教师关系</p>
            <template #footer>
              <div class="key-value-section">
                <p><strong>生成的密钥：</strong></p>
                <code class="key-value">{{ teacherKey.keyValue }}</code>
                <div class="key-actions">
                  <Button label="复制" size="small" @click="copyKey(teacherKey.keyValue)" />
                  <Button label="关闭" size="small" variant="secondary" @click="teacherKey = null" />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </section>

      <!-- 布告栏管理 -->
      <section class="section">
        <h2 class="section-title">📋 布告栏管理</h2>
        
        <!-- 任务列表 -->
        <div class="task-list">
          <Card v-for="task in tasks" :key="task.id" class="task-card" hoverable>
            <template #header>
              <div class="task-header">
                <h3>{{ task.title }}</h3>
                <span class="task-status" :class="task.status">{{ task.statusText }}</span>
              </div>
            </template>
            <p class="task-desc">{{ task.description }}</p>
            <div class="task-info">
              <span>接取人数: {{ task.participants }}</span>
              <span>奖励点数: {{ task.reward }}点</span>
            </div>
            <template #footer>
              <div class="task-actions">
                <Button label="评审" size="small" @click="reviewTask(task)" />
                <Button label="编辑" size="small" variant="secondary" @click="editTask(task)" />
              </div>
            </template>
          </Card>
        </div>
      </section>

      <!-- 学生管理 -->
      <section class="section">
        <h2 class="section-title">👥 学生管理</h2>
        <div class="student-grid">
          <Card v-for="student in students" :key="student.id" class="student-card" hoverable>
            <template #header>
              <div class="student-avatar">👨‍🎓</div>
              <div class="student-header-info">
                <h4>{{ student.username }}</h4>
                <span class="student-status" :class="student.studentStatus">{{ getStatusText(student.studentStatus) }}</span>
              </div>
            </template>
            <div class="student-info">
              <div class="info-item">
                <span class="info-label">📧 邮箱:</span>
                <span class="info-value">{{ student.email || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 绑定时间:</span>
                <span class="info-value">{{ formatDate(student.joinedAt) }}</span>
              </div>
              <div class="ability-progress">
                <span class="ability-label">💪 能力评估:</span>
                <div class="ability-bar">
                  <div class="ability-fill" :style="{ width: '60%' }"></div>
                </div>
                <span class="ability-score">60%</span>
              </div>
            </div>
            <template #footer>
              <div class="student-actions">
                <Button label="📋 分配任务" size="small" @click="() => console.log('分配任务给:', student.username)" />
                <Button label="👁️ 查看详情" size="small" variant="secondary" @click="() => console.log('查看学生详情:', student.username)" />
              </div>
            </template>
          </Card>
        </div>
        <div v-if="students.length === 0" class="empty-state">
          <div class="empty-icon">👨‍🎓</div>
          <p>暂无学生绑定</p>
          <p class="empty-hint">生成教师密钥让学生绑定</p>
        </div>
      </section>

      <!-- 创建任务模态框 -->
      <div v-if="showCreateTask" class="modal-overlay">
        <div class="modal-content">
          <h3>发布新任务</h3>
          <form @submit.prevent="createTask">
            <input v-model="newTask.title" placeholder="任务标题" required>
            <textarea v-model="newTask.description" placeholder="任务描述" required></textarea>
            <input v-model="newTask.reward" type="number" placeholder="奖励点数" min="1" max="4" required>
            <div class="modal-actions">
              <Button label="发布" type="submit" />
              <Button label="取消" variant="secondary" @click="showCreateTask = false" />
            </div>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExaminerNav from '@/components/ExaminerNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import ExaminerWelcome from '@/components/ExaminerWelcome.vue'
import examinerService from '@/services/examinerService'
import authService from '@/services/authService'

const showCreateTask = ref(false)
const teacherKey = ref<any>(null)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const newTask = ref({
  title: '',
  description: '',
  reward: 4
})

const tasks = ref([
  { id: 1, title: '前端项目开发', description: '完成一个Vue.js项目', participants: 5, reward: 4, status: 'active', statusText: '进行中' },
  { id: 2, title: '算法练习题', description: '完成10道算法题目', participants: 3, reward: 2, status: 'completed', statusText: '已完成' }
])

const students = ref<any[]>([])

// 获取当前用户ID
const getCurrentUserId = () => {
  const user = authService.getCurrentUser()
  return user?.id || ''
}

// 加载学生列表
const loadStudents = async () => {
  try {
    const teacherId = getCurrentUserId()
    if (!teacherId) return

    const response = await examinerService.getTeacherStudents(teacherId)
    if (response.success && response.data.students) {
      students.value = response.data.students
    }
  } catch (error) {
    console.error('加载学生列表失败:', error)
  }
}

// 获取状态文本
const getStatusText = (status: string | null) => {
  switch (status) {
    case 'wild': return '在野'
    case 'selected': return '中举'
    default: return '未知'
  }
}

// 获取能力百分比
// const getAbilityPercentage = (student: any) => {
//   // 这里可以根据实际的学生能力数据计算百分比
//   return Math.floor(Math.random() * 40) + 60 // 模拟60-100%的能力值
// }

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 分配任务
// const assignTask = (student: any) => {
//   console.log('分配任务给:', student.username)
//   // 实现分配任务逻辑
// }

// 查看学生详情
// const viewStudentDetails = (student: any) => {
//   console.log('查看学生详情:', student.username)
//   // 实现查看详情逻辑
// }

// 生成教师密钥
const generateTeacherKey = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    const creatorId = getCurrentUserId()
    if (!creatorId) {
      throw new Error('用户未登录')
    }
    
    const response = await examinerService.generateTeacherKey(creatorId, '教师关联密钥 - 用于学生绑定教师')
    
    if (response.success && response.data.key) {
      teacherKey.value = response.data.key
      successMessage.value = '教师密钥生成成功！'
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成教师密钥失败'
  } finally {
    loading.value = false
  }
}

// 复制密钥到剪贴板
const copyKey = async (keyValue: string) => {
  try {
    await navigator.clipboard.writeText(keyValue)
    alert('密钥已复制到剪贴板')
  } catch (error) {
    // 如果clipboard API不可用，使用现代备用方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = keyValue
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      
      // 使用现代方法
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        alert('密钥已复制到剪贴板')
      } else {
        throw new Error('复制失败')
      }
    } catch (err) {
      alert('复制失败，请手动复制密钥')
    }
  }
}

const createTask = () => {
  tasks.value.push({
    id: tasks.value.length + 1,
    ...newTask.value,
    participants: 0,
    status: 'active',
    statusText: '进行中'
  })
  showCreateTask.value = false
  newTask.value = { title: '', description: '', reward: 4 }
}

const reviewTask = (task: any) => {
  alert(`评审任务: ${task.title}`)
}

const editTask = (task: any) => {
  alert(`编辑任务: ${task.title}`)
}

// const assignPoints = (student: any) => {
//   alert(`为${student.name}分配点数`)
// }

// 组件挂载时加载学生列表
onMounted(async () => {
  await loadStudents()
})
</script>

<style scoped>
.examiner-page {
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
  text-align: center;
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 30px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-card {
  text-align: left;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.task-status.active {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.task-status.completed {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
}

.task-desc {
  color: #7f8c8d;
  margin-bottom: 10px;
  line-height: 1.5;
}

.task-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #95a5a6;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.student-card {
  text-align: left;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.student-avatar {
  font-size: 2.5rem;
}

.student-header-info h4 {
  margin: 0 0 5px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.student-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.student-status.wild {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
}

.student-status.selected {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px 0;
}

.info-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-value {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.ability-dots {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin: 10px 0;
}

.ability-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ecf0f1;
  transition: all 0.3s ease;
}

.ability-dot.active {
  background: #4caf50;
  transform: scale(1.2);
}

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
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 20px;
  color: #2c3e50;
  text-align: center;
  font-size: 1.3rem;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 2px solid rgba(135, 206, 235, 0.3);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.modal-content input:focus,
.modal-content textarea:focus {
  outline: none;
  border-color: #87CEEB;
}

.modal-content textarea {
  height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 10px;
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

/* 密钥显示样式 */
.key-display {
  margin-top: 20px;
}

.key-card {
  max-width: 500px;
  margin: 0 auto;
}

.card-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 10px;
}

.key-value-section {
  text-align: center;
}

.key-value {
  display: block;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  margin: 10px 0;
  word-break: break-all;
}

.key-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .student-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 20px;
  }
}
</style>