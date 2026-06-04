import type Editor from '@monaco-editor/react';
import type { ReactElement } from 'react';
import { lazy, Suspense } from 'react';
import type { PlaygroundColorMode } from '../theme/color-mode';

type MonacoEditorComponent = typeof Editor;

let lazyEditor: ReturnType<typeof lazy<MonacoEditorComponent>> | undefined;

function getLazyEditor(): ReturnType<typeof lazy<MonacoEditorComponent>> {
  lazyEditor ??= lazy(async () => {
    await import('./monaco-env');
    const mod = await import('@monaco-editor/react');

    return { default: mod.default };
  });

  return lazyEditor;
}

export interface MonacoCodeEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly colorMode: PlaygroundColorMode;
  readonly readOnly?: boolean;
}

export function MonacoCodeEditor({
  value,
  onChange,
  colorMode,
  readOnly = false,
}: MonacoCodeEditorProps): ReactElement {
  const LazyEditor = getLazyEditor();

  return (
    <Suspense fallback={null}>
      <LazyEditor
        height="100%"
        language="typescript"
        theme={colorMode === 'dark' ? 'vs-dark' : 'light'}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        options={{
          automaticLayout: true,
          fontSize: 13,
          minimap: { enabled: false },
          readOnly,
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </Suspense>
  );
}
