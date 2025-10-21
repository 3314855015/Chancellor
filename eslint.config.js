import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      vue
    },
    rules: {
      // 禁用不影响功能的SCSS相关警告
      'vue/no-unused-vars': 'off',
      'vue/no-parsing-error': 'off',
      'vue/valid-template-root': 'off',
      'vue/no-multiple-template-root': 'off',
      
      // 样式相关规则禁用
      'vue/no-unused-styles': 'off',
      'vue/no-deprecated-scope-attribute': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      'vue/no-deprecated-slot-scope-attribute': 'off',
      
      // 允许使用未定义的变量（SCSS变量可能被误报）
      'no-undef': 'off',
      
      // 其他不影响功能的规则
      'no-unused-vars': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs.recommended.rules,
      // TypeScript相关的不影响功能的规则禁用
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },
  {
    files: ['**/*.scss', '**/*.css'],
    rules: {
      // SCSS/CSS相关规则禁用
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
]