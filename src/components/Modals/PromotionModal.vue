<template>
  <BaseModal 
    :visible="visible" 
    title="📈 升官 - 生成考官密钥"
    @close="$emit('close')"
  >
    <div class="promotion-content">
      <div class="info-section">
        <p>生成考官密钥【升官】，用于教师身份认证和注册。</p>
        <div class="key-display" v-if="generatedKey">
          <h4>生成的密钥：</h4>
          <div class="key-value">{{ generatedKey }}</div>
          <button class="copy-btn" @click="copyKey">复制密钥</button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <button class="generate-btn" @click="generateKey">
        {{ generatedKey ? '重新生成' : '生成密钥' }}
      </button>
      <button class="cancel-btn" @click="$emit('close')">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'

interface Props {
  visible: boolean
}

defineProps<Props>()

// const emit = defineEmits<{
//   close: []
// }>()

const generatedKey = ref('')

const generateKey = () => {
  generatedKey.value = 'SJ_' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const copyKey = async () => {
  try {
    await navigator.clipboard.writeText(generatedKey.value)
    alert('密钥已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制密钥')
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