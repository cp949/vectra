import { describe, expect, it } from 'vitest';
import { getNextColorMode, readStoredColorMode, writeStoredColorMode } from '../../src/theme/color-mode';

describe('color mode storage', () => {
  it('저장된 light/dark 값만 color mode로 읽는다', () => {
    const storage = new Map<string, string>();
    storage.set('theme', 'dark');

    expect(readStoredColorMode({ getItem: (key) => storage.get(key) ?? null }, 'theme')).toBe('dark');
    storage.set('theme', 'light');
    expect(readStoredColorMode({ getItem: (key) => storage.get(key) ?? null }, 'theme')).toBe('light');
    storage.set('theme', 'system');
    expect(readStoredColorMode({ getItem: (key) => storage.get(key) ?? null }, 'theme')).toBeUndefined();
  });

  it('storage 접근 실패 시 undefined를 반환한다', () => {
    expect(
      readStoredColorMode(
        {
          getItem: () => {
            throw new Error('blocked');
          },
        },
        'theme'
      )
    ).toBeUndefined();
  });

  it('다음 color mode를 light와 dark 사이에서 토글한다', () => {
    expect(getNextColorMode('light')).toBe('dark');
    expect(getNextColorMode('dark')).toBe('light');
  });

  it('선택한 color mode를 storage에 기록한다', () => {
    const storage = new Map<string, string>();

    writeStoredColorMode({ setItem: (key, value) => storage.set(key, value) }, 'theme', 'dark');

    expect(storage.get('theme')).toBe('dark');
  });
});
