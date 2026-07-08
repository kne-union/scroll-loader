### ScrollLoader

基础的滚动加载组件，通过 IntersectionObserver 监听底部哨兵元素，当哨兵进入视口时触发 `onLoader` 回调加载更多数据。支持 SimpleBar 自定义滚动容器和原生滚动两种模式。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| className | `string` | — | 自定义 CSS 类名，会添加到滚动容器上 |
| noMore | `boolean` | — | 是否已无更多数据，设为 `true` 后停止触发加载 |
| onLoader | `() => Promise<void>` | — | 触发加载的回调函数，支持异步操作 |
| isLoading | `boolean` | — | 是否正在加载中，加载中时显示 Spin 且不重复触发 |
| completeTips | `string` | `"已加载全部数据"` | 全部数据加载完毕后的提示文案 |
| maxFullCount | `number` | `3` | 内容不足以产生滚动条时，自动加载的最大次数 |
| useSimpleBar | `boolean` | `true` | 是否使用 SimpleBar 作为滚动容器；`false` 则使用原生 div 滚动 |
| children | `ReactNode` | — | 列表内容，通常为数据渲染结果 |

---

### FetchScrollLoader

集成了 `@kne/react-fetch` 数据获取能力的滚动加载组件，封装了分页逻辑，通过配置即可实现滚动分页加载，无需手动管理 Fetch 和分页状态。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| api | `object` | `{ loader: () => ({ pageData: [], totalCount: 0 }) }` | 数据请求配置，`loader` 函数接收请求参数，返回 `{ pageData, totalCount }` |
| dataFormat | `(data) => ({ list, total })` | `data => ({ list: data.pageData, total: data.totalCount })` | 将接口返回数据格式化为 `{ list, total }` 结构 |
| mergeList | `(data, newData) => newData` | 按 `pageData` 拼接合并 | 新旧数据合并策略，默认将 `pageData` 数组拼接 |
| searchProps | `object` | — | 传递给接口的搜索条件，变化时重新请求第一页 |
| getSearchProps | `(searchProps) => object` | — | 将 `searchProps` 转换为实际请求参数，返回空对象时不发起请求 |
| children | `({ fetchApi, list, data }) => ReactNode` | — | 列表渲染函数，`list` 为格式化后的列表数据 |
| render | `({ fetchApi, children }) => ReactNode` | `({ children }) => children` | 外层渲染插槽，可在 ScrollLoader 外部包裹额外 UI |
| pagination | `object` | 见下方子属性 | 分页参数配置 |
| loading | `ReactNode` | — | 自定义加载中展示 |
| error | `ReactNode` | — | 自定义错误状态展示 |

另外还支持透传 `ScrollLoader` 的所有属性（如 `className`、`completeTips`、`maxFullCount`、`useSimpleBar` 等）。

#### pagination 子属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| paramsType | `string` | `'data'` | 分页参数在请求对象中的键名 |
| current | `string` | `'currentPage'` | 当前页码的字段名 |
| pageSizeName | `string` | `'perPage'` | 每页条数的字段名 |
| pageSize | `number` | `20` | 每页数据条数 |
