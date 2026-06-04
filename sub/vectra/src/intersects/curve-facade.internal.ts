/**
 * generic curve relation facade 공용 dispatch/변환 helper.
 *
 * curve numeric kernel은 nested `point`와 `tA`/`tB`를 가진 `IntersectionHit`를 만든다.
 * facade는 flat `x`/`y` + facade parameter field를 가진 `CurveIntersectionHit`로 변환한다.
 * public leaf끼리 helper 목적의 직접 import를 피하려고 변환을 이 internal helper에 모은다.
 */

import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type {
  CurveIntersectionHit,
  CurveIntersectionKind,
  InfiniteLineLike,
  IntersectionHit,
  IntersectionKind,
  SegmentLike,
} from '../types';

/**
 * kernel `IntersectionKind`를 facade `CurveIntersectionKind`로 좁힌다.
 *
 * 대상 kernel(line×curve, curve×curve, cubic self)은 `cross`/`touch`만 생성한다.
 * 방어적으로 `touch`가 아니면 `cross`로 처리해 overlap/parallel/coincident를 노출하지 않는다.
 */
export function toCurveKind(kind: IntersectionKind): CurveIntersectionKind {
  return kind === 'touch' ? 'touch' : 'cross';
}

/**
 * segment A→B를 origin=A, direction=B-A의 infinite-line으로 변환한다.
 *
 * direction을 unit vector로 정규화하지 않으므로 kernel `tA`가 segment parameter `[0, 1]`로 유지된다.
 *
 * @param segment 선분 A→B
 */
export function segmentToInfiniteLine(segment: SegmentLike): InfiniteLineLike {
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ax = readX(a);
  const ay = readY(a);
  return {
    origin: { x: ax, y: ay },
    direction: { x: readX(b) - ax, y: readY(b) - ay },
  };
}

/**
 * line/segment × curve kernel hit를 `tLine`/`tCurve` facade hit로 변환해 out에 기록한다.
 *
 * kernel `tA`는 line/segment parameter, `tB`는 curve parameter다.
 * out을 먼저 비우고 변환 결과를 push한다. `point`, `tA`, `tB`는 남기지 않는다.
 *
 * @param out 변환 결과를 기록할 facade hit 배열
 * @param hits kernel이 채운 nested-point hit 배열
 */
export function writeLineCurveHits(out: CurveIntersectionHit[], hits: IntersectionHit[]): void {
  out.length = 0;
  for (const hit of hits) {
    out.push({
      x: hit.point.x,
      y: hit.point.y,
      kind: toCurveKind(hit.kind),
      tLine: hit.tA,
      tCurve: hit.tB,
    });
  }
}

/**
 * segment × curve kernel hit를 `tLine`/`tCurve` facade hit로 변환해 out에 기록한다.
 *
 * kernel `tA`가 segment parameter `[0, 1]` 밖인 hit는 제거한다.
 * `tLine`은 normalized segment parameter, `tCurve`는 curve parameter다.
 * out을 먼저 비우고 범위 내 hit만 push한다.
 *
 * @param out 변환 결과를 기록할 facade hit 배열
 * @param hits kernel이 채운 nested-point hit 배열
 */
export function writeSegmentCurveHits(out: CurveIntersectionHit[], hits: IntersectionHit[]): void {
  out.length = 0;
  for (const hit of hits) {
    // segment는 tA ∈ [0, 1] 범위만 유효하다
    if (hit.tA < 0 || hit.tA > 1) continue;
    out.push({
      x: hit.point.x,
      y: hit.point.y,
      kind: toCurveKind(hit.kind),
      tLine: hit.tA,
      tCurve: hit.tB,
    });
  }
}

/**
 * curve × curve / curve self kernel hit를 `tA`/`tB` facade hit로 변환해 out에 기록한다.
 *
 * `swap`이 true이면 kernel `tA`/`tB`를 뒤집어 caller가 전달한 curve 순서에 맞춘다.
 * out을 먼저 비우고 변환 결과를 push한다. `point`는 남기지 않는다.
 *
 * @param out 변환 결과를 기록할 facade hit 배열
 * @param hits kernel이 채운 nested-point hit 배열
 * @param swap true이면 `tA`/`tB`를 swap해 caller order를 보존한다
 */
export function writeCurveCurveHits(out: CurveIntersectionHit[], hits: IntersectionHit[], swap: boolean): void {
  out.length = 0;
  for (const hit of hits) {
    out.push({
      x: hit.point.x,
      y: hit.point.y,
      kind: toCurveKind(hit.kind),
      tA: swap ? hit.tB : hit.tA,
      tB: swap ? hit.tA : hit.tB,
    });
  }
}
