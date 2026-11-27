/** 원 포함 관계, 반지름 조정과 중심각에 따른 스칼라 계산을 검증한다. */

import { describe, expect, expectTypeOf, test } from 'vitest';
import { chordLength } from '../../../src/circle/chord-length';
import { containsCircle } from '../../../src/circle/contains-circle';
import { expandBy } from '../../../src/circle/expand-by';
import { expandByInto } from '../../../src/circle/expand-by-into';
import { sagitta } from '../../../src/circle/sagitta';
import { sectorArea } from '../../../src/circle/sector-area';
import { segmentArea } from '../../../src/circle/segment-area';
import { shrinkBy } from '../../../src/circle/shrink-by';
import { shrinkByInto } from '../../../src/circle/shrink-by-into';
import type { CircleWritable } from '../../../src/types/flat-shapes.internal';

/** 반지름 변경 결과를 받을 빈 원을 만든다. */
function makeCircle(): CircleWritable {
  return { cx: 0, cy: 0, r: 0 };
}

describe('circle boolean query - containsCircle', () => {
  test('empty outer (radius=0)이면 false를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: 0 };
    const inner = { cx: 0, cy: 0, r: 1 };
    expect(containsCircle(outer, inner)).toBe(false);
  });

  test('empty outer (radius<0)이면 false를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: -1 };
    const inner = { cx: 0, cy: 0, r: 0 };
    expect(containsCircle(outer, inner)).toBe(false);
  });

  test('empty inner (radius=0)이면 true를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: 5 };
    const inner = { cx: 3, cy: 0, r: 0 };
    expect(containsCircle(outer, inner)).toBe(true);
  });

  test('empty inner (radius<0)이면 true를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: 5 };
    const inner = { cx: 10, cy: 0, r: -1 };
    expect(containsCircle(outer, inner)).toBe(true);
  });

  test('inner가 완전히 포함되면 true를 반환한다', () => {
    // outer r=10, inner center(2,0) r=3 → 10 - 3 = 7 >= dist=2
    const outer = { cx: 0, cy: 0, r: 10 };
    const inner = { cx: 2, cy: 0, r: 3 };
    expect(containsCircle(outer, inner)).toBe(true);
  });

  test('inner가 포함되지 않으면 false를 반환한다', () => {
    // outer r=5, inner center(4,0) r=3 → 5 - 3 = 2 < dist=4
    const outer = { cx: 0, cy: 0, r: 5 };
    const inner = { cx: 4, cy: 0, r: 3 };
    expect(containsCircle(outer, inner)).toBe(false);
  });

  test('내접 경계 (outer.r = inner.r + dist)이면 true를 반환한다', () => {
    // outer r=5, inner center(3,0) r=2 → 5 - 2 = 3 = dist=3
    const outer = { cx: 0, cy: 0, r: 5 };
    const inner = { cx: 3, cy: 0, r: 2 };
    expect(containsCircle(outer, inner)).toBe(true);
  });

  test('동심원이고 outer.r > inner.r이면 true를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: 10 };
    const inner = { cx: 0, cy: 0, r: 5 };
    expect(containsCircle(outer, inner)).toBe(true);
  });

  test('동심원이고 outer.r === inner.r이면 true를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: 5 };
    const inner = { cx: 0, cy: 0, r: 5 };
    expect(containsCircle(outer, inner)).toBe(true);
  });

  test('동심원이고 outer.r < inner.r이면 false를 반환한다', () => {
    const outer = { cx: 0, cy: 0, r: 3 };
    const inner = { cx: 0, cy: 0, r: 5 };
    expect(containsCircle(outer, inner)).toBe(false);
  });
});

describe('circle Into - expandByInto', () => {
  test('양수 amount로 radius가 증가한다', () => {
    const out = makeCircle();
    const circle = { cx: 1, cy: 2, r: 5 };
    const result = expandByInto(out, circle, 3);
    expect(result).toBe(out);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
    expect(out.r).toBe(8);
  });

  test('음수 amount로 radius가 감소한다', () => {
    const out = makeCircle();
    const circle = { cx: 0, cy: 0, r: 10 };
    expandByInto(out, circle, -4);
    expect(out.r).toBe(6);
  });

  test('amount=0이면 circle을 그대로 복사한다', () => {
    const out = makeCircle();
    const circle = { cx: 3, cy: 4, r: 7 };
    expandByInto(out, circle, 0);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(4);
    expect(out.r).toBe(7);
  });

  test('out === circle aliasing에서도 안전하게 동작한다', () => {
    const circle: CircleWritable = { cx: 2, cy: 3, r: 5 };
    const result = expandByInto(circle, circle, 2);
    expect(result).toBe(circle);
    expect(circle.cx).toBe(2);
    expect(circle.cy).toBe(3);
    expect(circle.r).toBe(7);
  });

  test('out을 반환한다', () => {
    const out = makeCircle();
    const result = expandByInto(out, { cx: 0, cy: 0, r: 1 }, 1);
    expect(result).toBe(out);
  });

  test('음수 radius 결과도 그대로 기록한다', () => {
    const out = makeCircle();
    expandByInto(out, { cx: 0, cy: 0, r: 2 }, -5);
    expect(out.r).toBe(-3);
  });
});

describe('circle companion - expandBy', () => {
  test('새 object를 반환한다', () => {
    const circle = { cx: 1, cy: 2, r: 5 };
    const result = expandBy(circle, 3);
    expect(result).not.toBe(circle);
    expect(result.cx).toBe(1);
    expect(result.cy).toBe(2);
    expect(result.r).toBe(8);
  });

  test('원본 circle을 수정하지 않는다', () => {
    const circle = { cx: 1, cy: 2, r: 5 };
    expandBy(circle, 3);
    expect(circle.cx).toBe(1);
    expect(circle.cy).toBe(2);
    expect(circle.r).toBe(5);
  });

  test('음수 amount도 처리한다', () => {
    const circle = { cx: 0, cy: 0, r: 10 };
    const result = expandBy(circle, -4);
    expect(result.r).toBe(6);
  });
});

describe('circle scalar query - chordLength', () => {
  test('empty circle (radius=0)이면 0을 반환한다', () => {
    expect(chordLength({ cx: 0, cy: 0, r: 0 }, Math.PI)).toBe(0);
  });

  test('empty circle (radius<0)이면 0을 반환한다', () => {
    expect(chordLength({ cx: 0, cy: 0, r: -1 }, Math.PI)).toBe(0);
  });

  test('중심각 0이면 0을 반환한다', () => {
    expect(chordLength({ cx: 0, cy: 0, r: 5 }, 0)).toBe(0);
  });

  test('중심각 π (반원)이면 2*radius를 반환한다 (지름)', () => {
    // chord = 2 * r * sin(π/2) = 2 * r
    const r = 5;
    expect(chordLength({ cx: 0, cy: 0, r: r }, Math.PI)).toBeCloseTo(2 * r, 10);
  });

  test('중심각 2π (전각)이면 0에 가까운 값을 반환한다', () => {
    // chord = 2 * r * sin(π) ≈ 0
    expect(chordLength({ cx: 0, cy: 0, r: 5 }, 2 * Math.PI)).toBeCloseTo(0, 10);
  });

  test('중심각 π/3이면 radius와 같은 현 길이를 반환한다', () => {
    // chord = 2 * r * sin(π/6) = 2 * r * 0.5 = r
    const r = 4;
    expect(chordLength({ cx: 0, cy: 0, r: r }, Math.PI / 3)).toBeCloseTo(r, 10);
  });

  test('음수 centralAngle도 양수와 같은 결과를 반환한다 (부호 무시)', () => {
    const circle = { cx: 0, cy: 0, r: 5 };
    expect(chordLength(circle, -Math.PI / 2)).toBeCloseTo(chordLength(circle, Math.PI / 2), 10);
  });
});

describe('circle scalar query - sectorArea', () => {
  test('empty circle (radius=0)이면 0을 반환한다', () => {
    expect(sectorArea({ center: { x: 0, y: 0 }, radius: 0 }, Math.PI)).toBe(0);
  });

  test('empty circle (radius<0)이면 0을 반환한다', () => {
    expect(sectorArea({ center: { x: 0, y: 0 }, radius: -1 }, Math.PI)).toBe(0);
  });

  test('중심각 2π (전원)이면 π*r²을 반환한다', () => {
    // 0.5 * r² * 2π = π * r²
    const r = 5;
    expect(sectorArea({ center: { x: 0, y: 0 }, radius: r }, 2 * Math.PI)).toBeCloseTo(Math.PI * r * r, 10);
  });

  test('중심각 π (반원)이면 π*r²/2를 반환한다', () => {
    // 0.5 * r² * π
    const r = 3;
    expect(sectorArea({ center: { x: 0, y: 0 }, radius: r }, Math.PI)).toBeCloseTo((Math.PI * r * r) / 2, 10);
  });

  test('중심각 0이면 0을 반환한다', () => {
    expect(sectorArea({ center: { x: 0, y: 0 }, radius: 5 }, 0)).toBe(0);
  });

  test('음수 centralAngle도 양수와 같은 결과를 반환한다 (부호 무시)', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    expect(sectorArea(circle, -Math.PI)).toBeCloseTo(sectorArea(circle, Math.PI), 10);
  });
});

describe('circle scalar query - segmentArea', () => {
  test('empty circle (radius=0)이면 0을 반환한다', () => {
    expect(segmentArea({ center: { x: 0, y: 0 }, radius: 0 }, Math.PI)).toBe(0);
  });

  test('empty circle (radius<0)이면 0을 반환한다', () => {
    expect(segmentArea({ center: { x: 0, y: 0 }, radius: -1 }, Math.PI)).toBe(0);
  });

  test('중심각 0이면 0을 반환한다', () => {
    expect(segmentArea({ center: { x: 0, y: 0 }, radius: 5 }, 0)).toBe(0);
  });

  test('중심각 π (반원)이면 π*r²/2를 반환한다', () => {
    // 0.5 * r² * (π - sin(π)) = 0.5 * r² * π
    const r = 3;
    expect(segmentArea({ center: { x: 0, y: 0 }, radius: r }, Math.PI)).toBeCloseTo((Math.PI * r * r) / 2, 10);
  });

  test('중심각 2π (전원)이면 π*r²에 가까운 값을 반환한다', () => {
    // 0.5 * r² * (2π - sin(2π)) ≈ 0.5 * r² * 2π = π * r²
    const r = 4;
    expect(segmentArea({ center: { x: 0, y: 0 }, radius: r }, 2 * Math.PI)).toBeCloseTo(Math.PI * r * r, 10);
  });

  test('결과는 항상 0 이상이다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    expect(segmentArea(circle, Math.PI / 4)).toBeGreaterThanOrEqual(0);
    expect(segmentArea(circle, Math.PI / 2)).toBeGreaterThanOrEqual(0);
    expect(segmentArea(circle, Math.PI)).toBeGreaterThanOrEqual(0);
  });

  test('음수 centralAngle도 양수와 같은 결과를 반환한다 (부호 무시)', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    expect(segmentArea(circle, -Math.PI / 2)).toBeCloseTo(segmentArea(circle, Math.PI / 2), 10);
  });

  test('중심각 3π/2 (major segment)이면 0.5*r²*(3π/2+1)을 반환한다', () => {
    // θ = 3π/2 > π → sin(3π/2) = -1 → 넓이 = 0.5*r²*(3π/2 - (-1)) = 0.5*r²*(3π/2+1)
    const r = 4;
    const theta = (3 * Math.PI) / 2;
    const expected = 0.5 * r * r * (theta - Math.sin(theta));
    expect(segmentArea({ center: { x: 0, y: 0 }, radius: r }, theta)).toBeCloseTo(expected, 10);
  });
});

describe('circle scalar query - sagitta', () => {
  test('중심각 π/2이면 r*(1-cos(π/4))를 반환한다', () => {
    // sagitta = 1 * (1 - cos(π/4)) ≈ 0.29289...
    expect(sagitta({ center: { x: 0, y: 0 }, radius: 1 }, Math.PI / 2)).toBeCloseTo(1 - Math.cos(Math.PI / 4), 10);
  });

  test('중심각 π (반원)이면 radius와 같다', () => {
    // sagitta = r * (1 - cos(π/2)) = r * (1 - 0) = r
    const r = 5;
    expect(sagitta({ center: { x: 0, y: 0 }, radius: r }, Math.PI)).toBeCloseTo(r, 10);
  });

  test('중심각 2π (전체 원)이면 2*radius를 반환한다', () => {
    // sagitta = r * (1 - cos(π)) = r * (1 - (-1)) = 2r
    const r = 3;
    expect(sagitta({ center: { x: 0, y: 0 }, radius: r }, 2 * Math.PI)).toBeCloseTo(2 * r, 10);
  });

  test('중심각 0이면 0을 반환한다', () => {
    // sagitta = r * (1 - cos(0)) = r * 0 = 0
    expect(sagitta({ center: { x: 0, y: 0 }, radius: 5 }, 0)).toBeCloseTo(0, 10);
  });

  test('음수 centralAngle도 양수와 같은 결과를 반환한다 (부호 무시)', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    expect(sagitta(circle, -Math.PI / 2)).toBeCloseTo(sagitta(circle, Math.PI / 2), 10);
  });

  test('empty circle (radius=0)이면 0을 반환한다', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: 0 }, Math.PI)).toBe(0);
  });

  test('empty circle (radius<0)이면 0을 반환한다', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: -1 }, Math.PI)).toBe(0);
  });

  test('radius가 NaN이면 NaN을 반환한다', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: NaN }, Math.PI)).toBeNaN();
  });

  test('centralAngle이 NaN이면 NaN을 반환한다', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: 5 }, NaN)).toBeNaN();
  });

  test('centralAngle이 Infinity이면 NaN을 반환한다', () => {
    // cos(Infinity) = NaN이므로 결과도 NaN
    expect(sagitta({ center: { x: 0, y: 0 }, radius: 5 }, Infinity)).toBeNaN();
  });

  test('centralAngle이 -Infinity이면 NaN을 반환한다 (Math.abs 후 cos(Infinity) = NaN)', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: 5 }, -Infinity)).toBeNaN();
  });

  test('radius가 Infinity이고 1-cos(|θ|/2) > 0인 angle이면 Infinity를 반환한다', () => {
    // Infinity * (1 - cos(π/4)) > 0 → Infinity
    expect(sagitta({ center: { x: 0, y: 0 }, radius: Infinity }, Math.PI / 2)).toBe(Infinity);
  });

  test('radius가 Infinity이고 angle = 0이면 Infinity * 0 = NaN을 반환한다', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: Infinity }, 0)).toBeNaN();
  });

  test('radius가 Infinity이고 angle = 4π이면 cos(2π) = 1 → Infinity * 0 = NaN', () => {
    expect(sagitta({ center: { x: 0, y: 0 }, radius: Infinity }, 4 * Math.PI)).toBeNaN();
  });

  test('radius가 -Infinity이면 -Infinity <= 0 분기로 0을 반환한다', () => {
    // r <= 0 분기에 NaN 비교가 아닌 -Infinity < 0이 적용된다
    expect(sagitta({ center: { x: 0, y: 0 }, radius: -Infinity }, Math.PI)).toBe(0);
  });
});

describe('circle Into - shrinkByInto', () => {
  test('양수 amount로 radius가 감소한다', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    const circle = { cx: 1, cy: 2, r: 10 };
    shrinkByInto(out, circle, 3);
    expect(out.cx).toBe(1);
    expect(out.cy).toBe(2);
    expect(out.r).toBe(7);
  });

  test('amount=0이면 circle을 그대로 복사한다', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    const circle = { cx: 3, cy: 4, r: 7 };
    shrinkByInto(out, circle, 0);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(4);
    expect(out.r).toBe(7);
  });

  test('amount > radius이면 radius가 음수가 된다', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    shrinkByInto(out, { cx: 0, cy: 0, r: 2 }, 5);
    expect(out.r).toBe(-3);
  });

  test('amount가 음수이면 radius가 증가한다', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    shrinkByInto(out, { cx: 0, cy: 0, r: 5 }, -3);
    expect(out.r).toBe(8);
  });

  test('out === circle aliasing에서도 안전하게 동작한다', () => {
    const circle: CircleWritable = { cx: 2, cy: 3, r: 10 };
    shrinkByInto(circle, circle, 4);
    expect(circle.cx).toBe(2);
    expect(circle.cy).toBe(3);
    expect(circle.r).toBe(6);
  });

  test('out을 반환한다', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    const result = shrinkByInto(out, { cx: 0, cy: 0, r: 5 }, 1);
    expect(result).toBe(out);
  });

  test('amount가 NaN이면 out.r가 NaN이 된다', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    shrinkByInto(out, { cx: 0, cy: 0, r: 5 }, NaN);
    expect(out.r).toBeNaN();
  });

  test('amount가 Infinity이면 out.r가 -Infinity가 된다 (radius - Infinity)', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    shrinkByInto(out, { cx: 0, cy: 0, r: 5 }, Infinity);
    expect(out.r).toBe(-Infinity);
  });

  test('amount가 -Infinity이면 out.r가 Infinity가 된다 (radius - (-Infinity))', () => {
    const out: CircleWritable = { cx: 0, cy: 0, r: 0 };
    shrinkByInto(out, { cx: 0, cy: 0, r: 5 }, -Infinity);
    expect(out.r).toBe(Infinity);
  });
});

describe('circle companion - shrinkBy', () => {
  test('expandBy(circle, -amount)와 동일한 결과를 반환한다', () => {
    const circle = { cx: 1, cy: 2, r: 10 };
    const result = shrinkBy(circle, 3);
    const expected = expandBy(circle, -3);
    expect(result).toEqual(expected);
  });

  test('새 object를 반환한다', () => {
    const circle = { cx: 1, cy: 2, r: 10 };
    const result = shrinkBy(circle, 3);
    expect(result).not.toBe(circle);
  });

  test('원본 circle을 수정하지 않는다', () => {
    const circle = { cx: 1, cy: 2, r: 10 };
    shrinkBy(circle, 3);
    expect(circle.r).toBe(10);
  });

  test('반환 타입이 CircleWritable이다 (anonymous inline 회귀 방지)', () => {
    const circle = { cx: 0, cy: 0, r: 5 };
    expectTypeOf(shrinkBy(circle, 1)).toEqualTypeOf<CircleWritable>();
  });
});
