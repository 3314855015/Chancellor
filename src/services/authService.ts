// 认证相关的API服务
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'

// 模拟API基础URL
// const API_BASE_URL = 'http://localhost:3000/api'

// 模拟网络请求延迟
const simulateNetworkDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 模拟用户数据存储（实际项目中应该使用后端API）
const mockUsers = [
  { id: 1, username: 'admin', password: '12345678', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'student1', password: '12345678', email: 'student1@example.com', role: 'student' }
]

// 模拟本地存储的token
let mockToken: string | null = null

/**
 * 用户登录
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  await simulateNetworkDelay(1500)
  
  const user = mockUsers.find(u => 
    u.username === credentials.username && u.password === credentials.password
  )
  
  if (!user) {
    throw new Error('用户名或密码错误')
  }
  
  // 生成模拟token
  mockToken = `mock_token_${user.id}_${Date.now()}`
  
  return {
    success: true,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as any
      },
      token: mockToken
    }
  }
}

/**
 * 用户注册（只能注册监生账号）
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  await simulateNetworkDelay(2000)
  
  // 检查用户名是否已存在
  const existingUser = mockUsers.find(u => u.username === userData.username)
  if (existingUser) {
    throw new Error('用户名已存在')
  }
  
  // 检查邮箱是否已存在
  const existingEmail = mockUsers.find(u => u.email === userData.email)
  if (existingEmail) {
    throw new Error('邮箱已被注册')
  }
  
  // 强制设置为监生身份（学生）
  const userRole = 'student' as const
  
  // 创建新用户
  const newUser = {
    id: mockUsers.length + 1,
    username: userData.username,
    password: userData.password,
    email: userData.email,
    role: userRole
  }
  
  mockUsers.push(newUser)
  
  return {
    success: true,
    message: '注册成功，您已成为监生（学生）',
    data: {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token: null // 注册后需要登录才能获取token
    }
  }
}

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  await simulateNetworkDelay(500)
  mockToken = null
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  await simulateNetworkDelay(500)
  
  if (!mockToken) {
    throw new Error('用户未登录')
  }
  
  // 从token中解析用户ID（模拟）
  const tokenParts = mockToken.split('_')
  const userId = parseInt(tokenParts[2])
  
  const user = mockUsers.find(u => u.id === userId)
  if (!user) {
    throw new Error('用户不存在')
  }
  
  return {
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  }
}

/**
 * 检查token是否有效
 */
export const validateToken = async (): Promise<boolean> => {
  await simulateNetworkDelay(300)
  return mockToken !== null
}