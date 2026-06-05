import { describe, expect, it } from 'vitest';

describe('MonacoCodeEditor', () => {
  it('패키지 엔트리에서 MonacoCodeEditor를 제공한다', async () => {
    const { MonacoCodeEditor } = await import('..');

    expect(typeof MonacoCodeEditor).toBe('function');
  });

  it('lazy MonacoCodeEditor import는 Monaco 전역을 설치하지 않는다', async () => {
    delete (globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment;

    await import('./LazyMonacoCodeEditor');

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
