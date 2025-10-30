<template>
  <div class="student-page">
    <StudentNav 
      title="🎓 监生面板" 
      subtitle="接取任务 · 提升能力 · 寻求就业"
    />
    
    <StudentWelcome />
    
    <main class="main-content">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
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
                          'editable': !studentTeacher && !isUpdatingAbility
                        }"
                        @click="updateAbilityValue(index, i)"
                      ></div>
                    </div>
                    <span class="ability-score">{{ ability.value }}/10</span>
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
        <div class="tasks-tabs">
          <Button 
            label="可接任务" 
            :variant="activeTab === 'available' ? 'primary' : 'secondary'"
            @click="activeTab = 'available'" 
          />
          <Button 
            label="已接任务" 
            :variant="activeTab === 'accepted' ? 'primary' : 'secondary'"
            @click="activeTab = 'accepted'" 
          />
          <Button 
            label="完成任务" 
            :variant="activeTab === 'completed' ? 'primary' : 'secondary'"
            @click="activeTab = 'completed'" 
          />
        </div>

        <!-- 任务列表 -->
        <div class="tasks-list">
          <Card v-for="task in filteredTasks" :key="task.id" class="task-item" hoverable>
            <div class="task-content">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
              <div class="task-meta">
                <span>奖励：{{ task.reward }}点</span>
                <span>截止：{{ task.deadline }}</span>
                <span>发布者：{{ task.publisher }}</span>
              </div>
            </div>
            <div class="task-actions">
              <Button 
                v-if="task.status === 'available'" 
                label="接取任务" 
                @click="acceptTask(task)" 
              />
              <Button 
                v-if="task.status === 'accepted'" 
                label="提交成果" 
                variant="warning"
                @click="submitTask(task)" 
              />
              <Button 
                v-if="task.status === 'completed'" 
                label="已完成" 
                variant="secondary"
                disabled 
              />
            </div>
          </Card>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StudentNav from '@/components/Nav/StudentNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import StudentWelcome from '@/components/Welcome/StudentWelcome.vue'
import studentService from '@/services/studentService'

// 响应式数据
const activeTab = ref('available')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const teacherKeyInput = ref('')
const isUpdatingAbility = ref(false)

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

// 能力数据
const abilities = ref([
  { name: '前端开发', icon: '💻', value: 0 },
  { name: '安卓开发', icon: '📱', value: 0 },
  { name: '后端开发', icon: '⚙️', value: 0 },
  { name: '人工智能', icon: '🤖', value: 0 },
  { name: '沟通能力', icon: '💬', value: 0 },
  { name: '创造力', icon: '💡', value: 0 },
  { name: '领导力', icon: '👑', value: 0 }
])

// 任务数据
const tasks = ref<any[]>([])

// 就业机会数据
const employmentOpportunities = ref<any[]>([])

// 计算属性：根据标签过滤任务
const filteredTasks = computed(() => {
  return tasks.value.filter(task => task.status === activeTab.value)
})

// 获取状态文本
const getStatusText = (status: string | null) => {
  switch (status) {
    case 'wild': return '在野'
    case 'selected': return '中举'
    default: return '未知'
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
    const response = await studentService.getStudentAbilities()
    if (response.success) {
      abilities.value = response.data.abilities
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
      // 重新加载教师信息
      await loadStudentTeacher()
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

// 提交任务
const submitTask = async (task: any) => {
  try {
    const submission = prompt(`请输入任务 ${task.title} 的成果描述：`)
    if (!submission) return
    
    const response = await studentService.submitTask(task.id, submission)
    if (response.success) {
      // 重新加载任务列表
      await loadStudentTasks()
      // 重新加载学生信息
      await loadStudentInfo()
      // 重新加载能力数据
      await loadStudentAbilities()
      successMessage.value = `任务 ${task.title} 已完成，获得 ${task.reward} 点能力值`
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '提交任务失败'
  }
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

// 组件挂载时加载所有数据
onMounted(async () => {
  await Promise.all([
    loadStudentInfo(),
    loadStudentTeacher(),
    loadStudentAbilities(),
    loadStudentTasks(),
    loadEmploymentOpportunities()
  ])
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

/* 个人信息与能力展示容器 */
.profile-abilities-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
  align-items: stretch;
}

.profile-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.abilities-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 20px;
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
  gap: 8px;
  flex: 1;
}

.ability-cell {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
  min-height: 50px;
  display: flex;
  align-items: center;
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

.tasks-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.task-content h4 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.task-content p {
  margin: 0 0 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #95a5a6;
}

.task-actions {
  display: flex;
  gap: 10px;
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
}
</style>