import { describe, expect, it } from 'vitest';
import { appPathFromPathname, exampleIdFromPathname, examplePath, shouldShowLanding, urlFromAppPath } from './routing';

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

  describe('배포 base', () => {
    it('base가 `/`이면 path를 그대로 둔다', () => {
      expect(appPathFromPathname('/ray-light-field', '/')).toBe('/ray-light-field');
      expect(urlFromAppPath('/ray-light-field', '/')).toBe('/ray-light-field');
      expect(urlFromAppPath('/', '/')).toBe('/');
    });

    it('브라우저 pathname에서 base 접두사를 뗀다', () => {
      expect(appPathFromPathname('/vectra/ray-light-field', '/vectra/')).toBe('/ray-light-field');
      expect(appPathFromPathname('/vectra/ray-light-field/', '/vectra/')).toBe('/ray-light-field/');
    });

    it('base 자체는 landing path `/`가 된다', () => {
      expect(appPathFromPathname('/vectra/', '/vectra/')).toBe('/');
      expect(appPathFromPathname('/vectra', '/vectra/')).toBe('/');
    });

    it('base로 시작하지 않는 pathname은 그대로 둔다', () => {
      expect(appPathFromPathname('/vectra-extra/x', '/vectra/')).toBe('/vectra-extra/x');
      expect(appPathFromPathname('/other', '/vectra/')).toBe('/other');
    });

    it('앱 path에 base 접두사를 붙여 URL로 만든다', () => {
      expect(urlFromAppPath('/ray-light-field', '/vectra/')).toBe('/vectra/ray-light-field');
      expect(urlFromAppPath('/', '/vectra/')).toBe('/vectra/');
    });

    it('URL을 만들고 다시 읽으면 원래 path로 돌아온다', () => {
      for (const base of ['/', '/vectra/']) {
        for (const path of ['/', '/ray-light-field']) {
          expect(appPathFromPathname(urlFromAppPath(path, base), base)).toBe(path);
        }
      }
    });
  });
});
