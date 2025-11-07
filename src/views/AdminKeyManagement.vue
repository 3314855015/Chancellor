<template>
  <div class="admin-key-management">
    <AdminNav 
      title="🔑 密钥管理" 
      subtitle="查看和管理所有生成的密钥"
    />
    
    <!-- 通知组件 -->
    <Notification 
      v-model:visible="notification.visible"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="hideNotification"
    />
    
    <main class="main-content">

      <!-- 密钥列表 -->
      <section class="keys-section">
        <div class="section-header">
          <h2 class="section-title">密钥列表</h2>
          <div class="section-actions">
            <Button label="刷新" @click="loadKeys" :loading="loading" />
            <Button label="清理过期密钥" @click="manualCleanup" :loading="loading" />
            <div class="auto-cleanup-toggle">
              <label class="toggle-label">
                <span class="toggle-text">定时清理(30min)</span>
                <input 
                  type="checkbox" 
                  v-model="autoCleanupEnabled" 
                  @change="toggleAutoCleanup"
                  class="toggle-switch"
                />
                <span class="slider"></span>
              </label>
            </div>
            <Button label="返回主页" @click="goBack" />
          </div>
        </div>

        <!-- 过滤和搜索 -->
        <div class="filters">
          <select v-model="filterType" class="filter-select">
            <option value="">所有类型</option>
            <option value="invitation">企业密钥</option>
            <option value="promotion">考官密钥</option>
            <option value="teacher">教师密钥</option>
          </select>
          
          <select v-model="filterStatus" class="filter-select">
            <option value="">所有状态</option>
            <option value="unused">未使用</option>
            <option value="used">已使用</option>
            <option value="expired">已过期</option>
          </select>
          
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="搜索密钥..." 
            class="search-input"
          />
        </div>

        <!-- 密钥表格 -->
        <div class="keys-table">
          <table>
            <thead>
              <tr>
                <th>密钥值</th>
                <th>类型</th>
                <th>状态</th>
                <th>创建者</th>
                <th>过期时间</th>
                <th>使用次数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="key in filteredKeys" :key="key.id" :class="{ expired: isExpired(key) }">
                <td>
                  <code class="key-value">{{ key.keyValue }}</code>
                </td>
                <td>
                  <span :class="`key-type ${key.keyType}`">
                    {{ getKeyTypeName(key.keyType) }}
                  </span>
                </td>
                <td>
                  <span :class="`key-status ${getKeyStatus(key)}`">
                    {{ getKeyStatusText(key) }}
                  </span>
                </td>
                <td>{{ key.creatorName }}</td>
                <td>{{ formatDate(key.expiresAt) }}</td>
                <td>{{ key.currentUses }}/{{ key.maxUses }}</td>
                <td>
                  <div class="actions">
                    <Button 
                      label="复制" 
                      size="small" 
                      @click="copyKey(key.keyValue)"
                    />
                    <Button 
                      label="删除" 
                      size="small" 
                      variant="danger"
                      @click="deleteKey(key.id)"
                      :disabled="key.used || isExpired(key)"
                      :title="getDeleteButtonTitle(key)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredKeys.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>没有找到匹配的密钥</p>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <Button 
            label="上一页" 
            @click="previousPage" 
            :disabled="pagination.page <= 1"
          />
          <span class="page-info">
            第 {{ pagination.page }} 页，共 {{ pagination.totalPages }} 页
          </span>
          <Button 
            label="下一页" 
            @click="nextPage" 
            :disabled="pagination.page >= pagination.totalPages"
          />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminNav from '@/components/Nav/AdminNav.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import Notification from '@/components/UI/Notification.vue'
import { useNotification } from '@/composables/useNotification'
import adminService from '@/services/adminService'
import authService from '@/services/authService'

const router = useRouter()
const { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning, 
  notification, 
  hideNotification 
} = useNotification()

// 响应式数据 
const keys = ref<any[]>([])
const loading = ref(false)
const filterType = ref('')
const filterStatus = ref('')
const searchTerm = ref('')
const autoCleanupEnabled = ref(false)
const cleanupInterval = ref<NodeJS.Timeout | null>(null)

const pagination = ref({
  page: 1,
  pageSize: 10, // 改为每页10条
  total: 0,
  totalPages: 0
})

// 获取当前用户ID
const getCurrentUserId = () => {
  const user = authService.getCurrentUser()
  return user?.id || ''
}

// 加载密钥列表
const loadKeys = async () => {
  try {
    loading.value = true
    const creatorId = getCurrentUserId()
    
    if (!creatorId) {
      throw new Error('用户未登录')
    }

    // 构建过滤参数
    const filters: {
      keyType?: string;
      status?: string;
      searchTerm?: string;
    } = {}
    if (filterType.value) {
      filters.keyType = filterType.value
    }
    if (filterStatus.value) {
      filters.status = filterStatus.value
    }
    if (searchTerm.value) {
      filters.searchTerm = searchTerm.value
    }

    const response = await adminService.getKeysList(
      creatorId, 
      pagination.value.page, 
      pagination.value.pageSize,
      filters
    )
    
    if (response.success && response.data) {
      // 每次只保留当前页的数据
      keys.value = response.data.keys || []
      pagination.value = {
        ...pagination.value,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    // 静默处理错误，不显示控制台日志
    keys.value = []
    pagination.value = {
      ...pagination.value,
      total: 0,
      totalPages: 0
    }
  } finally {
    loading.value = false
  }
}



// 过滤后的密钥列表（直接使用服务器返回的数据，不进行客户端过滤）
const filteredKeys = computed(() => {
  return keys.value
})

// 密钥状态判断
const getKeyStatus = (key: any) => {
  if (key.used) return 'used'
  if (isExpired(key)) return 'expired'
  return 'unused'
}

const getKeyStatusText = (key: any) => {
  const status = getKeyStatus(key)
  switch (status) {
    case 'used': return '已使用'
    case 'expired': return '已过期'
    default: return '未使用'
  }
}

const isExpired = (key: any) => {
  return new Date(key.expiresAt) < new Date()
}

// 密钥类型名称
const getKeyTypeName = (type: string) => {
  switch (type) {
    case 'invitation': return '企业密钥'
    case 'promotion': return '考官密钥'
    case 'teacher': return '教师密钥'
    default: return type
  }
}

// 删除按钮提示信息
const getDeleteButtonTitle = (key: any) => {
  if (key.used) {
    return '已使用的密钥不能删除'
  }
  if (isExpired(key)) {
    return '已过期的密钥不能删除'
  }
  return '删除此密钥'
}

// 复制密钥
const copyKey = (keyValue: string) => {
  navigator.clipboard.writeText(keyValue)
  alert('密钥已复制到剪贴板')
}

// 删除密钥
const deleteKey = async (keyId: number) => {
  // 先检查密钥状态，已使用或已过期的密钥不能删除
  const key = keys.value.find(k => k.id === keyId)
  if (!key) {
    showWarning('未找到要删除的密钥')
    return
  }
  
  if (key.used) {
    showWarning('已使用的密钥不能删除')
    return
  }
  
  if (isExpired(key)) {
    showWarning('已过期的密钥不能删除')
    return
  }
  
  if (!confirm('确定要删除这个密钥吗？此操作不可撤销。')) {
    return
  }
  
  try {
    const creatorId = getCurrentUserId()
    const response = await adminService.deleteKey(keyId, creatorId)
    
      if (response.success) {
      showSuccess('密钥删除成功')
      await loadKeys()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : '删除密钥失败')
  }
}

// 分页操作
const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    loadKeys()
  }
}

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadKeys()
  }
}

// 返回主页
const goBack = () => {
  router.push('/admin')
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 监听过滤条件变化，重置页码并重新加载数据
watch([filterType, filterStatus, searchTerm], () => {
  // 重置到第一页
  pagination.value.page = 1
  loadKeys()
}, { deep: true })

// 手动清理过期密钥
const manualCleanup = async () => {
  try {
    const creatorId = getCurrentUserId()
    if (!creatorId) {
      showWarning('用户未登录')
      return
    }
    
    loading.value = true
    const response = await adminService.cleanupExpiredKeys(creatorId)
    
    if (response.success) {
      const deletedCount = response.data?.deletedCount || 0
      if (deletedCount > 0) {
        showSuccess(`清理完成，删除了 ${deletedCount} 个过期密钥`)
      } else {
        showInfo('没有发现需要清理的过期密钥')
      }
      await loadKeys()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : '清理失败')
  } finally {
    loading.value = false
  }
}

// 切换定时清理功能
const toggleAutoCleanup = () => {
  if (autoCleanupEnabled.value) {
    // 启动定时清理
    startAutoCleanup()
    showInfo('定时清理已开启，每30分钟自动清理一次过期密钥')
  } else {
    // 停止定时清理
    stopAutoCleanup()
    showInfo('定时清理已关闭')
  }
}

// 启动定时清理
const startAutoCleanup = () => {
  // 立即执行一次清理
  performAutoCleanup()
  
  // 每30分钟执行一次清理
  cleanupInterval.value = setInterval(() => {
    performAutoCleanup()
  }, 30 * 60 * 1000) // 30分钟
}

// 停止定时清理
const stopAutoCleanup = () => {
  if (cleanupInterval.value) {
    clearInterval(cleanupInterval.value)
    cleanupInterval.value = null
  }
}

// 执行自动清理
const performAutoCleanup = async () => {
  try {
    const creatorId = getCurrentUserId()
    if (!creatorId) {
      return
    }
    
    const response = await adminService.cleanupExpiredKeys(creatorId)
    if (response.success) {
      const deletedCount = response.data?.deletedCount || 0
      if (deletedCount > 0) {
        showSuccess(`自动清理完成，删除了 ${deletedCount} 个过期密钥`)
        // 如果当前页面正在显示，则刷新数据
        await loadKeys()
      }
    }
  } catch (error) {
    showError('自动清理失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoCleanup()
})

// 组件挂载时加载数据
onMounted(async () => {
  await loadKeys()
})
</script>

<style scoped>
.admin-key-management {
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



/* 密钥列表区域 */
.keys-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.section-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 过滤区域 */
.filters {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.filter-select,
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

/* 表格样式 */
.keys-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.key-value {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.key-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.key-type.invitation {
  background: #e3f2fd;
  color: #1976d2;
}

.key-type.promotion {
  background: #f3e5f5;
  color: #7b1fa2;
}

.key-type.teacher {
  background: #e8f5e8;
  color: #388e3c;
}

.key-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.key-status.unused {
  background: #e8f5e8;
  color: #388e3c;
}

.key-status.used {
  background: #fff3e0;
  color: #f57c00;
}

.key-status.expired {
  background: #ffebee;
  color: #d32f2f;
}

tr.expired {
  opacity: 0.6;
}

.actions {
  display: flex;
  gap: 5px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

/* 自动清理切换开关样式 */
.auto-cleanup-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
}

.toggle-text {
  font-weight: 500;
}

.toggle-switch {
  display: none;
}

.slider {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 24px;
  transition: background-color 0.3s;
}

.slider:before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch:checked + .slider {
  background-color: #4CAF50;
}

.toggle-switch:checked + .slider:before {
  transform: translateX(26px);
}

.toggle-switch:focus + .slider {
  box-shadow: 0 0 1px #4CAF50;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.page-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-input {
    max-width: none;
  }
  
  table {
    font-size: 0.8rem;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>