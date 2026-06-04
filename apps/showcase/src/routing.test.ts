import { describe, expect, it } from 'vitest';
import { exampleIdFromPathname, examplePath, shouldShowLanding } from './routing';

describe('showcase routing', () => {
  it('루트 경로는 landing page로 판단한다', () => {
    expect(shouldShowLanding('/')).toBe(true);
    expect(shouldShowLanding('')).toBe(true);
  });

  it('예제 id를 URL slug 경로로 변환한다', () => {
    expect(examplePath('ray-light-field')).toBe('/ray-light-field');
  });

  it('URL 첫 segment를 예제 id로 읽는다', () => {
    expect(exampleIdFromPathname('/ray-light-field')).toBe('ray-light-field');
    expect(exampleIdFromPathname('/ray-light-field/')).toBe('ray-light-field');
  });
});
