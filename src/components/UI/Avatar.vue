<template>
  <div class="avatar-container">
    <div class="avatar" @click="toggleDropdown">
      <div class="avatar-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#87CEEB"/>
          <circle cx="16" cy="12" r="4" fill="#2c3e50"/>
          <path d="M8 24C8 20 12 18 16 18C20 18 24 20 24 24" stroke="#2c3e50" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="user-info">
        <span class="username">{{ user?.username || '用户' }}</span>
        <span class="role-badge" :class="user?.role">{{ getRoleDisplayName(user?.role) }}</span>
      </div>
    </div>
    
    <!-- 下拉菜单 -->
    <div v-if="showDropdown" class="dropdown-menu">
      <div class="dropdown-header">
        <div class="user-details">
          <strong>{{ user?.username }}</strong>
          <span class="user-email">{{ user?.email }}</span>
        </div>
      </div>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" @click="handleLogout">
        <span class="dropdown-icon">🚪</span>
        <span>退出登录</span>
      </button>
    </div>
    
    <!-- 下拉菜单遮罩 -->
    <div v-if="showDropdown" class="dropdown-overlay" @click="hideDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const showDropdown = ref(false)

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

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const hideDropdown = () => {
  showDropdown.value = false
}

const handleLogout = async () => {
  try {
    await authStore.userLogout()
    hideDropdown()
    // 退出后刷新页面
    window.location.reload()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.avatar-container')) {
    hideDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(135, 206, 235, 0.5);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.avatar:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
  border-color: rgba(135, 206, 235, 0.8);
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(135, 206, 235, 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.username {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1;
}

.role-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 8px;
  color: white;
  line-height: 1;
}

.role-badge.admin { background: #e74c3c; }
.role-badge.examiner { background: #f39c12; }
.role-badge.enterprise { background: #9b59b6; }
.role-badge.student { background: #3498db; }

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-details strong {
  color: #2c3e50;
  font-size: 0.9rem;
}

.user-email {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  color: #2c3e50;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-icon {
  font-size: 1rem;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}
</style>