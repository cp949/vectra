/** 점 모음 피팅의 계산 결과와 실패 조건을 검증한다. */
import { describe, expect, test } from 'vitest';
import { fitMinimumAreaRect } from '../../../src/fitting/fit-minimum-area-rect';
import { fitMinimumAreaRectInto } from '../../../src/fitting/fit-minimum-area-rect-into';

const NON_FINITE = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

/** 피팅 결과를 기록할 초기 출력 객체를 만든다. */
function createOut() {
  return { cx: 0, cy: 0, width: 0, height: 0, angle: 0 };
}

describe('fitMinimumAreaRectInto', () => {
  test('axis-aligned rectangle는 center/size/angle을 그대로 복원한다', () => {
    const out = createOut();
    const result = fitMinimumAreaRectInto(out, [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(result).toBe(out);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(0.5);
    expect(out.width).toBe(2);
    expect(out.height).toBe(1);
    expect(out.angle).toBe(0);
  });

  test('내부 point와 duplicate point는 결과에 영향을 주지 않는다', () => {
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 0.5 },
      { x: 0, y: 0 },
      { x: 2, y: 1 },
    ]);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(0.5);
    expect(out.width).toBe(2);
    expect(out.height).toBe(1);
    expect(out.angle).toBe(0);
  });

  test('rotated rectangle는 minimal-area oriented rect를 복원한다', () => {
    // u=(0.8, 0.6), perp=(-0.6, 0.8), center (0,0), half-extent 2(along u), 1(perp). area 8.
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      { x: 1.0, y: 2.0 },
      { x: 2.2, y: 0.4 },
      { x: -2.2, y: -0.4 },
      { x: -1.0, y: -2.0 },
    ]);
    // 4개 edge 모두 area 8 동률이며 float noise가 tie를 결정한다. 선택은 길이축(0.8,0.6) edge다.
    expect(out.cx).toBeCloseTo(0, 12);
    expect(out.cy).toBeCloseTo(0, 12);
    expect(out.width * out.height).toBeCloseTo(8, 12);
    expect([out.width, out.height].sort((a, b) => a - b)).toEqual([expect.closeTo(2, 12), expect.closeTo(4, 12)]);
    expect(out.width).toBeCloseTo(4, 12);
    expect(out.height).toBeCloseTo(2, 12);
    expect(out.angle).toBeCloseTo(Math.atan2(0.6, 0.8), 12);
  });

  test('square의 tie-break는 먼저 발견한 hull edge(angle 0)를 유지한다', () => {
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(out.cx).toBe(0.5);
    expect(out.cy).toBe(0.5);
    expect(out.width).toBe(1);
    expect(out.height).toBe(1);
    expect(out.angle).toBe(0);
  });

  test('정확히 3개 unique non-collinear point(삼각형)는 양수 size oriented rect를 만든다', () => {
    const out = createOut();
    const result = fitMinimumAreaRectInto(out, [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
    expect(result).toBe(out);
    expect(out.width).toBeGreaterThan(0);
    expect(out.height).toBeGreaterThan(0);
    expect(Number.isFinite(out.cx)).toBe(true);
    expect(Number.isFinite(out.cy)).toBe(true);
    expect(Number.isFinite(out.angle)).toBe(true);
  });

  test('unique point가 3 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(out, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('duplicate 제거 후 unique point가 3 미만이면 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(out, [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('collinear point set은 false이고 out을 수정하지 않는다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(out, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ])
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test('큰 epsilon은 얇은 rectangle을 degenerate로 실패 처리한다', () => {
    const out = createOut();
    expect(
      fitMinimumAreaRectInto(
        out,
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 0.001 },
          { x: 0, y: 0.001 },
        ],
        { epsilon: 0.01 }
      )
    ).toBe(false);
    expect(out).toEqual(createOut());
  });

  test.each(NON_FINITE)('non-finite point x 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitMinimumAreaRectInto(out, [
        { x: bad, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 },
      ])
    ).toThrow(RangeError);
  });

  test.each(NON_FINITE)('non-finite point y 좌표 %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitMinimumAreaRectInto(out, [
        { x: 0, y: bad },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 },
      ])
    ).toThrow(RangeError);
  });

  test.each([...NON_FINITE, -1])('invalid epsilon %p는 RangeError다', (bad) => {
    const out = createOut();
    expect(() =>
      fitMinimumAreaRectInto(
        out,
        [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 0, y: 1 },
        ],
        { epsilon: bad }
      )
    ).toThrow(RangeError);
  });

  test('axis-aligned 결과의 zero component는 -0이 아니라 +0이다', () => {
    const out = createOut();
    fitMinimumAreaRectInto(out, [
      { x: -1, y: -0.5 },
      { x: 1, y: -0.5 },
      { x: 1, y: 0.5 },
      { x: -1, y: 0.5 },
    ]);
    expect(Object.is(out.cx, -0)).toBe(false);
    expect(Object.is(out.cy, -0)).toBe(false);
    expect(Object.is(out.angle, -0)).toBe(false);
    expect(out.cx).toBe(0);
    expect(out.cy).toBe(0);
    expect(out.width).toBe(2);
    expect(out.height).toBe(1);
    expect(out.angle).toBe(0);
  });
});

describe('fitMinimumAreaRect', () => {
  test('성공 시 plain oriented rect object를 반환한다', () => {
    const result = fitMinimumAreaRect([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(result).toEqual({ cx: 1, cy: 0.5, width: 2, height: 1, angle: 0 });
  });

  test('collinear point set은 undefined를 반환한다', () => {
    expect(
      fitMinimumAreaRect([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ])
    ).toBeUndefined();
  });

  test('degenerate extent는 undefined를 반환한다', () => {
    expect(
      fitMinimumAreaRect(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 0.001 },
          { x: 0, y: 0.001 },
        ],
        { epsilon: 0.01 }
      )
    ).toBeUndefined();
  });

  test('non-finite point는 RangeError다', () => {
    expect(() =>
      fitMinimumAreaRect([
        { x: Number.NaN, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 },
      ])
    ).toThrow(RangeError);
  });
});
