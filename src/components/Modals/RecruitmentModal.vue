<template>
  <BaseModal 
    :visible="visible" 
    title="👥 招生 - 生成学生密钥"
    @close="handleClose"
  >
    <div class="recruitment-content">
      <div class="info-section">
        <p>生成学生密钥【招生】，用于学生身份认证和注册。</p>
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
        <div class="key-display" v-if="generatedKey">
          <h4>生成的密钥：</h4>
          <div class="key-value">{{ generatedKey.keyValue }}</div>
          <div class="key-info">
            <p><strong>类型：</strong>{{ generatedKey.keyType === 'invitation' ? '招生密钥' : generatedKey.keyType }}</p>
            <p><strong>过期时间：</strong>{{ formatDate(generatedKey.expiresAt) }}</p>
            <p><strong>最大使用次数：</strong>{{ generatedKey.maxUses }}次</p>
          </div>
          <button class="copy-btn" @click="copyKey">复制密钥</button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <button class="generate-btn" @click="generateKey" :disabled="loading">
        {{ loading ? '生成中...' : (generatedKey ? '重新生成' : '生成密钥') }}
      </button>
      <button class="cancel-btn" @click="handleClose">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import adminService from '@/services/adminService'
import authService from '@/services/authService'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const generatedKey = ref<any>(null)
const errorMessage = ref('')
const loading = ref(false)

const handleClose = () => {
  generatedKey.value = null
  errorMessage.value = ''
  loading.value = false
  emit('close')
}

const generateKey = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser?.id) {
      throw new Error('用户未登录')
    }

    const response = await adminService.generateKey({
      keyType: 'invitation',
      expiresInDays: 30,
      maxUses: 10,
      description: '招生密钥 - 用于学生注册'
    }, currentUser.id)

    if (response.success && response.data.key) {
      generatedKey.value = response.data.key
    } else {
      throw new Error(response.message || '密钥生成失败')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成密钥失败'
  } finally {
    loading.value = false
  }
}

const copyKey = async () => {
  if (!generatedKey.value) return
  
  try {
    await navigator.clipboard.writeText(generatedKey.value.keyValue)
    alert('密钥已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制密钥')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.recruitment-content {
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

.key-display {
  background: rgba(135, 206, 235, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.key-display h4 {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 1rem;
}

.key-value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1.1rem;
  color: #f57c00;
  margin-bottom: 10px;
  word-break: break-all;
}

.copy-btn {
  background: #87CEEB;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.copy-btn:hover {
  background: #76b9d6;
}

.generate-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.generate-btn:hover {
  background: #45a049;
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