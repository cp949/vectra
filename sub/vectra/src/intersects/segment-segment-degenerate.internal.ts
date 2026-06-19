import type { SegmentSegmentDetail } from '../types';
import {
  parameterOnSegmentPoint,
  pointAgreesWithSegment,
  pointLineDist,
  pointPointDist,
} from './segment-segment-geometry.internal';

/** 매 호출 fresh none result를 반환한다. 공유 상수를 재사용하지 않는다. */
function none(): SegmentSegmentDetail {
  return { kind: 'none' };
}

/**
 * degenerate 분기를 판정한다 — 한 쪽 이상의 segment가 점으로 환원된 경우.
 *
 * undefined를 반환하면 degenerate 분기가 아니므로 dispatcher가 다음 분기로 진행한다.
 * SegmentSegmentDetail을 반환하면 degenerate 결과(point/none)이며 dispatcher는 그대로 반환한다.
 * aDegen/bDegen 판정과 3 case(둘 다 점 / a만 점 / b만 점)의 분기 조건을 한 글자도 바꾸지 않고 보존한다.
 *
 * @param ax0 segment a 시작점 x
 * @param ay0 segment a 시작점 y
 * @param ax1 segment a 끝점 x
 * @param ay1 segment a 끝점 y
 * @param bx0 segment b 시작점 x
 * @param by0 segment b 시작점 y
 * @param bx1 segment b 끝점 x
 * @param by1 segment b 끝점 y
 * @param epsilon 거리 임계값
 */
export function degenerateSegmentSegmentDetail(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): SegmentSegmentDetail | undefined {
  const aDegen = ax0 === ax1 && ay0 === ay1;
  const bDegen = bx0 === bx1 && by0 === by1;

  // degenerate 분기: 한 쪽 이상이 점으로 환원된다
  if (aDegen || bDegen) {
    if (aDegen && bDegen) {
      if (pointPointDist(ax0, ay0, bx0, by0) <= epsilon) {
        return { kind: 'point', point: { x: ax0, y: ay0 }, tA: 0, tB: 0 };
      }
      return none();
    }
    if (aDegen) {
      // a를 점으로 보고 b 위 포함 여부를 판정한다
      const t = parameterOnSegmentPoint(ax0, ay0, bx0, by0, bx1, by1);
      const dist = pointLineDist(ax0, ay0, bx0, by0, bx1, by1);
      if (dist <= epsilon && t >= 0 && t <= 1 && pointAgreesWithSegment(ax0, ay0, bx0, by0, bx1, by1, t, epsilon)) {
        return { kind: 'point', point: { x: ax0, y: ay0 }, tA: 0, tB: t };
      }
      return none();
    }
    // b를 점으로 보고 a 위 포함 여부를 판정한다
    const t = parameterOnSegmentPoint(bx0, by0, ax0, ay0, ax1, ay1);
    const dist = pointLineDist(bx0, by0, ax0, ay0, ax1, ay1);
    if (dist <= epsilon && t >= 0 && t <= 1 && pointAgreesWithSegment(bx0, by0, ax0, ay0, ax1, ay1, t, epsilon)) {
      return { kind: 'point', point: { x: bx0, y: by0 }, tA: t, tB: 0 };
    }
    return none();
  }

  return undefined;
}
