<template>
  <div class="examiner-page">
    <ExaminerNav 
      title="📚 考官面板" 
      subtitle="发布任务 · 评审学生 · 分配点数"
    />
    
    <ExaminerWelcome />
    
    <main class="main-layout">
      <!-- 消息显示区域 -->
      <div v-if="errorMessage" class="message error">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="message success">
        {{ successMessage }}
      </div>
      
      <div class="layout-container">
        <!-- 主内容区 - 学生管理与密钥生成 (75%) -->
        <div class="main-content">
          <!-- 学生管理 + 密钥生成容器 -->
          <section class="student-key-section">
            <div class="section-header">
              <h2 class="section-title">👥 学生管理</h2>
              <div class="controls">
                <Button 
                  label="🔑 生成教师密钥" 
                  @click="generateTeacherKey" 
                  :loading="loading"
                  :disabled="loading"
                />
                <Button label="➕ 发布新任务" @click="showCreateTask = true" />
              </div>
            </div>
            
            <!-- 学生列表表格 -->
            <div class="student-table-container">
              <!-- 排序控制栏 -->
              <div class="sort-controls">
                <span class="sort-label">排序方式：</span>
                <div class="sort-buttons">
                  <button 
                    class="sort-btn" 
                    :class="{ active: sortField === 'username' }"
                    @click="toggleSort('username')"
                  >
                    姓名 <span class="sort-arrow" v-if="sortField === 'username'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </button>
                  <button 
                    class="sort-btn" 
                    :class="{ active: sortField === 'email' }"
                    @click="toggleSort('email')"
                  >
                    邮箱 <span class="sort-arrow" v-if="sortField === 'email'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </button>
                  <button 
                    class="sort-btn" 
                    :class="{ active: sortField === 'remainingPoints' }"
                    @click="toggleSort('remainingPoints')"
                  >
                    可分配点数 <span class="sort-arrow" v-if="sortField === 'remainingPoints'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </button>
                </div>
              </div>
              
              <table class="student-table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>邮箱</th>
                    <th>剩余可分配点数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- 实际学生数据行 -->
                  <tr v-for="student in paginatedStudents" :key="student.id" class="student-row">
                    <td class="student-name">{{ student.username }}</td>
                    <td class="student-email">{{ student.email || '未设置' }}</td>
                    <td class="remaining-points">
                      <span :class="{ 'zero-points': student.remainingPoints <= 0 }">
                        {{ student.remainingPoints }}点
                      </span>
                    </td>
                    <td class="student-actions">
                      <Button 
                        label="💪 分配能力" 
                        size="small" 
                        @click="openAssignAbilityModal(student)"
                        :disabled="student.remainingPoints <= 0"
                        :class="{ 'disabled-btn': student.remainingPoints <= 0 }"
                      />
                      <Button 
                        label="📞 联系我" 
                        size="small" 
                        variant="secondary" 
                        @click="contactStudent(student)"
                      />
                    </td>
                  </tr>
                  
                  <!-- 空行填充，确保始终显示7行 -->
                  <tr v-for="i in (7 - paginatedStudents.length)" :key="`empty-${i}`" class="empty-row">
                    <td colspan="4">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
              
              <!-- 分页控件 - 始终显示 -->
              <div class="pagination-controls">
                <Button 
                  label="上一页" 
                  size="small" 
                  variant="secondary" 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                />
                <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
                <Button 
                  label="下一页" 
                  size="small" 
                  variant="secondary" 
                  @click="nextPage" 
                  :disabled="currentPage >= totalPages"
                />
              </div>
              
              <div v-if="students.length === 0" class="empty-state">
                <div class="empty-icon">👨‍🎓</div>
                <p>暂无学生绑定</p>
                <p class="empty-hint">生成教师密钥让学生绑定</p>
              </div>
            </div>
            

          </section>
        </div>

        <!-- 布告栏区域 - 靠右 (25%) -->
        <div class="bulletin-sidebar">
          <section class="bulletin-section">
            <h2 class="section-title">📋 布告栏</h2>
            
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
        </div>
      </div>

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

      <!-- 分配能力模态框 -->
      <div v-if="showAssignAbilityModal" class="modal-overlay">
        <div class="assign-ability-modal">
          <div class="modal-header">
            <h3>💪 为 {{ selectedStudent?.username }} 分配能力</h3>
            <p class="modal-subtitle">剩余可分配点数: {{ selectedStudent?.remainingPoints }}点</p>
          </div>
          
          <div class="ability-grid">
            <div v-for="(ability, index) in abilities" :key="ability.name" class="ability-cell">
              <div class="ability-header">
                <span class="ability-icon">{{ ability.icon }}</span>
                <span class="ability-name">{{ ability.name }}</span>
                <span class="current-score">当前: {{ ability.currentValue }}/10</span>
              </div>
              
              <!-- 电池格显示 -->
              <div class="battery-container">
                <div class="battery-grid">
                  <div 
                    v-for="i in 10" 
                    :key="i"
                    class="battery-cell"
                    :class="getBatteryCellClass(ability, index, i)"
                    @mouseenter="hoverAbilityPoint(index, i)"
                    @mouseleave="clearHoverAbility"
                    @click="selectAbilityPoint(index, i)"
                  ></div>
                </div>
                <span class="ability-score">{{ ability.currentValue }}/10</span>
              </div>
              
              <!-- 分配点数输入 -->
              <div class="assign-controls">
                <span class="assign-label">分配点数:</span>
                <input 
                  v-model.number="ability.assignedPoints" 
                  type="number" 
                  min="0" 
                  :max="selectedStudent?.remainingPoints"
                  class="points-input"
                  @input="validatePointsInput(index)"
                />
                <span class="points-hint">最大可分配: {{ selectedStudent?.remainingPoints }}点</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="total-assignment">
              <p>总计分配点数: <strong>{{ totalAssignedPoints }}</strong> / {{ selectedStudent?.remainingPoints }}点</p>
              <p v-if="totalAssignedPoints > selectedStudent?.remainingPoints" class="points-warning">
                ⚠️ 分配点数超过剩余可分配点数
              </p>
              <p v-else-if="totalAssignedPoints > 0" class="points-info">
                ✅ 可以分配
              </p>
            </div>
            <div class="modal-actions">
              <Button label="取消" variant="secondary" @click="closeAssignAbilityModal" />
              <Button label="确认分配" @click="confirmAssignment" :disabled="!canAssign" />
            </div>
          </div>
          
          <!-- 二次确认弹窗 -->
          <div v-if="showConfirmDialog" class="confirm-dialog">
            <div class="confirm-content">
              <h4>⚠️ 确认分配</h4>
              <p>您确定要为 {{ selectedStudent?.username }} 分配 {{ totalAssignedPoints }} 点能力吗？</p>
              <p class="confirm-warning">此操作不可撤销！</p>
              <div class="confirm-actions">
                <Button label="取消" size="small" variant="secondary" @click="showConfirmDialog = false" />
                <Button label="确定分配" size="small" @click="executeAssignment" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教师密钥模态框 -->
      <div v-if="showTeacherKeyModal" class="modal-overlay">
        <div class="teacher-key-modal">
          <div class="modal-header">
            <h3>🔑 教师密钥生成成功</h3>
            <p class="modal-subtitle">用于学生绑定教师关系</p>
          </div>
          
          <div class="key-content">
            <div class="key-card">
              <div class="key-header">
                <span class="key-icon">🔑</span>
                <h4>教师密钥【拜师】</h4>
              </div>
              <div class="key-value-section">
                <p class="key-label">生成的密钥：</p>
                <code class="key-value">{{ teacherKey?.keyValue }}</code>
                <p class="key-hint">请将此密钥分享给学生进行绑定</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <div class="modal-actions">
              <Button 
                label="复制密钥" 
                @click="copyKey(teacherKey?.keyValue)" 
                variant="primary"
              />
              <Button 
                label="关闭" 
                variant="secondary" 
                @click="showTeacherKeyModal = false" 
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ExaminerNav from '@/components/Nav/ExaminerNav.vue'
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import ExaminerWelcome from '@/components/Welcome/ExaminerWelcome.vue'
import examinerService from '@/services/examinerService'
import authService from '@/services/authService'

const showCreateTask = ref(false)
const showAssignAbilityModal = ref(false)
const showConfirmDialog = ref(false)
const showTeacherKeyModal = ref(false)
const teacherKey = ref<any>(null)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const newTask = ref({
  title: '',
  description: '',
  reward: 4
})

// 分页相关
const currentPage = ref(1)
const pageSize = 7

// 学生能力数据
const abilities = ref([
  { name: '前端开发', icon: '💻', currentValue: 0, assignedPoints: 0 },
  { name: '安卓开发', icon: '📱', currentValue: 0, assignedPoints: 0 },
  { name: '后端开发', icon: '⚙️', currentValue: 0, assignedPoints: 0 },
  { name: '人工智能', icon: '🤖', currentValue: 0, assignedPoints: 0 },
  { name: '沟通能力', icon: '💬', currentValue: 0, assignedPoints: 0 },
  { name: '创造力', icon: '💡', currentValue: 0, assignedPoints: 0 },
  { name: '领导力', icon: '👑', currentValue: 0, assignedPoints: 0 }
])

const tasks = ref([
  { id: 1, title: '前端项目开发', description: '完成一个Vue.js项目', participants: 5, reward: 4, status: 'active', statusText: '进行中' },
  { id: 2, title: '算法练习题', description: '完成10道算法题目', participants: 3, reward: 2, status: 'completed', statusText: '已完成' }
])

const students = ref<any[]>([
  { id: 1, username: '张三', email: 'zhangsan@example.com', remainingPoints: 15, studentStatus: 'selected' },
  { id: 2, username: '李四', email: 'lisi@example.com', remainingPoints: 8, studentStatus: 'selected' },
  { id: 3, username: '王五', email: 'wangwu@example.com', remainingPoints: 0, studentStatus: 'selected' },
  { id: 4, username: '赵六', email: 'zhaoliu@example.com', remainingPoints: 12, studentStatus: 'selected' },
  { id: 5, username: '钱七', email: 'qianqi@example.com', remainingPoints: 20, studentStatus: 'selected' },
  { id: 6, username: '孙八', email: 'sunba@example.com', remainingPoints: 5, studentStatus: 'selected' },
  { id: 7, username: '周九', email: 'zhoujiu@example.com', remainingPoints: 18, studentStatus: 'selected' },
  { id: 8, username: '吴十', email: 'wushi@example.com', remainingPoints: 3, studentStatus: 'selected' }
])

const selectedStudent = ref<any>(null)
const hoveredAbility = ref({ abilityIndex: -1, pointValue: -1 })

// 排序相关
const sortField = ref('username')
const sortDirection = ref('asc')

// 计算属性
const sortedStudents = computed(() => {
  const sorted = [...students.value]
  sorted.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    
    if (sortField.value === 'remainingPoints') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    }
    
    if (sortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
  return sorted
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return sortedStudents.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(students.value.length / pageSize))

const totalAssignedPoints = computed(() => {
  return abilities.value.reduce((total, ability) => total + ability.assignedPoints, 0)
})

// 检查是否可以分配（已分配点数不超过剩余点数）
const canAssign = computed(() => {
  return totalAssignedPoints.value > 0 && totalAssignedPoints.value <= (selectedStudent.value?.remainingPoints || 0)
})

// 电池格交互逻辑
const getBatteryCellClass = (ability: any, abilityIndex: number, pointValue: number) => {
  const classes = []
  
  // 基础状态：已分配的点数显示绿色
  if (pointValue <= ability.currentValue) {
    classes.push('active') // 已分配的点数
  } 
  // 新增分配的点数显示蓝色
  else if (pointValue > ability.currentValue && pointValue <= ability.currentValue + ability.assignedPoints) {
    classes.push('assigned') // 新增分配的点数
  }
  // 未分配的点数显示灰色
  else {
    classes.push('inactive') // 未分配的点数
  }
  
  // 悬停状态
  if (hoveredAbility.value.abilityIndex === abilityIndex && 
      pointValue > ability.currentValue + ability.assignedPoints && 
      pointValue <= hoveredAbility.value.pointValue) {
    
    const diff = pointValue - (ability.currentValue + ability.assignedPoints)
    const remainingPoints = selectedStudent.value?.remainingPoints || 0
    
    if (diff <= remainingPoints) {
      classes.push('hover-can-assign') // 可分配的悬停状态
    } else {
      classes.push('hover-cannot-assign') // 不可分配的悬停状态
    }
  }
  
  return classes
}

const hoverAbilityPoint = (abilityIndex: number, pointValue: number) => {
  hoveredAbility.value = { abilityIndex, pointValue }
}

const clearHoverAbility = () => {
  hoveredAbility.value = { abilityIndex: -1, pointValue: -1 }
}

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
      // 为每个学生加载能力数据来计算剩余点数
      const studentsWithPoints = await Promise.all(
        response.data.students.map(async (student: any) => {
          try {
            // 获取学生的能力数据来计算已分配点数
            const abilityResponse = await examinerService.getStudentAbilities(student.id)
            let totalAssignedPoints = 0
            
            if (abilityResponse.success && abilityResponse.data.abilities) {
              totalAssignedPoints = abilityResponse.data.abilities.reduce((total: number, ability: any) => {
                return total + (ability.value || 0)
              }, 0)
            }
            
            // 计算剩余点数：初始10点减去已分配点数
            const remainingPoints = 10 - totalAssignedPoints
            
            return {
              ...student,
              remainingPoints: Math.max(0, remainingPoints) // 确保不为负数
            }
          } catch (error) {
            console.error(`加载学生 ${student.username} 能力数据失败:`, error)
            // 如果加载失败，使用默认的10点
            return {
              ...student,
              remainingPoints: 10
            }
          }
        })
      )
      
      students.value = studentsWithPoints
    }
  } catch (error) {
    console.error('加载学生列表失败:', error)
  }
}

// 加载学生能力数据
const loadStudentAbilities = async (studentId: string) => {
  try {
    // 使用examinerService获取学生能力数据
    const response = await examinerService.getStudentAbilities(studentId)
    
    if (response.success) {
      // 更新能力显示
      updateAbilityDisplayFromResponse(response.data.abilities)
    } else {
      console.warn('获取学生能力数据失败:', response.message)
      // 使用默认能力值
      resetToDefaultAbilities()
    }
  } catch (error) {
    console.error('加载学生能力数据失败:', error)
    // 使用默认能力值
    resetToDefaultAbilities()
  }
}

// 更新能力显示（从服务响应数据）
const updateAbilityDisplayFromResponse = (abilitiesData: any[]) => {
  console.log('更新能力显示，接收到的数据:', abilitiesData)
  
  abilities.value = abilities.value.map(ability => {
    // 在返回的能力数据中查找对应的能力
    const abilityData = abilitiesData.find(a => a.name === ability.name)
    
    console.log(`能力 ${ability.name} 匹配数据:`, abilityData)
    
    return {
      ...ability,
      currentValue: abilityData ? abilityData.value : 0
    }
  })
  
  console.log('更新后的能力数据:', abilities.value)
}

// 更新能力显示（从数据库原始数据）
const updateAbilityDisplay = (abilityData: any) => {
  abilities.value = abilities.value.map(ability => {
    let currentValue = 0
    
    // 根据能力名称映射到数据库字段
    switch (ability.name) {
      case '前端开发':
        currentValue = abilityData.frontend_points || 0
        break
      case '安卓开发':
        currentValue = abilityData.android_points || 0
        break
      case '后端开发':
        currentValue = abilityData.backend_points || 0
        break
      case '人工智能':
        currentValue = abilityData.ai_points || 0
        break
      case '沟通能力':
        currentValue = abilityData.communication_points || 0
        break
      case '创造力':
        currentValue = abilityData.creativity_points || 0
        break
      case '领导力':
        currentValue = abilityData.leadership_points || 0
        break
      default:
        currentValue = 0
    }
    
    return {
      ...ability,
      currentValue
    }
  })
}

// 重置为默认能力值
const resetToDefaultAbilities = () => {
  abilities.value = abilities.value.map(ability => ({
    ...ability,
    currentValue: 0
  }))
}

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

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// 排序切换
const toggleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// 打开分配能力模态框
const openAssignAbilityModal = async (student: any) => {
  selectedStudent.value = student
  showAssignAbilityModal.value = true
  
  // 禁止背景页面滚动
  document.body.classList.add('modal-open')
  
  // 重置能力分配数据
  abilities.value.forEach(ability => {
    ability.assignedPoints = 0
  })
  
  // 加载学生当前能力数据
  await loadStudentAbilities(student.id)
}

// 关闭分配能力模态框
const closeAssignAbilityModal = () => {
  showAssignAbilityModal.value = false
  showConfirmDialog.value = false
  selectedStudent.value = null
  
  // 恢复背景页面滚动
  document.body.classList.remove('modal-open')
}

// 选择能力点数
const selectAbilityPoint = (abilityIndex: number, pointValue: number) => {
  const ability = abilities.value[abilityIndex]
  const maxAssignable = pointValue - ability.currentValue
  
  if (maxAssignable > 0 && maxAssignable <= (selectedStudent.value?.remainingPoints || 0)) {
    ability.assignedPoints = maxAssignable
  }
}

// 验证点数输入
const validatePointsInput = (abilityIndex: number) => {
  const ability = abilities.value[abilityIndex]
  const maxPoints = selectedStudent.value?.remainingPoints || 0
  
  if (ability.assignedPoints < 0) {
    ability.assignedPoints = 0
  }
  
  if (ability.assignedPoints > maxPoints) {
    ability.assignedPoints = maxPoints
  }
  
  // 确保不能减少当前值
  if (ability.assignedPoints < 0) {
    ability.assignedPoints = 0
  }
}

// 确认分配
const confirmAssignment = () => {
  if (totalAssignedPoints.value > 0) {
    showConfirmDialog.value = true
  }
}

// 执行分配
const executeAssignment = async () => {
  try {
    if (!selectedStudent.value) {
      throw new Error('未选择学生')
    }

    // 再次检查已分配点数是否大于剩余点数（双重保险）
    if (totalAssignedPoints.value > selectedStudent.value.remainingPoints) {
      throw new Error(`分配点数(${totalAssignedPoints.value})超过剩余可分配点数(${selectedStudent.value.remainingPoints})`)
    }

    // 构建能力数据更新对象
    const abilityUpdates: any = {}
    abilities.value.forEach(ability => {
      if (ability.assignedPoints > 0) {
        // 根据能力名称映射到数据库字段
        switch (ability.name) {
          case '前端开发':
            abilityUpdates.frontend_points = ability.currentValue + ability.assignedPoints
            break
          case '安卓开发':
            abilityUpdates.android_points = ability.currentValue + ability.assignedPoints
            break
          case '后端开发':
            abilityUpdates.backend_points = ability.currentValue + ability.assignedPoints
            break
          case '人工智能':
            abilityUpdates.ai_points = ability.currentValue + ability.assignedPoints
            break
          case '沟通能力':
            abilityUpdates.communication_points = ability.currentValue + ability.assignedPoints
            break
          case '创造力':
            abilityUpdates.creativity_points = ability.currentValue + ability.assignedPoints
            break
          case '领导力':
            abilityUpdates.leadership_points = ability.currentValue + ability.assignedPoints
            break
        }
      }
    })

    if (Object.keys(abilityUpdates).length === 0) {
      throw new Error('没有分配任何能力点数')
    }

    // 使用examinerService保存能力分配数据
    const response = await examinerService.assignStudentAbilities(selectedStudent.value.id, abilityUpdates)
    
    if (response.success) {
      console.log('为', selectedStudent.value.username, '分配点数:', totalAssignedPoints.value)
      
      // 更新学生剩余点数
      if (selectedStudent.value) {
        selectedStudent.value.remainingPoints = response.data.remainingPoints
      }
      
      // 更新学生列表中的剩余点数
      const studentIndex = students.value.findIndex(s => s.id === selectedStudent.value.id)
      if (studentIndex !== -1) {
        students.value[studentIndex].remainingPoints = response.data.remainingPoints
      }
      
      successMessage.value = `成功为 ${selectedStudent.value.username} 分配了 ${totalAssignedPoints.value} 点能力！剩余点数: ${response.data.remainingPoints}点`
      closeAssignAbilityModal()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('分配能力失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '分配能力失败，请重试'
    showConfirmDialog.value = false // 关闭确认对话框
  }
}

// 联系学生
const contactStudent = (student: any) => {
  alert(`联系学生: ${student.username} (${student.email})`)
}

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
      showTeacherKeyModal.value = true // 显示模态框
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

.main-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.layout-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.main-content {
  flex: 3;
  min-width: 0;
}

.bulletin-sidebar {
  flex: 1;
  min-width: 300px;
}

/* 学生管理与密钥生成区域 */
.student-key-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

/* 排序控件样式 */
.sort-controls {
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.sort-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sort-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-btn:hover {
  border-color: #87CEEB;
  color: #2c3e50;
}

.sort-btn.active {
  background: #87CEEB;
  border-color: #87CEEB;
  color: white;
}

.sort-arrow {
  font-weight: bold;
  font-size: 0.9rem;
}

/* 学生表格样式 */
.student-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  flex: 1;
}

.student-table th {
  background: #2c3e50;
  color: white;
  padding: 12px 10px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
}

.student-table td {
  padding: 10px 10px;
  border-bottom: 1px solid #ecf0f1;
  font-size: 0.85rem;
  height: 40px;
}

.student-row:hover {
  background: #f8f9fa;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.student-email {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.remaining-points {
  font-weight: 600;
  color: #27ae60;
  font-size: 0.9rem;
}

.remaining-points .zero-points {
  color: #e74c3c;
}

.student-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
  min-height: 32px;
}

.student-actions .button {
  flex-shrink: 0;
  white-space: nowrap;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空行样式 */
.empty-row {
  height: 40px;
  border-bottom: 1px solid #ecf0f1;
}

.empty-row td {
  background: #fafafa;
}

/* 分页控件 - 始终显示 */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-top: 1px solid #ecf0f1;
  min-height: 60px;
}

.page-info {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* 布告栏样式 */
.bulletin-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
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
  font-size: 1.1rem;
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
  font-size: 0.9rem;
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

/* 模态框样式 */
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

/* 分配能力模态框 - 瘦高型手机比例 */
.assign-ability-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px; /* 更窄的宽度，手机比例 */
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* 模态框打开时禁止背景滚动 */
.modal-open {
  overflow: hidden;
}

.modal-header {
  padding: 20px 25px 15px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 1.2rem;
}

.modal-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* 能力网格 - 7行垂直排列 */
.ability-grid {
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  gap: 12px; /* 更小的间距 */
  max-height: 500px;
  overflow-y: auto;
}

.ability-cell {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ability-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ability-icon {
  font-size: 1.1rem;
}

.current-score {
  color: #7f8c8d;
  font-size: 0.85rem;
}

/* 电池格样式 - 瘦高型手机比例 */
.battery-container {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.battery-grid {
  display: flex;
  gap: 2px;
  flex: 1;
}

.battery-cell {
  flex: 1;
  height: 25px; /* 增加高度，瘦高型 */
  border-radius: 3px;
  background: #ecf0f1;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ddd;
  min-width: 8px; /* 确保瘦高比例 */
}

/* 已分配的点数 - 绿色 */
.battery-cell.active {
  background: #4caf50;
  border-color: #388e3c;
}

/* 新增分配的点数 - 蓝色 */
.battery-cell.assigned {
  background: #2196f3;
  border-color: #1976d2;
}

/* 未分配的点数 - 灰色 */
.battery-cell.inactive {
  background: #ecf0f1;
  border-color: #ddd;
}

/* 可分配的悬停状态 - 浅蓝色 */
.battery-cell.hover-can-assign {
  background: #87CEEB;
  border-color: #5dade2;
  transform: scaleY(1.1);
}

/* 不可分配的悬停状态 - 红色 */
.battery-cell.hover-cannot-assign {
  background: #f44336;
  border-color: #d32f2f;
  cursor: not-allowed;
}

.ability-score {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  min-width: 50px;
  text-align: right;
}

.ability-score {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  display: block;
}

/* 分配控制 */
.assign-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.assign-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.points-input {
  width: 80px;
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
}

.points-input:focus {
  outline: none;
  border-color: #87CEEB;
}

.points-hint {
  font-size: 0.8rem;
  color: #95a5a6;
}

/* 模态框底部 */
.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #ecf0f1;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.total-assignment {
  text-align: center;
  margin-bottom: 15px;
}

.total-assignment p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.points-warning {
  color: #e74c3c !important;
  font-size: 0.9rem !important;
  margin: 5px 0 0 !important;
  font-weight: 500 !important;
}

.points-info {
  color: #27ae60 !important;
  font-size: 0.9rem !important;
  margin: 5px 0 0 !important;
  font-weight: 500 !important;
}

/* 确认对话框 */
.confirm-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  min-width: 300px;
}

.confirm-content h4 {
  margin: 0 0 15px;
  color: #e74c3c;
  text-align: center;
}

.confirm-content p {
  margin: 0 0 10px;
  color: #2c3e50;
}

/* 教师密钥模态框 */
.teacher-key-modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 450px;
  width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.teacher-key-modal .modal-header {
  padding: 25px 30px 20px;
  border-bottom: 1px solid #ecf0f1;
  text-align: center;
}

.teacher-key-modal .modal-header h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.teacher-key-modal .modal-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.key-content {
  padding: 25px 30px;
}

.key-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.key-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.key-icon {
  font-size: 1.5rem;
}

.key-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.key-value-section {
  margin-top: 15px;
}

.key-label {
  margin: 0 0 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.key-value {
  display: block;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0;
  word-break: break-all;
}

.key-hint {
  margin: 10px 0 0;
  color: #95a5a6;
  font-size: 0.85rem;
}

.teacher-key-modal .modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #ecf0f1;
}

.teacher-key-modal .modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-warning {
  color: #e74c3c !important;
  font-weight: 600;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-hint {
  font-size: 0.9rem;
  color: #95a5a6;
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .layout-container {
    flex-direction: column;
  }
  
  .bulletin-sidebar {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .main-layout {
    padding: 15px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls {
    justify-content: center;
  }
  
  .student-table {
    font-size: 0.8rem;
  }
  
  .student-table th,
  .student-table td {
    padding: 10px 8px;
  }
  
  .student-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .ability-grid {
    grid-template-columns: 1fr;
    padding: 15px;
  }
  
  .assign-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .points-input {
    width: 100%;
  }
}
</style>