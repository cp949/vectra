/**
 * alignment / distribution guide geometry 단위 테스트.
 *
 * alignmentGuidesInto / distributeGuidesInto / distributeEquallyInto와
 * allocating companion(alignmentGuides / distributeGuides / distributeEqually)의
 * guide 좌표 정확성, out 초기화, empty/single/degenerate 처리, ordering/tie-break를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { alignmentGuides } from '../../../src/editor-geometry/alignment-guides';
import { alignmentGuidesInto } from '../../../src/editor-geometry/alignment-guides-into';
import { distributeEqually } from '../../../src/editor-geometry/distribute-equally';
import { distributeEquallyInto } from '../../../src/editor-geometry/distribute-equally-into';
import { distributeGuides } from '../../../src/editor-geometry/distribute-guides';
import { distributeGuidesInto } from '../../../src/editor-geometry/distribute-guides-into';
import type {
  AlignmentGuideResult,
  DistributeTarget,
  DistributionGuideResult,
} from '../../../src/editor-geometry/types';
import type { XYObjectWritable } from '../../../src/types';

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** 테스트용 XYObjectWritable factory */
function makeXY(): XYObjectWritable {
  return { x: 0, y: 0 };
}

/**
 * BoundsLike object 생성 헬퍼.
 * x, y는 min corner, w, h는 너비/높이를 받는다.
 */
function b(x: number, y: number, w: number, h: number) {
  return { min: { x, y }, max: { x: x + w, y: y + h } };
}

// ---------------------------------------------------------------------------
// alignmentGuidesInto
// ---------------------------------------------------------------------------

describe('alignmentGuidesInto', () => {
  describe('빈 입력 / 단일 item', () => {
    test('빈 배열이면 0을 반환하고 out을 비운다', () => {
      const out: AlignmentGuideResult[] = [{ axis: 'x', value: 0, kind: 'left', itemIndices: [0] }];
      const count = alignmentGuidesInto(out, [], 'left');
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });

    test('단일 item이면 0을 반환하고 out을 비운다', () => {
      const out: AlignmentGuideResult[] = [];
      const count = alignmentGuidesInto(out, [b(10, 20, 100, 60)], 'left');
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });
  });

  describe('out 초기화', () => {
    test('호출 전 out에 있던 내용을 지운 뒤 기록한다', () => {
      const out: AlignmentGuideResult[] = [
        { axis: 'x', value: 999, kind: 'left', itemIndices: [99] },
        { axis: 'y', value: 888, kind: 'top', itemIndices: [88] },
      ];
      alignmentGuidesInto(out, [b(0, 0, 50, 50), b(100, 100, 50, 50)], 'left');
      for (const g of out) {
        expect(g.value).not.toBe(999);
        expect(g.value).not.toBe(888);
      }
    });
  });

  describe('left alignment', () => {
    test('2개 item — 각 left edge 좌표로 guide를 기록한다', () => {
      const out: AlignmentGuideResult[] = [];
      const count = alignmentGuidesInto(out, [b(10, 0, 50, 50), b(80, 0, 40, 40)], 'left');
      expect(count).toBe(2);
      expect(out).toHaveLength(2);
      expect(out[0]).toMatchObject({ axis: 'x', value: 10, kind: 'left', itemIndices: [0] });
      expect(out[1]).toMatchObject({ axis: 'x', value: 80, kind: 'left', itemIndices: [1] });
    });

    test('동일 left edge를 가진 item은 단일 guide에 묶인다', () => {
      const out: AlignmentGuideResult[] = [];
      const count = alignmentGuidesInto(out, [b(10, 0, 50, 30), b(10, 50, 60, 40)], 'left');
      expect(count).toBe(1);
      expect(out[0]).toMatchObject({ axis: 'x', value: 10, kind: 'left', itemIndices: [0, 1] });
    });

    test('insertion order — itemIndices는 오름차순이다', () => {
      const out: AlignmentGuideResult[] = [];
      alignmentGuidesInto(out, [b(10, 0, 50, 30), b(50, 0, 40, 30), b(10, 60, 70, 30)], 'left');
      const guide10 = out.find((g) => g.value === 10);
      expect(guide10?.itemIndices).toEqual([0, 2]);
    });
  });

  describe('right alignment', () => {
    test('right edge(min.x + width)로 guide를 기록한다 — 동일 right는 단일 guide로 묶인다', () => {
      const out: AlignmentGuideResult[] = [];
      // b(10,0,50,50) right=60, b(30,0,30,50) right=60 → 동일이므로 1개 guide로 묶인다
      alignmentGuidesInto(out, [b(10, 0, 50, 50), b(30, 0, 30, 50)], 'right');
      expect(out).toHaveLength(1);
      expect(out[0].value).toBe(60);
      expect(out[0].itemIndices).toEqual([0, 1]);
    });

    test('서로 다른 right edge', () => {
      const out: AlignmentGuideResult[] = [];
      const count = alignmentGuidesInto(out, [b(0, 0, 30, 50), b(0, 0, 60, 50)], 'right');
      expect(count).toBe(2);
      const values = out.map((g) => g.value).sort((a, b) => a - b);
      expect(values).toEqual([30, 60]);
    });
  });

  describe('center-x alignment', () => {
    test('x축 center 좌표로 guide를 기록한다 — 동일 center는 단일 guide로 묶인다', () => {
      const out: AlignmentGuideResult[] = [];
      // b(0,0,100,50) center-x=50, b(10,0,80,50) center-x=50 → 단일 guide
      alignmentGuidesInto(out, [b(0, 0, 100, 50), b(10, 0, 80, 50)], 'center-x');
      expect(out).toHaveLength(1);
      expect(out[0]).toMatchObject({ axis: 'x', value: 50 });
      expect(out[0].itemIndices).toEqual([0, 1]);
    });

    test('서로 다른 center-x를 가진 item은 각각 guide를 기록한다', () => {
      const out: AlignmentGuideResult[] = [];
      // b(0,0,100,50) center-x=50, b(200,0,100,50) center-x=250
      alignmentGuidesInto(out, [b(0, 0, 100, 50), b(200, 0, 100, 50)], 'center-x');
      expect(out).toHaveLength(2);
      const values = out.map((g) => g.value).sort((a, b) => a - b);
      expect(values).toEqual([50, 250]);
    });
  });

  describe('top alignment', () => {
    test('min.y 좌표로 y axis guide를 기록한다', () => {
      const out: AlignmentGuideResult[] = [];
      const count = alignmentGuidesInto(out, [b(0, 10, 50, 50), b(100, 30, 50, 50)], 'top');
      expect(count).toBe(2);
      expect(out[0]).toMatchObject({ axis: 'y', kind: 'top', value: 10, itemIndices: [0] });
      expect(out[1]).toMatchObject({ axis: 'y', kind: 'top', value: 30, itemIndices: [1] });
    });
  });

  describe('bottom alignment', () => {
    test('max.y 좌표로 y axis guide를 기록한다', () => {
      const out: AlignmentGuideResult[] = [];
      alignmentGuidesInto(out, [b(0, 0, 50, 60), b(100, 0, 50, 60)], 'bottom');
      expect(out).toHaveLength(1);
      expect(out[0]).toMatchObject({ axis: 'y', kind: 'bottom', value: 60, itemIndices: [0, 1] });
    });
  });

  describe('center-y alignment', () => {
    test('y축 center 좌표로 y axis guide를 기록한다', () => {
      const out: AlignmentGuideResult[] = [];
      alignmentGuidesInto(out, [b(0, 0, 50, 100), b(100, 0, 50, 100)], 'center-y');
      expect(out).toHaveLength(1);
      expect(out[0]).toMatchObject({ axis: 'y', kind: 'center-y', value: 50 });
    });
  });

  describe('BoundsLike 다형성', () => {
    test('tuple BoundsLike를 받는다', () => {
      const out: AlignmentGuideResult[] = [];
      const count = alignmentGuidesInto(
        out,
        [
          [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
          ],
          [
            { x: 60, y: 0 },
            { x: 110, y: 50 },
          ],
        ],
        'left'
      );
      expect(count).toBe(2);
      expect(out[0].value).toBe(0);
      expect(out[1].value).toBe(60);
    });
  });
});

// ---------------------------------------------------------------------------
// alignmentGuides (companion)
// ---------------------------------------------------------------------------

describe('alignmentGuides', () => {
  test('빈 입력이면 새 빈 배열을 반환한다', () => {
    expect(alignmentGuides([], 'left')).toEqual([]);
  });

  test('단일 item이면 새 빈 배열을 반환한다', () => {
    expect(alignmentGuides([b(10, 20, 100, 60)], 'left')).toEqual([]);
  });

  test('동일 left edge item은 단일 guide에 itemIndices 오름차순으로 묶인다', () => {
    const result = alignmentGuides([b(10, 0, 50, 30), b(10, 50, 60, 40)], 'left');
    expect(result).toEqual([{ axis: 'x', value: 10, kind: 'left', itemIndices: [0, 1] }]);
  });

  test('Into와 동일한 result ordering / grouping을 반환한다', () => {
    const bounds = [b(10, 0, 50, 30), b(50, 0, 40, 30), b(10, 60, 70, 30)];
    const expected: AlignmentGuideResult[] = [];
    alignmentGuidesInto(expected, bounds, 'left');
    expect(alignmentGuides(bounds, 'left')).toEqual(expected);
  });

  test('호출마다 새 배열을 반환한다 (재사용 out 아님)', () => {
    const bounds = [b(0, 0, 50, 50), b(100, 100, 50, 50)];
    const a = alignmentGuides(bounds, 'left');
    const c = alignmentGuides(bounds, 'left');
    expect(a).not.toBe(c);
  });

  test('호출마다 새 result object를 반환한다', () => {
    const bounds = [b(0, 0, 50, 50), b(100, 100, 50, 50)];
    const a = alignmentGuides(bounds, 'left');
    const c = alignmentGuides(bounds, 'left');
    expect(a[0]).not.toBe(c[0]);
    expect(a[0].itemIndices).not.toBe(c[0].itemIndices);
  });

  test('NaN/Infinity 좌표 bounds도 throw하지 않고 산술 결과를 반환한다', () => {
    expect(() => alignmentGuides([b(Number.NaN, 0, 50, 50), b(0, 0, 50, 50)], 'left')).not.toThrow();
    const result = alignmentGuides(
      [
        { min: { x: 0, y: 0 }, max: { x: Number.POSITIVE_INFINITY, y: 50 } },
        { min: { x: 0, y: 0 }, max: { x: 50, y: 50 } },
      ],
      'right'
    );
    expect(result.some((g) => g.value === Number.POSITIVE_INFINITY)).toBe(true);
  });

  test('-Infinity 좌표를 그대로 전파한다', () => {
    const result = alignmentGuides(
      [
        { min: { x: Number.NEGATIVE_INFINITY, y: 0 }, max: { x: 50, y: 50 } },
        { min: { x: 0, y: 0 }, max: { x: 50, y: 50 } },
      ],
      'left'
    );
    expect(result.some((g) => g.value === Number.NEGATIVE_INFINITY)).toBe(true);
  });

  test('degenerate bounds(width=0)도 유한 guide를 산출한다', () => {
    const result = alignmentGuides([b(10, 0, 0, 30), b(10, 50, 0, 40)], 'left');
    expect(result).toEqual([{ axis: 'x', value: 10, kind: 'left', itemIndices: [0, 1] }]);
  });
});

// ---------------------------------------------------------------------------
// distributeGuidesInto
// ---------------------------------------------------------------------------

describe('distributeGuidesInto', () => {
  describe('빈 입력 / 2개 미만', () => {
    test('빈 배열이면 0을 반환하고 out을 비운다', () => {
      const out: DistributionGuideResult[] = [{ axis: 'x', value: 0, kind: 'edge-x', itemIndices: [0] }];
      const count = distributeGuidesInto(out, [], 'edge-x');
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });

    test('단일 item이면 0을 반환하고 out을 비운다', () => {
      const out: DistributionGuideResult[] = [];
      const count = distributeGuidesInto(out, [b(0, 0, 50, 50)], 'edge-x');
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });
  });

  describe('out 초기화', () => {
    test('호출 전 out에 있던 내용을 지운 뒤 기록한다', () => {
      const out: DistributionGuideResult[] = [{ axis: 'x', value: 999, kind: 'edge-x', itemIndices: [99] }];
      distributeGuidesInto(out, [b(0, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x');
      expect(out.every((g) => g.value !== 999)).toBe(true);
    });
  });

  describe('edge-x', () => {
    test('3개 item — 균등 left-edge 좌표를 guide로 기록한다', () => {
      // item0: x=0..50, item1: x=100..150, item2: x=200..250
      // edge 간격: (200 - 0) / 2 = 100. 즉 0, 100, 200
      const out: DistributionGuideResult[] = [];
      const count = distributeGuidesInto(out, [b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x');
      expect(count).toBe(3);
      const values = out.map((g) => g.value);
      expect(values).toEqual([0, 100, 200]);
      expect(out[0]).toMatchObject({ axis: 'x', kind: 'edge-x', itemIndices: [0] });
      expect(out[1]).toMatchObject({ axis: 'x', kind: 'edge-x', itemIndices: [1] });
      expect(out[2]).toMatchObject({ axis: 'x', kind: 'edge-x', itemIndices: [2] });
    });

    test('2개 item — left-edge 2개를 기록한다', () => {
      const out: DistributionGuideResult[] = [];
      const count = distributeGuidesInto(out, [b(0, 0, 50, 50), b(100, 0, 50, 50)], 'edge-x');
      expect(count).toBe(2);
      expect(out.map((g) => g.value)).toEqual([0, 100]);
    });
  });

  describe('center-x', () => {
    test('3개 item — x 중심 좌표를 guide로 기록한다', () => {
      // item0 center: 25, item1 center: 125, item2 center: 225
      const out: DistributionGuideResult[] = [];
      distributeGuidesInto(out, [b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'center-x');
      expect(out.map((g) => g.value)).toEqual([25, 125, 225]);
      expect(out[0]).toMatchObject({ axis: 'x', kind: 'center-x' });
    });
  });

  describe('gap-x', () => {
    test('3개 item — 인접 쌍의 midpoint를 guide로 기록한다', () => {
      // item0: 0..50, item1: 100..150, item2: 200..250
      // gap0: midpoint between item0.maxX(50) and item1.minX(100) = 75
      // gap1: midpoint between item1.maxX(150) and item2.minX(200) = 175
      const out: DistributionGuideResult[] = [];
      const count = distributeGuidesInto(out, [b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'gap-x');
      expect(count).toBe(2);
      expect(out.map((g) => g.value)).toEqual([75, 175]);
      expect(out[0]).toMatchObject({ axis: 'x', kind: 'gap-x', itemIndices: [0, 1] });
      expect(out[1]).toMatchObject({ axis: 'x', kind: 'gap-x', itemIndices: [1, 2] });
    });
  });

  describe('edge-y', () => {
    test('3개 item — top-edge 좌표를 guide로 기록한다', () => {
      const out: DistributionGuideResult[] = [];
      const count = distributeGuidesInto(out, [b(0, 0, 50, 50), b(0, 100, 50, 50), b(0, 200, 50, 50)], 'edge-y');
      expect(count).toBe(3);
      expect(out.map((g) => g.value)).toEqual([0, 100, 200]);
      expect(out[0]).toMatchObject({ axis: 'y', kind: 'edge-y' });
    });
  });

  describe('center-y', () => {
    test('3개 item — y 중심 좌표를 guide로 기록한다', () => {
      const out: DistributionGuideResult[] = [];
      distributeGuidesInto(out, [b(0, 0, 50, 50), b(0, 100, 50, 50), b(0, 200, 50, 50)], 'center-y');
      expect(out.map((g) => g.value)).toEqual([25, 125, 225]);
      expect(out[0]).toMatchObject({ axis: 'y', kind: 'center-y' });
    });
  });

  describe('gap-y', () => {
    test('3개 item — 인접 쌍의 y midpoint를 guide로 기록한다', () => {
      // item0: 0..50, item1: 100..150, item2: 200..250
      const out: DistributionGuideResult[] = [];
      const count = distributeGuidesInto(out, [b(0, 0, 50, 50), b(0, 100, 50, 50), b(0, 200, 50, 50)], 'gap-y');
      expect(count).toBe(2);
      expect(out.map((g) => g.value)).toEqual([75, 175]);
      expect(out[0]).toMatchObject({ axis: 'y', kind: 'gap-y', itemIndices: [0, 1] });
    });
  });

  describe('ordering (axis 기준 시작 좌표 오름차순)', () => {
    test('입력이 역순이어도 edge-x guide는 오름차순으로 기록된다', () => {
      const out: DistributionGuideResult[] = [];
      distributeGuidesInto(out, [b(200, 0, 50, 50), b(100, 0, 50, 50), b(0, 0, 50, 50)], 'edge-x');
      const values = out.map((g) => g.value);
      expect(values).toEqual([0, 100, 200]);
    });

    test('동좌표 item은 insertion order 안정 정렬 — edge-x', () => {
      const out: DistributionGuideResult[] = [];
      // item0: x=0, item1: x=100, item2: x=0 (동좌표)
      distributeGuidesInto(out, [b(0, 0, 50, 50), b(100, 0, 50, 50), b(0, 0, 50, 50)], 'edge-x');
      // 정렬 후: index2(x=0), index0(x=0), index1(x=100)? 아니다 — 동좌표 insertion order 유지
      // 동좌표: 원본 index 0 < 2 → index0이 먼저
      const itemIndicesFlat = out.flatMap((g) => g.itemIndices);
      const zeroXIndices = itemIndicesFlat.slice(0, 2);
      expect(zeroXIndices).toContain(0);
      expect(zeroXIndices).toContain(2);
      // insertion order 안정 → 0이 2보다 앞에 온다
      expect(zeroXIndices.indexOf(0)).toBeLessThan(zeroXIndices.indexOf(2));
    });
  });
});

// ---------------------------------------------------------------------------
// distributeGuides (companion)
// ---------------------------------------------------------------------------

describe('distributeGuides', () => {
  test('빈 입력이면 새 빈 배열을 반환한다', () => {
    expect(distributeGuides([], 'edge-x')).toEqual([]);
  });

  test('2개 미만이면 새 빈 배열을 반환한다', () => {
    expect(distributeGuides([b(0, 0, 50, 50)], 'edge-x')).toEqual([]);
  });

  test('edge-x — 정렬 순서대로 x축 guide 3개를 반환한다', () => {
    const result = distributeGuides([b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x');
    expect(result.map((g) => g.value)).toEqual([0, 100, 200]);
    expect(result.every((g) => g.axis === 'x' && g.kind === 'edge-x')).toBe(true);
  });

  test('gap-x — 인접 pair midpoint와 itemIndices 오름차순을 반환한다', () => {
    const result = distributeGuides([b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'gap-x');
    expect(result.map((g) => g.value)).toEqual([75, 175]);
    expect(result[0].itemIndices).toEqual([0, 1]);
    expect(result[1].itemIndices).toEqual([1, 2]);
  });

  test('Into와 동일한 result ordering을 반환한다', () => {
    const bounds = [b(200, 0, 50, 50), b(100, 0, 50, 50), b(0, 0, 50, 50)];
    const expected: DistributionGuideResult[] = [];
    distributeGuidesInto(expected, bounds, 'edge-x');
    expect(distributeGuides(bounds, 'edge-x')).toEqual(expected);
  });

  test('호출마다 새 배열을 반환한다', () => {
    const bounds = [b(0, 0, 50, 50), b(200, 0, 50, 50)];
    expect(distributeGuides(bounds, 'edge-x')).not.toBe(distributeGuides(bounds, 'edge-x'));
  });

  test('호출마다 새 result object를 반환한다', () => {
    const bounds = [b(0, 0, 50, 50), b(200, 0, 50, 50)];
    const a = distributeGuides(bounds, 'edge-x');
    const c = distributeGuides(bounds, 'edge-x');
    expect(a[0]).not.toBe(c[0]);
    expect(a[0].itemIndices).not.toBe(c[0].itemIndices);
  });

  test('NaN/Infinity 좌표 bounds도 throw하지 않는다', () => {
    expect(() =>
      distributeGuides([b(Number.NaN, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'gap-x')
    ).not.toThrow();
  });

  test('Infinity / -Infinity 시작 좌표를 그대로 전파한다', () => {
    const result = distributeGuides(
      [b(Number.NEGATIVE_INFINITY, 0, 50, 50), b(100, 0, 50, 50), b(Number.POSITIVE_INFINITY, 0, 50, 50)],
      'edge-x'
    );
    const values = result.map((g) => g.value);
    expect(values).toContain(Number.NEGATIVE_INFINITY);
    expect(values).toContain(Number.POSITIVE_INFINITY);
  });

  test('degenerate bounds(width=0)도 edge guide를 산출한다', () => {
    const result = distributeGuides([b(0, 0, 0, 50), b(100, 0, 0, 50), b(200, 0, 0, 50)], 'edge-x');
    expect(result.map((g) => g.value)).toEqual([0, 100, 200]);
  });

  test('gap-x — Infinity 좌표를 midpoint로 그대로 전파한다', () => {
    const result = distributeGuides(
      [b(0, 0, 50, 50), b(100, 0, 50, 50), b(Number.POSITIVE_INFINITY, 0, 50, 50)],
      'gap-x'
    );
    // 마지막 pair midpoint = (150 + +Inf) * 0.5 = +Inf
    expect(result.map((g) => g.value)).toContain(Number.POSITIVE_INFINITY);
  });
});

// ---------------------------------------------------------------------------
// distributeEquallyInto
// ---------------------------------------------------------------------------

describe('distributeEquallyInto', () => {
  describe('빈 입력 / 3개 미만', () => {
    test('빈 배열이면 0을 반환하고 out을 비운다', () => {
      const out: DistributeTarget<XYObjectWritable>[] = [{ index: 99, point: { x: 0, y: 0 } }];
      const count = distributeEquallyInto(out, [], 'edge-x', makeXY);
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });

    test('1개 item이면 0을 반환하고 out을 비운다', () => {
      const out: DistributeTarget<XYObjectWritable>[] = [];
      const count = distributeEquallyInto(out, [b(0, 0, 50, 50)], 'edge-x', makeXY);
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });

    test('2개 item이면 0을 반환하고 out을 비운다', () => {
      const out: DistributeTarget<XYObjectWritable>[] = [];
      const count = distributeEquallyInto(out, [b(0, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x', makeXY);
      expect(count).toBe(0);
      expect(out).toHaveLength(0);
    });
  });

  describe('out 초기화', () => {
    test('호출 전 out에 있던 내용을 지운 뒤 기록한다', () => {
      const out: DistributeTarget<XYObjectWritable>[] = [{ index: 99, point: { x: 999, y: 999 } }];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x', makeXY);
      expect(out.every((t) => t.index !== 99)).toBe(true);
    });
  });

  describe('edge-x — 균등 분배', () => {
    test('3개 item — 중간 item의 target position을 산출한다', () => {
      // item0: x=0..50, item1: x=150..200, item2: x=200..250
      // edge-x 정렬 후: item0(x=0), item1(x=150), item2(x=200)
      // 양 끝: item0(index=0), item2(index=2) 고정
      // 균등 간격: (200 - 0) / 2 = 100 → 중간 item의 target min.x = 100
      const out: DistributeTarget<XYObjectWritable>[] = [];
      const count = distributeEquallyInto(
        out,
        [b(0, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)],
        'edge-x',
        makeXY
      );
      // 양 끝은 이동하지 않으므로 output에 포함되지 않는다
      expect(count).toBe(1);
      expect(out).toHaveLength(1);
      expect(out[0].index).toBe(1);
      expect(out[0].point.x).toBe(100);
      expect(out[0].point.y).toBe(0); // min.y는 변하지 않는다
    });

    test('이미 균등 분배된 3개 item — 중간 item target을 기록한다', () => {
      // item0: 0, item1: 100, item2: 200 — 이미 균등
      const out: DistributeTarget<XYObjectWritable>[] = [];
      const count = distributeEquallyInto(
        out,
        [b(0, 0, 50, 50), b(100, 0, 50, 50), b(200, 0, 50, 50)],
        'edge-x',
        makeXY
      );
      // 이미 위치가 올바르면 target을 기록할 필요가 없다
      // 정책: 이동이 필요한 item만 기록한다 (양 끝 item은 제외, 나머지도 현재 위치와 같으면 제외)
      // → 실제로는 중간 item도 기록한다 (이동 여부와 무관하게 양 끝 제외한 모든 item을 기록)
      // 정책 재확인: "양 끝 item은 이동하지 않는다" → 양 끝 item은 output에서 제외
      // 중간 item은 target position(이동 여부 무관)을 항상 기록한다
      expect(count).toBe(1);
      expect(out[0].point.x).toBe(100); // 이미 올바른 위치
    });

    test('5개 item — 양 끝 외 3개 item의 target을 기록한다', () => {
      // item0: x=0, item1: x=50, item2: x=100, item3: x=150, item4: x=400
      // edge-x 정렬 후: 0, 50, 100, 150, 400
      // step = (400 - 0) / 4 = 100
      // target: item1=100, item2=200, item3=300
      const out: DistributeTarget<XYObjectWritable>[] = [];
      const count = distributeEquallyInto(
        out,
        [b(0, 0, 30, 30), b(50, 0, 30, 30), b(100, 0, 30, 30), b(150, 0, 30, 30), b(400, 0, 30, 30)],
        'edge-x',
        makeXY
      );
      expect(count).toBe(3);
      const sorted = [...out].sort((a, b) => a.index - b.index);
      expect(sorted.map((t) => t.point.x)).toEqual([100, 200, 300]);
    });
  });

  describe('center-x — center 기준 균등 분배', () => {
    test('3개 item — center 기준 중간 item의 target을 산출한다', () => {
      // item0: 0..50 (center=25), item1: 150..200 (center=175), item2: 200..250 (center=225)
      // center 정렬 후: item0(25), item1(175), item2(225)
      // step = (225 - 25) / 2 = 100
      // 중간 center target = 25 + 100 = 125 → min.x = 125 - 25 = 100
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)], 'center-x', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].index).toBe(1);
      expect(out[0].point.x).toBe(100);
    });
  });

  describe('gap-x — gap 균등화', () => {
    test('3개 item — gap 균등화 후 중간 item의 target을 산출한다', () => {
      // item0: 0..50, item1: 150..200, item2: 300..350
      // gap0: 150-50=100, gap1: 300-200=100 → 이미 균등, 중간 item 변화 없음
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(150, 0, 50, 50), b(300, 0, 50, 50)], 'gap-x', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].point.x).toBe(150); // 이미 균등 → 현재 위치 그대로
    });

    test('3개 item — gap이 불균등할 때 중간 item을 이동한다', () => {
      // item0: 0..50, item1: 200..250, item2: 300..350
      // total gap available: (300 - 50) - 50 = 200 (from end of item0 to start of item2, minus item1 width)
      // equal gap = 200 / 2 = 100 → item1 target min.x = 50 + 100 = 150
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(200, 0, 50, 50), b(300, 0, 50, 50)], 'gap-x', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].point.x).toBe(150);
    });
  });

  describe('edge-y — y축 균등 분배', () => {
    test('3개 item — 중간 item의 y target을 산출한다', () => {
      // item0: y=0, item1: y=150, item2: y=200
      // step = (200 - 0) / 2 = 100 → 중간 item target min.y = 100
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(0, 150, 50, 50), b(0, 200, 50, 50)], 'edge-y', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].index).toBe(1);
      expect(out[0].point.y).toBe(100);
      expect(out[0].point.x).toBe(0); // x는 변하지 않는다
    });
  });

  describe('center-y', () => {
    test('3개 item — center-y 기준 중간 item의 target을 산출한다', () => {
      // item0: y=0..50 (center=25), item1: y=150..200 (center=175), item2: y=200..250 (center=225)
      // step = (225 - 25) / 2 = 100
      // 중간 center target = 25 + 100 = 125 → min.y = 125 - 25 = 100
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(0, 150, 50, 50), b(0, 200, 50, 50)], 'center-y', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].point.y).toBe(100);
    });
  });

  describe('gap-y', () => {
    test('3개 item — gap-y 균등화', () => {
      // item0: 0..50, item1: 200..250, item2: 300..350
      // total gap = (300 - 50) - 50 = 200, equal gap = 100 → item1 target.y = 50 + 100 = 150
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(0, 200, 50, 50), b(0, 300, 50, 50)], 'gap-y', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].point.y).toBe(150);
    });
  });

  describe('factory — caller-side point storage', () => {
    test('factory가 제공한 object에 좌표를 기록한다', () => {
      const created: XYObjectWritable[] = [];
      function trackingFactory(): XYObjectWritable {
        const pt = { x: 0, y: 0 };
        created.push(pt);
        return pt;
      }
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(0, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x', trackingFactory);
      expect(created).toHaveLength(1);
      expect(out[0].point).toBe(created[0]);
      expect(created[0].x).toBe(100);
    });
  });

  describe('ordering — distribute 축 시작 좌표 오름차순', () => {
    test('입력이 역순이어도 edge-x 기준 올바른 target을 기록한다', () => {
      // item0: x=200, item1: x=100, item2: x=0
      // 정렬 후: item2(x=0), item1(x=100), item0(x=200)
      // 양 끝 item2, item0은 고정, item1 target = (200-0)/2 = 100 → 변화 없음
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(200, 0, 50, 50), b(100, 0, 50, 50), b(0, 0, 50, 50)], 'edge-x', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].index).toBe(1);
      expect(out[0].point.x).toBe(100); // 이미 균등
    });

    test('역순 3개 item — 불균등 분배 시 올바른 target index를 기록한다', () => {
      // item0: x=300, item1: x=100, item2: x=0
      // 정렬 후: item2(x=0), item1(x=100), item0(x=300)
      // step = (300-0)/2 = 150 → item1 target min.x = 150
      const out: DistributeTarget<XYObjectWritable>[] = [];
      distributeEquallyInto(out, [b(300, 0, 50, 50), b(100, 0, 50, 50), b(0, 0, 50, 50)], 'edge-x', makeXY);
      expect(out).toHaveLength(1);
      expect(out[0].index).toBe(1); // 원본 배열 index
      expect(out[0].point.x).toBe(150);
    });
  });
});

// ---------------------------------------------------------------------------
// distributeEqually (companion)
// ---------------------------------------------------------------------------

describe('distributeEqually', () => {
  test('3개 미만 입력이면 새 빈 배열을 반환한다', () => {
    expect(distributeEqually([], 'edge-x')).toEqual([]);
    expect(distributeEqually([b(0, 0, 50, 50)], 'edge-x')).toEqual([]);
    expect(distributeEqually([b(0, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x')).toEqual([]);
  });

  test('edge-x — 중간 item target 1개를 반환한다', () => {
    const result = distributeEqually([b(0, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x');
    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(1);
    expect(result[0].point).toEqual({ x: 100, y: 0 });
  });

  test('각 point가 plain object다', () => {
    const result = distributeEqually([b(0, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x');
    for (const t of result) {
      expect(Object.getPrototypeOf(t.point)).toBe(Object.prototype);
    }
  });

  test('Into와 동일한 target index / 좌표를 반환한다', () => {
    const bounds = [b(0, 0, 30, 30), b(50, 0, 30, 30), b(100, 0, 30, 30), b(150, 0, 30, 30), b(400, 0, 30, 30)];
    const expected: DistributeTarget<XYObjectWritable>[] = [];
    distributeEquallyInto(expected, bounds, 'edge-x', makeXY);
    expect(distributeEqually(bounds, 'edge-x')).toEqual(expected);
  });

  test('호출마다 새 배열과 새 point object를 반환한다', () => {
    const bounds = [b(0, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)];
    const a = distributeEqually(bounds, 'edge-x');
    const c = distributeEqually(bounds, 'edge-x');
    expect(a).not.toBe(c);
    expect(a[0].point).not.toBe(c[0].point);
  });

  test('NaN/Infinity 좌표가 포함된 input도 throw하지 않는다', () => {
    expect(() =>
      distributeEqually([b(Number.NaN, 0, 50, 50), b(150, 0, 50, 50), b(200, 0, 50, 50)], 'edge-x')
    ).not.toThrow();
  });

  test('Infinity 좌표는 산술 결과(NaN 가능)를 그대로 전파하고 throw하지 않는다', () => {
    const result = distributeEqually(
      [b(Number.NEGATIVE_INFINITY, 0, 50, 50), b(150, 0, 50, 50), b(Number.POSITIVE_INFINITY, 0, 50, 50)],
      'edge-x'
    );
    expect(result).toHaveLength(1);
    // edgeStep = (+Inf - -Inf)/2 = +Inf, target = -Inf + Inf*1 = NaN
    expect(Number.isNaN(result[0].point.x)).toBe(true);
  });

  test('degenerate bounds(width=0)도 중간 item target을 산출한다', () => {
    const result = distributeEqually([b(0, 0, 0, 50), b(100, 0, 0, 50), b(200, 0, 0, 50)], 'edge-x');
    expect(result).toHaveLength(1);
    expect(result[0].point).toEqual({ x: 100, y: 0 });
  });
});
