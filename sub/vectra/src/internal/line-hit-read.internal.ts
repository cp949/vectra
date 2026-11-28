/** 교차 판정에서 재사용하는 segment parameter record와 초기화 함수. */

import type { LineFamilyParam } from './line-family-param.internal';

/** 첫 번째 segment 판정에 쓰는 재사용 param이다. */
export const lineHitParamA: LineFamilyParam = { ox: 0, oy: 0, dx: 0, dy: 0, kind: 'finite' };

/** 두 번째 segment 판정에 쓰는 재사용 param이다. */
export const lineHitParamB: LineFamilyParam = { ox: 0, oy: 0, dx: 0, dy: 0, kind: 'finite' };

/**
 * `param`을 segment (ax, ay)→(bx, by)로 채워 반환한다.
 *
 * `segmentToLineFamilyParam`과 같은 값이다. 새 record를 만들지 않는다.
 */
export function fillSegmentParam(
  param: LineFamilyParam,
  ax: number,
  ay: number,
  bx: number,
  by: number
): LineFamilyParam {
  param.ox = ax;
  param.oy = ay;
  param.dx = bx - ax;
  param.dy = by - ay;
  return param;
}
