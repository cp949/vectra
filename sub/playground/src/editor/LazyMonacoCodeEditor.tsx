import type { ReactElement } from 'react';
import { createElement, lazy, Suspense } from 'react';
import type { MonacoCodeEditorProps } from './MonacoCodeEditor';

type MonacoCodeEditorComponent = (props: MonacoCodeEditorProps) => ReactElement;

let lazyMonacoCodeEditor: ReturnType<typeof lazy<MonacoCodeEditorComponent>> | undefined;

function getLazyMonacoCodeEditor(): ReturnType<typeof lazy<MonacoCodeEditorComponent>> {
  lazyMonacoCodeEditor ??= lazy(async () => {
    const mod = await import('./MonacoCodeEditor');

    return { default: mod.MonacoCodeEditor };
  });

  return lazyMonacoCodeEditor;
}

export function LazyMonacoCodeEditor(props: MonacoCodeEditorProps): ReactElement {
  const MonacoCodeEditor = getLazyMonacoCodeEditor();

  return createElement(Suspense, { fallback: null }, createElement(MonacoCodeEditor, props));
}
