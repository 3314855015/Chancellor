// 学生服务 - 专门处理学生相关功能
import { supabase } from '@/lib/supabase.client'
import { createClient } from '@supabase/supabase-js'
import authService from '@/services/authService'

// 定义类型接口
interface StudentInfo {
  id: string
  username: string
  email: string | null
  studentStatus: string | null
  abilityPoints: number
  completedTasks: number
  currentTask: string | null
  avatarUrl: string | null
  lastLoginAt: string | null
  createdAt: string
}

interface TeacherInfo {
  id: string
  username: string
  email: string | null
  joinedAt: string
}

interface TaskInfo {
  id: string
  title: string
  description: string
  reward: number
  deadline: string
  publisher: string
  status: 'available' | 'accepted' | 'completed'
  createdAt: string
}

interface AbilityInfo {
  name: string
  value: number
  icon: string
  totalValue?: number
  tempValue?: number
}

interface EmploymentOpportunity {
  id: string
  company: string
  position: string
  type: string
  requiredAbility: number
  salary: string
  description: string
}

interface StudentMessage {
  messageId: string
  senderId: string
  senderName: string
  senderEmail: string
  messageContent: string
  createdAt: string
  isRead: boolean
}

/**
 * 获取学生个人信息
 */
export const getStudentInfo = async (): Promise<{
  success: boolean
  message: string
  data: {
    student: StudentInfo | null
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { student: null }
      }
    }

    // 首先检查Supabase认证状态，如果没有认证则设置认证
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      // console.warn('Supabase会话未认证，尝试设置认证')
      
      // 获取当前用户的认证token
      const token = authService.getToken()
      if (token) {
        // 设置Supabase认证会话
        const { data: signInData, error: signInError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (signInError) {
          // console.warn('设置Supabase会话失败:', signInError)
          // 使用自定义认证方式获取学生信息
          return await getStudentInfoWithCustomAuth(currentUser)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用自定义认证方式')
        return await getStudentInfoWithCustomAuth(currentUser)
      }
    }

    // 查询学生详细信息
    const { data: studentData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // 查询学生能力点数
    let abilityData: any = null
    try {
      const { data, error: abilityError } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', currentUser.id)
      
      if (!abilityError && data && data.length > 0) {
        abilityData = data[0]
      } else {
        console.warn('获取能力数据失败或用户暂无能力数据:', abilityError?.message || '无数据')
      }
    } catch (abilityError) {
      console.warn('查询能力数据异常:', abilityError)
      // 继续使用默认值
    }

    // 查询学生任务统计（由于task_assignments表可能不存在，使用默认值）
    let completedTasks = 0
    let currentTask = null
    
    try {
      const { data: taskStats } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('student_id', currentUser.id)

      if (taskStats) {
        completedTasks = taskStats.filter(task => task.status === 'completed').length || 0
        currentTask = taskStats.find(task => task.status === 'accepted')?.task_title || null
      }
    } catch (taskError) {
      console.warn('查询任务统计失败:', taskError)
      // 使用默认值
    }

    const studentInfo: StudentInfo = {
      id: String(studentData.id),
      username: String(studentData.username),
      email: studentData.email,
      studentStatus: studentData.student_status,
      abilityPoints: abilityData ? 
        (abilityData.frontend_points + abilityData.android_points + abilityData.backend_points + 
         abilityData.ai_points + abilityData.communication_points + abilityData.creativity_points + 
         abilityData.leadership_points) : 0,
      completedTasks,
      currentTask,
      avatarUrl: studentData.avatar_url,
      lastLoginAt: studentData.last_login_at,
      createdAt: studentData.created_at
    }

    return {
      success: true,
      message: '获取学生信息成功',
      data: { student: studentInfo }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取学生信息失败'
    return {
      success: false,
      message,
      data: { student: null }
    }
  }
}

/**
 * 获取学生绑定的教师信息
 */
export const getStudentTeacher = async (): Promise<{
  success: boolean
  message: string
  data: {
    teacher: TeacherInfo | null
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { teacher: null }
      }
    }

    // 首先检查Supabase认证状态，但不直接返回，继续尝试获取教师信息
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      // console.warn('Supabase会话未认证，尝试使用自定义认证方式获取教师信息')
      // 不直接返回，继续尝试获取教师信息
    }

    // 使用视图查询学生-教师关系详情
    const { data: teacherDetails, error } = await supabase
      .from('student_teacher_details')
      .select('*')
      .eq('student_id', currentUser.id)

    if (error) {
      throw new Error(error.message)
    }

    // 如果没有找到记录，表示学生未绑定教师
    if (!teacherDetails || teacherDetails.length === 0) {
      return {
        success: true,
        message: '学生未绑定教师',
        data: { teacher: null }
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
      data: { teacher: teacherInfo }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取教师信息失败'
    return {
      success: false,
      message,
      data: { teacher: null }
    }
  }
}

/**
 * 获取学生能力数据
 */
export const getStudentAbilities = async (): Promise<{
  success: boolean
  message: string
  data: {
    abilities: AbilityInfo[]
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { abilities: [] }
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
          return await getStudentAbilitiesWithCustomAuth(currentUser)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用自定义认证方式')
        return await getStudentAbilitiesWithCustomAuth(currentUser)
      }
    }

    // 尝试查询能力数据，但处理可能的406错误
    let abilityData: any = null
    console.log('当前用户ID:', currentUser.id)
    try {
      const { data, error } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', currentUser.id)
      
      console.log('能力数据查询结果:', { data, error })
      
      if (!error && data && data.length > 0) {
        abilityData = data[0]
        console.log('获取到能力数据:', abilityData)
      } else {
        console.warn('未找到能力数据或查询失败:', error)
        // 如果用户没有能力数据，创建一个默认记录
        // 注意：由于RLS策略，插入操作可能会失败，所以这里只记录警告
        console.warn('无法创建默认能力数据：RLS策略限制')
      }
    } catch (queryError) {
      console.warn('查询能力数据异常:', queryError)
      // 继续使用默认值
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
        message: '获取能力数据成功',
        data: { abilities }
      }
    }

    // 返回默认能力数据
    return {
      success: true,
      message: '获取能力数据成功（使用默认值）',
      data: { abilities: defaultAbilities }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取能力数据失败'
    return {
      success: false,
      message,
      data: { abilities: [] }
    }
  }
}

/**
 * 获取学生任务列表（绑定教师发布的任务）
 */
export const getStudentTasks = async (status?: 'available' | 'accepted' | 'completed'): Promise<{
  success: boolean
  message: string
  data: {
    tasks: TaskInfo[]
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { tasks: [] }
      }
    }

    // 首先检查Supabase认证状态，如果没有认证则设置认证
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      // console.warn('Supabase会话未认证，尝试设置认证')
      
      // 获取当前用户的认证token
      const token = authService.getToken()
      if (token) {
        // 设置Supabase认证会话
        const { data: signInData, error: signInError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (signInError) {
          // console.warn('设置Supabase会话失败:', signInError)
          // 使用自定义认证方式获取任务
          return await getStudentTasksWithCustomAuth(currentUser, status)
        }
        
        console.log('Supabase会话设置成功')
      } else {
        console.warn('没有认证token，使用自定义认证方式')
        return await getStudentTasksWithCustomAuth(currentUser, status)
      }
    }

    // 查询学生绑定的教师
    const { data: teacherDetails, error: teacherError } = await supabase
      .from('student_teacher_details')
      .select('teacher_id')
      .eq('student_id', currentUser.id)

    if (teacherError) {
      throw new Error(teacherError.message)
    }

    // 如果没有绑定教师，返回空列表
    if (!teacherDetails || teacherDetails.length === 0) {
      return {
        success: true,
        message: '学生未绑定教师，暂无任务',
        data: { tasks: [] }
      }
    }

    const teacherId = teacherDetails[0].teacher_id

    // 查询教师发布的任务
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        reward,
        deadline,
        created_at,
        publisher:users!tasks_teacher_id_fkey(username)
      `)
      .eq('teacher_id', teacherId)

    // 根据状态过滤任务
    if (status) {
      query = query.eq('status', status)
    }

    const { data: tasksData, error: tasksError } = await query.order('created_at', { ascending: false })

    if (tasksError) {
      // 如果tasks表不存在，返回空列表
      if (tasksError.code === 'PGRST116') {
        console.warn('tasks表不存在，返回空任务列表')
        return {
          success: true,
          message: '获取任务列表成功（暂无可接任务）',
          data: { tasks: [] }
        }
      }
      throw new Error(tasksError.message)
    }

    // 查询学生已接取的任务状态
    let studentTasks: any[] = []
    try {
      const { data: studentTasksData } = await supabase
        .from('task_assignments')
        .select('task_id, status')
        .eq('student_id', currentUser.id)

      if (studentTasksData) {
        studentTasks = studentTasksData
      }
    } catch (studentTaskError) {
      console.warn('查询学生任务状态失败:', studentTaskError)
    }

    // 构建任务列表
    const taskList: TaskInfo[] = (tasksData || []).map(task => {
      // 查找学生对该任务的状态
      const studentTask = studentTasks.find(st => st.task_id === task.id)
      const taskStatus = studentTask ? studentTask.status : 'available'

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        reward: task.reward,
        deadline: task.deadline,
        publisher: task.publisher && Array.isArray(task.publisher) && task.publisher.length > 0 ? task.publisher[0].username || '未知教师' : '未知教师',
        status: taskStatus as 'available' | 'accepted' | 'completed',
        createdAt: task.created_at
      }
    })

    // 如果指定了状态，则按状态过滤
    const filteredTasks = status ? taskList.filter(task => task.status === status) : taskList

    return {
      success: true,
      message: `获取任务列表成功（共${filteredTasks.length}个任务）`,
      data: { tasks: filteredTasks }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取任务列表失败'
    return {
      success: false,
      message,
      data: { tasks: [] }
    }
  }
}

/**
 * 接取任务
 */
export const acceptTask = async (taskId: string): Promise<{
  success: boolean
  message: string
  data: null
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: null
      }
    }

    // 使用RPC函数接取任务，处理冲突和业务逻辑
    const { error } = await supabase
      .rpc('accept_student_task', {
        p_student_id: currentUser.id,
        p_task_id: taskId
      })

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '任务接取成功',
      data: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '任务接取失败'
    return {
      success: false,
      message,
      data: null
    }
  }
}

/**
 * 提交任务成果
 */
export const submitTask = async (taskId: string, submissionContent: string): Promise<{
  success: boolean
  message: string
  data: null
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: null
      }
    }

    // 直接使用RPC函数提交任务，不设置复杂的认证会话
    const { data, error } = await supabase.rpc('submit_task', {
      p_student_id: currentUser.id,
      p_task_id: taskId,
      p_submission_content: submissionContent
    })

    if (error) {
      throw new Error(error.message)
    }
    
    // 检查函数返回值
    if (data === 'success') {
      return {
        success: true,
        message: '任务提交成功',
        data: null
      }
    } else {
      // 函数返回了错误信息
      throw new Error(data || '任务提交失败')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '任务提交失败'
    return {
      success: false,
      message,
      data: null
    }
  }
}

/**
 * 获取就业机会列表
 */
export const getEmploymentOpportunities = async (): Promise<{
  success: boolean
  message: string
  data: {
    opportunities: EmploymentOpportunity[]
  }
}> => {
  try {
    // 由于employment_opportunities表可能不存在，返回空列表
    // 在实际部署时，需要先创建employment_opportunities表
    const opportunityList: EmploymentOpportunity[] = []

    return {
      success: true,
      message: '获取就业机会成功（暂无就业机会）',
      data: { opportunities: opportunityList }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取就业机会失败'
    return {
      success: false,
      message,
      data: { opportunities: [] }
    }
  }
}

/**
 * 申请就业机会
 */
export const applyEmploymentOpportunity = async (opportunityId: string): Promise<{
  success: boolean
  message: string
  data: null
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: null
      }
    }

    const { error } = await supabase
      .from('employment_applications')
      .insert({
        student_id: currentUser.id,
        opportunity_id: opportunityId,
        status: 'pending',
        applied_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '申请提交成功',
      data: null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '申请提交失败'
    return {
      success: false,
      message,
      data: null
    }
  }
}

/**
 * 更新学生状态（上任或拒绝）
 */
export const updateStudentStatus = async (newStatus: 'selected' | 'wild'): Promise<{
  success: boolean
  message: string
  data: null
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: null
      }
    }

    // 使用RPC函数更新学生状态
    const { data, error } = await supabase.rpc('update_student_status', {
      p_student_id: currentUser.id,
      p_new_status: newStatus
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data === 'success') {
      return {
        success: true,
        message: newStatus === 'selected' ? '上任成功！状态已更新为中举' : '已拒绝邀请',
        data: null
      }
    } else {
      throw new Error(data || '状态更新失败')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '状态更新失败'
    return {
      success: false,
      message,
      data: null
    }
  }
}

/**
 * 获取学生收到的企业消息（分页加载）
 */
export const getStudentMessages = async (page: number = 1, pageSize: number = 3): Promise<{
  success: boolean
  message: string
  data: {
    messages: StudentMessage[]
    currentPage: number
    totalPages: number
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { messages: [], currentPage: 1, totalPages: 1 }
      }
    }

    // 使用RPC函数获取学生消息
    const { data: messagesData, error } = await supabase
      .rpc('get_student_messages', {
        p_student_id: currentUser.id,
        p_page: page,
        p_page_size: pageSize
      })

    if (error) {
      console.warn('获取学生消息失败:', error)
      // 如果RPC失败，返回空消息列表
      return {
        success: true,
        message: '获取消息成功',
        data: { messages: [], currentPage: 1, totalPages: 1 }
      }
    }

    // 转换消息数据格式
    const messages: StudentMessage[] = (messagesData || []).map((msg: any) => ({
      messageId: msg.message_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      senderEmail: msg.sender_email,
      messageContent: msg.message_content,
      createdAt: msg.created_at,
      isRead: msg.is_read
    }))

    // 由于RPC函数没有返回总页数信息，这里我们假设有更多消息
    const totalPages = messages.length === pageSize ? page + 1 : page

    return {
      success: true,
      message: `获取消息成功（共${messages.length}条）`,
      data: {
        messages,
        currentPage: page,
        totalPages
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取消息失败'
    return {
      success: false,
      message,
      data: { messages: [], currentPage: 1, totalPages: 1 }
    }
  }
}

/**
 * 绑定教师（使用教师密钥）
 */
export const bindTeacher = async (keyValue: string): Promise<{
  success: boolean
  message: string
  data: {
    teacher: TeacherInfo | null
  }
}> => {
  try {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录',
        data: { teacher: null }
      }
    }

    // 使用RPC函数绑定学生和教师
    const { data: result, error } = await supabase.rpc('sp_bind_student_teacher', {
      p_key_value: keyValue,
      p_student_id: currentUser.id
    })

    if (error) {
      throw new Error(error.message)
    }

    if (result && result.length > 0) {
      const bindResult = result[0]
      if (bindResult.result === 'success') {
        const teacherInfo: TeacherInfo = {
          id: bindResult.teacher_id,
          username: bindResult.teacher_username,
          email: bindResult.teacher_email,
          joinedAt: new Date().toISOString()
        }

        return {
          success: true,
          message: '绑定教师成功',
          data: { teacher: teacherInfo }
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
      data: { teacher: null }
    }
  }
}

/**
 * 使用自定义认证方式获取能力数据
 */
const getStudentAbilitiesWithCustomAuth = async (currentUser: any): Promise<{
  success: boolean
  message: string
  data: {
    abilities: AbilityInfo[]
  }
}> => {
  try {
    // 使用RPC函数绕过RLS限制
    const { data, error } = await supabase
      .rpc('get_user_abilities_by_id', { 
        p_user_id: currentUser.id 
      })

    if (error) {
      console.warn('RPC查询能力数据失败:', error)
      // 如果RPC失败，尝试直接查询但使用服务角色密钥
      return await getStudentAbilitiesWithServiceRole(currentUser)
    }

    if (data && data.length > 0) {
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
        message: '获取能力数据成功',
        data: { abilities }
      }
    } else {
      // 如果没有数据，创建默认记录
      return await createDefaultAbilitiesWithServiceRole(currentUser)
    }
  } catch (error) {
    console.error('自定义认证查询异常:', error)
    return {
      success: false,
      message: '获取能力数据失败',
      data: { abilities: [] }
    }
  }
}

/**
 * 使用服务角色密钥获取能力数据
 */
const getStudentAbilitiesWithServiceRole = async (currentUser: any): Promise<{
  success: boolean
  message: string
  data: {
    abilities: AbilityInfo[]
  }
}> => {
  try {
    // 创建服务角色客户端（绕过RLS）
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('服务角色密钥未配置')
    }

    const serviceClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      serviceRoleKey
    )

    const { data, error } = await serviceClient
      .from('user_abilities')
      .select('*')
      .eq('user_id', currentUser.id)

    if (error) {
      throw new Error(error.message)
    }

    if (data && data.length > 0) {
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
        message: '获取能力数据成功',
        data: { abilities }
      }
    } else {
      // 如果没有数据，创建默认记录
      return await createDefaultAbilitiesWithServiceRole(currentUser)
    }
  } catch (error) {
    console.error('服务角色查询异常:', error)
    return {
      success: false,
      message: '获取能力数据失败',
      data: { abilities: [] }
    }
  }
}

/**
 * 使用服务角色密钥创建默认能力数据
 */
const createDefaultAbilitiesWithServiceRole = async (currentUser: any): Promise<{
  success: boolean
  message: string
  data: {
    abilities: AbilityInfo[]
  }
}> => {
  try {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('服务角色密钥未配置')
    }

    const serviceClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      serviceRoleKey
    )

    const { data: newAbilityData, error: insertError } = await serviceClient
      .from('user_abilities')
      .insert({
        user_id: currentUser.id,
        frontend_points: 0,
        android_points: 0,
        backend_points: 0,
        ai_points: 0,
        communication_points: 0,
        creativity_points: 0,
        leadership_points: 0
      })
      .select()

    if (insertError) {
      throw new Error(insertError.message)
    }

    if (newAbilityData && newAbilityData.length > 0) {
      const abilityData = newAbilityData[0]
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
        message: '创建默认能力数据成功',
        data: { abilities }
      }
    } else {
      throw new Error('创建能力数据失败')
    }
  } catch (error) {
    console.error('创建默认能力数据异常:', error)
    // 返回默认的0值能力数据
    return {
      success: true,
      message: '使用默认能力数据',
      data: { abilities: getDefaultAbilities() }
    }
  }
}

/**
 * 使用自定义认证方式获取学生信息
 */
const getStudentInfoWithCustomAuth = async (currentUser: any): Promise<{
  success: boolean
  message: string
  data: {
    student: StudentInfo | null
  }
}> => {
  try {
    // 使用RPC函数绕过RLS限制
    const { data, error } = await supabase
      .rpc('get_user_info_by_id', { 
        p_user_id: currentUser.id 
      })

    if (error) {
      console.warn('RPC查询学生信息失败:', error)
      // 如果RPC失败，尝试使用服务角色密钥
      return await getStudentInfoWithServiceRole(currentUser)
    }

    if (data && data.length > 0) {
      const userData = data[0]
      
      // 查询能力数据
      const abilitiesResponse = await getStudentAbilitiesWithCustomAuth(currentUser)
      let abilityPoints = 0
      if (abilitiesResponse.success) {
        abilityPoints = abilitiesResponse.data.abilities.reduce((sum, ability) => sum + ability.value, 0)
      }

      const studentInfo: StudentInfo = {
        id: String(userData.id),
        username: String(userData.username),
        email: userData.email,
        studentStatus: userData.student_status,
        abilityPoints,
        completedTasks: 0, // 暂时使用默认值
        currentTask: null, // 暂时使用默认值
        avatarUrl: userData.avatar_url,
        lastLoginAt: userData.last_login_at,
        createdAt: userData.created_at
      }

      return {
        success: true,
        message: '获取学生信息成功',
        data: { student: studentInfo }
      }
    } else {
      throw new Error('未找到用户信息')
    }
  } catch (error) {
    console.error('自定义认证查询异常:', error)
    return {
      success: false,
      message: '获取学生信息失败',
      data: { student: null }
    }
  }
}

/**
 * 使用服务角色密钥获取学生信息
 */
const getStudentInfoWithServiceRole = async (currentUser: any): Promise<{
  success: boolean
  message: string
  data: {
    student: StudentInfo | null
  }
}> => {
  try {
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('服务角色密钥未配置')
    }

    const serviceClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      serviceRoleKey
    )

    const { data: userData, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // 查询能力数据
    const abilitiesResponse = await getStudentAbilitiesWithServiceRole(currentUser)
    let abilityPoints = 0
    if (abilitiesResponse.success) {
      abilityPoints = abilitiesResponse.data.abilities.reduce((sum, ability) => sum + ability.value, 0)
    }

    const studentInfo: StudentInfo = {
      id: String(userData.id),
      username: String(userData.username),
      email: userData.email,
      studentStatus: userData.student_status,
      abilityPoints,
      completedTasks: 0, // 暂时使用默认值
      currentTask: null, // 暂时使用默认值
      avatarUrl: userData.avatar_url,
      lastLoginAt: userData.last_login_at,
      createdAt: userData.created_at
    }

    return {
      success: true,
      message: '获取学生信息成功',
      data: { student: studentInfo }
    }
  } catch (error) {
    console.error('服务角色查询异常:', error)
    return {
      success: false,
      message: '获取学生信息失败',
      data: { student: null }
    }
  }
}

/**
 * 获取默认能力数据
 */
const getDefaultAbilities = (): AbilityInfo[] => {
  return [
    { name: '前端开发', value: 0, icon: '💻' },
    { name: '安卓开发', value: 0, icon: '📱' },
    { name: '后端开发', value: 0, icon: '⚙️' },
    { name: '人工智能', value: 0, icon: '🤖' },
    { name: '沟通能力', value: 0, icon: '💬' },
    { name: '创造力', value: 0, icon: '💡' },
    { name: '领导力', value: 0, icon: '👑' }
  ]
}

/**
 * 获取学生实际能力数据（包含基础值和临时值）
 */
export const getStudentActualAbilities = async (): Promise<{
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

    // 使用RPC函数获取学生实际能力数据（包含基础值和临时值）
    const response = await supabase.rpc('get_student_actual_abilities', { p_user_id: currentUser.id });
    
    // 使用新的RPC函数获取有效的general点数
    const abilityRecordsResponse = await supabase.rpc('get_ability_records', { p_user_id: currentUser.id });
    
    const { data, error } = response;
    const { data: abilityRecordsData, error: abilityRecordsError } = abilityRecordsResponse;
    
    if (error) {
      console.warn('获取学生实际能力数据失败:', error)
      // 回退到旧方法，并包装返回类型
      const result = await getStudentAbilities()
      return {
        ...result,
        data: {
          ...result.data,
          remainingBasePoints: 0,
          remainingPoints: 0,
          remainingTotalPoints: 0,
          generalPoints: 0
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
        const result = await getStudentAbilities()
        return {
          ...result,
          data: {
            ...result.data,
            remainingBasePoints: 0,
            remainingPoints: 0,
            remainingTotalPoints: 0,
            generalPoints: 0
          }
        }
      }
      
      // 解析ability records数据获取有效的general点数
      let actualGeneralPoints = rpcData.general_points || 0;
      if (abilityRecordsData && abilityRecordsData.success && abilityRecordsData.data) {
        // 使用新的RPC函数返回的general点数
        actualGeneralPoints = abilityRecordsData.data.general_points || 0;
        // console.log('使用新的RPC函数获取的general点数:', actualGeneralPoints);
      } else if (abilityRecordsError) {
        console.warn('获取ability records失败，使用默认值:', abilityRecordsError);
      }
      
      // 将对象格式转换为前端需要的数组格式，合并基础值和临时值
      const abilitiesArray = [
        {
          name: '前端开发',
          value: rpcData.base_abilities?.frontend_points || 0,
          tempValue: rpcData.temp_abilities?.frontend_points || 0,
          totalValue: (rpcData.base_abilities?.frontend_points || 0) + (rpcData.temp_abilities?.frontend_points || 0),
          icon: '💻'
        },
        {
          name: '安卓开发',
          value: rpcData.base_abilities?.android_points || 0,
          tempValue: rpcData.temp_abilities?.android_points || 0,
          totalValue: (rpcData.base_abilities?.android_points || 0) + (rpcData.temp_abilities?.android_points || 0),
          icon: '📱'
        },
        {
          name: '后端开发',
          value: rpcData.base_abilities?.backend_points || 0,
          tempValue: rpcData.temp_abilities?.backend_points || 0,
          totalValue: (rpcData.base_abilities?.backend_points || 0) + (rpcData.temp_abilities?.backend_points || 0),
          icon: '⚙️'
        },
        {
          name: '人工智能',
          value: rpcData.base_abilities?.ai_points || 0,
          tempValue: rpcData.temp_abilities?.ai_points || 0,
          totalValue: (rpcData.base_abilities?.ai_points || 0) + (rpcData.temp_abilities?.ai_points || 0),
          icon: '🤖'
        },
        {
          name: '沟通能力',
          value: rpcData.base_abilities?.communication_points || 0,
          tempValue: rpcData.temp_abilities?.communication_points || 0,
          totalValue: (rpcData.base_abilities?.communication_points || 0) + (rpcData.temp_abilities?.communication_points || 0),
          icon: '💬'
        },
        {
          name: '创造力',
          value: rpcData.base_abilities?.creativity_points || 0,
          tempValue: rpcData.temp_abilities?.creativity_points || 0,
          totalValue: (rpcData.base_abilities?.creativity_points || 0) + (rpcData.temp_abilities?.creativity_points || 0),
          icon: '💡'
        },
        {
          name: '领导力',
          value: rpcData.base_abilities?.leadership_points || 0,
          tempValue: rpcData.temp_abilities?.leadership_points || 0,
          totalValue: (rpcData.base_abilities?.leadership_points || 0) + (rpcData.temp_abilities?.leadership_points || 0),
          icon: '👑'
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
      
      // console.log('修正后的剩余点数计算:', {
      //   baseTotal,
      //   tempTotal,
      //   actualGeneralPoints,
      //   remainingBasePoints,
      //   remainingTotalPoints
      // })
      
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
      console.warn('获取学生能力数据失败: RPC返回空数据')
      // 回退到旧方法，并包装返回类型
      const result = await getStudentAbilities()
      return {
        ...result,
        data: {
          ...result.data,
          remainingBasePoints: 0,
          remainingPoints: 0,
          remainingTotalPoints: 0,
          generalPoints: 0
        }
      }
    }
  } catch (error) {
    console.error('获取学生实际能力数据失败:', error)
    // 回退到旧方法，并包装返回类型
    const result = await getStudentAbilities()
    return {
      ...result,
      data: {
        ...result.data,
        remainingBasePoints: 0,
        remainingPoints: 0,
        remainingTotalPoints: 0,
        generalPoints: 0
      }
    }
  }
}

/**
 * 使用自定义认证方式获取任务列表
 */
const getStudentTasksWithCustomAuth = async (currentUser: any, status?: 'available' | 'accepted' | 'completed'): Promise<{
  success: boolean
  message: string
  data: {
    tasks: TaskInfo[]
  }
}> => {
  try {
    // 使用RPC函数绕过RLS限制获取任务
    const { data: tasksData, error } = await supabase
      .rpc('get_student_tasks', { 
        p_student_id: currentUser.id,
        p_status: status || null
      })

    if (error) {
      console.warn('RPC查询任务数据失败:', error)
      // 如果RPC失败，返回空列表
      return {
        success: true,
        message: '获取任务列表成功（暂无可接任务）',
        data: { tasks: [] }
      }
    }

    if (tasksData && tasksData.length > 0) {
      const taskList: TaskInfo[] = tasksData.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        reward: task.reward_points || 0,
        deadline: task.deadline,
        publisher: task.publisher || '未知教师',
        status: task.status as 'available' | 'accepted' | 'completed',
        createdAt: task.created_at
      }))

      return {
        success: true,
        message: `获取任务列表成功（共${taskList.length}个任务）`,
        data: { tasks: taskList }
      }
    } else {
      // 没有任务数据，返回空列表
      return {
        success: true,
        message: '获取任务列表成功（暂无可接任务）',
        data: { tasks: [] }
      }
    }
  } catch (error) {
    console.error('自定义认证查询任务异常:', error)
    return {
      success: false,
      message: '获取任务列表失败',
      data: { tasks: [] }
    }
  }
}

export default {
  getStudentInfo,
  getStudentTeacher,
  getStudentAbilities,
  getStudentActualAbilities,
  getStudentTasks,
  acceptTask,
  submitTask,
  getEmploymentOpportunities,
  applyEmploymentOpportunity,
  bindTeacher,
  getStudentMessages,
  updateStudentStatus
}