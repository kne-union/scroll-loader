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
          name: `商品名称 ${key + 1}`,
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
