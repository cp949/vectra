/**
 * distributeGuidesInto — bounds 배열에 대한 distribution guide line 산출.
 */

import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';
import type { DistributionGuideResult, DistributionKind } from './types';

/**
 * bounds 배열에 대해 지정된 distribution kind의 guide line을 산출한다.
 *
 * 호출 시 항상 out.length를 0으로 초기화한 뒤 push한다.
 * 정렬은 axis(x/y)별 bounds 시작 좌표 오름차순으로 진행하고, 동좌표는 insertion order로 안정 정렬한다.
 * gap 종류는 인접 item 사이의 mid-point를 guide value로 기록한다.
 * 빈 입력 또는 item이 2개 미만이면 0 반환 + 빈 out.
 * NaN/Infinity 좌표는 silent propagation(IEEE-754 동작).
 *
 * @param out guide 결과를 기록할 writable 배열. 호출 시 초기화한다.
 * @param bounds distribution 대상 bounds 배열
 * @param kind distribution 종류
 * @returns 기록된 guide 수
 */
export function distributeGuidesInto(
  out: DistributionGuideResult[],
  bounds: readonly BoundsLike[],
  kind: DistributionKind
): number {
  out.length = 0;

  if (bounds.length < 2) {
    return 0;
  }

  const isX = kind === 'edge-x' || kind === 'center-x' || kind === 'gap-x';
  const axis: 'x' | 'y' = isX ? 'x' : 'y';

  // 각 item의 정렬 기준값(edge/center)과 원본 index를 읽는다
  const entries: Array<{ idx: number; minVal: number; maxVal: number }> = [];

  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i];
    const minPt = readBoundsMin(b);
    const maxPt = readBoundsMax(b);
    const minVal = isX ? readX(minPt) : readY(minPt);
    const maxVal = isX ? readX(maxPt) : readY(maxPt);
    entries.push({ idx: i, minVal, maxVal });
  }

  // 시작 좌표 오름차순 안정 정렬 (동좌표는 insertion order 유지)
  entries.sort((a, b) => a.minVal - b.minVal);

  if (kind === 'edge-x' || kind === 'edge-y') {
    // 각 item의 시작 edge 좌표를 guide로 기록한다
    for (const e of entries) {
      out.push({ axis, value: e.minVal, kind, itemIndices: [e.idx] });
    }
  } else if (kind === 'center-x' || kind === 'center-y') {
    // 각 item의 center 좌표를 guide로 기록한다
    for (const e of entries) {
      const center = (e.minVal + e.maxVal) * 0.5;
      out.push({ axis, value: center, kind, itemIndices: [e.idx] });
    }
  } else {
    // gap-x / gap-y: 인접 item 쌍의 midpoint를 guide로 기록한다
    for (let i = 0; i < entries.length - 1; i++) {
      const curr = entries[i];
      const next = entries[i + 1];
      const midpoint = (curr.maxVal + next.minVal) * 0.5;
      // itemIndices: insertion order 오름차순
      const itemIndices = [curr.idx, next.idx].sort((a, b) => a - b);
      out.push({ axis, value: midpoint, kind, itemIndices });
    }
  }

  return out.length;
}
