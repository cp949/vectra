import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { equalizeSegmentsInto } from './equalize-segments-into';

/** equalizeSegments의 dual output 결과 타입. */
export interface EqualizedSegments {
  /** 첫 번째 path 균등화 결과 */
  a: PathCommand[];
  /** 두 번째 path 균등화 결과 */
  b: PathCommand[];
}

/**
 * 두 path의 draw segment 수를 맞춘 새 EqualizedSegments를 반환한다 (morph 전처리).
 *
 * 짧은 쪽에 zero-length cubic을 삽입해 긴 쪽의 draw segment 수에 맞춘다. 삽입 위치는
 * 기존 draw segment 경계에 비례 분산한다. 삽입 cubic은 control point와 endpoint가 한 점에
 * 모인 zero-length 형태라 path shape를 바꾸지 않는다.
 *
 * - draw segment 수가 같으면 양쪽 모두 입력 command를 그대로 재사용한다 (shallow copy 없음). 짧은 쪽에 삽입되는 zero-length cubic은 새 object다.
 * - 한쪽이 empty / Move-only면 그 path 시작점(또는 origin)에 zero-length cubic을 다른 쪽
 *   draw 수만큼 삽입한다.
 * - 양쪽 모두 empty면 `{ a: [], b: [] }`을 반환한다.
 *
 * 성능 최적화가 필요하면 `equalizeSegmentsInto`를 사용한다.
 *
 * @param commands1 첫 번째 path command sequence (absolute 전제)
 * @param commands2 두 번째 path command sequence (absolute 전제)
 * @param options 예약된 measurement 옵션
 * @returns 균등화된 { a, b } PathCommand[] 쌍
 */
export function equalizeSegments(
  commands1: readonly PathCommand[],
  commands2: readonly PathCommand[],
  options?: PathMeasurementOptions
): EqualizedSegments {
  const a: PathCommand[] = [];
  const b: PathCommand[] = [];
  equalizeSegmentsInto(a, b, commands1, commands2, options);
  return { a, b };
}
