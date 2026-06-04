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
import { CATEGORIES, EXAMPLE_TRIAGE, EXAMPLES, getVisibleExamples } from './examples/catalog';
import { ExampleIndexPage } from './shell/ExampleIndexPage';
import { ExampleNotFoundPage } from './shell/ExampleNotFoundPage';
import { getExampleRoute, toExamplePath } from './shell/example-route';
import { PlaygroundPage } from './shell/PlaygroundPage';

/** pixi-demo color mode 저장 key */
const COLOR_MODE_STORAGE_KEY = 'vectra.pixi-demo.colorMode';

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
  const [showAdvancedExamples, setShowAdvancedExamples] = useState<boolean>(false);
  const pathnameRef = useRef<string>(pathname);
  const isPlaygroundDirtyRef = useRef<boolean>(isPlaygroundDirty);
  const route = useMemo(() => getExampleRoute(pathname, EXAMPLES), [pathname]);
  const selectedRouteExample = route.kind === 'example' ? route.example : undefined;
  const visibleExamples = useMemo(
    () => getVisibleExamples(showAdvancedExamples, selectedRouteExample),
    [showAdvancedExamples, selectedRouteExample]
  );

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

  const handleToggleAdvancedExamples = useCallback((): void => {
    setShowAdvancedExamples((prev) => !prev);
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
        <ExampleIndexPage
          categories={CATEGORIES}
          examples={visibleExamples}
          exampleTriage={EXAMPLE_TRIAGE}
          onSelectExample={handleSelectExample}
          showAdvancedExamples={showAdvancedExamples}
          onToggleAdvancedExamples={handleToggleAdvancedExamples}
        />
      )}
      {route.kind === 'example' && (
        <PlaygroundPage
          selectedExample={route.example}
          categories={CATEGORIES}
          examples={visibleExamples}
          onSelectExample={handleSelectExample}
          onOpenIndex={handleOpenIndex}
          onDirtyChange={handlePlaygroundDirtyChange}
          colorMode={colorMode}
          onToggleColorMode={handleToggleColorMode}
          menuAction={
            <AdvancedExamplesToggle
              showAdvancedExamples={showAdvancedExamples}
              onToggleAdvancedExamples={handleToggleAdvancedExamples}
            />
          }
          renderExampleMeta={(example) => <ExampleTriageBadge triage={EXAMPLE_TRIAGE[example.id]} />}
        />
      )}
      {route.kind === 'not-found' && (
        <ExampleNotFoundPage requestedId={route.requestedId} onOpenIndex={handleOpenIndex} />
      )}
    </Fragment>
  );
}

function AdvancedExamplesToggle({
  showAdvancedExamples,
  onToggleAdvancedExamples,
}: {
  showAdvancedExamples: boolean;
  onToggleAdvancedExamples: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={showAdvancedExamples}
      onClick={onToggleAdvancedExamples}
      title="Include merged and API recipe examples"
      style={{
        width: '100%',
        padding: '8px 10px',
        border: showAdvancedExamples ? '1px solid #67e8f9' : '1px solid #334155',
        borderRadius: 6,
        background: showAdvancedExamples ? '#164e63' : '#0f172a',
        color: '#e5e7eb',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 800,
        textAlign: 'left',
      }}
    >
      Advanced
    </button>
  );
}

function ExampleTriageBadge({ triage }: { triage: string | undefined }): ReactElement | null {
  if (!triage || triage === 'keep') return null;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 5px',
        border: '1px solid #475569',
        borderRadius: 999,
        color: triage === 'merge' ? '#bae6fd' : '#fef3c7',
        fontSize: 10,
        fontWeight: 800,
        lineHeight: 1.4,
        textTransform: 'uppercase',
      }}
    >
      {triage}
    </span>
  );
}
