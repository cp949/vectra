/**
 * distributeEquallyInto — bounds 배열을 균등 분배한 target top-left 산출.
 */

import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, XYWritable } from '../types';
import type { DistributeTarget, DistributionKind } from './types';

/**
 * bounds 배열을 균등 분배한 target top-left 좌표 collection을 out 배열에 기록한다.
 *
 * 출력은 offset이 아니라 absolute target position이다.
 * 호출 시 항상 out.length를 0으로 초기화한 뒤 push한다.
 * 정렬은 axis별 bounds 시작 좌표 오름차순(동좌표는 insertion order 안정 정렬).
 * 양 끝 item(정렬 기준 첫 번째, 마지막)은 이동하지 않으므로 output에 포함하지 않는다.
 * 중간 item은 현재 위치와 무관하게 target position을 기록한다.
 * caller-provided factory가 각 element point storage를 만든다.
 * 빈 입력 또는 item이 3개 미만(분배 의미가 없음)이면 0 반환 + 빈 out.
 * degenerate bounds와 NaN/Infinity 좌표는 silent propagation(IEEE-754 동작).
 * gap-x/y에서 items가 겹치면 equalGap이 음수가 될 수 있다.
 *
 * @param out target 결과를 기록할 writable 배열. 호출 시 초기화한다.
 * @param bounds distribution 대상 bounds 배열
 * @param kind distribution 종류
 * @param factory 각 result point storage를 생성하는 caller-provided factory
 * @returns 기록된 target 수
 */
export function distributeEquallyInto<Point extends XYWritable>(
  out: DistributeTarget<Point>[],
  bounds: readonly BoundsLike[],
  kind: DistributionKind,
  factory: () => Point
): number {
  out.length = 0;

  if (bounds.length < 3) {
    return 0;
  }

  const isX = kind === 'edge-x' || kind === 'center-x' || kind === 'gap-x';

  // 각 item의 min/max 좌표와 원본 index를 읽는다
  const entries: Array<{ idx: number; minVal: number; maxVal: number; otherMin: number }> = [];

  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i];
    const minPt = readBoundsMin(b);
    const maxPt = readBoundsMax(b);
    const minVal = isX ? readX(minPt) : readY(minPt);
    const maxVal = isX ? readX(maxPt) : readY(maxPt);
    // 이동하지 않는 축 좌표(x축 분배 시 min.y, y축 분배 시 min.x)
    const otherMin = isX ? readY(minPt) : readX(minPt);
    entries.push({ idx: i, minVal, maxVal, otherMin });
  }

  // 시작 좌표 오름차순 안정 정렬 (동좌표는 insertion order 유지)
  entries.sort((a, b) => a.minVal - b.minVal);

  const n = entries.length;
  const first = entries[0];
  const last = entries[n - 1];

  // gap 분기에서만 필요한 사전 계산 (루프 밖에서 한 번만 계산)
  // gap-x/y: 중간 item 크기의 합과 equalGap을 미리 구한다.
  // items가 겹치면 totalSpace < 0이 될 수 있고 equalGap이 음수가 되는 경우도 있다.
  let gapEqualGap = 0;
  const gapItemSizes: number[] = [];
  if (kind === 'gap-x' || kind === 'gap-y') {
    let middleContentSize = 0;
    for (let j = 1; j < n - 1; j++) {
      const size = entries[j].maxVal - entries[j].minVal;
      gapItemSizes.push(size);
      middleContentSize += size;
    }
    const totalSpace = last.minVal - first.maxVal;
    gapEqualGap = (totalSpace - middleContentSize) / (n - 1);
  }

  // edge / center 분기에서만 필요한 사전 계산
  const edgeStep = kind === 'edge-x' || kind === 'edge-y' ? (last.minVal - first.minVal) / (n - 1) : 0;
  const firstCenter = (first.minVal + first.maxVal) * 0.5;
  const lastCenter = (last.minVal + last.maxVal) * 0.5;
  const centerStep = kind === 'center-x' || kind === 'center-y' ? (lastCenter - firstCenter) / (n - 1) : 0;

  // 중간 item에 대한 target min 좌표를 산출한다
  for (let i = 1; i < n - 1; i++) {
    const e = entries[i];
    let targetAxis: number;

    if (kind === 'edge-x' || kind === 'edge-y') {
      targetAxis = first.minVal + edgeStep * i;
    } else if (kind === 'center-x' || kind === 'center-y') {
      const targetCenter = firstCenter + centerStep * i;
      const halfSize = (e.maxVal - e.minVal) * 0.5;
      targetAxis = targetCenter - halfSize;
    } else {
      // gap-x / gap-y: first.maxVal + equalGap + 이전 middle item 누적 크기 + (i-1)*equalGap
      let accum = first.maxVal + gapEqualGap;
      for (let j = 0; j < i - 1; j++) {
        accum += gapItemSizes[j];
        accum += gapEqualGap;
      }
      targetAxis = accum;
    }

    const point = factory();

    // 분배 축에 target 좌표를 기록하고, 나머지 축은 원래 min 좌표를 유지한다
    if (isX) {
      writeXY(point, targetAxis, e.otherMin);
    } else {
      writeXY(point, e.otherMin, targetAxis);
    }

    out.push({ index: e.idx, point });
  }

  return out.length;
}
