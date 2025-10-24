// 统一的Supabase API服务层
import { supabase } from '@/lib/supabase.client'
import {
  login as supabaseLogin,
  register as supabaseRegister,
  logout as supabaseLogout,
  getCurrentUser as supabaseGetCurrentUser,
  validateKey as supabaseValidateKey,
  useKey as supabaseUseKey,
  generateKey as supabaseGenerateKey
} from './supabaseAuthService'
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  UseKeyRequest,
  KeyResponse,
  User,
  UserAbilities
} from '@/types/auth'

// 认证相关API - 直接调用Supabase后端
export const authAPI = {
  // 用户登录 - 使用supabaseAuthService中的加密逻辑
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return await supabaseLogin(credentials)
  },

  // 用户注册 - 使用supabaseAuthService中的加密逻辑
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return await supabaseRegister(userData)
  },

  // 使用密钥升级权限 - 使用supabaseAuthService中的业务逻辑
  upgradeRole: async (request: UseKeyRequest): Promise<KeyResponse> => {
    try {
      // 这里需要从本地存储获取当前用户ID
      const storedUser = localStorage.getItem('user_data')
      if (!storedUser) {
        return {
          success: false,
          message: '用户未登录',
          data: null
        }
      }
      
      const userData = JSON.parse(storedUser)
      const currentUserId = userData.id
      
      // 调用supabaseAuthService中的useKey函数
      const authResponse = await supabaseUseKey(request, currentUserId)
      
      // 将AuthResponse转换为KeyResponse
      if (authResponse.success) {
        // 如果升级成功，查询更新后的密钥信息
        const { data: updatedKey, error: keyError } = await supabase
          .from('invitation_keys')
          .select('*')
          .eq('key_value', request.keyValue)
          .single()
        
        if (keyError || !updatedKey) {
          // 如果查询失败，返回基本成功信息
          return {
            success: true,
            message: authResponse.message,
            data: {
              key: {
                id: '0', // 使用字符串类型的默认ID
                keyValue: request.keyValue,
                keyType: request.keyValue.startsWith('INVITE') ? 'invitation' : 'promotion',
                creatorId: '',
                used: true,
                usedBy: currentUserId,
                usedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                maxUses: 1,
                currentUses: 1,
                description: '密钥已使用',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          }
        }
        
        // 返回完整的密钥信息
        return {
          success: true,
          message: authResponse.message,
          data: {
            key: {
              id: updatedKey.id,
              keyValue: updatedKey.key_value,
              keyType: updatedKey.key_type,
              creatorId: updatedKey.creator_id,
              used: updatedKey.used,
              usedBy: updatedKey.used_by || undefined,
              usedAt: updatedKey.used_at || undefined,
              expiresAt: updatedKey.expires_at,
              maxUses: updatedKey.max_uses,
              currentUses: updatedKey.current_uses,
              description: updatedKey.description || undefined,
              createdAt: updatedKey.created_at,
              updatedAt: updatedKey.updated_at
            }
          }
        }
      } else {
        return {
          success: false,
          message: authResponse.message,
          data: null
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '密钥升级失败',
        data: null
      }
    }
  },

  // 获取当前用户信息 - 使用Supabase查询
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      // 从本地存储获取用户ID
      const storedUser = localStorage.getItem('user_data')
      if (!storedUser) {
        return {
          success: false,
          message: '用户未登录',
          data: {
            user: {} as User,
            token: null,
            abilities: {} as UserAbilities
          }
        }
      }

      const userData = JSON.parse(storedUser)
      
      // 查询用户信息
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single()

      if (error) {
        return {
          success: false,
          message: error.message || '获取用户信息失败',
          data: {
            user: {} as User,
            token: null,
            abilities: {} as UserAbilities
          }
        }
      }

      // 查询用户能力数据
      const { data: abilitiesData } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      return {
        success: true,
        message: '获取用户信息成功',
        data: {
          user: {
            id: String(user.id),
            username: String(user.username),
            email: String(user.email),
            role: user.role as 'student' | 'examiner' | 'enterprise' | 'admin',
            status: user.status as 'active' | 'inactive' | 'suspended',
            studentStatus: user.student_status as 'wild' | 'selected' | undefined,
            avatarUrl: user.avatar_url,
            lastLoginAt: user.last_login_at,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          },
          token: localStorage.getItem('auth_token'),
          abilities: abilitiesData ? {
            userId: String(abilitiesData.user_id),
            frontendPoints: Number(abilitiesData.frontend_points),
            androidPoints: Number(abilitiesData.android_points),
            backendPoints: Number(abilitiesData.backend_points),
            aiPoints: Number(abilitiesData.ai_points),
            communicationPoints: Number(abilitiesData.communication_points),
            creativityPoints: Number(abilitiesData.creativity_points),
            leadershipPoints: Number(abilitiesData.leadership_points),
            updatedAt: abilitiesData.updated_at
          } : {
            userId: String(userData.id),
            frontendPoints: 0,
            androidPoints: 0,
            backendPoints: 0,
            aiPoints: 0,
            communicationPoints: 0,
            creativityPoints: 0,
            leadershipPoints: 0,
            updatedAt: new Date().toISOString()
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取用户信息失败',
        data: {
          user: {} as User,
          token: null,
          abilities: {} as UserAbilities
        }
      }
    }
  },

  // 用户登出
  logout: async (): Promise<void> => {
    // 清除本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_abilities')
  },

  // 验证密钥
  validateKey: async (keyValue: string) => {
    try {
      const { data, error } = await supabase
        .rpc('validate_invitation_key', {
          p_key_value: keyValue
        })

      if (error) {
        return {
          success: false,
          message: error.message || '验证密钥失败',
          data: null
        }
      }

      if (!data || !data.success) {
        return {
          success: false,
          message: data?.message || '密钥验证失败',
          data: null
        }
      }

      const keyData = data.key

      return {
        success: true,
        message: data.message || '密钥验证成功',
        data: {
          key: {
            id: keyData.id,
            keyValue: keyData.key_value,
            keyType: keyData.key_type,
            creatorId: keyData.creator_id,
            used: keyData.used,
            usedBy: keyData.used_by || undefined,
            usedAt: keyData.used_at || undefined,
            expiresAt: keyData.expires_at,
            maxUses: keyData.max_uses,
            currentUses: keyData.current_uses,
            description: keyData.description || undefined,
            createdAt: keyData.created_at,
            updatedAt: keyData.updated_at
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '验证密钥失败',
        data: null
      }
    }
  }
}

// 用户相关API - 直接调用Supabase后端
export const userAPI = {
  // 获取用户能力数据
  getAbilities: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        return {
          success: false,
          message: error.message || '获取能力数据失败',
          data: null
        }
      }

      return {
        success: true,
        message: '获取能力数据成功',
        data: {
          userId: String(data.user_id),
          frontendPoints: Number(data.frontend_points),
          androidPoints: Number(data.android_points),
          backendPoints: Number(data.backend_points),
          aiPoints: Number(data.ai_points),
          communicationPoints: Number(data.communication_points),
          creativityPoints: Number(data.creativity_points),
          leadershipPoints: Number(data.leadership_points),
          updatedAt: data.updated_at
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取能力数据失败',
        data: null
      }
    }
  },

  // 更新用户能力数据
  updateAbilities: async (userId: string, abilities: any) => {
    try {
      const { data, error } = await supabase
        .from('user_abilities')
        .update({
          frontend_points: abilities.frontendPoints,
          android_points: abilities.androidPoints,
          backend_points: abilities.backendPoints,
          ai_points: abilities.aiPoints,
          communication_points: abilities.communicationPoints,
          creativity_points: abilities.creativityPoints,
          leadership_points: abilities.leadershipPoints,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        return {
          success: false,
          message: error.message || '更新能力数据失败',
          data: null
        }
      }

      return {
        success: true,
        message: '更新能力数据成功',
        data: abilities
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '更新能力数据失败',
        data: null
      }
    }
  }
}

// 密钥相关API - 直接调用Supabase后端
export const keyAPI = {
  // 生成密钥（管理员功能）
  generateKey: async (request: any) => {
    try {
      const { data, error } = await supabase
        .rpc('sp_generate_key', {
          p_key_type: request.keyType,
          p_creator_id: request.creatorId,
          p_description: request.description,
          p_max_uses: request.maxUses,
          p_expires_at: request.expiresAt
        })

      if (error) {
        return {
          success: false,
          message: error.message || '生成密钥失败',
          data: null
        }
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          message: '生成密钥失败',
          data: null
        }
      }

      const keyData = data[0]

      return {
        success: true,
        message: '生成密钥成功',
        data: {
          id: keyData.id,
          keyValue: keyData.key_value,
          keyType: keyData.key_type,
          creatorId: keyData.creator_id,
          used: keyData.used,
          usedBy: keyData.used_by,
          usedAt: keyData.used_at,
          expiresAt: keyData.expires_at,
          maxUses: keyData.max_uses,
          currentUses: keyData.current_uses,
          description: keyData.description,
          createdAt: keyData.created_at,
          updatedAt: keyData.updated_at
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '生成密钥失败',
        data: null
      }
    }
  },



  // 获取密钥列表
  getKeys: async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return {
          success: false,
          message: error.message || '获取密钥列表失败',
          data: null
        }
      }

      return {
        success: true,
        message: '获取密钥列表成功',
        data: data.map(key => ({
          id: key.id,
          keyValue: key.key_value,
          keyType: key.key_type,
          creatorId: key.creator_id,
          used: key.used,
          usedBy: key.used_by,
          usedAt: key.used_at,
          expiresAt: key.expires_at,
          maxUses: key.max_uses,
          currentUses: key.current_uses,
          description: key.description,
          createdAt: key.created_at,
          updatedAt: key.updated_at
        }))
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取密钥列表失败',
        data: null
      }
    }
  }
}

export default {
  auth: authAPI,
  user: userAPI,
  key: keyAPI,
}