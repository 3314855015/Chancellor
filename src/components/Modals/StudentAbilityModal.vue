<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>🎯 学生能力详情</h3>
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

        <!-- 能力展示 -->
        <div class="abilities-section">
          <h4>能力评估</h4>
          <div class="abilities-grid">
            <div 
              v-for="ability in abilities" 
              :key="ability.name"
              class="ability-item"
            >
              <div class="ability-icon">{{ ability.icon }}</div>
              <div class="ability-info">
                <span class="ability-name">{{ ability.name }}</span>
                <div class="ability-bar">
                  <div 
                    class="ability-fill" 
                    :style="{ width: (ability.value / 10) * 100 + '%' }"
                  ></div>
                </div>
                <span class="ability-value">{{ ability.value }}/10</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <LoadingSpinner />
          <p>正在加载能力信息...</p>
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
import type { StudentInfo, AbilityInfo } from '@/services/enterpriseService'

interface Props {
  studentId: string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const studentInfo = ref<StudentInfo | null>(null)
const abilities = ref<AbilityInfo[]>([])
const loading = ref(true)
const error = ref<string>('')

onMounted(async () => {
  await loadStudentData()
})

const loadStudentData = async () => {
  try {
    loading.value = true
    error.value = ''

    // 并行加载学生信息和能力信息
    const [infoResult, abilitiesResult] = await Promise.all([
      enterpriseService.getStudentInfo(props.studentId),
      enterpriseService.getStudentAbilities(props.studentId)
    ])

    studentInfo.value = infoResult
    abilities.value = abilitiesResult || []

    if (!infoResult) {
      error.value = '未找到学生信息'
    }
  } catch (err) {
    console.error('加载学生数据失败:', err)
    error.value = '加载学生数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
}

const getStatusText = (status: string | null) => {
  switch (status) {
    case 'wild': return '在野'
    case 'selected': return '中举'
    default: return '未知'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '未知'
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
  max-width: 600px;
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

.abilities-section h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.abilities-grid {
  display: grid;
  gap: 15px;
}

.ability-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.ability-item:hover {
  border-color: #87CEEB;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.2);
}

.ability-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.ability-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
}

.ability-name {
  min-width: 80px;
  font-weight: 600;
  color: #2c3e50;
}

.ability-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, #87CEEB, #3498db);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.ability-value {
  min-width: 40px;
  text-align: right;
  font-weight: 600;
  color: #3498db;
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

  .ability-info {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .ability-name {
    min-width: auto;
  }

  .ability-value {
    text-align: left;
  }
}
</style>