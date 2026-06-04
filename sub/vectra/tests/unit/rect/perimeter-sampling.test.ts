/**
 * perimeterPointInto / perimeterPoint / perimeterPointsInto / perimeterPoints 통합 테스트.
 *
 * 테스트 커버리지:
 *  - 정상 sampling (count, step 옵션)
 *  - wrap 옵션 (true/false 기본값 포함)
 *  - empty rect 동작
 *  - NaN / Infinity / -Infinity 입력 전파
 *  - RangeError 조건 (count/step 위반)
 *  - companion 위임 및 독립 array 반환
 */

import { describe, expect, test } from 'vitest';
import { perimeterPoint } from '../../../src/rect/perimeter-point';
import { perimeterPointInto } from '../../../src/rect/perimeter-point-into';
import { perimeterPoints } from '../../../src/rect/perimeter-points';
import { perimeterPointsInto } from '../../../src/rect/perimeter-points-into';

// 정사각형 rect (10×10): perimeter = 40. 각 edge 10씩.
// t=0.0 → topLeft  (0,0)
// t=0.25 → topRight (10,0)
// t=0.5  → bottomRight (10,10)
// t=0.75 → bottomLeft (0,10)
// t=1.0  → topLeft (폐곡선 종점, wrap=true이면 topLeft 반환)
const square = { x: 0, y: 0, width: 10, height: 10 };

// 직사각형 rect (20×10): perimeter = 60.
// edge lengths: top=20, right=10, bottom=20, left=10.
// t=0       → (0,0)
// t=20/60   → (20,0) = topRight
// t=30/60   → (20,10) = bottomRight
// t=50/60   → (0,10) = bottomLeft
const rect2 = { x: 0, y: 0, width: 20, height: 10 };

// 오프셋 rect
const offsetRect = { x: 5, y: 3, width: 10, height: 10 };

// 빈 rect
const emptyRectZero = { x: 2, y: 7, width: 0, height: 4 };
const emptyRectNeg = { x: 1, y: 2, width: -5, height: 3 };

// tuple 형태
const squareTuple = [0, 0, 10, 10] as const;

// --------------------------------------------------------------------------

describe('perimeterPointInto — 정상 sampling (square, wrap=true 기본값)', () => {
  test('t=0: topLeft 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('t=0.25: topRight 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.25);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(0);
  });

  test('t=0.5: bottomRight 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.5);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(10);
  });

  test('t=0.75: bottomLeft 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.75);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(10);
  });

  test('t=1.0: wrap=true이면 topLeft 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 1.0);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('t=1.25: wrap=true이면 t=0.25와 동일 (topRight)', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 1.25);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(0);
  });

  test('t=-0.25: wrap=true이면 t=0.75와 동일 (bottomLeft)', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, -0.25);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(10);
  });

  test('t=0.125: top edge 중간 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.125);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('t=0.375: right edge 중간 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.375);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(5);
  });

  test('t=0.625: bottom edge 중간 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.625);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(10);
  });

  test('t=0.875: left edge 중간 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.875);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(5);
  });
});

describe('perimeterPointInto — 직사각형 sampling', () => {
  test('t=20/60: topRight 정확히 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, rect2, 20 / 60);
    expect(out.x).toBeCloseTo(20);
    expect(out.y).toBeCloseTo(0);
  });

  test('t=30/60: bottomRight 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, rect2, 30 / 60);
    expect(out.x).toBeCloseTo(20);
    expect(out.y).toBeCloseTo(10);
  });

  test('t=50/60: bottomLeft 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, rect2, 50 / 60);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(10);
  });

  test('t=10/60: top edge 중간 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, rect2, 10 / 60);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(0);
  });

  test('t=25/60: right edge 중간 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, rect2, 25 / 60);
    expect(out.x).toBeCloseTo(20);
    expect(out.y).toBeCloseTo(5);
  });
});

describe('perimeterPointInto — 오프셋 rect', () => {
  test('t=0: x,y raw 좌표 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, offsetRect, 0);
    expect(out).toEqual({ x: 5, y: 3 });
  });

  test('t=0.25: topRight 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, offsetRect, 0.25);
    expect(out.x).toBeCloseTo(15);
    expect(out.y).toBeCloseTo(3);
  });
});

describe('perimeterPointInto — tuple input', () => {
  test('tuple 형태 RectLike를 정상 처리한다', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, squareTuple, 0.25);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(0);
  });
});

describe('perimeterPointInto — XYTupleWritable out', () => {
  test('tuple out에도 좌표를 기록한다', () => {
    const out: [number, number] = [0, 0];
    perimeterPointInto(out, square, 0.25);
    expect(out[0]).toBeCloseTo(10);
    expect(out[1]).toBeCloseTo(0);
  });

  test('반환값이 out과 동일한 reference이다', () => {
    const out: [number, number] = [0, 0];
    const ret = perimeterPointInto(out, square, 0.25);
    expect(ret).toBe(out);
  });
});

describe('perimeterPointInto — wrap 옵션', () => {
  test('wrap: false, t=0.5: 정상 계산', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.5, { wrap: false });
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(10);
  });

  test('wrap: false, t<0: topLeft로 clamp', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, -1, { wrap: false });
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('wrap: false, t>1: topLeft (폐곡선 종점) clamp', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 2, { wrap: false });
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('wrap: false, t=1: topLeft (폐곡선 종점) 반환', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 1, { wrap: false });
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('wrap: true (명시), t=1.5: t=0.5와 동일', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 1.5, { wrap: true });
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(10);
  });
});

describe('perimeterPointInto — NaN / Infinity 전파', () => {
  test('t=NaN: NaN이 out에 전파된다', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, Number.NaN);
    expect(Number.isNaN(out.x) || Number.isNaN(out.y)).toBe(true);
  });

  test('wrap: false, t=NaN: NaN을 숫자로 바꾸지 않는다', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, Number.NaN, { wrap: false });
    expect(Number.isNaN(out.x) || Number.isNaN(out.y)).toBe(true);
  });

  test('t=Infinity: Infinity 전파 (연산 결과가 finite가 아님)', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, Infinity);
    // Infinity - Math.floor(Infinity)는 NaN, 결과는 NaN이거나 비유한 값
    expect(Number.isFinite(out.x) && Number.isFinite(out.y)).toBe(false);
  });

  test('t=-Infinity: -Infinity 전파', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, -Infinity);
    expect(Number.isFinite(out.x) && Number.isFinite(out.y)).toBe(false);
  });
});

describe('perimeterPointInto — empty rect', () => {
  test('width=0: out에 topLeft raw 좌표 기록', () => {
    const out = { x: 99, y: 99 };
    perimeterPointInto(out, emptyRectZero, 0.5);
    expect(out.x).toBe(2);
    expect(out.y).toBe(7);
  });

  test('width<0: out에 topLeft raw 좌표 기록', () => {
    const out = { x: 99, y: 99 };
    perimeterPointInto(out, emptyRectNeg, 0.5);
    expect(out.x).toBe(1);
    expect(out.y).toBe(2);
  });

  test('반환값이 out과 동일 reference이다', () => {
    const out = { x: 0, y: 0 };
    const ret = perimeterPointInto(out, emptyRectZero, 0.5);
    expect(ret).toBe(out);
  });
});

// --------------------------------------------------------------------------

describe('perimeterPoint — companion', () => {
  test('perimeterPointInto와 동일한 결과를 반환한다', () => {
    const out = { x: 0, y: 0 };
    perimeterPointInto(out, square, 0.375);
    expect(perimeterPoint(square, 0.375)).toEqual(out);
  });

  test('새 object를 반환한다', () => {
    const r1 = perimeterPoint(square, 0.25);
    const r2 = perimeterPoint(square, 0.25);
    expect(r1).not.toBe(r2);
  });

  test('wrap 옵션을 그대로 위임한다', () => {
    const r1 = perimeterPoint(square, 2, { wrap: false });
    const r2 = perimeterPointInto({ x: 0, y: 0 }, square, 2, { wrap: false });
    expect(r1).toEqual(r2);
  });

  test('empty rect: topLeft raw 좌표를 담은 object 반환', () => {
    const result = perimeterPoint(emptyRectZero, 0.5);
    expect(result).toEqual({ x: 2, y: 7 });
  });

  test('NaN 전파: x 또는 y가 NaN이다', () => {
    const result = perimeterPoint(square, Number.NaN);
    expect(Number.isNaN(result.x) || Number.isNaN(result.y)).toBe(true);
  });

  test('input rect가 mutation되지 않는다', () => {
    const input = { x: 5, y: 3, width: 10, height: 10 };
    perimeterPoint(input, 0.5);
    expect(input).toEqual({ x: 5, y: 3, width: 10, height: 10 });
  });
});

// --------------------------------------------------------------------------

describe('perimeterPointsInto — count 옵션', () => {
  test('count=4: 정사각형에서 4 corner를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { count: 4 });
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: 0, y: 0 }); // t=0/4=0
    expect(out[1].x).toBeCloseTo(10);
    expect(out[1].y).toBeCloseTo(0); // t=1/4=0.25
    expect(out[2].x).toBeCloseTo(10);
    expect(out[2].y).toBeCloseTo(10); // t=2/4=0.5
    expect(out[3].x).toBeCloseTo(0);
    expect(out[3].y).toBeCloseTo(10); // t=3/4=0.75
  });

  test('count=1: t=0만 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { count: 1 });
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });

  test('count=8: 8개 point를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { count: 8 });
    expect(out).toHaveLength(8);
    // t=0/8=0 → (0,0)
    expect(out[0]).toEqual({ x: 0, y: 0 });
    // t=2/8=0.25 → (10,0)
    expect(out[2].x).toBeCloseTo(10);
    expect(out[2].y).toBeCloseTo(0);
  });

  test('out.length=0 후 새 object를 push한다 (기존 내용을 덮어쓴다)', () => {
    const old = { x: 999, y: 999 };
    const out: { x: number; y: number }[] = [old];
    perimeterPointsInto(out, square, { count: 2 });
    expect(out).toHaveLength(2);
    expect(out[0]).not.toBe(old);
  });

  test('count=0이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { count: 0 })).toThrow(RangeError);
  });

  test('count=-1이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { count: -1 })).toThrow(RangeError);
  });

  test('count=1.5이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { count: 1.5 })).toThrow(RangeError);
  });

  test('count=NaN이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { count: Number.NaN })).toThrow(RangeError);
  });
});

describe('perimeterPointsInto — step 옵션', () => {
  // square: perimeter=40. step=10 → dist=0,10,20,30 → 4 points
  test('step=10 (square perimeter=40): 4개 point 반환', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { step: 10 });
    expect(out).toHaveLength(4);
    // dist=0 → t=0 → (0,0)
    expect(out[0]).toEqual({ x: 0, y: 0 });
    // dist=10 → t=0.25 → (10,0)
    expect(out[1].x).toBeCloseTo(10);
    expect(out[1].y).toBeCloseTo(0);
    // dist=20 → t=0.5 → (10,10)
    expect(out[2].x).toBeCloseTo(10);
    expect(out[2].y).toBeCloseTo(10);
    // dist=30 → t=0.75 → (0,10)
    expect(out[3].x).toBeCloseTo(0);
    expect(out[3].y).toBeCloseTo(10);
  });

  test('step=20 (square perimeter=40): 2개 point 반환', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { step: 20 });
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1].x).toBeCloseTo(10);
    expect(out[1].y).toBeCloseTo(10);
  });

  test('step=50 (square perimeter=40): step > perimeter이면 1개 point', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { step: 50 });
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual({ x: 0, y: 0 });
  });

  test('step=5 (square perimeter=40): 8개 point 반환', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { step: 5 });
    expect(out).toHaveLength(8);
  });

  test('step=0이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { step: 0 })).toThrow(RangeError);
  });

  test('step=-1이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { step: -1 })).toThrow(RangeError);
  });

  test('step=NaN이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { step: Number.NaN })).toThrow(RangeError);
  });

  test('step=Infinity이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, square, { step: Infinity })).toThrow(RangeError);
  });

  test('step=1 절대 거리: 사각형 40개 점', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { step: 1 });
    expect(out).toHaveLength(40);
  });
});

describe('perimeterPointsInto — empty rect', () => {
  test('empty rect (width=0): out이 비어있다', () => {
    const out: { x: number; y: number }[] = [{ x: 1, y: 2 }];
    perimeterPointsInto(out, emptyRectZero, { count: 4 });
    expect(out).toHaveLength(0);
  });

  test('empty rect (width<0): out이 비어있다', () => {
    const out: { x: number; y: number }[] = [{ x: 1, y: 2 }];
    perimeterPointsInto(out, emptyRectNeg, { count: 4 });
    expect(out).toHaveLength(0);
  });

  test('empty rect, step 옵션: out이 비어있다', () => {
    const out: { x: number; y: number }[] = [{ x: 1, y: 2 }];
    perimeterPointsInto(out, emptyRectZero, { step: 5 });
    expect(out).toHaveLength(0);
  });

  test('empty rect에서도 invalid count는 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, emptyRectZero, { count: 0 })).toThrow(RangeError);
  });

  test('empty rect에서도 invalid step은 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => perimeterPointsInto(out, emptyRectZero, { step: 0 })).toThrow(RangeError);
  });
});

describe('perimeterPointsInto — wrap 옵션', () => {
  test('count 모드는 wrap 옵션을 perimeterPointInto에 위임한다', () => {
    const out1: { x: number; y: number }[] = [];
    const out2: { x: number; y: number }[] = [];
    perimeterPointsInto(out1, square, { count: 4, wrap: true });
    perimeterPointsInto(out2, square, { count: 4, wrap: false });
    // count 모드에서 t = i/count는 항상 [0,1) 범위이므로 wrap 차이가 없다
    expect(out1).toEqual(out2);
  });
});

// --------------------------------------------------------------------------

describe('perimeterPoints — companion', () => {
  test('count 옵션: perimeterPointsInto와 동일한 결과를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { count: 4 });
    expect(perimeterPoints(square, { count: 4 })).toEqual(out);
  });

  test('step 옵션: perimeterPointsInto와 동일한 결과를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    perimeterPointsInto(out, square, { step: 10 });
    expect(perimeterPoints(square, { step: 10 })).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const r1 = perimeterPoints(square, { count: 4 });
    const r2 = perimeterPoints(square, { count: 4 });
    expect(r1).not.toBe(r2);
  });

  test('empty rect: 빈 배열을 반환한다', () => {
    expect(perimeterPoints(emptyRectZero, { count: 4 })).toEqual([]);
  });

  test('invalid count: RangeError를 던진다', () => {
    expect(() => perimeterPoints(square, { count: 0 })).toThrow(RangeError);
  });

  test('invalid step: RangeError를 던진다', () => {
    expect(() => perimeterPoints(square, { step: 0 })).toThrow(RangeError);
  });

  test('input rect가 mutation되지 않는다', () => {
    const input = { x: 0, y: 0, width: 10, height: 10 };
    perimeterPoints(input, { count: 4 });
    expect(input).toEqual({ x: 0, y: 0, width: 10, height: 10 });
  });
});
