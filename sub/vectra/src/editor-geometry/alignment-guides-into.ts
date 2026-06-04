/**
 * alignmentGuidesInto — bounds 배열에 대한 alignment guide line 산출.
 */

import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';
import type { AlignmentGuideResult, AlignmentKind } from './types';

/**
 * bounds 배열에 대해 지정된 alignment kind의 guide line을 모두 산출해 out 배열에 기록한다.
 *
 * 호출 시 항상 out.length를 0으로 초기화한 뒤 push한다.
 * 동일 좌표에 align되는 item은 단일 guide의 itemIndices에 모아 기록한다.
 * 빈 입력 또는 단일 item이면 0 반환 + 빈 out.
 * itemIndices는 insertion order(원본 bounds 배열 index 오름차순).
 * NaN/Infinity 좌표는 silent propagation(IEEE-754 동작).
 *
 * @param out guide 결과를 기록할 writable 배열. 호출 시 초기화한다.
 * @param bounds alignment 대상 bounds 배열
 * @param kind alignment 종류
 * @returns 기록된 guide 수
 */
export function alignmentGuidesInto(
  out: AlignmentGuideResult[],
  bounds: readonly BoundsLike[],
  kind: AlignmentKind
): number {
  out.length = 0;

  if (bounds.length <= 1) {
    return 0;
  }

  // 각 item의 guide 좌표를 산출한다
  const axis = kind === 'left' || kind === 'center-x' || kind === 'right' ? 'x' : 'y';

  // value → guide 누적 map (동좌표 item 병합용)
  // insertion order를 보존하기 위해 별도 순서 배열을 유지한다
  const valueMap = new Map<number, number[]>();
  const valueOrder: number[] = [];

  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i];
    const minPt = readBoundsMin(b);
    const maxPt = readBoundsMax(b);
    const minX = readX(minPt);
    const minY = readY(minPt);
    const maxX = readX(maxPt);
    const maxY = readY(maxPt);

    let value: number;
    if (kind === 'left') {
      value = minX;
    } else if (kind === 'right') {
      value = maxX;
    } else if (kind === 'center-x') {
      value = (minX + maxX) * 0.5;
    } else if (kind === 'top') {
      value = minY;
    } else if (kind === 'bottom') {
      value = maxY;
    } else {
      // center-y
      value = (minY + maxY) * 0.5;
    }

    const existing = valueMap.get(value);
    if (existing === undefined) {
      valueMap.set(value, [i]);
      valueOrder.push(value);
    } else {
      existing.push(i);
    }
  }

  // valueOrder 순서대로 out에 push한다 (입력 bounds insertion order 기준)
  for (const value of valueOrder) {
    // biome-ignore lint/style/noNonNullAssertion: valueOrder에서 값을 가져왔으므로 항상 존재한다
    const indices = valueMap.get(value)!;
    out.push({ axis, value, kind, itemIndices: indices });
  }

  return out.length;
}
