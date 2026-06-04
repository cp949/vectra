import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LazyMonacoCodeEditor } from '../editor/LazyMonacoCodeEditor';
import { SandboxPreview } from '../sandbox/SandboxPreview';
import { AUTO_RUN_DEBOUNCE_MS, shouldScheduleAutoRun } from './auto-run';
import { ConsoleDock } from './ConsoleDock';
import { ExampleMenu } from './ExampleMenu';
import { ExampleSearchPopup } from './ExampleSearchPopup';
import { SplitWorkspace } from './SplitWorkspace';
import type { PlaygroundShellProps } from './types';
import { useSandboxRun } from './useSandboxRun';

const EXAMPLE_MENU_WIDTH = 260;

/** 예제 선택 변경 시에만 자동 실행한다 */
export function shouldAutoRunSelectedExample(previousExampleId: string, nextExampleId: string): boolean {
  return previousExampleId !== nextExampleId;
}

/** 예제 선택 effect에서 현재 예제를 실행할지 판단한다 */
export function shouldAutoRunSelectedExampleEffect(
  hasRunInitialExample: boolean,
  previousExampleId: string,
  nextExampleId: string
): boolean {
  return !hasRunInitialExample || shouldAutoRunSelectedExample(previousExampleId, nextExampleId);
}

/** console log가 새로 추가되면 dock을 펼친다 */
export function shouldOpenConsoleForLogCount(previousLogCount: number, nextLogCount: number): boolean {
  return nextLogCount > previousLogCount;
}

/** Monaco 기반 playground shell v2. example 선택, 실행, console dock을 통합 제공한다. */
export function PlaygroundShell<RuntimeSeed>({
  selectedExample,
  categories,
  examples,
  runtimeAdapter,
  colorMode,
  onToggleColorMode,
  onSelectExample,
  homeLabel = 'Vectra Showcase',
  onOpenIndex,
  onDirtyChange,
  showExampleDescriptions = false,
  showHeaderExampleTitle = false,
  menuAction,
  renderExampleMeta,
}: PlaygroundShellProps<RuntimeSeed>): ReactElement {
  const [code, setCode] = useState(selectedExample.source.code);
  const [isExampleMenuOpen, setIsExampleMenuOpen] = useState(true);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const initialCodeRef = useRef(selectedExample.source.code);
  const lastRunCodeRef = useRef(selectedExample.source.code);
  const suppressNextAutoRunRef = useRef(true);
  const selectedExampleIdRef = useRef(selectedExample.id);
  const hasRunInitialExampleRef = useRef(false);
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousConsoleLogCountRef = useRef(0);
  const run = useSandboxRun(runtimeAdapter);

  const clearAutoRunTimeout = useCallback((): void => {
    if (autoRunTimeoutRef.current !== null) {
      clearTimeout(autoRunTimeoutRef.current);
      autoRunTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearAutoRunTimeout();
    initialCodeRef.current = selectedExample.source.code;
    lastRunCodeRef.current = selectedExample.source.code;
    suppressNextAutoRunRef.current = true;
    setCode(selectedExample.source.code);

    if (
      shouldAutoRunSelectedExampleEffect(
        hasRunInitialExampleRef.current,
        selectedExampleIdRef.current,
        selectedExample.id
      )
    ) {
      hasRunInitialExampleRef.current = true;
      run.runCode(selectedExample.source.code, selectedExample.runtimeSeed ?? runtimeAdapter.defaultRuntimeSeed);
    }

    selectedExampleIdRef.current = selectedExample.id;
  }, [clearAutoRunTimeout, selectedExample, runtimeAdapter.defaultRuntimeSeed, run.runCode]);

  useEffect(() => {
    onDirtyChange?.(code !== initialCodeRef.current);
  }, [code, onDirtyChange]);

  useEffect(() => {
    const previousLogCount = previousConsoleLogCountRef.current;
    const nextLogCount = run.consoleLogs.length;
    previousConsoleLogCountRef.current = nextLogCount;

    if (shouldOpenConsoleForLogCount(previousLogCount, nextLogCount)) {
      setIsConsoleOpen(true);
    }
  }, [run.consoleLogs.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const runtimeSeed = selectedExample.runtimeSeed ?? runtimeAdapter.defaultRuntimeSeed;

  useEffect(() => {
    clearAutoRunTimeout();

    const suppressed = suppressNextAutoRunRef.current;
    suppressNextAutoRunRef.current = false;

    if (!shouldScheduleAutoRun({ codeChanged: code !== lastRunCodeRef.current, suppressed })) {
      return;
    }

    autoRunTimeoutRef.current = setTimeout(() => {
      autoRunTimeoutRef.current = null;
      lastRunCodeRef.current = code;
      run.runCode(code, runtimeSeed);
    }, AUTO_RUN_DEBOUNCE_MS);

    return clearAutoRunTimeout;
  }, [clearAutoRunTimeout, code, run.runCode, runtimeSeed]);

  const resetCode = (): void => {
    const nextCode = selectedExample.source.code;
    clearAutoRunTimeout();
    suppressNextAutoRunRef.current = true;
    lastRunCodeRef.current = nextCode;
    setCode(nextCode);
    run.runCode(nextCode, runtimeSeed);
  };

  const runCurrentCode = (): void => {
    clearAutoRunTimeout();
    lastRunCodeRef.current = code;
    run.runCode(code, runtimeSeed);
  };

  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: `${isExampleMenuOpen ? EXAMPLE_MENU_WIDTH : 0}px minmax(0, 1fr)`,
        height: '100vh',
        minHeight: 0,
        background: '#020617',
        color: '#e5e7eb',
      }}
    >
      <ExampleMenu
        categories={categories}
        examples={examples}
        selectedExampleId={selectedExample.id}
        onSelectExample={onSelectExample}
        homeLabel={homeLabel}
        onOpenHome={onOpenIndex}
        onOpenSearch={() => setIsSearchOpen(true)}
        showDescriptions={showExampleDescriptions}
        menuAction={menuAction}
        renderExampleMeta={renderExampleMeta}
        style={{
          width: EXAMPLE_MENU_WIDTH,
          boxSizing: 'border-box',
          overflow: isExampleMenuOpen ? 'auto' : 'hidden',
          visibility: isExampleMenuOpen ? 'visible' : 'hidden',
          padding: isExampleMenuOpen ? 12 : 0,
          borderRight: isExampleMenuOpen ? '1px solid #1e293b' : 0,
        }}
      />
      <section style={{ display: 'grid', gridTemplateRows: '52px 1fr', minHeight: 0 }}>
        <Box component="header" sx={headerSx}>
          <Tooltip title={isExampleMenuOpen ? 'Hide Menu' : 'Show Menu'}>
            <IconButton
              type="button"
              aria-label={isExampleMenuOpen ? 'Hide Menu' : 'Show Menu'}
              onClick={() => setIsExampleMenuOpen((value) => !value)}
              size="small"
              sx={toolButtonSx}
            >
              {isExampleMenuOpen ? (
                <ArrowBackRoundedIcon fontSize="small" />
              ) : (
                <ChevronRightRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          {showHeaderExampleTitle ? (
            <Box sx={titleGroupSx}>
              <Typography component="strong" sx={titleSx}>
                {selectedExample.title}
              </Typography>
              {showExampleDescriptions && selectedExample.description ? (
                <Typography component="span" sx={descriptionSx}>
                  {selectedExample.description}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          <Box sx={toolbarSx}>
            <Tooltip title="Run">
              <IconButton type="button" aria-label="Run" onClick={runCurrentCode} size="small" sx={runButtonSx}>
                <PlayArrowRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset">
              <IconButton type="button" aria-label="Reset" onClick={resetCode} size="small" sx={toolButtonSx}>
                <RestartAltRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isPreviewExpanded ? 'Show Code' : 'Expand Preview'}>
              <IconButton
                type="button"
                aria-label={isPreviewExpanded ? 'Show Code' : 'Expand Preview'}
                onClick={() => setIsPreviewExpanded((value) => !value)}
                size="small"
                sx={toolButtonSx}
              >
                {isPreviewExpanded ? <CodeRoundedIcon fontSize="small" /> : <OpenInFullRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={colorMode === 'dark' ? 'Light' : 'Dark'}>
              <IconButton
                type="button"
                aria-label={colorMode === 'dark' ? 'Light' : 'Dark'}
                onClick={onToggleColorMode}
                size="small"
                sx={toolButtonSx}
              >
                {colorMode === 'dark' ? (
                  <LightModeRoundedIcon fontSize="small" />
                ) : (
                  <DarkModeRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <SplitWorkspace
          isPreviewExpanded={isPreviewExpanded}
          editor={<LazyMonacoCodeEditor value={code} onChange={setCode} colorMode={colorMode} />}
          preview={
            <SandboxPreview
              key={run.runId}
              srcdoc={run.srcdoc}
              pendingMessage={run.pendingMessage}
              onMessage={run.handleSandboxMessage}
            />
          }
          consoleDock={
            <ConsoleDock
              logs={run.consoleLogs}
              isOpen={isConsoleOpen}
              onOpen={() => setIsConsoleOpen(true)}
              onClose={() => setIsConsoleOpen(false)}
              onClear={run.clearConsole}
            />
          }
        />
      </section>
      <ExampleSearchPopup
        open={isSearchOpen}
        examples={examples}
        categories={categories}
        selectedExampleId={selectedExample.id}
        onSelectExample={onSelectExample}
        onClose={() => setIsSearchOpen(false)}
        renderExampleMeta={renderExampleMeta}
      />
    </main>
  );
}

const headerSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  minWidth: 0,
  px: 1.5,
  borderBottom: '1px solid #1e293b',
  background: '#08111f',
};

const titleGroupSx = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 1.25,
  minWidth: 0,
  overflow: 'hidden',
};

const titleSx = {
  minWidth: 0,
  overflow: 'hidden',
  color: '#f8fafc',
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: 0,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const descriptionSx = {
  minWidth: 0,
  overflow: 'hidden',
  color: '#94a3b8',
  fontSize: 12,
  letterSpacing: 0,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const toolbarSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  ml: 'auto',
};

const toolButtonSx = {
  width: 34,
  height: 34,
  border: '1px solid #334155',
  borderRadius: 1,
  background: '#111827',
  color: '#cbd5e1',
  '&:hover': {
    borderColor: '#475569',
    background: '#1e293b',
    color: '#f8fafc',
  },
};

const runButtonSx = {
  width: 34,
  height: 34,
  border: '1px solid #67e8f9',
  borderRadius: 1,
  background: '#22d3ee',
  boxShadow: '0 0 0 1px rgb(34 211 238 / 18%), 0 8px 18px rgb(34 211 238 / 12%)',
  color: '#082f49',
  '&:hover': {
    borderColor: '#a5f3fc',
    background: '#67e8f9',
  },
};
