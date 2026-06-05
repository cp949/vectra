import { describe, expect, it } from 'vitest';

describe('MonacoCodeEditor', () => {
  it('패키지 엔트리에서 lazy MonacoCodeEditor를 export한다', async () => {
    const entrySource = await import('node:fs/promises').then(({ readFile }) =>
      readFile(new URL('../index.ts', import.meta.url), 'utf8')
    );

    expect(entrySource).toContain("import { LazyMonacoCodeEditor } from './editor/LazyMonacoCodeEditor';");
    expect(entrySource).toContain('export function MonacoCodeEditor');
    expect(entrySource).toContain('createElement(LazyMonacoCodeEditor, props)');
  });

  it('lazy MonacoCodeEditor import는 Monaco 전역을 설치하지 않는다', async () => {
    delete (globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment;

    const { LazyMonacoCodeEditor } = await import('./LazyMonacoCodeEditor');

    expect(typeof LazyMonacoCodeEditor).toBe('function');
    expect((globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment).toBeUndefined();
  });

  it('호스트 MonacoEnvironment를 덮어쓰지 않는다', async () => {
    const hostMonacoEnvironment = {
      getWorker() {
        throw new Error('host MonacoEnvironment should not be invoked during setup');
      },
    };
    (globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment = hostMonacoEnvironment;

    await import('./monaco-env');

    expect((globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment).toBe(hostMonacoEnvironment);
  });
});
