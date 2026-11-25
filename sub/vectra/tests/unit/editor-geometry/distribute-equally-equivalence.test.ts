/**
 * distributeEquallyInto — gap 분배의 누적 target을 이어 가며 계산하는 구현이 이전 구현과 비트 단위로
 * 같은지 고정한다.
 *
 * 검증: 객체·tuple bounds 0~40개(드물게 수백 개), 겹침·역전·동좌표·±0·NaN·±Infinity·1e308 좌표,
 * 여섯 분배 kind에서 반환 개수, 각 target의 index와 point가 이전 구현과 `Object.is` 수준으로 같다.
 */
import { describe, expect, test } from 'vitest';
import { distributeEquallyInto } from '../../../src/editor-geometry/distribute-equally-into';
import type { DistributeTarget, DistributionKind } from '../../../src/editor-geometry/types';
import { readBoundsMax, readBoundsMin } from '../../../src/internal/bounds';
import { readX, readY, writeXY } from '../../../src/internal/xy';
import { createRng } from '../../../src/random/create-rng';
import type { BoundsLike, XYObjectWritable, XYWritable } from '../../../src/types';

// 이전 구현. gap 분배는 item마다 target을 처음부터 다시 더한다. 새 구현의 비교 기준으로만 쓴다.
function referenceDistributeEquallyInto<Point extends XYWritable>(
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
  const entries: Array<{ idx: number; minVal: number; maxVal: number; otherMin: number }> = [];

  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i];
    const minPt = readBoundsMin(b);
    const maxPt = readBoundsMax(b);
    const minVal = isX ? readX(minPt) : readY(minPt);
    const maxVal = isX ? readX(maxPt) : readY(maxPt);
    const otherMin = isX ? readY(minPt) : readX(minPt);
    entries.push({ idx: i, minVal, maxVal, otherMin });
  }

  entries.sort((a, b) => a.minVal - b.minVal);

  const n = entries.length;
  const first = entries[0];
  const last = entries[n - 1];

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

  const edgeStep = kind === 'edge-x' || kind === 'edge-y' ? (last.minVal - first.minVal) / (n - 1) : 0;
  const firstCenter = (first.minVal + first.maxVal) * 0.5;
  const lastCenter = (last.minVal + last.maxVal) * 0.5;
  const centerStep = kind === 'center-x' || kind === 'center-y' ? (lastCenter - firstCenter) / (n - 1) : 0;

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
      let accum = first.maxVal + gapEqualGap;
      for (let j = 0; j < i - 1; j++) {
        accum += gapItemSizes[j];
        accum += gapEqualGap;
      }
      targetAxis = accum;
    }

    const point = factory();
    if (isX) {
      writeXY(point, targetAxis, e.otherMin);
    } else {
      writeXY(point, e.otherMin, targetAxis);
    }
    out.push({ index: e.idx, point });
  }

  return out.length;
}

type Rng = () => number;

const KINDS: DistributionKind[] = ['edge-x', 'center-x', 'gap-x', 'edge-y', 'center-y', 'gap-y'];
const SPECIAL = [0, -0, 1, -1, 0.5, 1e-300, 1e150, -1e150, 1e308, -1e308, Number.MAX_VALUE, NaN, Infinity, -Infinity];

function coord(rng: Rng, kind: number, special: number): number {
  const r = rng();
  if (r < special) return SPECIAL[Math.floor(rng() * SPECIAL.length)];
  if (kind === 0) return Math.floor(rng() * 21) - 10;
  if (kind === 1) return (rng() - 0.5) * 200;
  if (kind === 2) return (rng() - 0.5) * 2e154;
  return 1e6 + rng() * 1e-3;
}

function makeBounds(rng: Rng): BoundsLike[] {
  const kind = Math.floor(rng() * 4);
  const special = rng() < 0.6 ? 0 : 0.04;
  const r = rng();
  // 0, 1, 2, 3개 경계를 자주 만들고, 드물게 수백 개를 만든다.
  const n = r < 0.3 ? Math.floor(rng() * 5) : r < 0.97 ? Math.floor(rng() * 41) : 100 + Math.floor(rng() * 300);
  const mode = rng();
  const result: BoundsLike[] = [];
  for (let i = 0; i < n; i++) {
    let minX: number;
    let minY: number;
    let maxX: number;
    let maxY: number;
    if (mode < 0.15) {
      // 같은 좌표에 같은 크기
      minX = 3;
      minY = 4;
      maxX = 8;
      maxY = 9;
    } else if (mode < 0.3) {
      // 정렬된 정수 격자. 동좌표가 자주 생긴다.
      minX = (i % 5) * 7;
      minY = Math.floor(i / 5) * 6;
      maxX = minX + 1 + (i % 3);
      maxY = minY + 2 + (i % 4);
    } else {
      minX = coord(rng, kind, special);
      minY = coord(rng, kind, special);
      // 크기는 음수(역전)도 허용한다.
      maxX = minX + coord(rng, kind, special);
      maxY = minY + coord(rng, kind, special);
    }
    result.push(
      rng() < 0.3
        ? [
            [minX, minY],
            [maxX, maxY],
          ]
        : { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    );
  }
  return result;
}

function sameTargets(
  a: readonly DistributeTarget<XYObjectWritable>[],
  b: readonly DistributeTarget<XYObjectWritable>[]
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].index !== b[i].index) return false;
    if (!Object.is(a[i].point.x, b[i].point.x) || !Object.is(a[i].point.y, b[i].point.y)) return false;
  }
  return true;
}

const factory = (): XYObjectWritable => ({ x: -1, y: -1 });

describe('distributeEquallyInto — 이전 구현과 출력 동일성', () => {
  test('무작위 bounds 목록 2만 개: 여섯 kind의 결과가 이전 구현과 비트 단위로 같다', () => {
    const rng = createRng('distribute-equally-equivalence');
    let mismatch = '';
    for (let i = 0; i < 20_000 && mismatch === ''; i++) {
      const bounds = makeBounds(rng);
      const kind = KINDS[Math.floor(rng() * KINDS.length)];
      const actual: DistributeTarget<XYObjectWritable>[] = [{ index: 9, point: { x: 9, y: 9 } }];
      const expected: DistributeTarget<XYObjectWritable>[] = [{ index: 9, point: { x: 9, y: 9 } }];
      const countA = distributeEquallyInto(actual, bounds, kind, factory);
      const countB = referenceDistributeEquallyInto(expected, bounds, kind, factory);
      if (countA !== countB || !sameTargets(actual, expected)) mismatch = `#${i} n=${bounds.length} kind=${kind}`;
    }

    expect(mismatch).toBe('');
  });

  test('gap 분배는 같은 간격으로 놓고 양 끝 item은 움직이지 않는다', () => {
    const bounds = [
      { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
      { min: { x: 14, y: 0 }, max: { x: 24, y: 10 } },
      { min: { x: 25, y: 0 }, max: { x: 40, y: 10 } },
      { min: { x: 60, y: 0 }, max: { x: 70, y: 10 } },
    ];
    const out: DistributeTarget<XYObjectWritable>[] = [];

    expect(distributeEquallyInto(out, bounds, 'gap-x', factory)).toBe(2);
    expect(out.map((t) => t.index)).toEqual([1, 2]);
    // 남는 공간 60 - 10 - 25 = 25를 간격 3개로 나눈다.
    expect(out[0].point.x).toBeCloseTo(10 + 25 / 3, 9);
    expect(out[1].point.x).toBeCloseTo(10 + 25 / 3 + 10 + 25 / 3, 9);
  });
});
