import type { PlaygroundExampleId } from '@repo/playground';

/** showcase landing page 여부를 판단한다 */
export function shouldShowLanding(pathname: string): boolean {
  return pathname === '' || pathname === '/';
}

/** 예제 id를 URL path로 변환한다 */
export function examplePath(id: PlaygroundExampleId): string {
  return `/${id}`;
}

/** URL path의 첫 segment를 예제 id로 읽는다 */
export function exampleIdFromPathname(pathname: string): PlaygroundExampleId | undefined {
  const [firstSegment] = pathname.split('/').filter(Boolean);
  return firstSegment;
}

/**
 * 브라우저 pathname에서 배포 base 접두사를 떼어 앱 내부 path로 만든다.
 *
 * base는 vite의 `import.meta.env.BASE_URL`이다. `/` 또는 `/vectra/`처럼 앞뒤에 `/`가 있다.
 * base로 시작하지 않는 pathname은 그대로 돌려준다.
 */
export function appPathFromPathname(pathname: string, base: string): string {
  if (base === '/') return pathname;
  const prefix = base.slice(0, -1);
  if (pathname === prefix) return '/';
  if (pathname.startsWith(base)) return `/${pathname.slice(base.length)}`;
  return pathname;
}

/** 앱 내부 path에 배포 base 접두사를 붙여 브라우저 URL path로 만든다 */
export function urlFromAppPath(appPath: string, base: string): string {
  if (base === '/') return appPath;
  return `${base.slice(0, -1)}${appPath}`;
}
