<template>
  <div class="avatar-container">
    <div class="avatar" @click="$emit('click')">
      <div class="avatar-icon">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="url(#avatarGradient)"/>
          <circle cx="18" cy="14" r="4" fill="#ffffff"/>
          <path d="M10 26C10 21 16 18 18 18C20 18 26 21 26 26" stroke="#ffffff" stroke-width="2" fill="none"/>
          <defs>
            <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#667eea" />
              <stop offset="100%" stop-color="#764ba2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="user-info">
        <span class="username">{{ user?.username || '用户' }}</span>
        <span class="role-badge" :class="user?.role">{{ getRoleDisplayName(user?.role) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

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
</script>

<style scoped>
/* Avatar 容器样式 */
.avatar-container {
  position: relative;
  display: inline-block;
}

/* 头像区域样式 - 现代优化 */
.avatar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(15px);
  min-width: 140px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(102, 126, 234, 0.12);
}

.avatar:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(102, 126, 234, 0.4);
}

.avatar:active {
  transform: translateY(-1px) scale(1.01);
  transition: all 0.1s ease;
}

/* 头像图标样式 */
.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.avatar:hover .avatar-icon {
  transform: scale(1.1);
  background: rgba(102, 126, 234, 0.15);
}

/* 用户信息样式 */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.2;
  letter-spacing: 0.2px;
}

.role-badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 12px;
  color: white;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.role-badge.admin { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.role-badge.examiner { background: linear-gradient(135deg, #f39c12, #e67e22); }
.role-badge.enterprise { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
.role-badge.student { background: linear-gradient(135deg, #3498db, #2980b9); }



/* 响应式设计 */
@media (max-width: 480px) {
  .modal-content {
    max-width: 280px;
    margin: 20px;
  }
  
  .avatar {
    min-width: 120px;
    padding: 8px 12px;
  }
  
  .username {
    font-size: 0.85rem;
  }
  
  .role-badge {
    font-size: 0.7rem;
  }
}
</style>