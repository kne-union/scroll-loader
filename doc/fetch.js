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
