// 认证状态管理 - 使用统一的认证服务层
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  User, 
  UserState, 
  LoginRequest, 
  RegisterRequest, 
  UserAbilities,
  UseKeyRequest,
  GenerateKeyRequest 
} from '@/types/auth'
import authService from '@/services/authService'
import apiService, { authAPI } from '@/services/apiService'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性 - 从认证服务获取状态
  const isAuthenticated = computed(() => authService.isAuthenticated())
  const user = computed(() => authService.getCurrentUser())
  const token = computed(() => authService.getToken())
  const abilities = computed(() => authService.getUserAbilities())

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

  // 用户登录
  const userLogin = async (credentials: LoginRequest) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await authService.login(credentials)
      
      if (response.success) {
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
      const response = await authService.register(userData)
      
      if (response.success) {
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
      await authService.logout()
      clearError()
    } catch (err) {
      console.error('登出失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 检查登录状态
  const checkAuthStatus = async () => {
    setLoading(true)
    
    try {
      const isAuthenticated = await authService.checkAuthStatus()
      return isAuthenticated
    } catch (err) {
      console.error('检查登录状态失败:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 根据用户角色获取跳转路径
  const getRoleRedirectPath = () => {
    return authService.getRoleRedirectPath()
  }

  // 获取角色显示名称
  const getRoleDisplayName = () => {
    return authService.getRoleDisplayName()
  }

  // 获取角色描述
  const getRoleDescription = () => {
    return authService.getRoleDescription()
  }

  // 验证密钥
  const validateKey = async (keyValue: string) => {
    setLoading(true)
    clearError()
    
    try {
      const response = await authService.validateKey(keyValue)
      
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

  // 使用密钥升级权限
  const upgradeRole = async (request: UseKeyRequest) => {
    setLoading(true)
    clearError()
    
    try {
      // 调用API服务进行密钥验证和权限升级
      const response = await authAPI.upgradeRole(request)
      
      if (response.success) {
        // 更新本地用户状态
        await checkAuthStatus()
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
    userLogin,
    userRegister,
    userLogout,
    checkAuthStatus,
    getRoleRedirectPath,
    getRoleDisplayName,
    getRoleDescription,
    validateKey,
    upgradeRole,
    initializeAuth
  }
})