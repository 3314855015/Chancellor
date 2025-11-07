<template>
  <div v-if="visible" class="user-info-modal-overlay" @click="closeModal">
    <div class="user-info-modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <h3>用户信息</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <!-- 用户信息内容 -->
      <div class="user-details-modal">
        <div class="user-avatar-modal">
          <div class="avatar-icon-large">
            <svg width="60" height="60" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="18" fill="url(#avatarGradientLarge)"/>
              <circle cx="18" cy="14" r="4" fill="#ffffff"/>
              <path d="M10 26C10 21 16 18 18 18C20 18 26 21 26 26" stroke="#ffffff" stroke-width="2" fill="none"/>
              <defs>
                <linearGradient id="avatarGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#667eea" />
                  <stop offset="100%" stop-color="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <div class="user-info-content">
          <div class="info-item">
            <label>姓名</label>
            <div class="info-value gray-text">{{ user?.username || '用户' }}</div>
          </div>
          <div class="info-item">
            <label>邮箱</label>
            <div class="info-value gray-text">{{ user?.email || '未设置邮箱' }}</div>
          </div>
          <div class="info-item">
            <label>角色</label>
            <div class="info-value gray-text">{{ getRoleDisplayName(user?.role) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="modal-actions">
        <button class="btn-back" @click="closeModal">返回</button>
        <button class="btn-logout" @click="handleLogout">退出登录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

// 角色显示名称映射
const getRoleDisplayName = (role: string | undefined) => {
  switch (role) {
    case 'admin': return '管理员'
    case 'examiner': return '考官'
    case 'enterprise': return '州牧'
    case 'student': return '监生'
    default: return '用户'
  }
}

const closeModal = () => {
  emit('update:visible', false)
  emit('close')
}

const handleLogout = async () => {
  try {
    await authStore.userLogout()
    closeModal()
    // 跳转到主页
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
/* 用户信息模态框样式 */
.user-info-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.user-info-modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 320px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #95a5a6;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

/* 用户信息内容 */
.user-details-modal {
  padding: 24px;
}

.user-avatar-modal {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-icon-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.user-info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 0;
}

.gray-text {
  color: #95a5a6 !important;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #ecf0f1;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-back, .btn-logout {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #e9ecef;
}

.btn-back:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.btn-logout {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .user-info-modal-content {
    max-width: 280px;
    margin: 20px;
  }
}
</style>