// 基于Supabase的认证服务
import { supabase } from '@/lib/supabase.client';  // ✅ 修改为新的文件
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  UserAbilities,
  InvitationKey,
  UseKeyRequest,
  GenerateKeyRequest,
  KeyResponse
} from '@/types/auth'
import bcrypt from 'bcryptjs'


// 密码加密配置
const SALT_ROUNDS = 10

/**
 * 密码加密
 */
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 生成随机密钥
 */
const generateRandomKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const keyLength = 16
  let result = ''
  
  for (let i = 0; i < keyLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * 用户登录
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // 使用Supabase的RPC函数进行认证，绕过RLS限制
    let userData: any = null
    
    // 方案1：尝试直接RPC调用
    try {
      const passwordHash = await hashPassword(credentials.password)
      
      const { data, error } = await supabase
        .rpc('sp_authenticate_user', {
          p_username: credentials.username,
          p_password_hash: passwordHash
        })

      if (error) {
        console.error('RPC认证失败:', error)
      } else if (!data || !Array.isArray(data) || (data as any[]).length === 0) {
        throw new Error('用户名或密码错误')
      } else {
        userData = (data as any[])[0]
      }
    } catch (error) {
      console.error('RPC认证异常:', error)
    }

    // 方案2：如果RPC调用失败，使用直接SQL查询作为备用方案
    if (!userData) {
      // 首先查询用户信息
      const { data: userQuery, error: userQueryError } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .eq('status', 'active')
        .single()

      if (userQueryError || !userQuery) {
        throw new Error('用户名或密码错误')
      }

      // 验证密码（使用bcrypt验证）
      const isPasswordValid = await bcrypt.compare(credentials.password, (userQuery as any).password_hash)
      
      if (!isPasswordValid) {
        throw new Error('用户名或密码错误')
      }

      // 查询能力数据
      const { data: abilitiesQuery } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', (userQuery as any).id)
        .single()

      userData = {
        ...(userQuery as any),
        frontend_points: (abilitiesQuery as any)?.frontend_points || 0,
        android_points: (abilitiesQuery as any)?.android_points || 0,
        backend_points: (abilitiesQuery as any)?.backend_points || 0,
        ai_points: (abilitiesQuery as any)?.ai_points || 0,
        communication_points: (abilitiesQuery as any)?.communication_points || 0,
        creativity_points: (abilitiesQuery as any)?.creativity_points || 0,
        leadership_points: (abilitiesQuery as any)?.leadership_points || 0
      }
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ 
        last_login_at: new Date().toISOString()
      })
      .eq('id', (userData as any).id)
    
    // 创建用户对象
    const user: User = {
      id: String((userData as any).id),
      username: String((userData as any).username),
      email: String((userData as any).email),
      role: (userData as any).role as 'student' | 'examiner' | 'enterprise' | 'admin',
      status: 'active',
      studentStatus: (userData as any).student_status ? ((userData as any).student_status as 'wild' | 'selected') : undefined,
      avatarUrl: (userData as any).avatar_url,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 获取用户能力数据
    const { data: abilitiesData } = await supabase
      .from('user_abilities')
      .select('*')
      .eq('user_id', String((userData as any).id))
      .single()

    // 创建能力对象
    const abilitiesDataObj = abilitiesData as any
    const abilities: UserAbilities = {
      userId: String((userData as any).id),
      frontendPoints: Number(abilitiesDataObj?.frontend_points) || 0,
      androidPoints: Number(abilitiesDataObj?.android_points) || 0,
      backendPoints: Number(abilitiesDataObj?.backend_points) || 0,
      aiPoints: Number(abilitiesDataObj?.ai_points) || 0,
      communicationPoints: Number(abilitiesDataObj?.communication_points) || 0,
      creativityPoints: Number(abilitiesDataObj?.creativity_points) || 0,
      leadershipPoints: Number(abilitiesDataObj?.leadership_points) || 0,
      updatedAt: abilitiesDataObj?.updated_at || new Date().toISOString()
    }

    // 生成JWT token（在实际项目中应该由后端生成）
    const token = `supabase_token_${(userData as any).id}_${Date.now()}`

    return {
      success: true,
      message: '登录成功',
      data: {
        user,
        token,
        abilities
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    return {
      success: false,
      message,
      data: {
        user: {} as User,
        token: null,
        abilities: {} as UserAbilities
      }
    }
  }
}

/**
 * 用户注册（只能注册监生账号）
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    // 强制设置为监生身份（学生）
    const userRole = 'student' as const
    const studentStatus = 'wild' as const

    // 对密码进行哈希处理
    console.log('🔍 对密码进行哈希处理...')
    const passwordHash = await hashPassword(userData.password)
    console.log('🔍 密码哈希完成，长度:', passwordHash.length)

    // 使用RPC函数创建新用户（绕过RLS限制）
    console.log('🔍 开始创建新用户...')
    console.log('🔍 调用 RPC 函数 sp_register_user...')
    
    const { data: newUser, error: rpcError } = await supabase
      .rpc('sp_register_user', {
        p_username: userData.username,
        p_email: userData.email,
        p_password_hash: passwordHash
      })

    console.log('🔍 RPC 注册调用结果:', {
      newUser,
      rpcError: rpcError ? {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint
      } : null
    })

    if (rpcError) {
      console.error('❌ 用户注册失败:', rpcError)
      throw new Error(rpcError.message)
    }

    if (!newUser || !Array.isArray(newUser) || newUser.length === 0) {
      console.error('❌ 注册函数返回空数据')
      throw new Error('注册失败，请稍后重试')
    }

    console.log('✅ 用户注册成功，用户ID:', newUser[0].user_id)

    console.log('✅ 注册流程完成，返回成功响应')
    return {
      success: true,
      message: '注册成功，您已成为监生（学生）',
      data: {
        user: {
          id: String(newUser[0].user_id),
          username: String(newUser[0].user_username),
          email: String(newUser[0].user_email),
          role: newUser[0].user_role as 'student' | 'examiner' | 'enterprise' | 'admin',
          status: 'active' as 'active' | 'inactive' | 'suspended',
          studentStatus: newUser[0].user_student_status as 'wild' | 'selected' | null | undefined,
          avatarUrl: null,
          lastLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: null, // 注册后需要登录才能获取token
        abilities: {
          userId: String(newUser[0].user_id),
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
    const message = error instanceof Error ? error.message : '注册失败'
    return {
      success: false,
      message,
      data: {
        user: {} as User,
        token: null,
        abilities: {} as UserAbilities
      }
    }
  }
}

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  // 清除本地存储的token
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data')
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (userId: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // 获取用户能力数据
    const { data: abilities } = await supabase
      .from('user_abilities')
      .select('*')
      .eq('user_id', userId)
      .single()

    return {
      success: true,
      data: {
        user: {
          id: String(user.id),
          username: String(user.username),
          email: String(user.email),
          role: user.role as 'student' | 'examiner' | 'enterprise' | 'admin',
          status: user.status as 'active' | 'inactive' | 'suspended',
          studentStatus: user.student_status as 'wild' | 'selected' | null,
          avatarUrl: user.avatar_url,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        abilities: abilities ? {
          userId: String(abilities.user_id),
          frontendPoints: Number(abilities.frontend_points),
          androidPoints: Number(abilities.android_points),
          backendPoints: Number(abilities.backend_points),
          aiPoints: Number(abilities.ai_points),
          communicationPoints: Number(abilities.communication_points),
          creativityPoints: Number(abilities.creativity_points),
          leadershipPoints: Number(abilities.leadership_points),
          updatedAt: abilities.updated_at
        } : null
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取用户信息失败'
    return {
      success: false,
      message,
      data: {
        user: null,
        abilities: null
      }
    }
  }
}

/**
 * 验证密钥
 */
export const validateKey = async (keyValue: string): Promise<KeyResponse> => {
  try {
    const { data: key, error } = await supabase
      .from('invitation_keys')
      .select('*')
      .eq('key_value', keyValue)
      .single()

    if (error) {
      throw new Error('密钥不存在')
    }

    if (key.used) {
      throw new Error('密钥已被使用')
    }

    if (new Date(key.expires_at) < new Date()) {
      throw new Error('密钥已过期')
    }

    if (key.current_uses >= key.max_uses) {
      throw new Error('密钥使用次数已达上限')
    }

    return {
      success: true,
      message: '密钥验证成功',
      data: {
        key: {
          id: key.id,
          keyValue: key.key_value,
          keyType: key.key_type,
          creatorId: key.creator_id,
          used: key.used,
          usedBy: key.used_by || undefined,
          usedAt: key.used_at || undefined,
          expiresAt: key.expires_at,
          maxUses: key.max_uses,
          currentUses: key.current_uses,
          description: key.description || undefined,
          createdAt: key.created_at,
          updatedAt: key.updated_at
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '密钥验证失败'
    return {
      success: false,
      message,
      data: {
        key: {} as InvitationKey
      }
    }
  }
}

/**
 * 使用密钥升级权限
 */
export const useKey = async (request: UseKeyRequest, currentUserId: string): Promise<AuthResponse> => {
  try {
    // 验证密钥
    const keyResponse = await validateKey(request.keyValue)
    if (!keyResponse.success) {
      throw new Error(keyResponse.message)
    }

    const key = keyResponse.data.key
    const targetUserId = request.targetUserId || currentUserId

    // 根据密钥类型升级权限
    let newRole: 'examiner' | 'enterprise'
    
    switch (key.keyType) {
      case 'promotion':
        newRole = 'examiner'
        break
      case 'invitation':
        newRole = 'enterprise'
        break
      case 'teacher':
        // 教师密钥用于关联学生，不改变角色
        // 这里可以添加教师关联逻辑
        throw new Error('教师密钥功能暂未实现')
      default:
        throw new Error('无效的密钥类型')
    }

    // 更新用户角色
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    // 标记密钥为已使用
    const { error: keyError } = await supabase
      .from('invitation_keys')
      .update({
        used: true,
        used_by: targetUserId,
        used_at: new Date().toISOString(),
        current_uses: key.currentUses + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', key.id)

    if (keyError) {
      throw new Error(keyError.message)
    }

    // 获取用户能力数据
    const { data: abilities } = await supabase
      .from('user_abilities')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    return {
      success: true,
      message: `权限升级成功，您现在是${newRole === 'examiner' ? '考官' : '州牧（企业）'}`,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          studentStatus: updatedUser.student_status,
          avatarUrl: updatedUser.avatar_url,
          lastLoginAt: updatedUser.last_login_at,
          createdAt: updatedUser.created_at,
          updatedAt: updatedUser.updated_at
        },
        token: null,
        abilities: abilities ? {
          userId: abilities.user_id,
          frontendPoints: abilities.frontend_points,
          androidPoints: abilities.android_points,
          backendPoints: abilities.backend_points,
          aiPoints: abilities.ai_points,
          communicationPoints: abilities.communication_points,
          creativityPoints: abilities.creativity_points,
          leadershipPoints: abilities.leadership_points,
          updatedAt: abilities.updated_at
        } : null
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '权限升级失败'
    return {
      success: false,
      message,
      data: {
        user: {} as User,
        token: null,
        abilities: {} as UserAbilities
      }
    }
  }
}

/**
 * 生成密钥（管理员功能）
 */
export const generateKey = async (request: GenerateKeyRequest, creatorId: string): Promise<KeyResponse> => {
  try {
    const keyValue = `${request.keyType.toUpperCase()}-${Date.now()}-${generateRandomKey()}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (request.expiresInDays || 30))

    const { data: newKey, error } = await supabase
      .from('invitation_keys')
      .insert({
        key_value: keyValue,
        key_type: request.keyType,
        creator_id: creatorId,
        expires_at: expiresAt.toISOString(),
        max_uses: request.maxUses || 1,
        current_uses: 0,
        description: request.description
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    if (!newKey) {
      throw new Error('密钥生成失败')
    }

    return {
      success: true,
      message: '密钥生成成功',
      data: {
        key: {
          id: newKey.id,
          keyValue: newKey.key_value,
          keyType: newKey.key_type,
          creatorId: newKey.creator_id,
          used: newKey.used,
          usedBy: newKey.used_by || undefined,
          usedAt: newKey.used_at || undefined,
          expiresAt: newKey.expires_at,
          maxUses: newKey.max_uses,
          currentUses: newKey.current_uses,
          description: newKey.description || undefined,
          createdAt: newKey.created_at,
          updatedAt: newKey.updated_at
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '密钥生成失败'
    return {
      success: false,
      message,
      data: {
        key: {} as InvitationKey
      }
    }
  }
}

/**
 * 检查token是否有效
 */
export const validateToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    return false
  }

  // 在实际项目中，这里应该验证token的有效性
  // 目前简单检查token格式
  return token.startsWith('supabase_token_')
}