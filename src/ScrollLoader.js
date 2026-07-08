import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Space, Spin } from 'antd';
import SimpleBar from 'simplebar-react';
import style from './style.module.scss';
import useRefCallback from '@kne/use-ref-callback';
import classnames from 'classnames';
import { createWithIntlProvider, useIntl } from '@kne/react-intl';
import zhCn from './locale/zh-CN';
import 'simplebar-react/dist/simplebar.min.css';

const LoadSentinel = ({ onLoad, getRoot, getDisabled, maxFullCount }) => {
  const sentinelRef = useRef();
  const onLoadHandler = useRefCallback(onLoad);
  const getRootFn = useRefCallback(getRoot);
  const getDisabledFn = useRefCallback(getDisabled);
  const autoLoadCountRef = useRef(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      async entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting || getDisabledFn()) {
          return;
        }

        const root = getRootFn();
        const isNotFilling = root ? root.clientHeight >= root.scrollHeight : true;

        if (isNotFilling && autoLoadCountRef.current >= maxFullCount) {
          return;
        }

        await onLoadHandler();

        if (isNotFilling) {
          autoLoadCountRef.current++;
        } else {
          autoLoadCountRef.current = 0;
        }
      },
      { root: getRootFn(), rootMargin: '20px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [maxFullCount, onLoadHandler, getRootFn, getDisabledFn]);

  return <div ref={sentinelRef} className={style['load-sentinel']} aria-hidden="true" />;
};

const ScrollLoader = createWithIntlProvider(
  'zh-CN',
  zhCn,
  'scroll-loader'
)(
  forwardRef((props, ref) => {
    const { formatMessage } = useIntl();
    const { className, noMore, onLoader, isLoading, completeTips, maxFullCount, useSimpleBar, children } = Object.assign(
      {},
      {
        maxFullCount: 3,
        useSimpleBar: true,
        completeTips: formatMessage({ id: 'loadComplete' })
      },
      props
    );
    const scrollerRef = useRef();
    const onLoaderHandler = useRefCallback(onLoader);
    const getDisabled = useRefCallback(() => noMore || isLoading);

    useImperativeHandle(ref, () => {
      return scrollerRef.current;
    }, []);

    const getRoot = () => (useSimpleBar ? scrollerRef.current : null);

    const content = (
      <Space direction="vertical">
        <div>{children}</div>
        {!noMore && <LoadSentinel onLoad={onLoaderHandler} getRoot={getRoot} getDisabled={getDisabled} maxFullCount={maxFullCount} />}
        {isLoading && !noMore ? (
          <div className={style['scroller-no-more']}>
            <Spin size="small" />
          </div>
        ) : null}
        {noMore && completeTips ? <div className={style['scroller-no-more']}>{completeTips}</div> : null}
      </Space>
    );

    if (useSimpleBar) {
      return (
        <SimpleBar
          className={classnames('load-container', className)}
          scrollableNodeProps={{
            ref: scrollerRef
          }}
        >
          {content}
        </SimpleBar>
      );
    }

    return (
      <div className={classnames('load-container', className)} ref={scrollerRef}>
        {content}
      </div>
    );
  })
);

export default ScrollLoader;
