<template>
  <header class="student-nav">
    <div class="nav-content">
      <!-- 返回按钮 -->
      <BackButton />
      
      <!-- 标题区域 -->
      <div class="title-section">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      
      <!-- 按钮区域 -->
      <div class="action-section">
        <button class="action-btn" @click="showPromotionModal">
          <span class="btn-icon">📈</span>
          <span class="btn-text">升官</span>
        </button>
        <button class="action-btn" @click="showInvitationModal">
          <span class="btn-icon">📨</span>
          <span class="btn-text">接受邀约</span>
        </button>
        <Avatar />
      </div>
    </div>

    <!-- 升官模态框 -->
    <PromotionModal 
      v-model:visible="showPromotion" 
      @close="hidePromotionModal"
      @success="handlePromotionSuccess"
    />

    <!-- 接受邀约模态框 -->
    <InvitationModal 
      v-model:visible="showInvitation" 
      @close="hideInvitationModal"
      @success="handleInvitationSuccess"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackButton from '@/components/UI/BackButton.vue'
import Avatar from '@/components/UI/Avatar.vue'
import PromotionModal from '@/components/Modals/PromotionModal.vue'
import InvitationModal from '@/components/Modals/InvitationModal.vue'

interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()

const showPromotion = ref(false)
const showInvitation = ref(false)

const showPromotionModal = () => {
  showPromotion.value = true
}

const hidePromotionModal = () => {
  showPromotion.value = false
}

const showInvitationModal = () => {
  showInvitation.value = true
}

const hideInvitationModal = () => {
  showInvitation.value = false
}

const handlePromotionSuccess = () => {
  // 身份升级成功，跳转到主页面（下次登录会直接进入对应角色页面）
  window.location.href = '/'
}

const handleInvitationSuccess = () => {
  // 身份升级成功，跳转到主页面（下次登录会直接进入对应角色页面）
  window.location.href = '/'
}
</script>

<style scoped>
.student-nav {
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(135, 206, 235, 0.3);
}

.nav-content {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-section h1 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

.title-section p {
  margin: 5px 0 0;
  color: #34495e;
  font-size: 1rem;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #2c3e50;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.8);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .action-section {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>