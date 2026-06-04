// 앱 루트 컴포넌트
// showcase shell layout + slug route 조합
import {
  getNextColorMode,
  type PlaygroundColorMode,
  type PlaygroundExampleId,
  readStoredColorMode,
  writeStoredColorMode,
} from '@repo/playground';
import type { ReactElement } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, EXAMPLES } from './examples/catalog';
import { ExampleIndexPage } from './shell/ExampleIndexPage';
import { ExampleNotFoundPage } from './shell/ExampleNotFoundPage';
import { getExampleRoute, toExamplePath } from './shell/example-route';
import { PlaygroundPage } from './shell/PlaygroundPage';

/** canvas-demo color mode 저장 key */
const COLOR_MODE_STORAGE_KEY = 'vectra.canvas-demo.colorMode';

/** 브라우저 storage 접근이 차단된 환경에서는 persistence만 비활성화한다 */
function getColorModeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** 저장된 color mode 또는 기본 light mode를 반환한다 */
function readInitialColorMode(): PlaygroundColorMode {
  const storage = getColorModeStorage();
  return storage ? (readStoredColorMode(storage, COLOR_MODE_STORAGE_KEY) ?? 'light') : 'light';
}

/**
 * 앱 루트 컴포넌트.
 *
 * React Router 없이 pathname state와 History API로 예제 slug route를 처리한다.
 */
export function App(): ReactElement {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);
  const [isPlaygroundDirty, setIsPlaygroundDirty] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<PlaygroundColorMode>(readInitialColorMode);
  const pathnameRef = useRef<string>(pathname);
  const isPlaygroundDirtyRef = useRef<boolean>(isPlaygroundDirty);
  const route = useMemo(() => getExampleRoute(pathname, EXAMPLES), [pathname]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    isPlaygroundDirtyRef.current = isPlaygroundDirty;
  }, [isPlaygroundDirty]);

  useEffect(() => {
    function handlePopState(): void {
      if (
        isPlaygroundDirtyRef.current &&
        !window.confirm('편집 중인 내용이 있습니다. 페이지를 이동하면 내용이 사라집니다. 계속하시겠습니까?')
      ) {
        window.history.pushState(null, '', pathnameRef.current);
        setPathname(pathnameRef.current);
        return;
      }
      setPathname(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (route.kind !== 'example') {
      setIsPlaygroundDirty(false);
    }
  }, [route.kind]);

  const handlePlaygroundDirtyChange = useCallback((isDirty: boolean): void => {
    setIsPlaygroundDirty(isDirty);
  }, []);

  const handleToggleColorMode = useCallback((): void => {
    setColorMode((prev) => {
      const next = getNextColorMode(prev);
      const storage = getColorModeStorage();
      if (storage) {
        writeStoredColorMode(storage, COLOR_MODE_STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  function handleSelectExample(id: PlaygroundExampleId): void {
    const path = toExamplePath(id);
    window.history.pushState(null, '', path);
    setPathname(window.location.pathname);
  }

  function handleOpenIndex(): void {
    window.history.pushState(null, '', '/');
    setPathname(window.location.pathname);
  }

  return (
    <Fragment>
      {route.kind === 'index' && (
        <ExampleIndexPage categories={CATEGORIES} examples={EXAMPLES} onSelectExample={handleSelectExample} />
      )}
      {route.kind === 'example' && (
        <PlaygroundPage
          selectedExample={route.example}
          categories={CATEGORIES}
          examples={EXAMPLES}
          onSelectExample={handleSelectExample}
          onOpenIndex={handleOpenIndex}
          onDirtyChange={handlePlaygroundDirtyChange}
          colorMode={colorMode}
          onToggleColorMode={handleToggleColorMode}
        />
      )}
      {route.kind === 'not-found' && (
        <ExampleNotFoundPage requestedId={route.requestedId} onOpenIndex={handleOpenIndex} />
      )}
    </Fragment>
  );
}
