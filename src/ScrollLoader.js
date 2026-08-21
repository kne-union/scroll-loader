import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Space, Spin } from 'antd';
import SimpleBar from 'simplebar-react';
import style from './style.module.scss';
import useRefCallback from '@kne/use-ref-callback';
import classnames from 'classnames';
import { createWithIntlProvider, useIntl } from '@kne/react-intl';
import zhCn from './locale/zh-CN';
import 'simplebar-react/dist/simplebar.min.css';

const getViewportScrollElement = () => document.scrollingElement || document.documentElement;

const measureHasOverflow = root => {
  if (root) {
    return root.scrollHeight > root.clientHeight;
  }
  const el = getViewportScrollElement();
  return el.scrollHeight > window.innerHeight;
};

const isNearBottom = root => {
  if (root) {
    return root.clientHeight + root.scrollTop + 20 >= root.scrollHeight;
  }
  const el = getViewportScrollElement();
  return window.innerHeight + (window.scrollY || window.pageYOffset || 0) + 20 >= el.scrollHeight;
};

const LoadSentinel = ({ onLoad, getRoot, getDisabled, maxFullCount }) => {
  const sentinelRef = useRef();
  const onLoadHandler = useRefCallback(onLoad);
  const getRootFn = useRefCallback(getRoot);
  const getDisabledFn = useRefCallback(getDisabled);
  const autoLoadCountRef = useRef(0);
  const loadingLockRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const tryLoad = async () => {
      if (getDisabledFn() || loadingLockRef.current) {
        return false;
      }
      loadingLockRef.current = true;
      try {
        await onLoadHandler();
        return true;
      } finally {
        loadingLockRef.current = false;
      }
    };

    // 内容不足以产生滚动条时的自动补载：最多 maxFullCount 次，仍填不满则放弃补载
    const tryAutoFill = async () => {
      if (getDisabledFn() || loadingLockRef.current) {
        return;
      }
      const root = getRootFn();
      if (measureHasOverflow(root)) {
        autoLoadCountRef.current = 0;
        return;
      }
      if (autoLoadCountRef.current >= maxFullCount) {
        return;
      }
      const loaded = await tryLoad();
      if (loaded) {
        autoLoadCountRef.current += 1;
      }
    };

    // 正常下拉 / 滚到底：不受 maxFullCount 限制，一直加载到 noMore（totalCount）
    const tryScrollLoad = async () => {
      if (getDisabledFn() || loadingLockRef.current) {
        return;
      }
      const loaded = await tryLoad();
      if (loaded) {
        autoLoadCountRef.current = 0;
      }
    };

    const observerRoot = getRootFn();
    const observer = new IntersectionObserver(
      async entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting || getDisabledFn()) {
          return;
        }

        const root = getRootFn();
        if (measureHasOverflow(root)) {
          await tryScrollLoad();
        } else {
          await tryAutoFill();
        }
      },
      { root: observerRoot, rootMargin: '20px' }
    );

    observer.observe(sentinel);

    const onScroll = () => {
      if (getDisabledFn() || loadingLockRef.current) {
        return;
      }

      const root = getRootFn();
      if (root && measureHasOverflow(root)) {
        if (isNearBottom(root)) {
          tryScrollLoad();
        }
        return;
      }

      // 内部容器随内容撑开、无自身滚动条时，回退到页面滚动下拉加载
      if (measureHasOverflow(null) && isNearBottom(null)) {
        const rect = sentinel.getBoundingClientRect();
        if (rect.top < window.innerHeight + 20) {
          tryScrollLoad();
        }
      }
    };

    const scrollTarget = observerRoot || window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    if (observerRoot) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener('scroll', onScroll);
      if (observerRoot) {
        window.removeEventListener('scroll', onScroll);
      }
    };
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
