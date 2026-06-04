/**
 * controlPointsInto unit test.
 *
 * 검증 방법:
 * - open edge clamp: 첫 점은 previous === current, 마지막 점은 next === current, nextNext === next.
 * - closed edge: 첫 점과 마지막 점에서 modulo wrapping.
 * - single point는 네 field 모두 같은 점.
 * - empty input은 false 반환 + out 미수정.
 * - NaN / Infinity / -Infinity / 음수 / 비정수 / index >= length는 RangeError.
 * - tuple input과 object input을 모두 읽고, tuple output과 object output에 모두 기록한다.
 * - input/output aliasing이 안전하다(쓰기 전 좌표를 모두 읽는다).
 * - non-finite 좌표는 NaN / Infinity / -Infinity / -0를 pass through한다.
 */

import { describe, expect, it } from 'vitest';
import { controlPointsInto } from '../../../src/curve/control-points-into';
import type { CurveControlPointsWritable, XYInput, XYObjectWritable, XYTupleWritable } from '../../../src/types';

const PTS: XYInput[] = [
  { x: 0, y: 0 },
  { x: 10, y: 5 },
  { x: 20, y: 0 },
  { x: 30, y: 5 },
];

function makeObjectOut(): CurveControlPointsWritable<XYObjectWritable> {
  return {
    previous: { x: -1, y: -1 },
    current: { x: -1, y: -1 },
    next: { x: -1, y: -1 },
    nextNext: { x: -1, y: -1 },
  };
}

describe('controlPointsInto', () => {
  it('open 첫 점은 previous === current, next/nextNext가 이어진다', () => {
    const out = makeObjectOut();
    expect(controlPointsInto(out, PTS, 0)).toBe(true);
    expect(out.previous).toEqual({ x: 0, y: 0 });
    expect(out.current).toEqual({ x: 0, y: 0 });
    expect(out.next).toEqual({ x: 10, y: 5 });
    expect(out.nextNext).toEqual({ x: 20, y: 0 });
  });

  it('open 중간 점은 네 이웃이 순서대로 기록된다', () => {
    const out = makeObjectOut();
    controlPointsInto(out, PTS, 1);
    expect(out.previous).toEqual({ x: 0, y: 0 });
    expect(out.current).toEqual({ x: 10, y: 5 });
    expect(out.next).toEqual({ x: 20, y: 0 });
    expect(out.nextNext).toEqual({ x: 30, y: 5 });
  });

  it('open 마지막 점은 next === current, nextNext === next', () => {
    const out = makeObjectOut();
    controlPointsInto(out, PTS, 3);
    expect(out.previous).toEqual({ x: 20, y: 0 });
    expect(out.current).toEqual({ x: 30, y: 5 });
    expect(out.next).toEqual({ x: 30, y: 5 });
    expect(out.nextNext).toEqual({ x: 30, y: 5 });
  });

  it('open second-to-last는 nextNext === next로 clamp된다', () => {
    const out = makeObjectOut();
    controlPointsInto(out, PTS, 2);
    expect(out.previous).toEqual({ x: 10, y: 5 });
    expect(out.current).toEqual({ x: 20, y: 0 });
    expect(out.next).toEqual({ x: 30, y: 5 });
    expect(out.nextNext).toEqual({ x: 30, y: 5 });
  });

  it('closed 첫 점은 previous가 마지막 점으로 wrapping된다', () => {
    const out = makeObjectOut();
    controlPointsInto(out, PTS, 0, { closed: true });
    expect(out.previous).toEqual({ x: 30, y: 5 });
    expect(out.current).toEqual({ x: 0, y: 0 });
    expect(out.next).toEqual({ x: 10, y: 5 });
    expect(out.nextNext).toEqual({ x: 20, y: 0 });
  });

  it('closed 마지막 점은 next/nextNext가 앞으로 wrapping된다', () => {
    const out = makeObjectOut();
    controlPointsInto(out, PTS, 3, { closed: true });
    expect(out.previous).toEqual({ x: 20, y: 0 });
    expect(out.current).toEqual({ x: 30, y: 5 });
    expect(out.next).toEqual({ x: 0, y: 0 });
    expect(out.nextNext).toEqual({ x: 10, y: 5 });
  });

  it('single point open은 네 field 모두 같은 점이다', () => {
    const out = makeObjectOut();
    controlPointsInto(out, [{ x: 7, y: 9 }], 0);
    expect(out.previous).toEqual({ x: 7, y: 9 });
    expect(out.current).toEqual({ x: 7, y: 9 });
    expect(out.next).toEqual({ x: 7, y: 9 });
    expect(out.nextNext).toEqual({ x: 7, y: 9 });
  });

  it('single point closed도 네 field 모두 같은 점이다', () => {
    const out = makeObjectOut();
    controlPointsInto(out, [{ x: 7, y: 9 }], 0, { closed: true });
    expect(out.previous).toEqual({ x: 7, y: 9 });
    expect(out.current).toEqual({ x: 7, y: 9 });
    expect(out.next).toEqual({ x: 7, y: 9 });
    expect(out.nextNext).toEqual({ x: 7, y: 9 });
  });

  it('empty input은 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makeObjectOut();
    expect(controlPointsInto(out, [], 0)).toBe(false);
    expect(out).toEqual(makeObjectOut());
  });

  it.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
    ['음수', -1],
    ['비정수', 1.5],
    ['index === length', PTS.length],
    ['index > length', PTS.length + 3],
  ])('invalid index(%s)는 RangeError를 던진다', (_label, index) => {
    const out = makeObjectOut();
    expect(() => controlPointsInto(out, PTS, index)).toThrow(RangeError);
  });

  it('tuple input을 읽는다', () => {
    const tuplePts: XYInput[] = [
      [0, 0],
      [10, 5],
      [20, 0],
    ];
    const out = makeObjectOut();
    controlPointsInto(out, tuplePts, 1);
    expect(out.previous).toEqual({ x: 0, y: 0 });
    expect(out.current).toEqual({ x: 10, y: 5 });
    expect(out.next).toEqual({ x: 20, y: 0 });
    expect(out.nextNext).toEqual({ x: 20, y: 0 });
  });

  it('tuple output에 기록한다', () => {
    const out: CurveControlPointsWritable<XYTupleWritable> = {
      previous: [0, 0],
      current: [0, 0],
      next: [0, 0],
      nextNext: [0, 0],
    };
    controlPointsInto(out, PTS, 1);
    expect(out.previous).toEqual([0, 0]);
    expect(out.current).toEqual([10, 5]);
    expect(out.next).toEqual([20, 0]);
    expect(out.nextNext).toEqual([30, 5]);
  });

  it('input/output aliasing이 안전하다(쓰기 전 좌표를 모두 읽는다)', () => {
    const a = { x: 1, y: 1 };
    const b = { x: 2, y: 2 };
    const c = { x: 3, y: 3 };
    const pts = [a, b, c];
    // out.previous가 points[2](=c)를 alias한다. previous에 쓰기 전 next/nextNext가 c를 읽어야 한다.
    const out: CurveControlPointsWritable<XYObjectWritable> = {
      previous: c,
      current: { x: 0, y: 0 },
      next: { x: 0, y: 0 },
      nextNext: { x: 0, y: 0 },
    };
    controlPointsInto(out, pts, 1);
    expect(out.previous).toEqual({ x: 1, y: 1 });
    expect(out.current).toEqual({ x: 2, y: 2 });
    expect(out.next).toEqual({ x: 3, y: 3 });
    expect(out.nextNext).toEqual({ x: 3, y: 3 });
  });

  it.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('non-finite 좌표(%s)를 네 write 경로로 pass through하고 index 매핑을 유지한다', (_label, value) => {
    const out = makeObjectOut();
    // index 1에서 previous/current/next/nextNext가 서로 다른 점을 읽는다.
    // finite 좌표(100/200/300/400)로 매핑을, non-finite 좌표로 pass-through를 동시에 검증한다.
    controlPointsInto(
      out,
      [
        { x: value, y: 100 },
        { x: 200, y: value },
        { x: value, y: 300 },
        { x: 400, y: value },
      ],
      1
    );
    expect(out.previous).toEqual({ x: value, y: 100 });
    expect(out.current).toEqual({ x: 200, y: value });
    expect(out.next).toEqual({ x: value, y: 300 });
    expect(out.nextNext).toEqual({ x: 400, y: value });
  });

  it('-0 좌표를 current/next write 경로에서 그대로 pass through한다', () => {
    const out = makeObjectOut();
    controlPointsInto(
      out,
      [
        { x: 1, y: 1 },
        { x: -0, y: -0 },
        { x: -0, y: -0 },
      ],
      1
    );
    expect(Object.is(out.current.x, -0)).toBe(true);
    expect(Object.is(out.current.y, -0)).toBe(true);
    expect(Object.is(out.next.x, -0)).toBe(true);
    expect(Object.is(out.next.y, -0)).toBe(true);
  });

  it('성공 시 true를 반환한다', () => {
    const out = makeObjectOut();
    expect(controlPointsInto(out, PTS, 2, { closed: true })).toBe(true);
  });
});
