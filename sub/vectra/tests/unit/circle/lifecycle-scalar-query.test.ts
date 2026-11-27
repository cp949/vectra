/** 원 복사, 내접원 생성, 스칼라 조회와 점 포함 판정을 검증한다. */

import { describe, expect, test } from 'vitest';
import { arcLength } from '../../../src/circle/arc-length';
import { area } from '../../../src/circle/area';
import { circleAnnulusArea } from '../../../src/circle/circle-annulus-area';
import { circumference } from '../../../src/circle/circumference';
import { containsPoint } from '../../../src/circle/contains-point';
import { copyInto } from '../../../src/circle/copy-into';
import { distanceToPoint } from '../../../src/circle/distance-to-point';
import { fromBoundsInto } from '../../../src/circle/from-bounds-into';
import type { CircleWritable } from '../../../src/types/flat-shapes.internal';

/** 복사와 내접원 계산에 쓸 원을 만든다. */
function makeCircle(): CircleWritable {
  return { cx: 0, cy: 0, r: 0 };
}

describe('circle lifecycle - copyInto', () => {
  test('원의 필드를 복사하고 out을 반환한다', () => {
    const out = makeCircle();
    const src = { cx: 3, cy: 4, r: 5 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(4);
    expect(out.r).toBe(5);
  });

  test('반지름이 0인 원도 모든 필드를 복사한다', () => {
    const out = { cx: 9, cy: 9, r: 9 };
    const source = { cx: 7, cy: 8, r: 0 };
    expect(copyInto(out, source)).toBe(out);
    expect(out).toEqual(source);
  });

  test('out === circle aliasing에서도 안전하게 복사한다', () => {
    const out = makeCircle();
    out.cx = 3;
    out.cy = 4;
    out.r = 5;
    copyInto(out, out);
    expect(out.cx).toBe(3);
    expect(out.cy).toBe(4);
    expect(out.r).toBe(5);
  });
});

describe('circle lifecycle - fromBoundsInto', () => {
  test('정사각형 bounds의 inscribed circle을 기록하고 out을 반환한다', () => {
    const out = makeCircle();
    const result = fromBoundsInto(out, { minX: 0, minY: 0, maxX: 4, maxY: 4 });
    expect(result).toBe(out);
    expect(out.cx).toBe(2);
    expect(out.cy).toBe(2);
    expect(out.r).toBe(2);
  });

  test('non-square bounds: radius = min(width, height) / 2', () => {
    const out = makeCircle();
    fromBoundsInto(out, { minX: 0, minY: 0, maxX: 4, maxY: 10 });
    expect(out.cx).toBe(2);
    expect(out.cy).toBe(5);
    expect(out.r).toBe(2);
  });

  test('empty bounds (inverted): radius = 0, center = (minX, minY)를 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { minX: 5, minY: 0, maxX: 1, maxY: 5 });
    expect(out.cx).toBe(5);
    expect(out.cy).toBe(0);
    expect(out.r).toBe(0);
  });
});

describe('circle scalar query - area', () => {
  test('radius > 0이면 π * r²를 반환한다', () => {
    expect(area({ cx: 0, cy: 0, r: 5 })).toBe(Math.PI * 25);
  });

  test('radius === 0이면 0을 반환한다 (empty circle)', () => {
    expect(area({ cx: 0, cy: 0, r: 0 })).toBe(0);
  });

  test('radius < 0이면 0을 반환한다 (empty circle)', () => {
    expect(area({ cx: 0, cy: 0, r: -3 })).toBe(0);
  });
});

describe('circle scalar query - arcLength', () => {
  test('radius > 0이면 r * |θ|를 반환한다', () => {
    // radius 2, centralAngle π → 2π
    expect(arcLength({ cx: 0, cy: 0, r: 2 }, Math.PI)).toBe(2 * Math.PI);
  });

  test('음수 centralAngle은 양수 angle과 같은 결과를 반환한다', () => {
    expect(arcLength({ cx: 0, cy: 0, r: 2 }, -Math.PI)).toBe(arcLength({ cx: 0, cy: 0, r: 2 }, Math.PI));
  });

  test('직각에 대응하는 호의 길이를 반환한다', () => {
    expect(arcLength({ cx: 0, cy: 0, r: 3 }, Math.PI / 2)).toBe((3 * Math.PI) / 2);
  });

  test('radius === 0이면 0을 반환한다 (empty circle)', () => {
    expect(arcLength({ cx: 0, cy: 0, r: 0 }, Math.PI)).toBe(0);
  });

  test('radius < 0이면 0을 반환한다 (empty circle)', () => {
    expect(arcLength({ cx: 0, cy: 0, r: -3 }, Math.PI)).toBe(0);
  });

  test('centralAngle = Infinity이면 Infinity를 반환한다', () => {
    expect(arcLength({ cx: 0, cy: 0, r: 2 }, Infinity)).toBe(Infinity);
  });

  test('centralAngle = -Infinity이면 Infinity를 반환한다 (부호 무시)', () => {
    expect(arcLength({ cx: 0, cy: 0, r: 2 }, -Infinity)).toBe(Infinity);
  });

  test('radius = Infinity, centralAngle = 0이면 NaN을 반환한다 (Infinity * 0)', () => {
    expect(arcLength({ cx: 0, cy: 0, r: Infinity }, 0)).toBeNaN();
  });

  test('radius = -Infinity이면 empty 분기로 0을 반환한다', () => {
    expect(arcLength({ cx: 0, cy: 0, r: -Infinity }, Math.PI)).toBe(0);
  });

  test('radius = NaN이면 NaN을 반환한다', () => {
    expect(arcLength({ cx: 0, cy: 0, r: NaN }, Math.PI)).toBeNaN();
  });
});

describe('circle scalar query - circleAnnulusArea', () => {
  test('outerRadius > innerRadius이면 π * (R² - r²)를 반환한다', () => {
    // (3, 1) → π * (9 - 1) = 8π
    expect(circleAnnulusArea(3, 1)).toBe(8 * Math.PI);
  });

  test('같은 반지름이면 0을 반환한다', () => {
    expect(circleAnnulusArea(2, 2)).toBe(0);
  });

  test('innerRadius = 0이면 full disk 넓이를 반환한다', () => {
    expect(circleAnnulusArea(2, 0)).toBe(Math.PI * 4);
  });

  test('innerRadius < 0이면 RangeError를 던진다', () => {
    expect(() => circleAnnulusArea(3, -1)).toThrow(RangeError);
  });

  test('outerRadius < innerRadius이면 RangeError를 던진다', () => {
    expect(() => circleAnnulusArea(1, 3)).toThrow(RangeError);
  });

  test('outerRadius가 non-finite이면 RangeError를 던진다', () => {
    expect(() => circleAnnulusArea(Infinity, 1)).toThrow(RangeError);
    expect(() => circleAnnulusArea(NaN, 1)).toThrow(RangeError);
  });

  test('innerRadius가 non-finite이면 RangeError를 던진다', () => {
    expect(() => circleAnnulusArea(3, Infinity)).toThrow(RangeError);
    expect(() => circleAnnulusArea(3, -Infinity)).toThrow(RangeError);
    expect(() => circleAnnulusArea(3, NaN)).toThrow(RangeError);
  });

  test('결과가 overflow해 non-finite이면 RangeError를 던진다', () => {
    expect(() => circleAnnulusArea(1e200, 0)).toThrow(RangeError);
  });
});

describe('circle scalar query - circumference', () => {
  test('radius > 0이면 2 * π * r을 반환한다', () => {
    expect(circumference({ cx: 0, cy: 0, r: 5 })).toBe(2 * Math.PI * 5);
  });

  test('radius === 0이면 0을 반환한다 (empty circle)', () => {
    expect(circumference({ cx: 0, cy: 0, r: 0 })).toBe(0);
  });

  test('radius < 0이면 0을 반환한다 (empty circle)', () => {
    expect(circumference({ cx: 0, cy: 0, r: -3 })).toBe(0);
  });
});

describe('circle scalar query - distanceToPoint', () => {
  test('외부 점까지 unsigned 거리를 반환한다', () => {
    // center (0,0), radius 3, point (5,0) → 5 - 3 = 2
    expect(distanceToPoint({ cx: 0, cy: 0, r: 3 }, { x: 5, y: 0 })).toBe(2);
  });

  test('경계 위 점은 0을 반환한다 (closed boundary)', () => {
    // center (0,0), radius 5, point (5,0) → distance = 5 - 5 = 0
    expect(distanceToPoint({ cx: 0, cy: 0, r: 5 }, { x: 5, y: 0 })).toBe(0);
  });

  test('내부 점은 0을 반환한다', () => {
    // center (0,0), radius 10, point (3,4) → dist = 5 < 10 → 0
    expect(distanceToPoint({ cx: 0, cy: 0, r: 10 }, { x: 3, y: 4 })).toBe(0);
  });

  test('center와 같은 점은 0을 반환한다 (non-empty circle)', () => {
    expect(distanceToPoint({ cx: 2, cy: 3, r: 5 }, { x: 2, y: 3 })).toBe(0);
  });

  test('empty circle (radius=0)은 center까지의 거리를 반환한다', () => {
    // center (0,0), radius 0, point (3,4) → dist = 5
    expect(distanceToPoint({ cx: 0, cy: 0, r: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  test('empty circle (radius<0)은 center까지의 거리를 반환한다', () => {
    // center (0,0), radius -2, point (0,5) → dist = 5
    expect(distanceToPoint({ cx: 0, cy: 0, r: -2 }, { x: 0, y: 5 })).toBe(5);
  });

  test('empty circle (radius=0), point = center이면 0을 반환한다', () => {
    expect(distanceToPoint({ cx: 2, cy: 3, r: 0 }, { x: 2, y: 3 })).toBe(0);
  });

  test('empty circle (radius<0), point = center이면 0을 반환한다', () => {
    expect(distanceToPoint({ cx: 2, cy: 3, r: -5 }, { x: 2, y: 3 })).toBe(0);
  });
});

describe('circle boolean query - containsPoint', () => {
  test('내부 점은 true를 반환한다', () => {
    // center (0,0), radius 10, point (3,4) → dist = 5 < 10 → true
    expect(containsPoint({ cx: 0, cy: 0, r: 10 }, { x: 3, y: 4 })).toBe(true);
  });

  test('경계 위 점은 true를 반환한다 (closed boundary)', () => {
    // center (0,0), radius 5, point (3,4) → dist = 5 = radius → true
    expect(containsPoint({ cx: 0, cy: 0, r: 5 }, { x: 3, y: 4 })).toBe(true);
  });

  test('외부 점은 false를 반환한다', () => {
    // center (0,0), radius 4, point (3,4) → dist = 5 > 4 → false
    expect(containsPoint({ cx: 0, cy: 0, r: 4 }, { x: 3, y: 4 })).toBe(false);
  });

  test('empty circle (radius=0)은 false를 반환한다', () => {
    expect(containsPoint({ cx: 0, cy: 0, r: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('empty circle (radius<0)은 false를 반환한다', () => {
    expect(containsPoint({ cx: 0, cy: 0, r: -1 }, { x: 0, y: 0 })).toBe(false);
  });

  test('empty circle (radius=0), point ≠ center이면 false를 반환한다', () => {
    expect(containsPoint({ cx: 0, cy: 0, r: 0 }, { x: 1, y: 0 })).toBe(false);
  });

  test('empty circle (radius<0), point ≠ center이면 false를 반환한다', () => {
    expect(containsPoint({ cx: 0, cy: 0, r: -1 }, { x: 1, y: 0 })).toBe(false);
  });
});
