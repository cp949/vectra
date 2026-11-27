import type { InfiniteLineLike, InfiniteLineWritable } from '../types';
import { reverseInto } from './reverse-into';

// v2-migration: B-19 반전·반사 출력 전환 시 중첩 출력 생성을 제거한다.
/** `direction` 부호를 반전한 새 plain object를 반환한다. `origin`은 유지한다. */
export function reverse(line: InfiniteLineLike): InfiniteLineWritable {
  return reverseInto({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }, line);
}
