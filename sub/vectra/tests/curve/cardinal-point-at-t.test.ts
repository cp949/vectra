/**
 * cardinalPointAtTInto와 companion cardinalPointAtT 테스트.
 * tension shorthand/options object 동치, clamp, closed curve, degenerate 입력을 다룬다.
 */
import { describe, expect, it } from 'vitest';
import { cardinalPointAtT } from '../../src/curve/cardinal-point-at-t';
import { cardinalPointAtTInto } from '../../src/curve/cardinal-point-at-t-into';
import { expectClose, expectPointClose } from './_cardinal-test-helpers';

const PTOL = 1e-14;

// open 직선 4점
const line4 = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
];

// closed 정사각형
const square = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

describe('cardinalPointAtTInto — open 직선 4점', () => {
  it('t=0은 첫 점 (0,0)을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, line4, 0);
    expectPointClose(out, 0, 0, PTOL);
  });

  it('t=1은 마지막 점 (3,0)을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, line4, 1);
    expectPointClose(out, 3, 0, PTOL);
  });

  it('t=0.5, tension=0은 직선 중간점 (1.5,0)을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, line4, 0.5, 0);
    expectPointClose(out, 1.5, 0, PTOL);
  });
});

describe('cardinalPointAtTInto — tension shorthand vs options', () => {
  it('tension number와 { tension } object 결과가 동일하다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 3 },
      { x: 4, y: 1 },
      { x: 5, y: 5 },
    ];
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    const out0 = { x: 0, y: 0 };
    cardinalPointAtTInto(out1, points, 0.3, 1);
    cardinalPointAtTInto(out2, points, 0.3, { tension: 1 });
    cardinalPointAtTInto(out0, points, 0.3, { tension: 0 });
    expectPointClose(out1, out2.x, out2.y, PTOL);
    // tension 0과 1 결과가 같지 않은지 확인 — shorthand가 실제로 다른 tension을 적용한다는 보장
    expect(Math.abs(out1.y - out0.y)).toBeGreaterThan(PTOL);
  });
});

describe('cardinalPointAtTInto — tension clamp', () => {
  it.each<[number, number]>([
    [-1, 0],
    [2, 1],
  ])('tension %f과 %f 결과가 같다 (clamp)', (t, ref) => {
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    cardinalPointAtTInto(out1, line4, 0.3, t);
    cardinalPointAtTInto(out2, line4, 0.3, ref);
    expectPointClose(out1, out2.x, out2.y, PTOL);
  });
});

describe('cardinalPointAtTInto — closed curve', () => {
  it('t=0은 첫 점 (0,0)을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, square, 0, { tension: 0, closed: true });
    expectPointClose(out, 0, 0, PTOL);
  });

  it('t=1은 t=0과 동일하다 (loop 닫힘)', () => {
    const out0 = { x: 0, y: 0 };
    const out1 = { x: 0, y: 0 };
    cardinalPointAtTInto(out0, square, 0, { tension: 0, closed: true });
    cardinalPointAtTInto(out1, square, 1, { tension: 0, closed: true });
    expectPointClose(out1, out0.x, out0.y, PTOL);
  });

  it('t=0.25, tension=0은 points[1]=(1,0)을 정확히 반환한다', () => {
    // raw = 0.25*4 = 1.0, floor=1, localT=0 → segment[1] 시작점
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, square, 0.25, { tension: 0, closed: true });
    expectPointClose(out, 1, 0, PTOL);
  });

  it('closed t=0.25와 open t=0.25는 다르다', () => {
    // open: raw=0.25*3=0.75, segIndex=0, localT=0.75
    const outClosed = { x: 0, y: 0 };
    const outOpen = { x: 0, y: 0 };
    cardinalPointAtTInto(outClosed, square, 0.25, { tension: 0, closed: true });
    cardinalPointAtTInto(outOpen, square, 0.25, { tension: 0, closed: false });
    expect(outClosed).not.toEqual(outOpen);
  });
});

describe('cardinalPointAtTInto — degenerate', () => {
  it('n=0 open은 (0,0)을 반환한다', () => {
    const out = { x: 99, y: 99 };
    cardinalPointAtTInto(out, [], 0.5);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  it('n=1 open은 그 점을 그대로 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, [{ x: 5, y: 7 }], 0.5);
    expectPointClose(out, 5, 7, PTOL);
  });

  it('n=2 open, t=0.5, tension=0은 두 점의 중간점을 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ],
      0.5,
      0
    );
    expectPointClose(out, 1, 0, PTOL);
  });

  it('n=0 closed는 (0,0)을 반환한다', () => {
    const out = { x: 99, y: 99 };
    cardinalPointAtTInto(out, [], 0.5, { closed: true });
    expect(out).toEqual({ x: 0, y: 0 });
  });

  it('n=1 closed는 그 점을 그대로 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, [{ x: 3, y: 4 }], 0.5, { closed: true });
    expectPointClose(out, 3, 4, PTOL);
  });
});

describe('cardinalPointAtTInto — out 반환', () => {
  it('전달한 out을 그대로 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(cardinalPointAtTInto(out, line4, 0.5)).toBe(out);
  });
});

describe('cardinalPointAtT — companion 일치', () => {
  it('cardinalPointAtTInto와 동일한 결과를 반환한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, line4, 0.4, 0.5);
    const result = cardinalPointAtT(line4, 0.4, 0.5);
    expectPointClose(result, out.x, out.y, PTOL);
  });

  it('호출마다 새 object를 반환한다', () => {
    const a = cardinalPointAtT(line4, 0.4, 0.5);
    const b = cardinalPointAtT(line4, 0.4, 0.5);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('degenerate n=0은 (0,0)을 반환한다', () => {
    const result = cardinalPointAtT([], 0.5);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('closed curve t=0.5도 Into와 일치한다', () => {
    const out = { x: 0, y: 0 };
    cardinalPointAtTInto(out, square, 0.5, { tension: 0, closed: true });
    const result = cardinalPointAtT(square, 0.5, { tension: 0, closed: true });
    expectClose(result.x, out.x, PTOL);
    expectClose(result.y, out.y, PTOL);
  });
});
