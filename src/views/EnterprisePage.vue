<template>
  <div class="enterprise-page">
    <EnterpriseNav 
      title="🏢 州牧面板" 
      subtitle="企业匹配 · 人才对接 · 点数使用"
    />
    
    <EnterpriseWelcome @start-recruiting="() => showDescriptionInput = true" />
    
    <!-- 描述输入模态框 -->
    <div v-if="showDescriptionInput" class="modal-overlay">
      <div class="modal-content">
        <h3>🔍 智能人才推荐</h3>
        <div class="description-input">
          <label for="userDescription">请描述您需要的人才类型：</label>
          <textarea 
            id="userDescription" 
            v-model="userDescription" 
            placeholder="例如：需要前端开发经验丰富，熟悉React框架的工程师..."
            rows="4"
          ></textarea>
        </div>
        <div class="modal-actions">
          <Button label="开始推荐" @click="fetchAIRecommendations" />
          <Button label="取消" variant="secondary" @click="showDescriptionInput = false" />
        </div>
      </div>
    </div>
    
    <!-- 悬浮学生卡片容器 -->
    <div v-if="showStudentCards" class="floating-student-cards">
      <div class="cards-container">
        <div v-for="student in recommendedStudents" :key="student.id" class="student-card">
          <div class="student-header">
            <div class="student-avatar">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="student-info">
              <h3>{{ student.name }}</h3>
              <p class="contact-info">{{ student.contact }}</p>
            </div>
          </div>
          <div class="student-description">
            <p>{{ student.description }}</p>
          </div>
          <div class="student-actions">
            <Button label="查看能力" variant="secondary" @click="viewAbility(student)" />
            <Button label="任务历史" variant="secondary" @click="viewTaskHistory(student)" />
            <Button label="联系我" @click="contactStudent(student)" />
          </div>
        </div>
      </div>
    </div>
    
    <main class="main-content">
      <!-- 企业信息 -->
      <section class="section">
        <h2 class="section-title">🏢 企业信息</h2>
        <Card class="info-card">
          <div class="info-item">
            <label>企业名称：</label>
            <span>{{ enterpriseInfo.name }}</span>
          </div>
          <div class="info-item">
            <label>剩余点数：</label>
            <span class="points">{{ enterpriseInfo.points }}点</span>
          </div>
          <div class="info-item">
            <label>对接状态：</label>
            <span :class="enterpriseInfo.status">{{ enterpriseInfo.statusText }}</span>
          </div>
        </Card>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EnterpriseNav from '@/components/EnterpriseNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import EnterpriseWelcome from '@/components/EnterpriseWelcome.vue'



const showBuyPoints = ref(false)
const showStudentCards = ref(false)
const showDescriptionInput = ref(false)
const userDescription = ref('')
const selectedOption = ref(10)
const filter = ref({
  skill: '',
  ability: '0'
})

const enterpriseInfo = ref({
  name: '创新科技有限公司',
  points: 5,
  status: 'active',
  statusText: '正常对接'
})

const pointsOptions = ref([
  { amount: 10, price: 100 },
  { amount: 20, price: 180 },
  { amount: 50, price: 400 },
  { amount: 100, price: 750 }
])

const students = ref([
  { id: 1, name: '张三', emoji: '👦', ability: 7, skill: '前端开发', status: '在野' },
  { id: 2, name: '李四', emoji: '👧', ability: 8, skill: '后端开发', status: '中举' },
  { id: 3, name: '王五', emoji: '👨', ability: 6, skill: 'UI设计', status: '在野' },
  { id: 4, name: '赵六', emoji: '👩', ability: 9, skill: '前端开发', status: '中举' }
])

const recommendedStudents = ref([
  { 
    id: '44444444-4444-4444-4444-444444444444', 
    name: 'student_demo', 
    emoji: '🧑‍💻', 
    ability: 8, 
    skill: '全栈开发', 
    contact: 'student@chancellor.edu',
    description: '该学生账号（用户名：student_demo）注册于2025年10月22日，邮箱为student@chancellor.edu，角色为学生，状态活跃。账号采用“wild”学生状态，尚未设置头像且未记录最后登录时间。'
  },
  { 
    id: 'c3244e80-c85a-46af-94eb-1450f71fa96a', 
    name: 'test_user_1761186623747', 
    emoji: '👩‍🎨', 
    ability: 9, 
    skill: 'UI/UX设计', 
    contact: 'test@example.com',
    description: '该用户为活跃学生，账号于2025年10月创建，身份状态为野生学员。使用邮箱test@example.com注册，尚未进行过系统登录。'
  },
  { 
    id: 'a7bd7060-b7a5-4be4-89a6-691687ce138a', 
    name: '1332326659', 
    emoji: '👨‍🔬', 
    ability: 7, 
    skill: '数据科学', 
    contact: '3663816961@qq.com',
    description: '该用户为在读学生，账号状态正常，于2025年10月23日注册。目前尚未设置头像且未记录登录时间，采用系统加密方式保护密码安全。'
  }
])

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const skillMatch = !filter.value.skill || student.skill.includes(filter.value.skill)
    const abilityMatch = !filter.value.ability || student.ability >= parseInt(filter.value.ability)
    return skillMatch && abilityMatch
  })
})

const filterStudents = () => {
  // 过滤逻辑已在computed中实现
}

const refreshList = () => {
  alert('刷新学生列表')
}

const contactStudent = (student: any) => {
  if (enterpriseInfo.value.points >= 1) {
    enterpriseInfo.value.points -= 1
    alert(`已联系 ${student.name}，消耗1点，剩余${enterpriseInfo.value.points}点`)
  }
}

const viewStudentDetail = (student: any) => {
  alert(`查看 ${student.name} 的详细信息`)
}

const buyPoints = () => {
  const option = pointsOptions.value.find(opt => opt.amount === selectedOption.value)
  if (option) {
    enterpriseInfo.value.points += option.amount
    alert(`成功购买 ${option.amount} 点，花费 ¥${option.price}`)
    showBuyPoints.value = false
  }
}

const viewPointsHistory = () => {
  alert('查看点数消费记录')
}

const viewAbility = (student: any) => {
  alert(`查看 ${student.name} 的能力详情：${student.ability}/10`)
}

const viewTaskHistory = (student: any) => {
  alert(`查看 ${student.name} 的任务历史`)
}

const fetchAIRecommendations = async () => {
  if (!userDescription.value.trim()) {
    alert('请输入人才描述')
    return
  }

  try {
    const response = await fetch('http://localhost:5678/webhook/ai-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: userDescription.value
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器返回了非JSON格式的响应')
    }

    // 获取响应文本以进行调试
    const responseText = await response.text()
    
    if (!responseText.trim()) {
      throw new Error('服务器返回了空响应')
    }

    // 尝试解析JSON
    const data = JSON.parse(responseText)

    
    // 处理返回的推荐数据 - 处理嵌套数组结构
    let recommendations = []
    
    // 情况1: 数据是数组形式，包含多个对象
    if (Array.isArray(data)) {
      // 遍历数组，查找包含recommendations的对象
      for (const item of data) {
        if (item.recommendations && Array.isArray(item.recommendations)) {
          // 过滤掉空数据的推荐
          recommendations = item.recommendations.filter(rec => 
            rec && (rec.name || rec.username) && (rec.email || rec.contact)
          )
          if (recommendations.length > 0) break
        }
      }
    }
    // 情况2: 数据是对象形式
    else if (data.recommendations && Array.isArray(data.recommendations)) {
      recommendations = data.recommendations.filter(rec => 
        rec && (rec.name || rec.username) && (rec.email || rec.contact)
      )
    }

    
    if (recommendations.length > 0) {
      // 将AI推荐的数据转换为前端需要的格式
      recommendedStudents.value = recommendations.map((rec: any, index: number) => {
        
        // 直接使用n8n返回的字段
        return {
          id: rec.id || index + 1,
          name: rec.name || rec.username || `推荐人才${index + 1}`,
          emoji: ['🧑‍💻', '👩‍🎨', '👨‍🔬'][index] || '👤',
          ability: 7, // 默认能力值
          skill: '待评估', // 默认技能
          contact: rec.email || rec.contact || '联系方式未知',
          description: rec.summary || '暂无AI生成简介'
        }
      })
      
      showStudentCards.value = true
      showDescriptionInput.value = false
    } else {
      alert('未找到匹配的人才推荐')
      showStudentCards.value = false
    }
  } catch (error) {
    alert(`AI推荐请求失败：${error.message}，使用模拟数据进行测试`)
    
    // 测试模式：使用模拟数据
    recommendedStudents.value = [
      { 
        id: "", 
        name: 'test_user_1761186623747', 
        emoji: '🧑‍💻', 
        ability: 7, 
        skill: '待评估', 
        contact: 'test@example.com',
        description: '这是AI生成的测试简介，实际会从n8n工作流返回真实数据'
      },
      { 
        id: "", 
        name: '1332326659', 
        emoji: '👩‍🎨', 
        ability: 7, 
        skill: '待评估', 
        contact: '3663816961@qq.com',
        description: '这是AI生成的测试简介，实际会从n8n工作流返回真实数据'
      },
      { 
        id: "", 
        name: '推荐人才3', 
        emoji: '👨‍🔬', 
        ability: 7, 
        skill: '待评估', 
        contact: '联系方式未知',
        description: '这是AI生成的测试简介，实际会从n8n工作流返回真实数据'
      }
    ]
    showStudentCards.value = true
    showDescriptionInput.value = false
  }
}
</script>

<style scoped>
.enterprise-page {
  min-height: 100vh;
  background: white;
  color: #2c3e50;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 悬浮学生卡片样式 */
.floating-student-cards {
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.student-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}



.student-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.student-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
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

.student-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: 600;
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

.student-description {
  margin-bottom: 25px;
  line-height: 1.6;
  color: #5a6c7d;
  font-size: 0.95rem;
  background: rgba(135, 206, 235, 0.05);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #87CEEB;
}

.student-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.student-actions .button {
  flex: 1;
  min-width: 100px;
  text-align: center;
}

/* 描述输入模态框样式 */
.description-input {
  margin-bottom: 25px;
}

.description-input label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #2c3e50;
}

.description-input textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(135, 206, 235, 0.3);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.description-input textarea:focus {
  outline: none;
  border-color: #87CEEB;
}

.description-input textarea::placeholder {
  color: #95a5a6;
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

.info-card {
  max-width: 400px;
  margin: 0 auto;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(135, 206, 235, 0.3);
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-item label {
  font-weight: bold;
  color: #2c3e50;
}

.info-item .points {
  color: #f57c00;
  font-weight: bold;
  font-size: 1.1rem;
}

.info-item .active {
  color: #4caf50;
  font-weight: bold;
}

.matching-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
  color: #2c3e50;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid rgba(135, 206, 235, 0.3);
  border-radius: 6px;
  background: white;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #87CEEB;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.student-match-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.student-match-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.student-avatar {
  font-size: 2.5rem;
}

.student-match-info h4 {
  margin: 0 0 5px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.student-match-info p {
  margin: 0 0 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.ability-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ability-dots {
  display: flex;
  gap: 3px;
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

.ability-score {
  font-size: 0.8rem;
  color: #95a5a6;
}

.match-actions {
  display: flex;
  gap: 10px;
}

.points-card {
  max-width: 500px;
  margin: 0 auto;
}

.points-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-balance h3 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.points-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #f57c00;
}

.points-actions {
  display: flex;
  gap: 10px;
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

.points-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.points-option {
  border: 3px solid rgba(187, 222, 251, 0.5);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.points-option:hover,
.points-option.selected {
  border-color: #87CEEB;
  background: rgba(135, 206, 235, 0.1);
}

.option-amount {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.option-price {
  font-size: 1rem;
  color: #f57c00;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

@media (max-width: 768px) {
  .matching-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .student-match-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .points-info {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .points-options {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 20px;
  }
}
</style>