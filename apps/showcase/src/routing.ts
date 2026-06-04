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
