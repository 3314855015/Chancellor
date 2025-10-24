// 认证状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  User, 
  UserState, 
  LoginRequest, 
  RegisterRequest, 
  UserAbilities,
  UseKeyRequest,
  GenerateKeyRequest 
} from '@/types/auth'
import { 
  login, 
  register, 
  logout, 
  getCurrentUser, 
  validateToken,
  useKey,
  generateKey,
  validateKey 
} from '@/services/supabaseAuthService'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const abilities = ref<UserAbilities | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取状态
  const getState = (): UserState => ({
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    token: token.value,
    abilities: abilities.value,
    loading: loading.value,
    error: error.value
  })

  // 设置错误
  const setError = (message: string | null) => {
    error.value = message
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  // 设置加载状态
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  // 设置用户信息
  const setUser = (userData: User | null) => {
    user.value = userData
    isAuthenticated.value = !!userData
  }

  // 设置token
  const setToken = (newToken: string | null) => {
    token.value = newToken
    // 实际项目中应该将token存储到localStorage
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  // 设置能力信息
  const setAbilities = (abilitiesData: UserAbilities | null) => {
    abilities.value = abilitiesData
  }

  // 用户登录
  const userLogin = async (credentials: LoginRequest) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await login(credentials)
      
      if (response.success) {
        setUser(response.data.user)
        setToken(response.data.token)
        setAbilities(response.data.abilities || null)
        return { success: true, message: response.message }
      } else {
        setError(response.message)
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // 用户注册
  const userRegister = async (userData: RegisterRequest) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await register(userData)
      
      if (response.success) {
        // 注册成功后不自动登录，需要用户手动登录
        return { success: true, message: response.message }
      } else {
        setError(response.message)
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // 用户登出
  const userLogout = async () => {
    setLoading(true)
    
    try {
      await logout()
      setUser(null)
      setToken(null)
      setAbilities(null)
      clearError()
    } catch (err) {
      console.error('登出失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 检查登录状态
  const checkAuthStatus = async () => {
    const savedToken = localStorage.getItem('auth_token')
    
    if (!savedToken) {
      return false
    }
    
    try {
      const isValid = await validateToken()
      if (isValid) {
        // 从token中提取用户ID
        // 注意：这里需要根据实际的token格式来提取用户ID
        // 由于我们使用的是Supabase认证，可能需要从JWT token中解析用户信息
        // 暂时使用简单的用户ID存储方式
        const userId = localStorage.getItem('user_id')
        
        if (userId) {
          const response = await getCurrentUser(userId)
          if (response.success && response.data.user) {
            setUser(response.data.user)
            setToken(savedToken)
            setAbilities(response.data.abilities || null)
            return true
          }
        }
      }
    } catch (err) {
      console.error('检查登录状态失败:', err)
    }
    
    // token无效，清除本地存储
    setUser(null)
    setToken(null)
    setAbilities(null)
    return false
  }

  // 使用密钥升级权限
  const upgradeRole = async (request: UseKeyRequest) => {
    setLoading(true)
    clearError()
    
    if (!user.value) {
      setError('请先登录')
      setLoading(false)
      return { success: false, message: '请先登录' }
    }
    
    try {
      const response = await useKey(request, user.value.id)
      
      if (response.success) {
        setUser(response.data.user)
        setAbilities(response.data.abilities || null)
        return { success: true, message: response.message }
      } else {
        setError(response.message)
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '权限升级失败'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // 生成密钥（管理员功能）
  const createKey = async (request: GenerateKeyRequest) => {
    setLoading(true)
    clearError()
    
    if (!user.value || user.value.role !== 'admin') {
      setError('只有管理员可以生成密钥')
      setLoading(false)
      return { success: false, message: '只有管理员可以生成密钥' }
    }
    
    try {
      const response = await generateKey(request, user.value.id)
      
      if (response.success) {
        return { success: true, message: response.message, data: response.data }
      } else {
        setError(response.message)
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '密钥生成失败'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // 验证密钥
  const verifyKey = async (keyValue: string) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await validateKey(keyValue)
      
      if (response.success) {
        return { success: true, message: response.message, data: response.data }
      } else {
        setError(response.message)
        return { success: false, message: response.message }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '密钥验证失败'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // 初始化时检查登录状态
  const initializeAuth = async () => {
    await checkAuthStatus()
  }

  return {
    // 状态
    isAuthenticated,
    user,
    token,
    abilities,
    loading,
    error,
    
    // 获取状态
    getState,
    
    // 操作方法
    setError,
    clearError,
    setLoading,
    setUser,
    setToken,
    setAbilities,
    userLogin,
    userRegister,
    userLogout,
    checkAuthStatus,
    upgradeRole,
    createKey,
    verifyKey,
    initializeAuth
  }
})