<template>
  <div class="examiner-page">
    <Header 
      title="📚 考官面板" 
      subtitle="发布任务 · 评审学生 · 分配点数"
      :navigation="navigation"
    />
    
    <ExaminerWelcome />
    
    <main class="main-content">
      <!-- 布告栏管理 -->
      <section class="section">
        <h2 class="section-title">📋 布告栏管理</h2>
        <div class="controls">
          <Button label="➕ 发布新任务" @click="showCreateTask = true" />
          <Button label="🔑 生成教师密钥" @click="generateTeacherKey" />
        </div>
        
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
              <div class="student-avatar">{{ student.emoji }}</div>
              <h4>{{ student.name }}</h4>
            </template>
            <p>状态: {{ student.status }}</p>
            <div class="ability-dots">
              <span v-for="n in 10" :key="n" 
                    :class="['ability-dot', n <= student.ability ? 'active' : '']"></span>
            </div>
            <p>能力点数: {{ student.ability }}/10</p>
            <template #footer>
              <Button label="分配点数" @click="assignPoints(student)" />
            </template>
          </Card>
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
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import ExaminerWelcome from '@/components/ExaminerWelcome.vue'

const navigation = [
  { icon: '🏠', label: '首页', path: '/' },
  { icon: '📖', label: '关于', path: '/about' }
]

const showCreateTask = ref(false)
const teacherKey = ref('')
const newTask = ref({
  title: '',
  description: '',
  reward: 4
})

const tasks = ref([
  { id: 1, title: '前端项目开发', description: '完成一个Vue.js项目', participants: 5, reward: 4, status: 'active', statusText: '进行中' },
  { id: 2, title: '算法练习题', description: '完成10道算法题目', participants: 3, reward: 2, status: 'completed', statusText: '已完成' }
])

const students = ref([
  { id: 1, name: '张三', emoji: '👦', ability: 7, status: '在野' },
  { id: 2, name: '李四', emoji: '👧', ability: 8, status: '中举' },
  { id: 3, name: '王五', emoji: '👨', ability: 6, status: '在野' }
])

const generateTeacherKey = () => {
  teacherKey.value = 'JS_' + Math.random().toString(36).substr(2, 9).toUpperCase()
  alert(`教师密钥已生成: ${teacherKey.value}`)
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

const assignPoints = (student: any) => {
  alert(`为${student.name}分配点数`)
}
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
  padding: 30px 20px;
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
  text-align: center;
}

.student-avatar {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.student-card h4 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.student-card p {
  margin: 5px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
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