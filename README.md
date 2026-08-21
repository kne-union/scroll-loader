# scroll-loader

### 描述

滚动加载下一页数据.

### 安装

```shell
npm i --save @kne/scroll-loader
```

### 概述

# ScrollLoader

基于 IntersectionObserver 的 React 滚动加载组件库，当用户滚动到列表底部时自动加载更多数据，实现无限滚动体验。

### 核心特性

- **两种加载模式**：`ScrollLoader` 提供基础滚动监听能力，需配合 `@kne/react-fetch` 手动管理分页；`FetchScrollLoader` 内置数据获取与分页逻辑，开箱即用
- **智能哨兵检测**：使用 IntersectionObserver 监听底部元素，内容不足一屏时自动补加载，直到填满可视区域
- **双滚动方案**：默认集成 SimpleBar 美化滚动条，也支持原生 div 滚动
- **国际化内置**：自带中英文支持，加载完成提示自动适配语言
- **灵活的分页配置**：支持自定义分页参数字段名、每页条数、数据合并策略
- **搜索联动**：`FetchScrollLoader` 支持 `searchProps` 变化时自动重置并重新加载


### 示例

#### 示例样式

```scss
@use '@kne/responsive-utils/scss' as responsive;

.scroll-list {
  @include responsive.up(md) {
    max-height: 500px;
  }
}
```

#### 示例代码

- ScrollLoader
- 基础滚动加载组件，结合 Fetch 手动管理分页逻辑；移动端自动使用视口滚动，桌面端使用 SimpleBar 容器滚动
- _ScrollLoader(@kne/current-lib_scroll-loader)[import * as _ScrollLoader from "@kne/scroll-loader"],(@kne/current-lib_scroll-loader/dist/index.css),_reactFetch(@kne/react-fetch),lodash(lodash),antd(antd),_ResponsiveUtils(@kne/responsive-utils)[import * as _ResponsiveUtils from "@kne/responsive-utils"]

```jsx
const { get, merge, range } = lodash;
const { default: Fetch } = _reactFetch;
const { default: ScrollLoader } = _ScrollLoader;
const { useIsMobile } = _ResponsiveUtils;
const { Flex, Switch, Typography, Divider, Tag } = antd;
const { useState } = React;

const { Text } = Typography;

// 模拟商品列表数据
const mockProductList = ({ currentPage = 1, perPage = 20 }) => {
  return new Promise((resolve) => {
    const start = (currentPage - 1) * perPage;
    setTimeout(() => {
      resolve({
        totalCount: 75,
        pageData: range(start, Math.min(start + perPage, 75)).map((key) => ({
          id: key + 1,
          name: &#96;商品名称 ${key + 1}&#96;,
          price: (Math.random() * 1000 + 10).toFixed(2),
          category: ['电子产品', '服装', '食品', '家居'][key % 4],
          stock: Math.floor(Math.random() * 500),
          status: key % 3 === 0 ? '缺货' : '在售'
        }))
      });
    }, 800);
  });
};

const BaseExample = () => {
  const isMobile = useIsMobile();
  const useSimpleBar = !isMobile;
  const [customTips, setCustomTips] = useState(false);

  return (
    <Flex vertical gap={16}>
      <Flex gap={16} align="center" style={{ padding: '0 8px' }} wrap="wrap">
        <Text strong>配置项：</Text>
        <Tag color={isMobile ? 'orange' : 'blue'}>
          {isMobile ? '移动端：视口滚动' : '桌面端：SimpleBar 容器滚动'}
        </Tag>
        <Flex align="center" gap={8}>
          <Text type="secondary">自定义完成提示</Text>
          <Switch checked={customTips} onChange={setCustomTips} />
        </Flex>
      </Flex>

      <Divider style={{ margin: 0 }} />

      <Fetch
        loader={({ data }) => {
          return mockProductList(Object.assign({ currentPage: 1, perPage: 20 }, data));
        }}
        render={(fetchApi) => {
          const pagination = {
            paramsType: 'data',
            current: 'currentPage',
            pageSize: 'perPage',
            defaultPageSize: 20
          };
          const current = get(fetchApi.requestParams, [pagination.paramsType, pagination.current], 1);
          const pageSize =
            get(fetchApi.requestParams, [pagination.paramsType, pagination.pageSize]) ||
            pagination.defaultPageSize;

          const formatData = {
            list: fetchApi.data.pageData,
            total: fetchApi.data.totalCount
          };

          return (
            <ScrollLoader
              className="scroll-list"
              isLoading={!fetchApi.isComplete}
              noMore={!formatData.total || current * pageSize >= formatData.total}
              completeTips={customTips ? '— 已展示全部商品 —' : undefined}
              maxFullCount={3}
              useSimpleBar={useSimpleBar}
              onLoader={async () => {
                await fetchApi.loadMore(
                  merge({
                    data: {
                      [pagination.pageSize]: pageSize,
                      [pagination.current]: current + 1
                    }
                  }),
                  (data, newData) => {
                    return Object.assign({}, newData, {
                      pageData: data.pageData.concat(newData.pageData)
                    });
                  }
                );
              }}
            >
              <Flex vertical gap={8}>
                {formatData.list.map((item) => (
                  <Flex
                    key={item.id}
                    justify="space-between"
                    align="center"
                    style={{
                      padding: '12px 16px',
                      background: '#fafafa',
                      borderRadius: 8,
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <Flex vertical gap={4}>
                      <Text strong>{item.name}</Text>
                      <Flex gap={8}>
                        <Tag color="blue">{item.category}</Tag>
                        <Text type="secondary">库存：{item.stock}</Text>
                      </Flex>
                    </Flex>
                    <Flex align="center" gap={12}>
                      <Tag color={item.status === '在售' ? 'green' : 'red'}>{item.status}</Tag>
                      <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                        ¥{item.price}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </ScrollLoader>
          );
        }}
      />
    </Flex>
  );
};

render(<BaseExample />);

```

- FetchScrollLoader
- 集成数据获取的滚动加载组件，支持搜索过滤、自定义分页；移动端自动使用视口滚动加载
- _ScrollLoader(@kne/current-lib_scroll-loader)[import * as _ScrollLoader from "@kne/scroll-loader"],(@kne/current-lib_scroll-loader/dist/index.css),antd(antd),_ResponsiveUtils(@kne/responsive-utils)[import * as _ResponsiveUtils from "@kne/responsive-utils"]

```jsx
const { FetchScrollLoader } = _ScrollLoader;
const { useIsMobile } = _ResponsiveUtils;
const { Flex, Typography, Divider, Tag, Input, Select } = antd;
const { useState, useCallback } = React;

const { Text, Title } = Typography;

// 模拟用户列表接口
const mockUserList = ({ data = {} }) => {
  const { currentPage = 1, perPage = 20, keyword, role } = data;
  return new Promise((resolve) => {
    const roles = ['管理员', '编辑', '普通用户'];
    const allUsers = Array.from({ length: 86 }, (_, i) => ({
      id: i + 1,
      name: &#96;用户_${String(i + 1).padStart(3, '0')}&#96;,
      email: &#96;user${i + 1}@example.com&#96;,
      role: roles[i % 3],
      department: ['技术部', '产品部', '设计部', '运营部'][i % 4],
      createTime: &#96;2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}&#96;
    }));

    let filtered = allUsers;
    if (keyword) {
      filtered = filtered.filter(
        (u) => u.name.includes(keyword) || u.email.includes(keyword)
      );
    }
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    const start = (currentPage - 1) * perPage;
    const pageData = filtered.slice(start, start + perPage);

    setTimeout(() => {
      resolve({
        totalCount: filtered.length,
        pageData
      });
    }, 600);
  });
};

const BaseExample = () => {
  const isMobile = useIsMobile();
  const useSimpleBar = !isMobile;
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState(undefined);

  const handleSearch = useCallback((value) => {
    setKeyword(value);
  }, []);

  return (
    <Flex vertical gap={16}>
      {/* 搜索区域 */}
      <Flex gap={12} align="center" style={{ padding: '0 8px' }} wrap="wrap">
        <Text strong>搜索条件：</Text>
        <Tag color={isMobile ? 'orange' : 'blue'}>
          {isMobile ? '移动端：视口滚动' : '桌面端：SimpleBar 容器滚动'}
        </Tag>
        <Input.Search
          placeholder="搜索用户名或邮箱"
          allowClear
          onSearch={handleSearch}
          style={{ width: 260 }}
        />
        <Select
          placeholder="按角色筛选"
          allowClear
          value={role}
          onChange={setRole}
          style={{ width: 140 }}
          options={[
            { label: '管理员', value: '管理员' },
            { label: '编辑', value: '编辑' },
            { label: '普通用户', value: '普通用户' }
          ]}
        />
      </Flex>

      <Divider style={{ margin: 0 }} />

      {/* 列表区域 */}
      <FetchScrollLoader
        className="scroll-list"
        useSimpleBar={useSimpleBar}
        api={{
          loader: mockUserList
        }}
        searchProps={{ keyword, role }}
        getSearchProps={(props) => {
          const result = {};
          if (props.keyword) result.keyword = props.keyword;
          if (props.role) result.role = props.role;
          return result;
        }}
        pagination={{
          paramsType: 'data',
          current: 'currentPage',
          pageSizeName: 'perPage',
          pageSize: 15
        }}
        maxFullCount={2}
        completeTips="— 已加载全部用户 —"
        render={({ fetchApi, children }) => {
          return (
            <Flex vertical gap={8}>
              <Flex justify="space-between" align="center" style={{ padding: '0 4px' }}>
                <Text type="secondary">
                  共 {fetchApi.data.totalCount} 条记录
                </Text>
                <Text type="secondary">
                  当前 {fetchApi.data.pageData.length} 条
                </Text>
              </Flex>
              {children}
            </Flex>
          );
        }}
      >
        {({ list }) => {
          if (!list || list.length === 0) {
            return (
              <Flex justify="center" style={{ padding: 40 }}>
                <Text type="secondary">暂无数据</Text>
              </Flex>
            );
          }
          return (
            <Flex vertical gap={8}>
              {list.map((item) => (
                <Flex
                  key={item.id}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <Flex vertical gap={4}>
                    <Flex align="center" gap={8}>
                      <Text strong>{item.name}</Text>
                      <Tag
                        color={
                          item.role === '管理员'
                            ? 'red'
                            : item.role === '编辑'
                              ? 'blue'
                              : 'default'
                        }
                      >
                        {item.role}
                      </Tag>
                    </Flex>
                    <Flex gap={16}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.email}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.department}
                      </Text>
                    </Flex>
                  </Flex>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    创建于 {item.createTime}
                  </Text>
                </Flex>
              ))}
            </Flex>
          );
        }}
      </FetchScrollLoader>
    </Flex>
  );
};

render(<BaseExample />);

```

### API

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
| maxFullCount | `number` | `3` | 内容不足以产生滚动条时，自动补载的最大次数；仍填不满则放弃补载。有滚动条后的正常下拉加载不受此限制，直到 `noMore`（如 totalCount 加载完） |
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
