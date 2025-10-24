// 认证相关的类型定义

// 用户角色类型
export type UserRole = 'student' | 'examiner' | 'enterprise' | 'admin'

// 用户状态类型
export type UserStatus = 'active' | 'inactive' | 'suspended'
export type StudentStatus = 'wild' | 'selected'

// 用户信息接口
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  studentStatus?: StudentStatus
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// 用户能力信息接口
export interface UserAbilities {
  userId: string
  frontendPoints: number
  androidPoints: number
  backendPoints: number
  aiPoints: number
  communicationPoints: number
  creativityPoints: number
  leadershipPoints: number
  updatedAt: string
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

// 密钥相关接口
export interface InvitationKey {
  id: number
  keyValue: string
  keyType: 'invitation' | 'promotion' | 'teacher'
  creatorId: string
  used: boolean
  usedBy?: string
  usedAt?: string
  expiresAt: string
  maxUses: number
  currentUses: number
  description?: string
  createdAt: string
  updatedAt: string
}

// 密钥使用请求
export interface UseKeyRequest {
  keyValue: string
  targetUserId?: string
}

// 生成密钥请求
export interface GenerateKeyRequest {
  keyType: 'invitation' | 'promotion' | 'teacher'
  maxUses?: number
  expiresInDays?: number
  description?: string
}

// 认证响应接口
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string | null
    abilities?: UserAbilities
  }
}

// 密钥响应接口
export interface KeyResponse {
  success: boolean
  message: string
  data: {
    key: InvitationKey
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
  abilities: UserAbilities | null
  loading: boolean
  error: string | null
}