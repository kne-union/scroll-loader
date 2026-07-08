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
      name: `用户_${String(i + 1).padStart(3, '0')}`,
      email: `user${i + 1}@example.com`,
      role: roles[i % 3],
      department: ['技术部', '产品部', '设计部', '运营部'][i % 4],
      createTime: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`
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
