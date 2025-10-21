<template>
  <div class="student-page">
    <StudentNav 
      title="🎓 监生面板" 
      subtitle="接取任务 · 提升能力 · 寻求就业"
    />
    
    <StudentWelcome />
    
    <main class="main-content">
      <!-- 学生信息 -->
      <section class="section">
        <h2 class="section-title">👤 个人信息</h2>
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
            </div>
          </div>
        </Card>
      </section>

      <!-- 能力展示 -->
      <section class="section">
        <h2 class="section-title">💪 能力展示</h2>
        <div class="abilities-grid">
          <Card v-for="ability in abilities" :key="ability.name" class="ability-card" hoverable>
            <div class="ability-icon">{{ ability.icon }}</div>
            <h4>{{ ability.name }}</h4>
            <div class="ability-bar">
              <div class="ability-fill" :style="{ width: ability.value * 10 + '%' }"></div>
            </div>
            <span class="ability-score">{{ ability.value }}/10</span>
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
import { ref, computed } from 'vue'
import StudentNav from '@/components/StudentNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import StudentWelcome from '@/components/StudentWelcome.vue'



const activeTab = ref('available')

const studentInfo = ref({
  name: '张三',
  emoji: '👦',
  status: 'active',
  statusText: '在野',
  abilityPoints: 7,
  completedTasks: 3,
  currentTask: '前端项目开发'
})

const abilities = ref([
  { name: '技术能力', icon: '💻', value: 7 },
  { name: '沟通能力', icon: '💬', value: 8 },
  { name: '团队协作', icon: '👥', value: 6 },
  { name: '学习能力', icon: '📚', value: 9 },
  { name: '创造力', icon: '🎨', value: 7 },
  { name: '领导力', icon: '⭐', value: 5 }
])

const tasks = ref([
  { id: 1, title: '前端项目开发', description: '完成一个Vue.js项目', reward: 4, 
    deadline: '2024-12-31', publisher: '李老师', status: 'available' },
  { id: 2, title: '算法练习题', description: '完成10道算法题目', reward: 2, 
    deadline: '2024-12-25', publisher: '王老师', status: 'available' },
  { id: 3, title: 'UI设计作业', description: '设计一个移动端界面', reward: 3, 
    deadline: '2024-12-28', publisher: '张老师', status: 'accepted' }
])

const employmentOpportunities = ref([
  { id: 1, company: '创新科技', position: '前端开发工程师', type: '全职', 
    requiredAbility: 7, salary: '15-25K' },
  { id: 2, company: '智慧软件', position: '后端开发工程师', type: '实习', 
    requiredAbility: 6, salary: '8-12K' },
  { id: 3, company: '设计工坊', position: 'UI设计师', type: '兼职', 
    requiredAbility: 8, salary: '12-18K' }
])

const filteredTasks = computed(() => {
  return tasks.value.filter(task => task.status === activeTab.value)
})

const acceptTask = (task: any) => {
  task.status = 'accepted'
  studentInfo.value.currentTask = task.title
  alert(`已接取任务：${task.title}`)
}

const submitTask = (task: any) => {
  task.status = 'completed'
  studentInfo.value.abilityPoints += task.reward
  studentInfo.value.completedTasks += 1
  studentInfo.value.currentTask = ''
  alert(`任务 ${task.title} 已完成，获得 ${task.reward} 点能力值`)
}

const applyOpportunity = (opportunity: any) => {
  if (studentInfo.value.abilityPoints >= opportunity.requiredAbility) {
    alert(`已申请 ${opportunity.company} 的 ${opportunity.position} 职位`)
  } else {
    alert(`能力不足，需要 ${opportunity.requiredAbility} 点能力值`)
  }
}
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

.profile-card {
  max-width: 500px;
  margin: 0 auto;
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

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.ability-card {
  text-align: center;
  padding: 20px;
}

.ability-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.ability-card h4 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 1rem;
}

.ability-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, #87CEEB 0%, #98D8F0 100%);
  transition: width 0.3s ease;
}

.ability-score {
  font-size: 0.9rem;
  color: #95a5a6;
  font-weight: bold;
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
  .profile-content {
    flex-direction: column;
    text-align: center;
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