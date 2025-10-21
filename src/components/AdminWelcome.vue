<template>
  <div class="admin-welcome">
    <div class="welcome-content">
      <h1 class="welcome-title">皇上，您吉祥~</h1>
      <p class="welcome-subtitle">又是万众瞩目的科举，您要邀请州牧还是任命考官？</p>
      <div class="welcome-actions">
        <button class="welcome-btn primary" @click="inviteEnterprise">
          📨 邀请州牧
        </button>
        <button class="welcome-btn secondary" @click="appointExaminer">
          📈 任命考官
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const inviteEnterprise = () => {
  // 跳转到生成企业密钥功能
  alert('生成企业密钥【请帖】')
}

const appointExaminer = () => {
  // 跳转到生成考官密钥功能
  alert('生成考官密钥【升官】')
}
</script>

<style scoped>
.admin-welcome {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 30%, #fff176 100%);
  color: #5d4037;
  padding: 6rem 2rem;
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.admin-welcome::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.welcome-content {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #5d4037 0%, #8d6e63 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.5);
  }
}

.welcome-subtitle {
  font-size: 1.3rem;
  margin: 0 0 3rem 0;
  opacity: 0.95;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.welcome-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.welcome-btn.primary {
  background: rgba(255, 255, 255, 0.9);
  color: #f57c00;
  box-shadow: 0 4px 15px rgba(245, 124, 0, 0.2);
}

.welcome-btn.primary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 124, 0, 0.3);
}

.welcome-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: #5d4037;
  border: 2px solid rgba(93, 64, 55, 0.3);
  box-shadow: 0 4px 15px rgba(93, 64, 55, 0.1);
}

.welcome-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(93, 64, 55, 0.2);
}

@media (max-width: 768px) {
  .admin-welcome {
    padding: 3rem 1rem;
  }
  
  .welcome-title {
    font-size: 2.2rem;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .welcome-btn {
    width: 200px;
  }
}
</style>