import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户信息接口
interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
}

// 应用状态存储
export const useAppStore = defineStore('app', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  // getters
  const isLoggedIn = computed(() => !!userInfo.value)
  const userName = computed(() => userInfo.value?.name || '游客')

  // actions
  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const logout = () => {
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    // state
    userInfo,
    isLoading,
    theme,
    
    // getters
    isLoggedIn,
    userName,
    
    // actions
    setUserInfo,
    setLoading,
    toggleTheme,
    logout
  }
})