// 统一的认证服务层 - 封装所有认证相关逻辑
import { authAPI } from './apiService'
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User,
  UserAbilities
} from '@/types/auth'

class AuthService {
  private token: string | null = null
  private user: User | null = null
  private abilities: UserAbilities | null = null

  constructor() {
    this.loadFromStorage()
  }

  // 从本地存储加载认证状态
  private loadFromStorage() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')
    const storedAbilities = localStorage.getItem('user_abilities')

    if (storedToken) this.token = storedToken
    if (storedUser) this.user = JSON.parse(storedUser)
    if (storedAbilities) this.abilities = JSON.parse(storedAbilities)
  }

  // 保存认证状态到本地存储
  private saveToStorage() {
    if (this.token) localStorage.setItem('auth_token', this.token)
    if (this.user) localStorage.setItem('user_data', JSON.stringify(this.user))
    if (this.abilities) localStorage.setItem('user_abilities', JSON.stringify(this.abilities))
  }

  // 清除认证状态
  private clearStorage() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_abilities')
    this.token = null
    this.user = null
    this.abilities = null
  }

  // 用户登录
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        this.token = response.data.token
        this.user = response.data.user
        this.abilities = response.data.abilities || null
        this.saveToStorage()
      }
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // 用户注册
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authAPI.register(userData)
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  // 用户登出
  async logout(): Promise<void> {
    try {
      await authAPI.logout()
      this.clearStorage()
    } catch (error) {
      console.error('Logout failed:', error)
      // 即使API调用失败，也要清除本地状态
      this.clearStorage()
    }
  }

  // 检查认证状态
  async checkAuthStatus(): Promise<boolean> {
    if (!this.token || !this.user) {
      return false
    }

    try {
      const response = await authAPI.getCurrentUser()
      if (response.success && response.data) {
        this.user = response.data.user
        this.abilities = response.data.abilities || null
        this.saveToStorage()
        return true
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
    }

    // 认证失败，清除状态
    this.clearStorage()
    return false
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    return this.user
  }

  // 获取用户能力
  getUserAbilities(): UserAbilities | null {
    return this.abilities
  }

  // 获取认证令牌
  getToken(): string | null {
    return this.token
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return !!this.token && !!this.user
  }

  // 根据用户角色获取跳转路径
  getRoleRedirectPath(): string {
    if (!this.user) return '/'

    switch (this.user.role) {
      case 'admin':
        return '/admin'
      case 'examiner':
        return '/examiner'
      case 'enterprise':
        return '/enterprise'
      case 'student':
        return '/student'
      default:
        return '/'
    }
  }

  // 获取角色显示名称
  getRoleDisplayName(): string {
    if (!this.user) return '用户'

    switch (this.user.role) {
      case 'admin': return '管理员'
      case 'examiner': return '考官'
      case 'enterprise': return '州牧'
      case 'student': return '监生'
      default: return '用户'
    }
  }

  // 获取角色描述
  getRoleDescription(): string {
    if (!this.user) return '智能教育与就业平台用户'

    switch (this.user.role) {
      case 'admin': return '生成企业密钥【请帖】和考官密钥【升官】'
      case 'examiner': return '发布任务、评审学生、分配能力点数'
      case 'enterprise': return '企业匹配学生、使用点数进行人才对接'
      case 'student': return '接取任务、提升能力、寻求就业机会'
      default: return '智能教育与就业平台用户'
    }
  }

  // 验证密钥
  async validateKey(keyValue: string) {
    try {
      return await authAPI.validateKey(keyValue)
    } catch (error) {
      console.error('Validate key failed:', error)
      throw error
    }
  }
}

// 创建单例实例
export const authService = new AuthService()

export default authService