<template>
  <div class="enterprise-page">
    <Header 
      title="🏢 州牧面板" 
      subtitle="企业匹配 · 人才对接 · 点数使用"
      :navigation="navigation"
    />
    
    <EnterpriseWelcome />
    
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

      <!-- 人才匹配 -->
      <section class="section">
        <h2 class="section-title">🔍 人才匹配</h2>
        <div class="matching-controls">
          <div class="filter-group">
            <label>筛选条件：</label>
            <select v-model="filter.skill" @change="filterStudents">
              <option value="">全部技能</option>
              <option value="前端">前端开发</option>
              <option value="后端">后端开发</option>
              <option value="设计">UI设计</option>
            </select>
            <select v-model="filter.ability" @change="filterStudents">
              <option value="0">全部能力</option>
              <option value="7">7分以上</option>
              <option value="8">8分以上</option>
              <option value="9">9分以上</option>
            </select>
          </div>
          <Button label="🔄 刷新列表" @click="refreshList" />
        </div>

        <!-- 学生列表 -->
        <div class="student-list">
          <Card v-for="student in filteredStudents" :key="student.id" class="student-match-card" hoverable>
            <div class="student-match-header">
              <div class="student-avatar">{{ student.emoji }}</div>
              <div class="student-match-info">
                <h4>{{ student.name }}</h4>
                <p>{{ student.skill }} · {{ student.status }}</p>
                <div class="ability-display">
                  <span>能力值：</span>
                  <div class="ability-dots">
                    <span v-for="n in 10" :key="n" 
                          :class="['ability-dot', n <= student.ability ? 'active' : '']"></span>
                  </div>
                  <span class="ability-score">{{ student.ability }}/10</span>
                </div>
              </div>
            </div>
            <div class="match-actions">
              <Button 
                label="📧 联系 (消耗1点)" 
                @click="contactStudent(student)" 
                :disabled="enterpriseInfo.points < 1"
              />
              <Button label="详情" variant="secondary" @click="viewStudentDetail(student)" />
            </div>
          </Card>
        </div>
      </section>

      <!-- 点数管理 -->
      <section class="section">
        <h2 class="section-title">💰 点数管理</h2>
        <Card class="points-card">
          <div class="points-info">
            <div class="points-balance">
              <h3>当前点数余额</h3>
              <div class="points-amount">{{ enterpriseInfo.points }}点</div>
            </div>
            <div class="points-actions">
              <Button label="购买点数" @click="showBuyPoints = true" />
              <Button label="消费记录" variant="secondary" @click="viewPointsHistory" />
            </div>
          </div>
        </Card>
      </section>

      <!-- 购买点数模态框 -->
      <div v-if="showBuyPoints" class="modal-overlay">
        <div class="modal-content">
          <h3>购买点数</h3>
          <div class="points-options">
            <div v-for="option in pointsOptions" :key="option.amount" 
                 class="points-option" :class="{ selected: selectedOption === option.amount }"
                 @click="selectedOption = option.amount">
              <div class="option-amount">{{ option.amount }}点</div>
              <div class="option-price">¥{{ option.price }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <Button label="确认购买" @click="buyPoints" />
            <Button label="取消" variant="secondary" @click="showBuyPoints = false" />
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import EnterpriseWelcome from '@/components/EnterpriseWelcome.vue'

const navigation = [
  { icon: '🏠', label: '首页', path: '/' },
  { icon: '📖', label: '关于', path: '/about' }
]

const showBuyPoints = ref(false)
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
</script>

<style scoped>
.enterprise-page {
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