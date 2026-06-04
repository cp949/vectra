import type { PlaygroundColorMode, PlaygroundRuntimeAdapter } from '@repo/playground';
import { findExampleById, PlaygroundShell, readStoredColorMode, writeStoredColorMode } from '@repo/playground';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, EXAMPLES } from './examples/catalog';
import { LandingPage } from './LandingPage';
import type { ShowcaseRuntimeSeed } from './pixi/api';
import { exampleIdFromPathname, examplePath, shouldShowLanding } from './routing';
import { createPixiRunnerHtml, SHOWCASE_ALLOWED_SPECIFIERS } from './sandbox/pixi-runner-html';

const COLOR_MODE_KEY = 'vectra.showcase.colorMode';

function getColorModeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function readInitialColorMode(): PlaygroundColorMode {
  const storage = getColorModeStorage();
  return storage ? (readStoredColorMode(storage, COLOR_MODE_KEY) ?? 'dark') : 'dark';
}

const DEFAULT_RUNTIME_SEED: ShowcaseRuntimeSeed = { randomSeed: 20260523 };

const RUNTIME_ADAPTER: PlaygroundRuntimeAdapter<ShowcaseRuntimeSeed> = {
  allowedSpecifiers: SHOWCASE_ALLOWED_SPECIFIERS,
  defaultRuntimeSeed: DEFAULT_RUNTIME_SEED,
  createRunnerHtml: createPixiRunnerHtml,
};

export function App(): ReactElement {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [colorMode, setColorMode] = useState<PlaygroundColorMode>(readInitialColorMode);
  const selectedId = shouldShowLanding(pathname) ? undefined : exampleIdFromPathname(pathname);
  const selectedExample = useMemo(() => (selectedId ? findExampleById(EXAMPLES, selectedId) : undefined), [selectedId]);

  useEffect(() => {
    const onPopState = (): void => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToPath = (nextPathname: string): void => {
    window.history.pushState({}, '', nextPathname);
    setPathname(window.location.pathname);
  };

  if (!selectedExample) {
    return (
      <LandingPage
        categories={CATEGORIES}
        examples={EXAMPLES}
        onSelectExample={(id) => navigateToPath(examplePath(id))}
      />
    );
  }

  return (
    <PlaygroundShell
      selectedExample={selectedExample}
      categories={CATEGORIES}
      examples={EXAMPLES}
      runtimeAdapter={RUNTIME_ADAPTER}
      colorMode={colorMode}
      onToggleColorMode={() => {
        const next = colorMode === 'dark' ? 'light' : 'dark';
        setColorMode(next);
        const storage = getColorModeStorage();
        if (storage) writeStoredColorMode(storage, COLOR_MODE_KEY, next);
      }}
      onSelectExample={(id) => navigateToPath(examplePath(id))}
      onOpenIndex={() => navigateToPath('/')}
    />
  );
}
