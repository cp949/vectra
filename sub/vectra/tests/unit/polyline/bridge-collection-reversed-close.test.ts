/**
 * polyline reversed/close collection helper unit test.
 *
 * reversed/close point collection helper의 clear/push/aliasing/edge-case 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { close } from '../../../src/polyline/close';
import { closeInto } from '../../../src/polyline/close-into';
import { reversePointsInto } from '../../../src/polyline/reverse-points-into';
import { reversed } from '../../../src/polyline/reversed';
import { reversedInto } from '../../../src/polyline/reversed-into';
import type { PolylineLike, XYObjectWritable } from '../../../src/types';

const EMPTY: PolylineLike = { points: [] };
const TWO_PT: PolylineLike = {
  points: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
};
const THREE_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
    { x: 6, y: 8 },
  ],
};

describe('polyline bridge/collection - reversedInto', () => {
  test('받은 outPoints 자체를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    const result = reversedInto(out, TWO_PT);
    expect(result).toBe(out);
  });

  test('빈 polyline이면 out을 clear하고 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
    ];
    const result = reversedInto(out, EMPTY);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('object point input을 역순 새 object point로 출력한다', () => {
    const out: XYObjectWritable[] = [];
    reversedInto(out, THREE_PT);
    expect(out).toEqual([
      { x: 6, y: 8 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
    ]);
  });

  test('tuple point input을 역순 새 object point로 출력한다', () => {
    const polyTuple: PolylineLike = {
      points: [
        [1, 2],
        [3, 4],
      ],
    };
    const out: XYObjectWritable[] = [];
    reversedInto(out, polyTuple);
    expect(out).toEqual([
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });

  test('input/output 배열 aliasing에서도 좌표가 유지된다', () => {
    const sharedPoints: XYObjectWritable[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ];
    const poly: PolylineLike = { points: sharedPoints };
    reversedInto(sharedPoints, poly);
    expect(sharedPoints).toEqual([
      { x: 5, y: 6 },
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 1, y: 2 };
    const poly: PolylineLike = { points: [pt] };
    const out: XYObjectWritable[] = [];
    reversedInto(out, poly);
    expect(out[0]).not.toBe(pt);
  });

  test('기존 reversePointsInto와 결과가 같다', () => {
    const a = reversedInto([], THREE_PT);
    const b = reversePointsInto([], THREE_PT);
    expect(a).toEqual(b);
  });
});

describe('polyline bridge/collection - reversed', () => {
  test('새 배열을 반환한다', () => {
    const result = reversed(THREE_PT);
    expect(result).toEqual([
      { x: 6, y: 8 },
      { x: 3, y: 4 },
      { x: 0, y: 0 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    expect(reversed(TWO_PT)).not.toBe(reversed(TWO_PT));
  });
});

describe('polyline bridge/collection - closeInto', () => {
  test('받은 outPoints 자체를 반환한다', () => {
    const out: XYObjectWritable[] = [];
    expect(closeInto(out, TWO_PT)).toBe(out);
  });

  test('빈 polyline이면 out을 clear하고 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    closeInto(out, EMPTY);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 같은 좌표 2개를 기록한다', () => {
    const out: XYObjectWritable[] = [];
    closeInto(out, { points: [{ x: 5, y: 7 }] });
    expect(out).toEqual([
      { x: 5, y: 7 },
      { x: 5, y: 7 },
    ]);
    // 두 point는 서로 다른 새 object다.
    expect(out[0]).not.toBe(out[1]);
  });

  test('open two-point polyline은 마지막에 첫 점을 복제한다', () => {
    const out: XYObjectWritable[] = [];
    closeInto(out, TWO_PT);
    expect(out).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });

  test('open three-point polyline은 마지막에 첫 점을 복제한다', () => {
    const out: XYObjectWritable[] = [];
    closeInto(out, THREE_PT);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 6, y: 8 },
      { x: 0, y: 0 },
    ]);
  });

  test('이미 닫힌 polyline은 close point를 추가하지 않는다', () => {
    const closed: PolylineLike = {
      points: [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 6, y: 8 },
        { x: 0, y: 0 },
      ],
    };
    const out: XYObjectWritable[] = [];
    closeInto(out, closed);
    expect(out).toHaveLength(4);
    expect(out[3]).toEqual({ x: 0, y: 0 });
  });

  test('tuple point input을 새 object point로 출력한다', () => {
    const out: XYObjectWritable[] = [];
    closeInto(out, {
      points: [
        [1, 2],
        [3, 4],
      ],
    });
    expect(out).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });

  test('input/output 배열 aliasing에서도 좌표가 유지된다', () => {
    const sharedPoints: XYObjectWritable[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    closeInto(sharedPoints, { points: sharedPoints });
    expect(sharedPoints).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });
});

describe('polyline bridge/collection - close', () => {
  test('새 배열을 반환한다', () => {
    expect(close(TWO_PT)).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    expect(close(TWO_PT)).not.toBe(close(TWO_PT));
  });
});

describe('polyline bridge/collection - reversed/close non-finite 좌표 pass-through', () => {
  test('reversedInto는 NaN 좌표를 그대로 전파한다', () => {
    const out = reversedInto([], {
      points: [
        { x: Number.NaN, y: 0 },
        { x: 1, y: 2 },
      ],
    });
    expect(out[0]).toEqual({ x: 1, y: 2 });
    expect(Number.isNaN(out[1].x)).toBe(true);
    expect(out[1].y).toBe(0);
  });

  test('reversedInto는 Infinity / -Infinity 좌표를 그대로 전파한다', () => {
    const out = reversedInto([], {
      points: [
        { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
        { x: 1, y: 2 },
      ],
    });
    expect(out[1]).toEqual({ x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
  });

  test('reversePointsInto도 같은 writer라 non-finite 전파가 동일하다', () => {
    const a = reversePointsInto([], {
      points: [
        { x: Number.POSITIVE_INFINITY, y: 0 },
        { x: 1, y: 2 },
      ],
    });
    const b = reversedInto([], {
      points: [
        { x: Number.POSITIVE_INFINITY, y: 0 },
        { x: 1, y: 2 },
      ],
    });
    expect(a).toEqual(b);
  });

  test('reversed(companion)도 non-finite 좌표를 전파한다', () => {
    const out = reversed({
      points: [
        { x: Number.NaN, y: 0 },
        { x: 1, y: 2 },
      ],
    });
    expect(Number.isNaN(out[1].x)).toBe(true);
  });

  test('closeInto는 NaN 좌표를 그대로 전파한다', () => {
    const out = closeInto([], {
      points: [
        { x: Number.NaN, y: 1 },
        { x: 3, y: 4 },
      ],
    });
    expect(out).toHaveLength(3);
    expect(Number.isNaN(out[0].x)).toBe(true);
    expect(Number.isNaN(out[2].x)).toBe(true);
  });

  test('closeInto는 Infinity / -Infinity 좌표를 그대로 전파한다', () => {
    const out = closeInto([], {
      points: [
        { x: Number.POSITIVE_INFINITY, y: 0 },
        { x: 3, y: Number.NEGATIVE_INFINITY },
      ],
    });
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: Number.POSITIVE_INFINITY, y: 0 });
    expect(out[1]).toEqual({ x: 3, y: Number.NEGATIVE_INFINITY });
    expect(out[2]).toEqual({ x: Number.POSITIVE_INFINITY, y: 0 });
  });

  test('closeInto는 NaN 끝점을 closed로 보지 않고 close point를 추가한다', () => {
    // 첫 점과 끝점이 NaN으로 동일해 보여도 NaN !== NaN이라 exact equality가 성립하지 않는다.
    const out = closeInto([], {
      points: [
        { x: Number.NaN, y: 0 },
        { x: 3, y: 4 },
        { x: Number.NaN, y: 0 },
      ],
    });
    // closed로 판정했다면 length 3, 아니면 close point 1개 추가로 length 4.
    expect(out).toHaveLength(4);
    expect(Number.isNaN(out[3].x)).toBe(true);
  });
});
