#### ScrollLoader

基础的滚动加载组件，当用户滚动到页面底部时触发加载更多数据的回调函数。

##### 属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| className | string | - | 自定义类名 |
| noMore | boolean | - | 是否没有更多数据，为true时不再触发加载 |
| onLoader | function | - | 加载更多数据的回调函数 |
| isLoading | boolean | - | 是否正在加载数据 |
| completeTips | string | "已加载全部数据" | 加载完成的提示文本 |
| maxFullCount | number | 3 | 当内容不足以滚动时，自动触发加载的最大次数 |
| children | ReactNode | - | 子元素，通常是数据列表 |

#### FetchScrollLoader

集成了数据获取功能的滚动加载组件，简化了`ScrollLoader`和`Fetch`组件的组合使用。

##### 属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| api | object | { loader: () => ({ pageData: [], totalCount: 0 }) } | 数据获取API配置，必须包含loader函数 |
| dataFormat | function | (data) => ({ list: data.pageData, total: data.totalCount }) | 数据格式化函数，将API返回的数据转换为组件需要的格式 |
| mergeList | function | (data, newData) => ({ ...newData, pageData: data.pageData.concat(newData.pageData) }) | 合并列表数据的函数，用于将新加载的数据与现有数据合并 |
| searchProps | object | - | 搜索参数，会传递给API |
| getSearchProps | function | - | 获取搜索参数的函数，接收searchProps作为参数，返回请求参数 |
| children | function | - | 渲染函数，接收{ fetchApi, list, data }作为参数，返回ReactNode |
| render | function | ({ fetchApi, children }) => children | 自定义渲染函数，可用于在ScrollLoader外层添加额外的UI元素 |
| pagination | object | { paramsType: 'data', current: 'currentPage', pageSizeName: 'perPage', pageSize: 20 } | 分页配置 |

###### pagination属性详解

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| paramsType | string | 'data' | 分页参数在请求参数中的位置 |
| current | string | 'currentPage' | 当前页码的参数名 |
| pageSizeName | string | 'perPage' | 每页条数的参数名 |
| pageSize | number | 20 | 每页条数 |
