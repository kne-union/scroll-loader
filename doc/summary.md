# ScrollLoader

基于 IntersectionObserver 的 React 滚动加载组件库，当用户滚动到列表底部时自动加载更多数据，实现无限滚动体验。

### 核心特性

- **两种加载模式**：`ScrollLoader` 提供基础滚动监听能力，需配合 `@kne/react-fetch` 手动管理分页；`FetchScrollLoader` 内置数据获取与分页逻辑，开箱即用
- **智能哨兵检测**：使用 IntersectionObserver 监听底部元素，内容不足一屏时自动补加载，直到填满可视区域
- **双滚动方案**：默认集成 SimpleBar 美化滚动条，也支持原生 div 滚动
- **国际化内置**：自带中英文支持，加载完成提示自动适配语言
- **灵活的分页配置**：支持自定义分页参数字段名、每页条数、数据合并策略
- **搜索联动**：`FetchScrollLoader` 支持 `searchProps` 变化时自动重置并重新加载
