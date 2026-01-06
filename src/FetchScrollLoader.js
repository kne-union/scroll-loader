import React, { forwardRef } from 'react';
import Fetch from '@kne/react-fetch';
import ScrollLoader from './ScrollLoader';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { isNotEmpty } from '@kne/is-empty';

const FetchScrollLoader = forwardRef((props, ref) => {
  const {
    dataFormat, mergeList, api, searchProps, getSearchProps, children, render, loading, error, ...others
  } = Object.assign({}, {
    api: {
      loader: () => {
        return {
          pageData: [], totalCount: 0
        };
      }
    }, mergeList: (data, newData) => {
      return Object.assign({}, newData, {
        pageData: data.pageData.concat(newData.pageData)
      });
    }, dataFormat: data => {
      return {
        list: data.pageData, total: data.totalCount
      };
    }, children: props => {
      console.log(props);
      return null;
    }, render: ({ fetchApi, children }) => {
      return children;
    }
  }, props);

  const pagination = Object.assign({}, {
    paramsType: 'data', current: 'currentPage', pageSizeName: 'perPage', pageSize: 20
  }, props.pagination);

  const computedSearchProps = searchProps => {
    if (getSearchProps && isNotEmpty(searchProps)) {
      const requestProps = getSearchProps(searchProps);
      return isNotEmpty(requestProps) ? { [pagination.paramsType]: requestProps } : {};
    }
    return {};
  };

  return (<Fetch
    {...merge({}, api, computedSearchProps(searchProps))}
    loading={loading}
    error={error}
    render={fetchApi => {
      const formatData = dataFormat(fetchApi.data);
      const current = get(fetchApi.requestParams, [pagination.paramsType, pagination.current], 1),
        pageSize = get(fetchApi.requestParams, [pagination.paramsType, pagination.pageSizeName]) || pagination.pageSize;

      const noMore = !formatData.total || current * pageSize >= formatData.total;
      const onLoader = async () => {
        await fetchApi.loadMore(merge({}, computedSearchProps(searchProps), {
          [pagination.paramsType]: {
            [pagination.pageSizeName]: pageSize, [pagination.current]: current + 1
          }
        }), mergeList);
      };

      return render({
        fetchApi,
        children: (<ScrollLoader {...others} isLoading={!fetchApi.isComplete} noMore={noMore} onLoader={onLoader}>
          {children({ fetchApi, list: formatData.list, data: fetchApi.data })}
        </ScrollLoader>)
      });
    }}
    ref={ref}
  />);
});

export default FetchScrollLoader;
