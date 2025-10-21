# Chancellor Vue App

基于 Vue 3 + TypeScript + Element Plus 的现代化 Web 应用框架。

## 🚀 技术栈

- **前端框架**: Vue 3 + Composition API
- **开发语言**: TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **HTTP客户端**: Axios

## 📦 项目特性

### 网络请求规范
- ✅ 统一的 Axios 请求封装
- ✅ 请求/响应拦截器配置
- ✅ 错误处理机制（网络错误、服务器错误、业务错误）
- ✅ 请求重试和超时设置
- ✅ TypeScript 类型定义支持

### 组件封装规范
- ✅ 单一职责原则的组件设计
- ✅ Composition API 逻辑复用
- ✅ 完整的 Props、Emits、Slots 规范
- ✅ Scoped CSS 样式隔离
- ✅ 响应式设计支持

### 开发体验
- ✅ 热重载开发服务器
- ✅ TypeScript 类型检查
- ✅ ESLint 代码规范
- ✅ 现代化的构建流程

## 🛠️ 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

### 类型检查
```bash
npm run type-check
```

## 📁 项目结构

```
src/
├── api/           # API 接口封装
├── components/    # 通用组件
├── views/         # 页面组件
├── stores/        # 状态管理
├── router/        # 路由配置
├── styles/        # 样式文件
└── utils/         # 工具函数
```

## 🔧 核心功能

### 网络请求封装
项目使用统一的 HTTP 客户端封装，支持：
- 自动添加认证 Token
- 请求参数序列化
- 响应数据格式化
- 错误码映射处理
- 请求日志记录

### 状态管理
基于 Pinia 的状态管理方案：
- 模块化的 Store 设计
- TypeScript 类型支持
- 响应式状态更新
- 持久化存储支持

### 路由配置
Vue Router 4 路由管理：
- 动态路由加载
- 路由守卫配置
- 页面标题管理
- 路由权限控制

## 🎨 UI 设计

项目采用 Element Plus 作为基础 UI 组件库，具备：
- 现代化的设计风格
- 完整的组件生态系统
- 响应式布局支持
- 可定制的主题配置

## 🔒 安全特性

- 请求参数校验
- XSS 攻击防护
- CSRF 令牌支持
- 安全的认证机制

## 📈 性能优化

- 代码分割和懒加载
- 组件级缓存策略
- 图片懒加载支持
- 请求防抖和节流

## 🤝 开发规范

### 代码提交规范
- 使用 Conventional Commits 格式
- 提交前运行代码检查
- 确保 TypeScript 类型正确

### 组件开发规范
- 使用 PascalCase 命名组件
- 为 Props 提供完整的类型定义
- 编写组件使用文档
- 遵循单一职责原则

## 📄 许可证

MIT License

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 🆘 常见问题

### Q: 如何添加新的 API 接口？
A: 在 `src/api/` 目录下创建对应的模块文件，遵循现有的封装规范。

### Q: 如何创建新的页面？
A: 在 `src/views/` 目录下创建页面组件，并在 `src/router/index.ts` 中添加路由配置。

### Q: 如何自定义主题？
A: 修改 `src/styles/variables.scss` 中的 CSS 变量来定制主题色彩。

---

**开发团队**: Chancellor Team  
**最后更新**: 2024年1月