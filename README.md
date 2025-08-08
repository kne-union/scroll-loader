
# scroll-loader


### 描述

滚动加载下一页数据.


### 安装

```shell
npm i --save @kne/scroll-loader
```


### 概述

一个用于实现滚动加载功能的React组件库。当用户滚动到页面底部时，自动加载更多数据，提供无限滚动的用户体验。

#### 特点

- 支持自定义加载状态和无更多数据状态的显示
- 提供基础的`ScrollLoader`组件和集成了数据获取功能的`FetchScrollLoader`组件
- 支持国际化，内置中文和英文支持
- 使用简单，配置灵活


### 示例


#### 示例样式

```scss
.scroll-list {
  max-height: 300px;
}
```

#### 示例代码

- ScrollLoader
- 滚动到底后自动加载下一页数据
- _ScrollLoader(@kne/current-lib_scroll-loader)[import * as _ScrollLoader from "@kne/scroll-loader"],(@kne/current-lib_scroll-loader/dist/index.css),_reactFetch(@kne/react-fetch),lodash(lodash)

```jsx
const { get, merge, range } = lodash;
const { default: Fetch } = _reactFetch;
const { default: ScrollLoader } = _ScrollLoader;

const BaseExample = () => {
  return (<Fetch
    loader={({ data }) => {
      const params = Object.assign({
        perPage: 20, currentPage: 1
      }, data);
      return new Promise((resolve) => {
        const start = (params.currentPage - 1) * params.perPage;
        setTimeout(() => {
          resolve({
            totalCount: 100, pageData: range(start, start + params.perPage).map((key) => {
              return {
                label: `第${key + 1}项`, value: key + 1
              };
            })
          });
        }, 500);
      });
    }}
    render={(fetchApi) => {
      const pagination = {
        paramsType: 'data', current: 'currentPage', pageSize: 'perPage', defaultPageSize: 20
      };
      const current = get(fetchApi.requestParams, [pagination.paramsType, pagination.current], 1),
        pageSize = get(fetchApi.requestParams, [pagination.paramsType, pagination.pageSize]) || pagination.defaultPageSize;

      const formatData = {
        list: fetchApi.data.pageData, total: fetchApi.data.totalCount
      };
      return (<ScrollLoader
        className="scroll-list"
        isLoading={!fetchApi.isComplete}
        noMore={!formatData.total || current * pageSize >= formatData.total}
        onLoader={async () => {
          await fetchApi.loadMore(merge({
            data: {
              [pagination.pageSize]: pageSize, [pagination.current]: current + 1
            }
          }), (data, newData) => {
            return Object.assign({}, newData, {
              pageData: data.pageData.concat(newData.pageData)
            });
          });
        }}
      >
        {formatData.list.map((item) => {
          return <div key={item.value}>{item.label}</div>;
        })}
      </ScrollLoader>);
    }}
  />);
};

render(<BaseExample />);

```

- FetchScrollLoader
- 封装了数据获取
- _ScrollLoader(@kne/current-lib_scroll-loader)[import * as _ScrollLoader from "@kne/scroll-loader"],(@kne/current-lib_scroll-loader/dist/index.css),lodash(lodash)

```jsx
const { get, merge, range } = lodash;
const { FetchScrollLoader } = _ScrollLoader;

const BaseExample = () => {
  return <FetchScrollLoader className="scroll-list" api={{
    loader: ({ data }) => {
      const params = Object.assign({
        perPage: 20, currentPage: 1
      }, data);
      return new Promise((resolve) => {
        const start = (params.currentPage - 1) * params.perPage;
        setTimeout(() => {
          resolve({
            totalCount: 100, pageData: range(start, start + params.perPage).map((key) => {
              return {
                label: `第${key + 1}项`, value: key + 1
              };
            })
          });
        }, 500);
      });
    }
  }}>{({ list }) => {
    return list.map((item) => {
      return <div key={item.value}>{item.label}</div>;
    });
  }}</FetchScrollLoader>;
};

render(<BaseExample />);

```


### API

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

