import type { XYObjectWritable } from '../types/index';
import { parsePointArrayInto } from './parse-point-array-into';

/**
 * generic point-array 문자열을 파싱하여 새 배열로 반환한다.
 *
 * - 새 `{ x, y }` object 배열을 할당하여 반환한다.
 * - buffer 재사용이 필요하면 {@link parsePointArrayInto}를 사용한다.
 * - SVG points와 동일한 grammar를 사용한다(공백·콤마 혼합 허용).
 * - 파싱 실패 시 Error를 throw한다.
 * - 빈 문자열은 정상 처리(빈 배열 반환).
 *
 * @param input - point-array 문자열
 * @returns 파싱된 `{ x, y }` 배열
 */
export function parsePointArray(input: string): { x: number; y: number }[] {
  const out: XYObjectWritable[] = [];
  parsePointArrayInto(out, input);
  return out;
}
