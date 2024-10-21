import React from 'react';
import Fetch from '@kne/react-fetch';
import ScrollLoader from './ScrollLoader';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { isNotEmpty } from '@kne/is-empty';

const FetchScrollLoader = props => {
  const { dataFormat, mergeList, completeTips, api, searchProps, getSearchProps, children, ...others } = Object.assign(
    {},
    {
      api: {
        loader: () => {
          return {
            pageData: [],
            totalCount: 0
          };
        }
      },
      mergeList: (data, newData) => {
        return Object.assign({}, newData, {
          pageData: data.pageData.concat(newData.pageData)
        });
      },
      dataFormat: data => {
        return {
          list: data.pageData,
          total: data.totalCount
        };
      },
      children: props => {
        console.log(props);
        return null;
      }
    },
    props
  );

  const pagination = Object.assign(
    {},
    {
      paramsType: 'data',
      current: 'currentPage',
      pageSizeName: 'perPage',
      pageSize: 20
    },
    props.pagination
  );

  const computedSearchProps = searchProps => {
    if (getSearchProps && isNotEmpty(searchProps)) {
      const requestProps = getSearchProps(searchProps);
      return isNotEmpty(requestProps) ? { [pagination.paramsType]: requestProps } : {};
    }
    return {};
  };

  return (
    <Fetch
      {...Object.assign({}, api, computedSearchProps(searchProps))}
      render={fetchApi => {
        const formatData = dataFormat(fetchApi.data);
        const current = get(fetchApi.requestParams, [pagination.paramsType, pagination.current], 1),
          pageSize = get(fetchApi.requestParams, [pagination.paramsType, pagination.pageSizeName]) || pagination.pageSize;

        const noMore = !formatData.total || current * pageSize >= formatData.total;
        const onLoader = async () => {
          await fetchApi.loadMore(
            merge(
              {
                [pagination.paramsType]: {
                  [pagination.pageSizeName]: pageSize,
                  [pagination.current]: current + 1
                }
              },
              computedSearchProps(searchProps)
            ),
            mergeList
          );
        };

        return (
          <ScrollLoader {...others} completeTips={completeTips} isLoading={!fetchApi.isComplete} noMore={noMore} onLoader={onLoader}>
            {children({ fetchApi, list: formatData.list, data: fetchApi.data })}
          </ScrollLoader>
        );
      }}
    />
  );
};

export default FetchScrollLoader;
