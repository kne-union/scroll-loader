
# scroll-loader


### 描述

滚动加载下一页数据


### 安装

```shell
npm i --save @kne/scroll-loader
```

### 示例


#### 示例样式

```scss
.scroll-list {
  max-height: 300px;
}
```

#### 示例代码

- scroll-loader
- 滚动到底后自动加载下一页数据
- _ScrollLoader(@kne/current-lib_scroll-loader)[import * as _ScrollLoader from "@kne/scroll-loader"],_reactFetch(@kne/react-fetch),lodash(lodash)

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
        completeTips=""
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


### API

| 属性名 | 说明 | 类型 | 默认值 |
|-----|----|----|-----|
|     |    |    |     |

