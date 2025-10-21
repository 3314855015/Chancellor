import { defineStore } from 'pinia'

/**
 * 应用状态管理
 * 管理应用标题、主题等全局状态
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    appTitle: '上赛博朝廷，享智能招聘！',
    theme: 'light' as 'light' | 'dark',
    version: '1.0.0',
    isLoading: false
  }),
  
  getters: {
    isDarkTheme: (state) => state.theme === 'dark'
  },
  
  actions: {
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      // 应用到HTML根元素
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    },
    
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    }
  }
})