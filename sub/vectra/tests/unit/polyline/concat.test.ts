/**
 * polyline concat collection helper unit test.
 *
 * concatInto/concat의 endpoint dedupe, weldTolerance, empty/single source, aliasing,
 * invalid tolerance, non-finite 좌표 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { concat } from '../../../src/polyline/concat';
import { concatInto } from '../../../src/polyline/concat-into';
import type { PolylineLike, XYObjectWritable } from '../../../src/types';

const SEG_A: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
};
const SEG_B: PolylineLike = {
  points: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],
};
const SEG_C: PolylineLike = {
  points: [
    { x: 5, y: 5 },
    { x: 6, y: 6 },
  ],
};

describe('polyline concat - concatInto', () => {
  test('받은 outPoints 자체를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    expect(concatInto(out, [SEG_A, SEG_C])).toBe(out);
  });

  test('빈 source collection이면 out을 clear하고 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
    ];
    const result = concatInto(out, []);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('empty polyline source는 point를 추가하지 않고 접합 endpoint도 바꾸지 않는다', () => {
    const out = concatInto([], [SEG_A, { points: [] }, SEG_C]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    ]);
  });

  test('empty source 사이에 둔 인접 source는 그 이전 endpoint와 접합 dedupe된다', () => {
    // empty source가 접합 endpoint를 바꾸지 않으므로 SEG_B는 SEG_A의 (1,0) endpoint와 dedupe된다.
    const out = concatInto([], [SEG_A, { points: [] }, SEG_B]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('empty source를 사이에 둔 접합도 weldTolerance를 동일하게 적용한다', () => {
    const near: PolylineLike = {
      points: [
        { x: 1.0005, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    const out = concatInto([], [SEG_A, { points: [] }, near], { weldTolerance: 0.001 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('거리가 weldTolerance와 정확히 같은 endpoint는 inclusive(<=)로 제거한다', () => {
    const exact: PolylineLike = {
      points: [
        { x: 1.25, y: 0 },
        { x: 3, y: 0 },
      ],
    };
    // (1,0)과 (1.25,0) 사이 거리 0.25 === weldTolerance 0.25.
    const out = concatInto([], [SEG_A, exact], { weldTolerance: 0.25 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  test('single-point source는 직전 output endpoint와 dedupe될 수 있다', () => {
    // single-point source의 점이 직전 endpoint와 같으면 제거된다.
    const out = concatInto([], [SEG_A, { points: [{ x: 1, y: 0 }] }, SEG_C]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    ]);
  });

  test('직전 endpoint와 다른 single-point source는 그대로 추가한다', () => {
    const out = concatInto([], [SEG_A, { points: [{ x: 9, y: 9 }] }]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 9, y: 9 },
    ]);
  });

  test('떨어진 open polyline은 source 순서대로 모든 point를 출력한다', () => {
    const out = concatInto([], [SEG_A, SEG_C]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    ]);
  });

  test('인접 endpoint exact equality는 기본값에서 두 번째 endpoint 1개를 제거한다', () => {
    const out = concatInto([], [SEG_A, SEG_B]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('같은 source 내부 repeated point는 유지한다', () => {
    const out = concatInto(
      [],
      [
        {
          points: [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
          ],
        },
      ]
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  test('연속 접합이 모두 같은 좌표면 endpoint를 하나만 남긴다', () => {
    const out = concatInto(
      [],
      [{ points: [{ x: 1, y: 1 }] }, { points: [{ x: 1, y: 1 }] }, { points: [{ x: 1, y: 1 }] }]
    );
    expect(out).toEqual([{ x: 1, y: 1 }]);
  });

  test('weldTolerance 양수는 near endpoint를 제거한다', () => {
    const near: PolylineLike = {
      points: [
        { x: 1.0005, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    const out = concatInto([], [SEG_A, near], { weldTolerance: 0.001 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('weldTolerance보다 먼 endpoint는 유지한다', () => {
    const far: PolylineLike = {
      points: [
        { x: 1.5, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    const out = concatInto([], [SEG_A, far], { weldTolerance: 0.001 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1.5, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('weldTolerance: 0은 exact equality만 제거한다', () => {
    const near: PolylineLike = {
      points: [
        { x: 1.0005, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    const out = concatInto([], [SEG_A, near], { weldTolerance: 0 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1.0005, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test.each([
    ['음수', -1],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('invalid weldTolerance(%s)는 RangeError를 던지고 out을 수정하지 않는다', (_label, tol) => {
    const out: XYObjectWritable[] = [{ x: 7, y: 7 }];
    expect(() => concatInto(out, [SEG_A, SEG_B], { weldTolerance: tol })).toThrow(RangeError);
    // out은 수정되지 않는다.
    expect(out).toEqual([{ x: 7, y: 7 }]);
  });

  test('tuple / object mixed point input을 새 object point로 출력한다', () => {
    const out = concatInto(
      [],
      [
        {
          points: [[0, 0], { x: 1, y: 0 }],
        },
        {
          points: [{ x: 1, y: 0 }, [2, 0]],
        },
      ]
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('outPoints와 source points 배열이 같아도 안전하다', () => {
    const sharedPoints: XYObjectWritable[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    const result = concatInto(sharedPoints, [{ points: sharedPoints }, SEG_C]);
    expect(result).toBe(sharedPoints);
    expect(sharedPoints).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    ]);
  });

  test('output point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 3, y: 4 };
    const out = concatInto([], [{ points: [pt] }]);
    expect(out[0]).toEqual({ x: 3, y: 4 });
    expect(out[0]).not.toBe(pt);
  });

  test('NaN endpoint는 exact / tolerance dedupe하지 않는다', () => {
    const nanSeg: PolylineLike = {
      points: [
        { x: Number.NaN, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    const prev: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: Number.NaN, y: 0 },
      ],
    };
    const out = concatInto([], [prev, nanSeg], { weldTolerance: 5 });
    // NaN !== NaN, hypot 결과 NaN이므로 접합 point를 제거하지 않는다.
    expect(out).toHaveLength(4);
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(Number.isNaN(out[2].x)).toBe(true);
    expect(out[3]).toEqual({ x: 2, y: 0 });
  });

  test('Infinity 좌표는 그대로 전파하고 finite endpoint와 dedupe하지 않는다', () => {
    const infSeg: PolylineLike = {
      points: [
        { x: Number.POSITIVE_INFINITY, y: 0 },
        { x: 2, y: Number.NEGATIVE_INFINITY },
      ],
    };
    const out = concatInto([], [SEG_A, infSeg], { weldTolerance: 1e9 });
    expect(out).toHaveLength(4);
    expect(out[2]).toEqual({ x: Number.POSITIVE_INFINITY, y: 0 });
    expect(out[3]).toEqual({ x: 2, y: Number.NEGATIVE_INFINITY });
  });

  test('weldTolerance: 0은 같은 Infinity endpoint를 exact equality로 제거한다', () => {
    const prev: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: Number.POSITIVE_INFINITY, y: 1 },
      ],
    };
    const next: PolylineLike = {
      points: [
        { x: Number.POSITIVE_INFINITY, y: 1 },
        { x: 2, y: 0 },
      ],
    };
    const out = concatInto([], [prev, next], { weldTolerance: 0 });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: Number.POSITIVE_INFINITY, y: 1 },
      { x: 2, y: 0 },
    ]);
  });
});

describe('polyline concat - concat', () => {
  test('새 배열을 반환한다', () => {
    expect(concat([SEG_A, SEG_B])).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    expect(concat([SEG_A, SEG_B])).not.toBe(concat([SEG_A, SEG_B]));
  });

  test('weldTolerance 옵션을 concatInto와 동일하게 적용한다', () => {
    const near: PolylineLike = {
      points: [
        { x: 1.0005, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    expect(concat([SEG_A, near], { weldTolerance: 0.001 })).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('invalid weldTolerance는 RangeError를 던진다', () => {
    expect(() => concat([SEG_A, SEG_B], { weldTolerance: -1 })).toThrow(RangeError);
  });
});
