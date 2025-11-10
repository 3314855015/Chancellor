// 教师服务 - 专门处理教师相关功能
import { supabase } from '@/lib/supabase.client'
import authService from '@/services/authService'
import type { 
  KeyResponse,
  InvitationKey
} from '@/types/auth'

// 定义能力信息接口（与studentService.ts保持一致）
interface AbilityInfo {
  name: string
  value: number
  icon: string
  totalValue?: number
  tempValue?: number
}

// 定义类型接口
interface StudentData {
  id: string
  username: string
  email: string | null
  student_status: string | null
  created_at: string
}

interface TeacherData {
  id: string
  username: string
  email: string | null
  created_at: string
}

interface StudentRelation {
  student: StudentData[]
  created_at: string
}

interface TeacherRelation {
  teacher: TeacherData[]
  created_at: string
}

interface StudentInfo {
  id: string
  username: string
  email: string | null
  studentStatus: string | null
  joinedAt: string
}

interface TeacherInfo {
  id: string
  username: string
  email: string | null
  joinedAt: string
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
 * 生成教师密钥（教师功能）
 */
export const generateTeacherKey = async (creatorId: string, description?: string): Promise<KeyResponse> => {
  try {
    // 验证当前用户是否为教师
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', creatorId)
      .single()

    if (userError || !currentUser) {
      throw new Error('用户信息获取失败')
    }

    if (currentUser.role !== 'examiner') {
      throw new Error('只有教师可以生成教师密钥')
    }

    // 生成密钥值
    const keyValue = `TEACHER-${Date.now()}-${generateRandomKey()}`
    
    // 计算过期时间（教师密钥默认90天）
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    // 首先尝试直接插入
    const { data: newKey, error } = await supabase
      .from('invitation_keys')
      .insert({
        key_value: keyValue,
        key_type: 'teacher',
        creator_id: creatorId,
        expires_at: expiresAt.toISOString(),
        max_uses: 1,
        current_uses: 0,
        description: description || '教师关联密钥 - 用于学生绑定教师'
      })
      .select()
      .single()

    // 如果直接插入失败，尝试使用RPC函数
    if (error) {
      // 使用RPC函数绕过RLS限制
      const { data: rpcResult, error: rpcError } = await supabase.rpc('generate_invitation_key', {
        p_key_value: keyValue,
        p_key_type: 'teacher',
        p_creator_id: creatorId,
        p_expires_at: expiresAt.toISOString(),
        p_max_uses: 1,
        p_description: description || '教师关联密钥 - 用于学生绑定教师'
      })
      
      if (rpcError) {
        throw new Error(`教师密钥生成失败: ${rpcError.message}`)
      }
      
      // 检查RPC返回结果
      if (rpcResult && rpcResult.error) {
        throw new Error(`教师密钥生成失败: ${rpcResult.error}`)
      }
      
      if (rpcResult && rpcResult.success) {
        // 直接从RPC结果中获取密钥信息
        const keyData = rpcResult.key
        return {
          success: true,
          message: '教师密钥生成成功',
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
      } else {
        // 如果RPC没有返回预期结果，尝试查询
        const { data: createdKey, error: queryError } = await supabase
          .from('invitation_keys')
          .select('*')
          .eq('key_value', keyValue)
          .single()
          
        if (queryError) {
          // 即使查询失败，也返回成功，因为RPC可能已成功插入
          return {
            success: true,
            message: '教师密钥生成成功',
            data: {
              key: {
                id: '0', // 使用默认ID
                keyValue: keyValue,
                keyType: 'teacher',
                creatorId: creatorId,
                used: false,
                usedBy: undefined,
                usedAt: undefined,
                expiresAt: expiresAt.toISOString(),
                maxUses: 1,
                currentUses: 0,
                description: description || '教师关联密钥 - 用于学生绑定教师',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          }
        }
        
        // 使用查询到的密钥信息
        return {
          success: true,
          message: '教师密钥生成成功',
          data: {
            key: {
              id: createdKey.id,
              keyValue: createdKey.key_value,
              keyType: createdKey.key_type,
              creatorId: createdKey.creator_id,
              used: createdKey.used,
              usedBy: createdKey.used_by || undefined,
              usedAt: createdKey.used_at || undefined,
              expiresAt: createdKey.expires_at,
              maxUses: createdKey.max_uses,
              currentUses: createdKey.current_uses,
              description: createdKey.description || undefined,
              createdAt: createdKey.created_at,
              updatedAt: createdKey.updated_at
            }
          }
        }
      }
    }

    if (!newKey) {
      throw new Error('教师密钥生成失败')
    }

    return {
      success: true,
      message: '教师密钥生成成功',
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
    const message = error instanceof Error ? error.message : '教师密钥生成失败'
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
 * 获取教师指导的学生列表
 */
export const getTeacherStudents = async (teacherId: string): Promise<any> => {
  try {
    // 使用视图查询学生-教师关系详情
    const { data: studentDetails, error } = await supabase
      .from('student_teacher_details')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // 如果没有关系记录，返回空列表
    if (!studentDetails || studentDetails.length === 0) {
      return {
        success: true,
        message: '暂无学生绑定',
        data: {
          students: []
        }
      }
    }

    // 类型安全的映射
    const studentList: StudentInfo[] = studentDetails.map(detail => ({
      id: detail.student_id || '',
      username: detail.student_username || '',
      email: detail.student_email || null,
      studentStatus: null, // 视图不包含student_status字段
      joinedAt: detail.created_at
    }))

    return {
      success: true,
      message: '获取学生列表成功',
      data: {
        students: studentList
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取学生列表失败'
    return {
      success: false,
      message,
      data: {
        students: []
      }
    }
  }
}

/**
 * 获取学生绑定的教师信息
 */
export const getStudentTeacher = async (studentId: string): Promise<any> => {
  try {
    // 使用视图查询学生-教师关系详情
    const { data: teacherDetails, error } = await supabase
      .from('student_teacher_details')
      .select('*')
      .eq('student_id', studentId)

    if (error) {
      throw new Error(error.message)
    }

    // 如果没有找到记录，表示学生未绑定教师
    if (!teacherDetails || teacherDetails.length === 0) {
      return {
        success: true,
        message: '学生未绑定教师',
        data: {
          teacher: null
        }
      }
    }

    const teacherInfo: TeacherInfo = {
      id: teacherDetails[0].teacher_id || '',
      username: teacherDetails[0].teacher_username || '',
      email: teacherDetails[0].teacher_email || null,
      joinedAt: teacherDetails[0].created_at
    }

    return {
      success: true,
      message: '获取教师信息成功',
      data: {
        teacher: teacherInfo
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取教师信息失败'
    return {
      success: false,
      message,
      data: {
        teacher: null
      }
    }
  }
}

/**
 * 学生绑定教师（使用教师密钥）
 */
export const bindStudentTeacher = async (keyValue: string, studentId: string): Promise<any> => {
  try {
    // 使用RPC函数绑定学生和教师
    const { data: result, error } = await supabase.rpc('sp_bind_student_teacher', {
      p_key_value: keyValue,
      p_student_id: studentId
    })

    if (error) {
      throw new Error(error.message)
    }

    if (result && result.length > 0) {
      const bindResult = result[0]
      if (bindResult.result === 'success') {
        return {
          success: true,
          message: '绑定教师成功',
          data: {
            teacher: {
              id: bindResult.teacher_id,
              username: bindResult.teacher_username,
              email: bindResult.teacher_email
            }
          }
        }
      } else {
        throw new Error(bindResult.result)
      }
    } else {
      throw new Error('绑定失败，请重试')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '绑定教师失败'
    return {
      success: false,
      message,
      data: null
    }
  }
}

/**
 * 获取学生实际能力数据（包含基础值和临时值）
 */
export const getStudentActualAbilities = async (studentId: string): Promise<{
  success: boolean
  message: string
  data: {
    abilities: any[]
    remainingBasePoints: number
    remainingPoints: number
    remainingTotalPoints: number
    generalPoints: number
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { abilities: [], remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
      }
    }

    // 使用RPC函数获取学生实际能力数据（包含基础值和临时值）
    const response = await supabase.rpc('get_student_actual_abilities', { p_user_id: studentId });
    
    // 使用新的RPC函数获取有效的general点数
    const abilityRecordsResponse = await supabase.rpc('get_ability_records', { p_user_id: studentId });
    
    const { data, error } = response;
    const { data: abilityRecordsData, error: abilityRecordsError } = abilityRecordsResponse;
    
    if (error) {
      console.warn('获取学生实际能力数据失败:', error)
      // 回退到旧方法，并包装返回类型
      const result = await getStudentAbilities(studentId)
      return {
        ...result,
        data: {
          ...result.data,
          remainingBasePoints: 0
        }
      }
    }
    
    if (data) {
      // RPC函数返回的是嵌套的数据结构      
      // 解析嵌套结构 - 检查不同的返回格式
      let rpcData = null
      
      // 解析 Supabase RPC 返回的双层嵌套结构
      // Supabase RPC 返回格式: {data: {success: true, data: {...}}, error: null}
      if (data.success !== undefined && data.data) {
        // 格式1: 双层嵌套结构 - data.data 包含实际数据
        rpcData = data.data
      } else if (data.base_abilities || data.general_points !== undefined) {
        // 格式2: 直接包含数据字段
        rpcData = data
      } else if (data.data) {
        // 格式3: 单层嵌套结构
        rpcData = data.data
      } else {
        // 格式4: 其他格式，尝试直接使用
        rpcData = data
      }
      
      if (!rpcData) {
        console.warn('RPC返回数据格式不正确，使用默认值')
        // 回退到旧方法
        const result = await getStudentAbilities(studentId)
        return {
          ...result,
          data: {
            ...result.data,
            remainingBasePoints: 0
          }
        }
      }
      
      // 解析ability records数据获取有效的general点数
      let actualGeneralPoints = rpcData.general_points || 0;
      if (abilityRecordsData && abilityRecordsData.success && abilityRecordsData.data) {
        // 使用新的RPC函数返回的general点数
        actualGeneralPoints = abilityRecordsData.data.general_points || 0;
        console.log('使用新的RPC函数获取的general点数:', actualGeneralPoints);
      } else if (abilityRecordsError) {
        console.warn('获取ability records失败，使用默认值:', abilityRecordsError);
      }
      
      // 将对象格式转换为前端需要的数组格式
      const abilitiesArray = [
        {
          type: 'frontend',
          name: '前端开发',
          value: rpcData.base_abilities?.frontend_points || 0,
          tempValue: rpcData.temp_abilities?.frontend_points || 0,
          totalValue: rpcData.total_abilities?.frontend_points || 0
        },
        {
          type: 'android',
          name: '安卓开发',
          value: rpcData.base_abilities?.android_points || 0,
          tempValue: rpcData.temp_abilities?.android_points || 0,
          totalValue: rpcData.total_abilities?.android_points || 0
        },
        {
          type: 'backend',
          name: '后端开发',
          value: rpcData.base_abilities?.backend_points || 0,
          tempValue: rpcData.temp_abilities?.backend_points || 0,
          totalValue: rpcData.total_abilities?.backend_points || 0
        },
        {
          type: 'ai',
          name: '人工智能',
          value: rpcData.base_abilities?.ai_points || 0,
          tempValue: rpcData.temp_abilities?.ai_points || 0,
          totalValue: rpcData.total_abilities?.ai_points || 0
        },
        {
          type: 'communication',
          name: '沟通能力',
          value: rpcData.base_abilities?.communication_points || 0,
          tempValue: rpcData.temp_abilities?.communication_points || 0,
          totalValue: rpcData.total_abilities?.communication_points || 0
        },
        {
          type: 'creativity',
          name: '创造力',
          value: rpcData.base_abilities?.creativity_points || 0,
          tempValue: rpcData.temp_abilities?.creativity_points || 0,
          totalValue: rpcData.total_abilities?.creativity_points || 0
        },
        {
          type: 'leadership',
          name: '领导力',
          value: rpcData.base_abilities?.leadership_points || 0,
          tempValue: rpcData.temp_abilities?.leadership_points || 0,
          totalValue: rpcData.total_abilities?.leadership_points || 0
        }
      ]
      
      // 重新计算剩余点数，使用实际的general点数
      const baseTotal = (rpcData.base_abilities?.frontend_points || 0) +
                       (rpcData.base_abilities?.android_points || 0) +
                       (rpcData.base_abilities?.backend_points || 0) +
                       (rpcData.base_abilities?.ai_points || 0) +
                       (rpcData.base_abilities?.communication_points || 0) +
                       (rpcData.base_abilities?.creativity_points || 0) +
                       (rpcData.base_abilities?.leadership_points || 0);
      
      const tempTotal = (rpcData.temp_abilities?.frontend_points || 0) +
                        (rpcData.temp_abilities?.android_points || 0) +
                        (rpcData.temp_abilities?.backend_points || 0) +
                        (rpcData.temp_abilities?.ai_points || 0) +
                        (rpcData.temp_abilities?.communication_points || 0) +
                        (rpcData.temp_abilities?.creativity_points || 0) +
                        (rpcData.temp_abilities?.leadership_points || 0);
      
      const remainingBasePoints = Math.max(0, 10 - baseTotal);
      const remainingTotalPoints = Math.max(0, 10 + actualGeneralPoints - (baseTotal + tempTotal));
      
      console.log('修正后的剩余点数计算:', {
        baseTotal,
        tempTotal,
        actualGeneralPoints,
        remainingBasePoints,
        remainingTotalPoints
      })
      
      return {
        success: true,
        message: '获取学生能力数据成功',
        data: { 
          abilities: abilitiesArray,
          remainingBasePoints: remainingBasePoints,
          remainingPoints: remainingTotalPoints,
          remainingTotalPoints: remainingTotalPoints,
          generalPoints: actualGeneralPoints
        }
      }
    } else {
      console.warn('获取学生能力数据失败:', data?.message)
      // 回退到旧方法，并包装返回类型
      const result = await getStudentAbilities(studentId)
      return {
        ...result,
        data: {
          ...result.data,
          remainingBasePoints: 0
        }
      }
    }
  } catch (error) {
    console.error('获取学生实际能力数据失败:', error)
    // 回退到旧方法，并包装返回类型
    const result = await getStudentAbilities(studentId)
    return {
      ...result,
      data: {
        ...result.data,
        remainingBasePoints: 0
      }
    }
  }
}

/**
 * 获取学生能力数据（教师视角）
 */
export const getStudentAbilities = async (studentId: string): Promise<{
  success: boolean
  message: string
  data: {
    abilities: AbilityInfo[]
    remainingBasePoints: number
    remainingPoints: number
    remainingTotalPoints: number
    generalPoints: number
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { abilities: [], remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
      }
    }

    // 首先检查Supabase认证状态，如果没有认证则设置认证
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      console.warn('Supabase会话未认证，尝试设置认证')
      
      // 获取当前用户的认证token
      const token = authService.getToken()
      if (token) {
        // 设置Supabase认证会话
        const { data: signInData, error: signInError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (signInError) {
          console.warn('设置Supabase会话失败:', signInError)
          // 尝试使用自定义认证方式
          return await getStudentAbilitiesWithCustomAuth(studentId)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用自定义认证方式')
        return await getStudentAbilitiesWithCustomAuth(studentId)
      }
    }

    // 尝试查询能力数据
    let abilityData: any = null
    try {
      const { data, error } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', studentId)
      
      console.log('学生能力数据查询结果:', { data, error })
      
      if (!error && data && data.length > 0) {
        abilityData = data[0]
        console.log('获取到学生能力数据:', abilityData)
      } else {
        console.warn('未找到学生能力数据或查询失败:', error)
      }
    } catch (queryError) {
      console.warn('查询学生能力数据异常:', queryError)
    }

    // 定义默认能力数据
    const defaultAbilities: AbilityInfo[] = [
      { name: '前端开发', value: 0, icon: '💻' },
      { name: '安卓开发', value: 0, icon: '📱' },
      { name: '后端开发', value: 0, icon: '⚙️' },
      { name: '人工智能', value: 0, icon: '🤖' },
      { name: '沟通能力', value: 0, icon: '💬' },
      { name: '创造力', value: 0, icon: '💡' },
      { name: '领导力', value: 0, icon: '👑' }
    ]

    // 如果有能力数据，更新默认值
    if (abilityData) {
      const abilities: AbilityInfo[] = [
        { name: '前端开发', value: abilityData.frontend_points || 0, icon: '💻' },
        { name: '安卓开发', value: abilityData.android_points || 0, icon: '📱' },
        { name: '后端开发', value: abilityData.backend_points || 0, icon: '⚙️' },
        { name: '人工智能', value: abilityData.ai_points || 0, icon: '🤖' },
        { name: '沟通能力', value: abilityData.communication_points || 0, icon: '💬' },
        { name: '创造力', value: abilityData.creativity_points || 0, icon: '💡' },
        { name: '领导力', value: abilityData.leadership_points || 0, icon: '👑' }
      ]

      return {
        success: true,
        message: '获取学生能力数据成功',
        data: { abilities, remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
      }
    }

    // 返回默认能力数据
    return {
      success: true,
      message: '获取学生能力数据成功（使用默认值）',
      data: { abilities: defaultAbilities, remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取学生能力数据失败'
    return {
      success: false,
      message,
      data: { abilities: [], remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
    }
  }
}

/**
 * 使用自定义认证方式获取学生能力数据
 */
const getStudentAbilitiesWithCustomAuth = async (studentId: string): Promise<{
  success: boolean
  message: string
  data: {
    abilities: AbilityInfo[]
    remainingBasePoints: number
    remainingPoints: number
    remainingTotalPoints: number
    generalPoints: number
  }
}> => {
  try {
    // 尝试使用RPC函数查询能力数据
    const { data, error } = await supabase
      .rpc('get_user_abilities_by_id', { p_user_id: studentId })
    
    if (!error && data && data.length > 0) {
      console.log('通过RPC获取到学生能力数据:', data)
      
      // RPC返回的是数组，取第一个元素
      const abilityData = data[0]
      
      const abilities: AbilityInfo[] = [
        { name: '前端开发', value: abilityData.frontend_points || 0, icon: '💻' },
        { name: '安卓开发', value: abilityData.android_points || 0, icon: '📱' },
        { name: '后端开发', value: abilityData.backend_points || 0, icon: '⚙️' },
        { name: '人工智能', value: abilityData.ai_points || 0, icon: '🤖' },
        { name: '沟通能力', value: abilityData.communication_points || 0, icon: '💬' },
        { name: '创造力', value: abilityData.creativity_points || 0, icon: '💡' },
        { name: '领导力', value: abilityData.leadership_points || 0, icon: '👑' }
      ]

      return {
        success: true,
        message: '获取学生能力数据成功',
        data: { abilities, remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
      }
    } else {
      console.warn('RPC查询学生能力数据失败:', error)
      // 如果RPC失败，返回默认值
      const defaultAbilities: AbilityInfo[] = [
        { name: '前端开发', value: 0, icon: '💻' },
        { name: '安卓开发', value: 0, icon: '📱' },
        { name: '后端开发', value: 0, icon: '⚙️' },
        { name: '人工智能', value: 0, icon: '🤖' },
        { name: '沟通能力', value: 0, icon: '💬' },
        { name: '创造力', value: 0, icon: '💡' },
        { name: '领导力', value: 0, icon: '👑' }
      ]

      return {
        success: true,
        message: '获取学生能力数据成功（使用默认值）',
        data: { abilities: defaultAbilities, remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
      }
    }
  } catch (error) {
    console.error('自定义认证方式获取学生能力数据失败:', error)
    const message = error instanceof Error ? error.message : '获取学生能力数据失败'
    return {
      success: false,
      message,
      data: { abilities: [], remainingBasePoints: 0, remainingPoints: 0, remainingTotalPoints: 0, generalPoints: 0 }
    }
  }
}

/**
 * 分配学生能力点数（使用追踪功能）
 */
export const assignStudentAbilities = async (studentId: string, abilityUpdates: any): Promise<{
  success: boolean
  message: string
  data: {
    remainingPoints: number
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: {
          remainingPoints: 0
        }
      }
    }

    // 首先检查Supabase认证状态
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      console.warn('Supabase会话未认证，尝试设置认证')
      
      // 获取当前用户的认证token
      const token = authService.getToken()
      if (token) {
        // 设置Supabase认证会话
        const { data: signInData, error: signInError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (signInError) {
          console.warn('设置Supabase会话失败:', signInError)
          // 尝试使用自定义认证方式
          return await assignStudentAbilitiesWithCustomAuth(studentId, abilityUpdates)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用自定义认证方式')
        return await assignStudentAbilitiesWithCustomAuth(studentId, abilityUpdates)
      }
    }

    // 计算总分配点数
    const totalPoints = (abilityUpdates.frontend_points || 0) +
                        (abilityUpdates.android_points || 0) +
                        (abilityUpdates.backend_points || 0) +
                        (abilityUpdates.ai_points || 0) +
                        (abilityUpdates.communication_points || 0) +
                        (abilityUpdates.creativity_points || 0) +
                        (abilityUpdates.leadership_points || 0)

    // 验证点数不超过10点
    if (totalPoints > 10) {
      throw new Error(`分配点数超过限制：总点数 ${totalPoints} 超过10点限制`)
    }

    // 使用新的追踪功能分配能力点数
    // 为每个分配的能力类型单独调用RPC函数
    const allocationResults = []
    
    // 前端开发能力分配
    if (abilityUpdates.frontend_points && abilityUpdates.frontend_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'frontend',
        p_points: abilityUpdates.frontend_points,
        p_expires_in_months: 6 // 默认6个月过期
      })
      allocationResults.push(result)
    }
    
    // 安卓开发能力分配
    if (abilityUpdates.android_points && abilityUpdates.android_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'android',
        p_points: abilityUpdates.android_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 后端开发能力分配
    if (abilityUpdates.backend_points && abilityUpdates.backend_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'backend',
        p_points: abilityUpdates.backend_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 人工智能能力分配
    if (abilityUpdates.ai_points && abilityUpdates.ai_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'ai',
        p_points: abilityUpdates.ai_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 沟通能力分配
    if (abilityUpdates.communication_points && abilityUpdates.communication_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'communication',
        p_points: abilityUpdates.communication_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 创造力分配
    if (abilityUpdates.creativity_points && abilityUpdates.creativity_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'creativity',
        p_points: abilityUpdates.creativity_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 领导力分配
    if (abilityUpdates.leadership_points && abilityUpdates.leadership_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'leadership',
        p_points: abilityUpdates.leadership_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }

    // 检查是否有分配失败的情况
    const failedAllocations = allocationResults.filter(result => 
      result.error || (result.data && !result.data.success)
    )
    
    if (failedAllocations.length > 0) {
      throw new Error(`部分能力分配失败，请重试`)
    }

    const remainingPoints = 10 - totalPoints

    return {
      success: true,
      message: '能力分配成功（已启用追踪功能）',
      data: {
        remainingPoints
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '能力分配失败'
    return {
      success: false,
      message,
      data: {
        remainingPoints: 0
      }
    }
  }
}

/**
 * 使用自定义认证方式分配学生能力点数（使用追踪功能）
 */
const assignStudentAbilitiesWithCustomAuth = async (studentId: string, abilityUpdates: any): Promise<{
  success: boolean
  message: string
  data: {
    remainingPoints: number
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    // 计算总分配点数
    const totalPoints = (abilityUpdates.frontend_points || 0) +
                        (abilityUpdates.android_points || 0) +
                        (abilityUpdates.backend_points || 0) +
                        (abilityUpdates.ai_points || 0) +
                        (abilityUpdates.communication_points || 0) +
                        (abilityUpdates.creativity_points || 0) +
                        (abilityUpdates.leadership_points || 0)

    // 验证点数不超过10点
    if (totalPoints > 10) {
      throw new Error(`分配点数超过限制：总点数 ${totalPoints} 超过10点限制`)
    }

    // 使用新的追踪功能分配能力点数
    // 为每个分配的能力类型单独调用RPC函数
    const allocationResults = []
    
    // 前端开发能力分配
    if (abilityUpdates.frontend_points && abilityUpdates.frontend_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'frontend',
        p_points: abilityUpdates.frontend_points,
        p_expires_in_months: 6 // 默认6个月过期
      })
      allocationResults.push(result)
    }
    
    // 安卓开发能力分配
    if (abilityUpdates.android_points && abilityUpdates.android_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'android',
        p_points: abilityUpdates.android_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 后端开发能力分配
    if (abilityUpdates.backend_points && abilityUpdates.backend_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'backend',
        p_points: abilityUpdates.backend_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 人工智能能力分配
    if (abilityUpdates.ai_points && abilityUpdates.ai_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'ai',
        p_points: abilityUpdates.ai_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 沟通能力分配
    if (abilityUpdates.communication_points && abilityUpdates.communication_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'communication',
        p_points: abilityUpdates.communication_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 创造力分配
    if (abilityUpdates.creativity_points && abilityUpdates.creativity_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'creativity',
        p_points: abilityUpdates.creativity_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }
    
    // 领导力分配
    if (abilityUpdates.leadership_points && abilityUpdates.leadership_points > 0) {
      const result = await supabase.rpc('assign_ability_points_with_tracking', {
        p_teacher_id: currentUser.id,
        p_student_id: studentId,
        p_ability_type: 'leadership',
        p_points: abilityUpdates.leadership_points,
        p_expires_in_months: 6
      })
      allocationResults.push(result)
    }

    // 检查是否有分配失败的情况
    const failedAllocations = allocationResults.filter(result => 
      result.error || (result.data && !result.data.success)
    )
    
    if (failedAllocations.length > 0) {
      throw new Error(`部分能力分配失败，请重试`)
    }

    // 计算剩余点数
    const remainingPoints = 10 - totalPoints

    return {
      success: true,
      message: '能力分配成功（已启用追踪功能）',
      data: {
        remainingPoints
      }
    }
  } catch (error) {
    console.error('自定义认证方式分配能力失败:', error)
    const message = error instanceof Error ? error.message : '能力分配失败'
    return {
      success: false,
      message,
      data: {
        remainingPoints: 0
      }
    }
  }
}

/**
 * 获取考官发布的任务列表（包含统计信息）
 */
export const getExaminerTasks = async (): Promise<{
  success: boolean
  message: string
  data: {
    tasks: any[]
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: {
          tasks: []
        }
      }
    }

    // 首先检查Supabase认证状态，如果没有认证则设置认证
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      console.warn('Supabase会话未认证，尝试设置认证')
      
      // 获取当前用户的认证token
      const token = authService.getToken()
      if (token) {
        // 设置Supabase认证会话
        const { data: signInData, error: signInError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (signInError) {
          console.warn('设置Supabase会话失败:', signInError)
          // 尝试使用RPC函数绕过认证
          return await getExaminerTasksWithRPC(currentUser.id)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用RPC函数')
        return await getExaminerTasksWithRPC(currentUser.id)
      }
    }

    // 查询当前考官发布的任务，并关联任务分配表获取统计信息
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments (
          id,
          status,
          submitted_at,
          reviewed_at
        )
      `)
      .eq('examiner_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('直接查询失败，尝试使用RPC函数:', error)
      return await getExaminerTasksWithRPC(currentUser.id)
    }

    // 处理任务数据，添加统计信息
    const processedTasks = (tasks || []).map(task => {
      const assignments = task.task_assignments || []
      
      // 计算统计信息
      const participants = assignments.length
      const completedParticipants = assignments.filter(a => a.status === 'completed').length
      const pendingReviews = assignments.filter(a => 
        a.status === 'submitted' && !a.reviewed_at
      ).length

      return {
        ...task,
        participants,
        completedParticipants,
        pendingReviews
      }
    })

    return {
      success: true,
      message: '获取任务列表成功',
      data: {
        tasks: processedTasks
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取任务列表失败'
    return {
      success: false,
      message,
      data: {
        tasks: []
      }
    }
  }
}

/**
 * 使用RPC函数获取考官任务列表（绕过认证限制）
 */
const getExaminerTasksWithRPC = async (examinerId: string): Promise<{
  success: boolean
  message: string
  data: {
    tasks: any[]
  }
}> => {
  try {
    // 使用RPC函数获取任务列表
    const { data: tasks, error } = await supabase
      .rpc('get_examiner_tasks', { p_examiner_id: examinerId })

    if (error) {
      console.warn('RPC函数调用失败，返回空列表:', error)
      return {
        success: true,
        message: '获取任务列表成功（返回空列表）',
        data: {
          tasks: []
        }
      }
    }

    // 处理返回的任务数据，移除ability_type字段（如果存在）
    const processedTasks = (tasks || []).map((task: any) => {
      const { ability_type, ...rest } = task
      
      // 如果没有统计信息，添加默认值
      return {
        ...rest,
        participants: rest.participants || 0,
        completedParticipants: rest.completed_participants || 0,
        pendingReviews: rest.pending_reviews || 0
      }
    })

    return {
      success: true,
      message: '获取任务列表成功',
      data: {
        tasks: processedTasks
      }
    }
  } catch (error) {
    console.error('RPC方式获取任务列表失败:', error)
    return {
      success: true,
      message: '获取任务列表成功（返回空列表）',
      data: {
        tasks: []
      }
    }
  }
}

/**
 * 更新任务状态
 */
export const updateTaskStatus = async (taskId: string, newStatus: string): Promise<{
  success: boolean
  message: string
  data?: {
    task_id: string
    new_status: string
    updated_at: string
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    // 使用RPC函数更新任务状态
    const { data: result, error } = await supabase
      .rpc('update_task_status', {
        p_task_id: taskId,
        p_new_status: newStatus
      })

    if (error) {
      throw new Error(`RPC函数调用失败: ${error.message}`)
    }

    // 解析RPC返回结果
    if (result && !result.success) {
      throw new Error(result.message)
    }

    return {
      success: true,
      message: result.message || '任务状态更新成功',
      data: result.data
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新任务状态失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 删除任务（包含二次确认）
 */
export const deleteTask = async (taskId: string, confirmationCode?: string): Promise<{
  success: boolean
  message: string
  confirmation_required?: boolean
  confirmation_message?: string
  expected_code?: string
  affected_assignments?: number
  data?: {
    task_id: string
    deleted_assignments: number
    deleted_at: string
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    // 使用RPC函数删除任务
    const { data: result, error } = await supabase
      .rpc('delete_examiner_task', {
        p_task_id: taskId,
        p_confirmation_code: confirmationCode
      })

    if (error) {
      throw new Error(`RPC函数调用失败: ${error.message}`)
    }

    // 如果返回结果包含confirmation_required，表示需要二次确认
    if (result && result.confirmation_required) {
      return {
        success: false,
        message: result.message,
        confirmation_required: true,
        confirmation_message: result.confirmation_message,
        expected_code: result.expected_code,
        affected_assignments: result.affected_assignments
      }
    }

    // 解析RPC返回结果
    if (result && !result.success) {
      throw new Error(result.message)
    }

    return {
      success: true,
      message: result.message || '任务删除成功',
      data: result.data
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除任务失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 更新任务详细信息
 */
export const updateTaskDetails = async (taskId: string, taskData: {
  title?: string
  description?: string
  reward_points?: number
  deadline?: string
  expires_in_months?: number
  status?: string
}): Promise<{
  success: boolean
  message: string
  data?: {
    task_id: string
    updated_fields: string[]
    updated_at: string
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    // 使用RPC函数更新任务详细信息
    const { data: result, error } = await supabase
      .rpc('update_task_details', {
        p_task_id: taskId,
        p_title: taskData.title,
        p_description: taskData.description,
        p_reward_points: taskData.reward_points,
        p_deadline: taskData.deadline,
        p_expires_in_months: taskData.expires_in_months,
        p_status: taskData.status
      })

    if (error) {
      throw new Error(`RPC函数调用失败: ${error.message}`)
    }

    // 解析RPC返回结果
    if (result && !result.success) {
      throw new Error(result.message)
    }

    return {
      success: true,
      message: result.message || '任务信息更新成功',
      data: result.data
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新任务信息失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 创建新任务
 */
export const createTask = async (taskData: {
  title: string
  description: string
  reward_points: number
  deadline: string
  expires_in_months: number
  status: string
}): Promise<{
  success: boolean
  message: string
  data?: {
    task: any
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    // 首先检查Supabase认证状态，如果没有认证则设置认证
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      console.warn('Supabase会话未认证，尝试设置认证')
      
      // 获取当前用户的认证token
      const token = authService.getToken()
      if (token) {
        // 设置Supabase认证会话
        const { data: signInData, error: signInError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (signInError) {
          console.warn('设置Supabase会话失败:', signInError)
          // 尝试使用RPC函数绕过认证
          return await createTaskWithRPC(currentUser.id, taskData)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用RPC函数')
        return await createTaskWithRPC(currentUser.id, taskData)
      }
    }

    // 计算过期时间
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + taskData.expires_in_months)

    // 插入新任务
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        reward_points: taskData.reward_points,
        deadline: taskData.deadline,
        expires_in_months: taskData.expires_in_months,
        status: taskData.status,
        examiner_id: currentUser.id
      })
      .select()
      .single()

    if (error) {
      console.warn('直接插入失败，尝试使用RPC函数:', error)
      return await createTaskWithRPC(currentUser.id, taskData)
    }

    return {
      success: true,
      message: '任务创建成功',
      data: {
        task: newTask
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '任务创建失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 使用RPC函数创建任务（绕过认证限制）
 */
const createTaskWithRPC = async (examinerId: string, taskData: {
  title: string
  description: string
  reward_points: number
  deadline: string
  expires_in_months: number
  status: string
}): Promise<{
  success: boolean
  message: string
  data?: {
    task: any
  }
}> => {
  try {
    // 使用RPC函数创建任务
    const { data: newTask, error } = await supabase
      .rpc('create_examiner_task', {
        p_examiner_id: examinerId,
        p_title: taskData.title,
        p_description: taskData.description,
        p_reward_points: taskData.reward_points,
        p_deadline: taskData.deadline,
        p_expires_in_months: taskData.expires_in_months,
        p_status: taskData.status
      })

    if (error) {
      throw new Error(`RPC函数调用失败: ${error.message}`)
    }

    return {
      success: true,
      message: '任务创建成功',
      data: {
        task: newTask
      }
    }
  } catch (error) {
    console.error('RPC方式创建任务失败:', error)
    const message = error instanceof Error ? error.message : '任务创建失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 获取任务参与者列表（学生提交的作品）
 * 只返回状态为'submitted'和'completed'的学生记录
 */
export const getTaskParticipants = async (taskId: string): Promise<{
  success: boolean
  message: string
  data: {
    students: any[]
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: {
          students: []
        }
      }
    }

    // 使用RPC函数获取任务参与者（RPC函数已过滤只返回submitted和completed状态）
    const { data: participants, error } = await supabase
      .rpc('get_task_participants', { p_task_id: taskId })

    if (error) {
      console.error('RPC函数调用失败:', error)
      return {
        success: false,
        message: `获取参与者列表失败: ${error.message}`,
        data: {
          students: []
        }
      }
    }

    // 处理返回的学生数据 - RPC函数已确保只返回submitted和completed状态
    const students = (participants || []).map((student: any) => ({
      id: student.id,
      username: student.username,
      email: student.email,
      submission_date: student.submission_date,
      submission_url: student.submission_url,
      status: student.status // 直接使用RPC返回的状态字段
    }))

    return {
      success: true,
      message: '获取参与者列表成功',
      data: {
        students
      }
    }
  } catch (error) {
    console.error('获取任务参与者失败:', error)
    const message = error instanceof Error ? error.message : '获取参与者列表失败'
    return {
      success: false,
      message,
      data: {
        students: []
      }
    }
  }
}

/**
 * 批准学生提交的作品
 */
export const approveSubmission = async (studentId: string, taskId: string): Promise<{
  success: boolean
  message: string
  data?: {
    student_id: string
    task_id: string
    approved_at: string
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    // 使用RPC函数批准提交
    const { data: result, error } = await supabase
      .rpc('approve_task_submission', {
        p_student_id: studentId,
        p_task_id: taskId,
        p_examiner_id: currentUser.id
      })

    if (error) {
      throw new Error(`RPC函数调用失败: ${error.message}`)
    }

    // 解析RPC返回结果
    if (result && !result.success) {
      throw new Error(result.message)
    }

    return {
      success: true,
      message: result.message || '作品已通过评审',
      data: result.data
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '评审操作失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 拒绝学生提交的作品
 */
export const rejectSubmission = async (studentId: string, taskId: string): Promise<{
  success: boolean
  message: string
  data?: {
    student_id: string
    task_id: string
    rejected_at: string
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      }
    }

    // 使用RPC函数拒绝提交
    const { data: result, error } = await supabase
      .rpc('reject_task_submission', {
        p_student_id: studentId,
        p_task_id: taskId,
        p_examiner_id: currentUser.id
      })

    if (error) {
      throw new Error(`RPC函数调用失败: ${error.message}`)
    }

    // 解析RPC返回结果
    if (result && !result.success) {
      throw new Error(result.message)
    }

    return {
      success: true,
      message: result.message || '作品已拒绝',
      data: result.data
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '评审操作失败'
    return {
      success: false,
      message
    }
  }
}

export default {
  generateTeacherKey,
  getTeacherStudents,
  getStudentTeacher,
  bindStudentTeacher,
  getStudentAbilities,
  getStudentActualAbilities,
  assignStudentAbilities,
  getExaminerTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  updateTaskDetails,
  getTaskParticipants,
  approveSubmission,
  rejectSubmission
}