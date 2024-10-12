import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Space, Spin } from 'antd';
import SimpleBar from 'simplebar-react';
import style from './style.module.scss';
import 'simplebar-react/dist/simplebar.min.css';
import { useThrottledCallback } from 'use-debounce';
import useRefCallback from '@kne/use-ref-callback';
import classnames from 'classnames';

const FullDataInList = ({ getScrollerRef, loadMore, maxFullCount }) => {
  const loaderHandler = useRefCallback(loadMore);
  const getScroller = useRefCallback(getScrollerRef);
  useEffect(() => {
    let maxCount = maxFullCount;
    const scroller = getScroller();
    const loadMore = async () => {
      if (scroller.clientHeight === scroller.scrollHeight && maxCount > 0) {
        await loaderHandler().then(() => {
          return new Promise(resolve => {
            setTimeout(resolve, 500);
          });
        });
        maxCount--;
        await loadMore();
      }
    };
    loadMore();
  }, [maxFullCount, loaderHandler, getScroller]);
  return null;
};

const ScrollLoader = forwardRef((props, ref) => {
  const locale = Object.assign(
    {},
    {
      loadComplete: '加载完成'
    },
    props.locale
  );
  const { className, noMore, onLoader, isLoading, completeTips, maxFullCount, children } = Object.assign(
    {},
    {
      maxFullCount: 3,
      completeTips: locale.loadComplete
    },
    props,
    { locale }
  );
  const scrollerRef = useRef();
  const onLoaderHandler = useRefCallback(onLoader);
  const canLoadRef = useRef(!noMore && !isLoading);
  canLoadRef.current = !noMore && !isLoading;

  useImperativeHandle(ref, () => {
    return scrollerRef.current;
  }, []);
  const scrollHandler = useThrottledCallback(e => {
    const el = e.target;
    if (canLoadRef.current && el.clientHeight + el.scrollTop + 20 > el.scrollHeight) {
      onLoaderHandler();
    }
  }, 100);

  return (
    <SimpleBar
      className={classnames('load-container', className)}
      scrollableNodeProps={{
        ref: scrollerRef,
        onScroll: scrollHandler
      }}
    >
      {!isLoading && !noMore && <FullDataInList maxFullCount={maxFullCount} getScrollerRef={() => scrollerRef.current} loadMore={onLoaderHandler} />}
      <Space direction="vertical">
        <div>{children}</div>
        {isLoading ? (
          <div className={style['scroller-no-more']}>
            <Spin size="small" />
          </div>
        ) : null}
        {noMore && completeTips ? <div className={style['scroller-no-more']}>{completeTips}</div> : null}
      </Space>
    </SimpleBar>
  );
});

export default ScrollLoader;
