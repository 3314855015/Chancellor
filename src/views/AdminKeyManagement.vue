<template>
  <div class="admin-key-management">
    <AdminNav 
      title="🔑 密钥管理" 
      subtitle="查看和管理所有生成的密钥"
    />
    
    <main class="main-content">
      <!-- 统计信息 -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🔑</div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalKeys }}</div>
              <div class="stat-label">总密钥数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.usedKeys }}</div>
              <div class="stat-label">已使用</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.unusedKeys }}</div>
              <div class="stat-label">未使用</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.expiredKeys }}</div>
              <div class="stat-label">已过期</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 密钥列表 -->
      <section class="keys-section">
        <div class="section-header">
          <h2 class="section-title">密钥列表</h2>
          <div class="section-actions">
            <Button label="刷新" @click="loadKeys" :loading="loading" />
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
                      :disabled="key.used"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminNav from '@/components/AdminNav.vue'
import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import adminService from '@/services/adminService'
import authService from '@/services/authService'

const router = useRouter()

// 响应式数据
const keys = ref<any[]>([])
const loading = ref(false)
const filterType = ref('')
const filterStatus = ref('')
const searchTerm = ref('')

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

const statistics = ref({
  totalKeys: 0,
  usedKeys: 0,
  unusedKeys: 0,
  expiredKeys: 0
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

    const response = await adminService.getKeysList(
      creatorId, 
      pagination.value.page, 
      pagination.value.pageSize
    )
    
    if (response.success && response.data) {
      keys.value = response.data.keys
      pagination.value = {
        ...pagination.value,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('加载密钥列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStatistics = async () => {
  try {
    const creatorId = getCurrentUserId()
    
    if (!creatorId) {
      return
    }

    const response = await adminService.getKeyStatistics(creatorId)
    
    if (response.success && response.data) {
      statistics.value = {
        totalKeys: response.data.totalKeys,
        usedKeys: response.data.usedKeys,
        unusedKeys: response.data.unusedKeys,
        expiredKeys: keys.value.filter(key => isExpired(key)).length
      }
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 过滤后的密钥列表
const filteredKeys = computed(() => {
  return keys.value.filter(key => {
    // 类型过滤
    if (filterType.value && key.keyType !== filterType.value) {
      return false
    }
    
    // 状态过滤
    if (filterStatus.value) {
      const status = getKeyStatus(key)
      if (filterStatus.value === 'unused' && status !== 'unused') return false
      if (filterStatus.value === 'used' && status !== 'used') return false
      if (filterStatus.value === 'expired' && status !== 'expired') return false
    }
    
    // 搜索过滤
    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      return (
        key.keyValue.toLowerCase().includes(term) ||
        key.creatorName.toLowerCase().includes(term) ||
        key.description?.toLowerCase().includes(term)
      )
    }
    
    return true
  })
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

// 复制密钥
const copyKey = (keyValue: string) => {
  navigator.clipboard.writeText(keyValue)
  alert('密钥已复制到剪贴板')
}

// 删除密钥
const deleteKey = async (keyId: number) => {
  if (!confirm('确定要删除这个密钥吗？此操作不可撤销。')) {
    return
  }
  
  try {
    const creatorId = getCurrentUserId()
    const response = await adminService.deleteKey(keyId, creatorId)
    
    if (response.success) {
      alert('密钥删除成功')
      await loadKeys()
      await loadStatistics()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : '删除密钥失败')
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

// 组件挂载时加载数据
onMounted(async () => {
  await loadKeys()
  await loadStatistics()
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

/* 统计区域 */
.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
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
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
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