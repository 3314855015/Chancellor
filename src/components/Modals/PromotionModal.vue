<template>
  <BaseModal 
    :visible="visible" 
    title="📈 升官 - 使用考官密钥"
    @close="handleClose"
  >
    <div class="promotion-content">
      <div class="info-section">
        <p>请输入考官密钥【升官】来升级为考官身份</p>
        <div class="key-input-section">
          <label for="promotion-key">考官密钥：</label>
          <input 
            id="promotion-key"
            v-model="keyValue"
            type="text"
            placeholder="请输入考官密钥"
            class="key-input"
          />
        </div>
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>
    
    <template #footer>
      <button class="confirm-btn" @click="handleConfirm" :disabled="loading">
        {{ loading ? '验证中...' : '确认升级' }}
      </button>
      <button class="cancel-btn" @click="handleClose">取消</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const keyValue = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleClose = () => {
  keyValue.value = ''
  errorMessage.value = ''
  loading.value = false
  emit('close')
}

const handleConfirm = async () => {
  if (!keyValue.value.trim()) {
    errorMessage.value = '请输入考官密钥'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // 首先验证密钥类型
    const validationResult = await authStore.validateKey(keyValue.value)
    
    if (!validationResult.success) {
      errorMessage.value = validationResult.message || '密钥验证失败'
      return
    }

    // 检查密钥类型是否为promotion（考官密钥）
    const keyType = validationResult.data?.key?.keyType
    if (keyType !== 'promotion') {
      errorMessage.value = '请输入正确的考官密钥'
      return
    }

    // 调用API服务进行权限升级
    const result = await authStore.upgradeRole({ keyValue: keyValue.value })
    
    if (result.success) {
      emit('success')
      handleClose()
    } else {
      errorMessage.value = result.message || '密钥验证失败'
    }
  } catch (error) {
    console.error('升级失败:', error)
    errorMessage.value = '升级失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.promotion-content {
  text-align: center;
}

.info-section {
  margin-bottom: 20px;
}

.info-section p {
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 20px;
}

.key-input-section {
  text-align: left;
  margin-bottom: 15px;
}

.key-input-section label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.key-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.key-input:focus {
  outline: none;
  border-color: #87CEEB;
  box-shadow: 0 0 0 2px rgba(135, 206, 235, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 10px;
  text-align: center;
}

.confirm-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
  margin-right: 10px;
}

.confirm-btn:hover:not(:disabled) {
  background: #45a049;
}

.confirm-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.cancel-btn:hover {
  background: #7f8c8d;
}
</style>