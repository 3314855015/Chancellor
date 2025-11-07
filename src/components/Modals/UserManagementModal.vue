<template>
  <BaseModal
    v-model:visible="visible"
    title="👥 用户管理"
    size="large"
    width="1200px"
    @close="$emit('close')"
  >
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">角色筛选：</label>
          <select v-model="filters.role" class="filter-select" @change="loadUsers">
            <option value="">全部角色</option>
            <option value="admin">管理员</option>
            <option value="student">学生</option>
            <option value="enterprise">企业</option>
            <option value="examiner">考官</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">状态筛选：</label>
          <select v-model="filters.status" class="filter-select" @change="loadUsers">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="suspended">暂停</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">学生状态：</label>
          <select v-model="filters.student_status" class="filter-select" @change="loadUsers">
            <option value="">全部状态</option>
            <option value="wild">野生</option>
            <option value="selected">已选择</option>
          </select>
        </div>
        
        <Button label="重置筛选" size="small" variant="secondary" @click="resetFilters" />
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>学生状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!-- 实际用户数据行 -->
          <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
            <td class="username">{{ user.username }}</td>
            <td class="email">{{ user.email || '未设置' }}</td>
            <td class="role">
              <select 
                v-model="user.role" 
                class="editable-select"
                :disabled="user.role === 'admin'"
                @change="updateUserField(user.id, 'role', user.role)"
              >
                <option value="student">学生</option>
                <option value="enterprise">企业</option>
                <option value="examiner">考官</option>
                <option value="admin" disabled>管理员</option>
              </select>
            </td>
            <td class="status">
              <select 
                v-model="user.status" 
                class="editable-select"
                :disabled="user.role === 'admin'"
                @change="updateUserField(user.id, 'status', user.status)"
              >
                <option value="active">活跃</option>
                <option value="inactive">非活跃</option>
                <option value="suspended">暂停</option>
              </select>
            </td>
            <td class="student-status">
              <select 
                v-if="user.role === 'student'"
                v-model="user.student_status" 
                class="editable-select"
                @change="updateUserField(user.id, 'student_status', user.student_status)"
              >
                <option value="wild">野生</option>
                <option value="selected">已选择</option>
              </select>
              <span v-else class="not-applicable">-</span>
            </td>
            <td class="created-at">{{ formatDate(user.created_at) }}</td>
            <td class="actions">
              <Button 
                label="暂停" 
                size="small" 
                variant="danger" 
                @click="confirmSuspendUser(user)"
                :disabled="user.role === 'admin' || user.status === 'suspended'"
                :class="{ 'disabled-btn': user.role === 'admin' || user.status === 'suspended' }"
              />
            </td>
          </tr>
          
          <!-- 空行填充，确保始终显示7行 -->
          <tr v-for="i in (7 - users.length)" :key="`empty-${i}`" class="empty-row">
            <td colspan="7">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页控件 -->
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

    <!-- 空状态 -->
    <div v-if="users.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">👨‍🎓</div>
      <p>暂无用户数据</p>
      <p class="empty-hint">请检查筛选条件或联系系统管理员</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 消息显示 -->
    <div v-if="message" :class="['message', message.type]">
      {{ message.text }}
    </div>

    <template #footer>
      <Button label="关闭" @click="$emit('close')" />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import Button from '@/components/Button.vue'
import adminService from '@/services/adminService'
import authService from '@/services/authService'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'student' | 'enterprise' | 'examiner'
  status: 'active' | 'inactive' | 'suspended'
  student_status?: 'wild' | 'selected'
  created_at: string
  updated_at: string
}

interface Props {
  visible: boolean
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const visible = ref(props.visible)
const users = ref<User[]>([])
const loading = ref(false)
const message = ref<Message | null>(null)

// 筛选条件
const filters = ref({
  role: '',
  status: '',
  student_status: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = 7
const totalUsers = ref(0)
const totalPages = ref(1)

// 计算属性 - 直接使用从API获取的分页数据
const paginatedUsers = computed(() => users.value)

// 监听visible变化
watch(() => props.visible, (newVal) => {
  visible.value = newVal
  if (newVal) {
    loadUsers()
  }
})

// 获取当前用户ID
const getCurrentUserId = () => {
  const user = authService.getCurrentUser()
  return user?.id || ''
}

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const userId = getCurrentUserId()
    if (!userId) {
      throw new Error('用户未登录')
    }

    const response = await adminService.getUsersList(
      userId, 
      currentPage.value, 
      pageSize,
      {
        role: filters.value.role || undefined,
        status: filters.value.status || undefined,
        student_status: filters.value.student_status || undefined
      }
    )

    if (response.success) {
      users.value = response.data.users
      totalUsers.value = response.data.pagination.total
      totalPages.value = response.data.pagination.totalPages
      
      // 确保当前页数不超过总页数
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    showMessage('error', error instanceof Error ? error.message : '加载用户列表失败')
    users.value = []
    totalUsers.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

// 更新用户字段
const updateUserField = async (userId: string, field: string, value: any) => {
  try {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      throw new Error('用户未登录')
    }

    const updates = { [field]: value }
    const response = await adminService.updateUser(currentUserId, userId, updates)

    if (response.success) {
      showMessage('success', '用户信息更新成功')
      loadUsers() // 重新加载数据
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    showMessage('error', error instanceof Error ? error.message : '更新用户信息失败')
    // 重新加载数据以恢复原始状态
    loadUsers()
  }
}

// 确认暂停用户
const confirmSuspendUser = (user: User) => {
  if (user.role === 'admin') {
    showMessage('error', '不能暂停管理员账户')
    return
  }

  if (user.status === 'suspended') {
    showMessage('error', '用户已经是暂停状态')
    return
  }

  if (confirm(`确定要暂停用户 "${user.username}" 吗？暂停后用户将无法登录系统。`)) {
    suspendUser(user.id)
  }
}

// 暂停用户
const suspendUser = async (userId: string) => {
  try {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      throw new Error('用户未登录')
    }

    const response = await adminService.suspendUser(currentUserId, userId)

    if (response.success) {
      showMessage('success', '用户已暂停')
      loadUsers() // 重新加载数据
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    showMessage('error', error instanceof Error ? error.message : '暂停用户失败')
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    role: '',
    status: '',
    student_status: ''
  }
  loadUsers()
}

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadUsers()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadUsers()
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 显示消息
const showMessage = (type: 'success' | 'error', text: string) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 3000)
}

// 初始化
onMounted(() => {
  if (visible.value) {
    loadUsers()
  }
})
</script>

<style scoped>
.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-width: 120px;
}

.user-table-container {
  margin: 20px 0;
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.user-table th {
  background: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.user-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
}

.user-row:hover {
  background: #f8f9fa;
}

.empty-row {
  height: 48px;
}

.empty-row td {
  border-bottom: 1px solid #e9ecef;
}

.editable-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-width: 100px;
}

.editable-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.not-applicable {
  color: #6c757d;
  font-style: italic;
}

.username {
  font-weight: 500;
}

.email {
  color: #6c757d;
}

.role, .status, .student-status {
  text-align: center;
}

.created-at {
  color: #6c757d;
  font-size: 0.9rem;
}

.actions {
  text-align: center;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.page-info {
  font-weight: 500;
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 5px;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  padding: 10px 15px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .user-table {
    font-size: 0.9rem;
  }
  
  .user-table th,
  .user-table td {
    padding: 8px 10px;
  }
}
</style>