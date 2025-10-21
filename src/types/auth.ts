// 认证相关的类型定义

// 用户角色类型
export type UserRole = 'student' | 'examiner' | 'enterprise' | 'admin'

// 用户信息接口
export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  agreeTerms: boolean
}

// 认证响应接口
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string | null
  }
}

// 错误响应接口
export interface ErrorResponse {
  success: false
  message: string
  error?: {
    code: string
    details?: any
  }
}

// 用户状态接口
export interface UserState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}