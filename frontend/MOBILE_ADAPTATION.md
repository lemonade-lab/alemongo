# 移动端适配说明

## 概述

本项目已全面支持移动端适配，包括响应式布局、触摸优化、安全区域适配等功能。

## 主要特性

### 1. 响应式断点

- `xs`: 320px (超小屏幕)
- `sm`: 640px (小屏幕)
- `md`: 768px (中等屏幕)
- `lg`: 1024px (大屏幕)
- `xl`: 1280px (超大屏幕)
- `2xl`: 1536px (2倍超大屏幕)

### 2. 移动端专用断点

- `mobile-s`: 320px
- `mobile-m`: 375px
- `mobile-l`: 425px
- `tablet`: 768px
- `laptop`: 1024px
- `laptop-l`: 1440px
- `desktop`: 2560px

### 3. 核心功能

#### 3.1 移动端检测 Hook

```typescript
import { useMobile } from '@/hook/useMobile'

const { isMobile, isTablet, screenSize } = useMobile()
```

#### 3.2 触摸反馈 Hook

```typescript
import { useTouchFeedback } from '@/hook/useMobile'

const { isPressed, touchHandlers, touchClassName } = useTouchFeedback()
```

#### 3.3 移动端滚动优化

```typescript
import { useMobileScroll } from '@/hook/useMobile'

useMobileScroll() // 防止过度滚动
```

### 4. 样式类

#### 4.1 移动端布局类

- `.mobile-flex-col`: 垂直布局
- `.mobile-w-full`: 全宽
- `.mobile-hidden`: 移动端隐藏
- `.mobile-block`: 移动端显示

#### 4.2 移动端间距类

- `.mobile-p-1` 到 `.mobile-p-6`: 内边距
- `.mobile-m-1` 到 `.mobile-m-6`: 外边距

#### 4.3 移动端字体类

- `.mobile-text-xs`: 超小字体
- `.mobile-text-sm`: 小字体
- `.mobile-text-base`: 基础字体
- `.mobile-text-lg`: 大字体
- `.mobile-text-xl`: 超大字体

#### 4.4 移动端交互类

- `.mobile-button`: 移动端按钮优化
- `.mobile-input`: 移动端输入框优化
- `.mobile-touch-feedback`: 触摸反馈
- `.mobile-scroll`: 滚动优化

#### 4.5 安全区域适配

- `.mobile-safe-area`: 全安全区域
- `.mobile-safe-area-top`: 顶部安全区域
- `.mobile-safe-area-bottom`: 底部安全区域
- `.mobile-safe-area-left`: 左侧安全区域
- `.mobile-safe-area-right`: 右侧安全区域

### 5. 组件适配

#### 5.1 主布局

- 移动端侧边栏改为抽屉式
- 顶部导航栏适配
- 底部操作栏

#### 5.2 浮动按钮

- 桌面端：右下角浮动按钮组
- 移动端：底部固定操作栏

#### 5.3 JSONEdit 组件

- 工具栏响应式布局
- Tab 导航垂直排列
- 按钮和输入框优化

### 6. 性能优化

#### 6.1 触摸优化

- 禁用默认触摸高亮
- 优化触摸反馈
- 防止误触

#### 6.2 滚动优化

- 启用弹性滚动
- 防止过度滚动
- 平滑滚动效果

#### 6.3 动画优化

- 支持用户偏好设置
- 减少动画（prefers-reduced-motion）
- 高对比度模式支持

### 7. 无障碍支持

#### 7.1 键盘导航

- 支持键盘操作
- 焦点管理
- 屏幕阅读器支持

#### 7.2 高对比度

- 自动检测用户偏好
- 高对比度样式适配

#### 7.3 字体缩放

- 支持系统字体缩放
- 保持布局稳定

### 8. 使用示例

#### 8.1 基础响应式组件

```tsx
import { useMobile } from '@/hook/useMobile'

const MyComponent = () => {
  const { isMobile } = useMobile()
  
  return (
    <div className={`
      ${isMobile ? 'mobile-p-4' : 'p-6'}
      ${isMobile ? 'mobile-text-sm' : 'text-base'}
    `}>
      <h1 className={isMobile ? 'mobile-text-lg' : 'text-xl'}>
        标题
      </h1>
      <button className="mobile-button touch-optimized">
        按钮
      </button>
    </div>
  )
}
```

#### 8.2 条件渲染

```tsx
const Layout = () => {
  const { isMobile } = useMobile()
  
  return (
    <div>
      {!isMobile && <DesktopSidebar />}
      {isMobile && <MobileNavbar />}
      <main className={isMobile ? 'mobile-safe-area' : ''}>
        内容
      </main>
    </div>
  )
}
```

#### 8.3 触摸反馈

```tsx
import { useTouchFeedback } from '@/hook/useMobile'

const TouchButton = () => {
  const { touchHandlers, touchClassName } = useTouchFeedback()
  
  return (
    <button 
      className={`mobile-button touch-optimized ${touchClassName}`}
      {...touchHandlers}
    >
      触摸按钮
    </button>
  )
}
```

### 9. 最佳实践

#### 9.1 设计原则

1. **移动优先**: 先设计移动端，再扩展到桌面端
2. **触摸友好**: 确保所有交互元素至少有 44px 的触摸区域
3. **内容优先**: 移动端优先显示核心内容
4. **性能优先**: 优化移动端性能，减少不必要的动画

#### 9.2 开发建议

1. **使用 Hook**: 优先使用提供的移动端 Hook
2. **响应式类**: 使用 Tailwind 的响应式类
3. **测试**: 在不同设备和方向下测试
4. **性能**: 监控移动端性能指标

#### 9.3 测试清单

- [ ] 不同屏幕尺寸适配
- [ ] 横竖屏切换
- [ ] 触摸交互正常
- [ ] 键盘导航支持
- [ ] 屏幕阅读器兼容
- [ ] 性能表现良好
- [ ] 安全区域适配
- [ ] 高对比度模式

### 10. 故障排除

#### 10.1 常见问题

1. **iOS 输入框缩放**: 使用 `.mobile-input` 类
2. **触摸反馈异常**: 检查 `touch-action` 属性
3. **滚动卡顿**: 使用 `.mobile-scroll` 类
4. **安全区域问题**: 添加 `.mobile-safe-area` 类

#### 10.2 调试工具

- Chrome DevTools 设备模拟
- Safari Web Inspector
- React Developer Tools
- Lighthouse 移动端测试

## 更新日志

### v1.0.0
- 初始移动端适配实现
- 响应式布局支持
- 触摸优化
- 安全区域适配
- 移动端专用 Hook
- 样式系统完善
