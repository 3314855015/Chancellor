// 企业服务 - 专门处理企业相关功能
import { supabase } from '@/lib/supabase.client'
import authService from '@/services/authService'

// 定义类型接口
export interface StudentInfo {
  id: string
  username: string
  email: string | null
  studentStatus: string | null
  avatarUrl: string | null
  lastLoginAt: string | null
  createdAt: string
}

export interface AbilityInfo {
  name: string
  value: number
  icon: string
}

export interface TaskInfo {
  id: string
  title: string
  description: string
  reward: number
  deadline: string
  publisher: string
  status: 'available' | 'accepted' | 'completed'
  createdAt: string
}

export interface TaskAssignment {
  id: string
  taskId: string
  studentId: string
  status: string
  submission: string | null
  submittedAt: string | null
  reviewedAt: string | null
  awardedPoints: number | null
  createdAt: string
}

interface StudentAbilityData {
  frontendPoints: number
  androidPoints: number
  backendPoints: number
  aiPoints: number
  communicationPoints: number
  creativityPoints: number
  leadershipPoints: number
}

export interface StudentTaskHistory {
  task: TaskInfo
  assignment: TaskAssignment
}

class EnterpriseService {
  /**
   * 根据学生ID查询学生基本信息
   */
  async getStudentInfo(studentId: string): Promise<StudentInfo | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, student_status, avatar_url, last_login_at, created_at')
        .eq('id', studentId)
        .eq('role', 'student')
        .single()

      if (error) {
        console.error('查询学生信息失败:', error)
        return null
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        studentStatus: data.student_status,
        avatarUrl: data.avatar_url,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('查询学生信息异常:', error)
      return null
    }
  }

  /**
   * 根据学生ID查询学生能力信息
   */
  async getStudentAbilities(studentId: string): Promise<AbilityInfo[] | null> {
    try {
      const { data, error } = await supabase
        .from('user_abilities')
        .select('*')
        .eq('user_id', studentId)
        .single()

      if (error) {
        console.error('查询学生能力失败:', error)
        return null
      }

      if (!data) {
        return this.getDefaultAbilities()
      }

      const abilityData: StudentAbilityData = {
        frontendPoints: data.frontend_points || 0,
        androidPoints: data.android_points || 0,
        backendPoints: data.backend_points || 0,
        aiPoints: data.ai_points || 0,
        communicationPoints: data.communication_points || 0,
        creativityPoints: data.creativity_points || 0,
        leadershipPoints: data.leadership_points || 0
      }

      return this.formatAbilities(abilityData)
    } catch (error) {
      console.error('查询学生能力异常:', error)
      return this.getDefaultAbilities()
    }
  }

  /**
   * 根据学生ID查询任务历史
   */
  async getStudentTaskHistory(studentId: string): Promise<StudentTaskHistory[] | null> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          id,
          task_id,
          student_id,
          status,
          submission,
          submitted_at,
          reviewed_at,
          awarded_points,
          created_at,
          tasks (
            id,
            title,
            description,
            reward_points,
            deadline,
            status,
            created_at,
            examiners:users!tasks_examiner_id_fkey(username)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('查询任务历史失败:', error)
        return null
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map(item => ({
        assignment: {
          id: item.id,
          taskId: item.task_id,
          studentId: item.student_id,
          status: item.status,
          submission: item.submission,
          submittedAt: item.submitted_at,
          reviewedAt: item.reviewed_at,
          awardedPoints: item.awarded_points,
          createdAt: item.created_at
        },
        task: {
          id: Array.isArray(item.tasks) && item.tasks.length > 0 ? item.tasks[0].id || '' : '',
          title: Array.isArray(item.tasks) && item.tasks.length > 0 ? item.tasks[0].title || '未知任务' : '未知任务',
          description: Array.isArray(item.tasks) && item.tasks.length > 0 ? item.tasks[0].description || '' : '',
          reward: Array.isArray(item.tasks) && item.tasks.length > 0 ? item.tasks[0].reward_points || 0 : 0,
          deadline: Array.isArray(item.tasks) && item.tasks.length > 0 ? item.tasks[0].deadline || '' : '',
          publisher: Array.isArray(item.tasks) && item.tasks.length > 0 && Array.isArray(item.tasks[0].examiners) && item.tasks[0].examiners.length > 0 
            ? item.tasks[0].examiners[0].username || '未知发布者'
            : '未知发布者',
          status: this.mapTaskStatus(item.status),
          createdAt: Array.isArray(item.tasks) && item.tasks.length > 0 ? item.tasks[0].created_at || '' : ''
        }
      }))
    } catch (error) {
      console.error('查询任务历史异常:', error)
      return null
    }
  }

  /**
   * 联系学生（消耗企业点数）
   */
  async contactStudent(studentId: string): Promise<boolean> {
    try {
      // 获取当前企业用户信息
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        console.error('未找到当前用户信息')
        return false
      }

      // 这里可以添加点数消耗逻辑
      // 暂时返回成功
      console.log(`企业用户 ${currentUser.username} 联系学生 ${studentId}`)
      return true
    } catch (error) {
      console.error('联系学生异常:', error)
      return false
    }
  }

  /**
   * 获取多个学生的基本信息
   */
  async getMultipleStudentsInfo(studentIds: string[]): Promise<StudentInfo[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, student_status, avatar_url, last_login_at, created_at')
        .in('id', studentIds)
        .eq('role', 'student')

      if (error) {
        console.error('查询多个学生信息失败:', error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map(item => ({
        id: item.id,
        username: item.username,
        email: item.email,
        studentStatus: item.student_status,
        avatarUrl: item.avatar_url,
        lastLoginAt: item.last_login_at,
        createdAt: item.created_at
      }))
    } catch (error) {
      console.error('查询多个学生信息异常:', error)
      return []
    }
  }

  /**
   * 获取默认能力信息
   */
  private getDefaultAbilities(): AbilityInfo[] {
    return [
      { name: '前端开发', value: 0, icon: '💻' },
      { name: '安卓开发', value: 0, icon: '📱' },
      { name: '后端开发', value: 0, icon: '⚙️' },
      { name: '人工智能', value: 0, icon: '🤖' },
      { name: '沟通能力', value: 0, icon: '💬' },
      { name: '创造力', value: 0, icon: '✨' },
      { name: '领导力', value: 0, icon: '👑' }
    ]
  }

  /**
   * 格式化能力数据
   */
  private formatAbilities(abilityData: StudentAbilityData): AbilityInfo[] {
    return [
      { name: '前端开发', value: abilityData.frontendPoints, icon: '💻' },
      { name: '安卓开发', value: abilityData.androidPoints, icon: '📱' },
      { name: '后端开发', value: abilityData.backendPoints, icon: '⚙️' },
      { name: '人工智能', value: abilityData.aiPoints, icon: '🤖' },
      { name: '沟通能力', value: abilityData.communicationPoints, icon: '💬' },
      { name: '创造力', value: abilityData.creativityPoints, icon: '✨' },
      { name: '领导力', value: abilityData.leadershipPoints, icon: '👑' }
    ]
  }

  /**
   * 映射任务状态
   */
  private mapTaskStatus(status: string): 'available' | 'accepted' | 'completed' {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'accepted'
      case 'completed':
        return 'completed'
      case 'submitted':
        return 'completed'
      default:
        return 'available'
    }
  }
}

// 创建单例实例
export default new EnterpriseService()