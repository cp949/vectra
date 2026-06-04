import { describe, expect, test } from 'vitest';
import { arcLength } from '../../../src/circle/arc-length';
import { area } from '../../../src/circle/area';
import { circleAnnulusArea } from '../../../src/circle/circle-annulus-area';
import { circumference } from '../../../src/circle/circumference';
import { containsPoint } from '../../../src/circle/contains-point';
import { copyInto } from '../../../src/circle/copy-into';
import { distanceToPoint } from '../../../src/circle/distance-to-point';
import { fromBoundsInto } from '../../../src/circle/from-bounds-into';
import type { CircleWritable, XYTupleWritable } from '../../../src/types';

function makeCircle(): CircleWritable {
  return { center: { x: 0, y: 0 }, radius: 0 };
}

describe('circle lifecycle - copyInto', () => {
  test('center, radius 인자로 circle을 기록하고 out을 반환한다', () => {
    const out = makeCircle();
    const result = copyInto(out, { x: 3, y: 4 }, 5);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  test('tuple center, radius 인자로 circle을 기록한다', () => {
    const out = makeCircle();
    copyInto(out, [3, 4], 5);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: CircleWritable<XYTupleWritable> = { center, radius: 0 };
    const result = copyInto(out, { x: 3, y: 4 }, 5);
    expect(result).toBe(out);
    expect(center).toEqual([3, 4]);
    expect(out.radius).toBe(5);
  });

  test('radius <= 0을 그대로 기록한다', () => {
    const zero = makeCircle();
    const negative = makeCircle();
    copyInto(zero, { x: 1, y: 2 }, 0);
    copyInto(negative, { x: 1, y: 2 }, -3);
    expect(zero.radius).toBe(0);
    expect(negative.radius).toBe(-3);
  });

  test('object center CircleLike를 복사한다', () => {
    const out = makeCircle();
    const src = { center: { x: 3, y: 4 }, radius: 5 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  test('tuple center CircleLike를 복사한다', () => {
    const out = makeCircle();
    const src = { center: [3, 4] as const, radius: 5 };
    copyInto(out, src);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  test('tuple shorthand CircleLike를 복사한다', () => {
    const out = makeCircle();
    copyInto(out, [[3, 4], 5]);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  test('mutable tuple center storage에 복사한다', () => {
    const center: [number, number] = [0, 0];
    const out: CircleWritable<XYTupleWritable> = { center, radius: 0 };
    const src = { center: { x: 3, y: 4 }, radius: 5 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(center).toEqual([3, 4]);
    expect(out.radius).toBe(5);
  });

  test('out === circle aliasing에서도 안전하게 복사한다', () => {
    const out = makeCircle();
    out.center.x = 3;
    out.center.y = 4;
    out.radius = 5;
    copyInto(out, out);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(5);
  });

  test('out.center === circle.center aliasing에서도 안전하게 복사한다', () => {
    const sharedCenter = { x: 3, y: 4 };
    const out: CircleWritable = { center: sharedCenter, radius: 0 };
    const src = { center: sharedCenter, radius: 7 };
    copyInto(out, src);
    expect(out.center).toEqual({ x: 3, y: 4 });
    expect(out.radius).toBe(7);
  });

  test('소스 circle을 mutate하지 않는다', () => {
    const out = makeCircle();
    const src = { center: { x: 3, y: 4 }, radius: 5 };
    copyInto(out, src);
    expect(src.center).toEqual({ x: 3, y: 4 });
    expect(src.radius).toBe(5);
  });
});

describe('circle lifecycle - fromBoundsInto', () => {
  test('정사각형 bounds의 inscribed circle을 기록한다', () => {
    const out = makeCircle();
    const result = fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 4, y: 4 } });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 2, y: 2 });
    expect(out.radius).toBe(2);
  });

  test('width < height bounds: radius = width / 2', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 4, y: 10 } });
    expect(out.center).toEqual({ x: 2, y: 5 });
    expect(out.radius).toBe(2);
  });

  test('height < width bounds: radius = height / 2', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 4 } });
    expect(out.center).toEqual({ x: 5, y: 2 });
    expect(out.radius).toBe(2);
  });

  test('tuple min/max bounds를 처리한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: [0, 0], max: [6, 6] });
    expect(out.center).toEqual({ x: 3, y: 3 });
    expect(out.radius).toBe(3);
  });

  test('mutable tuple center storage에 bounds 결과를 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: CircleWritable<XYTupleWritable> = { center, radius: 0 };
    const result = fromBoundsInto(out, { min: [0, 0], max: [6, 6] });
    expect(result).toBe(out);
    expect(center).toEqual([3, 3]);
    expect(out.radius).toBe(3);
  });

  test('object min, tuple max 혼합 bounds를 처리한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 2, y: 2 }, max: [6, 8] });
    expect(out.center).toEqual({ x: 4, y: 5 });
    expect(out.radius).toBe(2);
  });

  test('empty bounds (x inverted): radius = 0, center = (min.x, min.y)를 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 5, y: 0 }, max: { x: 1, y: 5 } });
    expect(out.center).toEqual({ x: 5, y: 0 });
    expect(out.radius).toBe(0);
  });

  test('empty bounds (y inverted): radius = 0, center = (min.x, min.y)를 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 0, y: 5 }, max: { x: 5, y: 1 } });
    expect(out.center).toEqual({ x: 0, y: 5 });
    expect(out.radius).toBe(0);
  });

  test('sentinel empty bounds (Infinity, -Infinity): radius = 0, center = (Infinity, Infinity)를 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: Infinity, y: Infinity }, max: { x: -Infinity, y: -Infinity } });
    expect(out.center).toEqual({ x: Infinity, y: Infinity });
    expect(out.radius).toBe(0);
  });

  test('out.center === bounds.min aliasing에서도 안전하게 기록한다', () => {
    const shared = { x: 0, y: 0 };
    const out: CircleWritable = { center: shared, radius: 0 };
    fromBoundsInto(out, { min: shared, max: { x: 4, y: 4 } });
    expect(out.center).toEqual({ x: 2, y: 2 });
    expect(out.radius).toBe(2);
  });

  test('out.center === bounds.max aliasing에서도 안전하게 기록한다', () => {
    const shared = { x: 4, y: 4 };
    const out: CircleWritable = { center: shared, radius: 0 };
    fromBoundsInto(out, { min: { x: 0, y: 0 }, max: shared });
    expect(out.center).toEqual({ x: 2, y: 2 });
    expect(out.radius).toBe(2);
  });

  test('min === max 단일 점 bounds: radius = 0, center = 점 좌표를 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 3, y: 5 }, max: { x: 3, y: 5 } });
    expect(out.center).toEqual({ x: 3, y: 5 });
    expect(out.radius).toBe(0);
  });

  test('width = 0 line bounds: radius = 0, center = 수직 중심을 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 3, y: 0 }, max: { x: 3, y: 6 } });
    expect(out.center).toEqual({ x: 3, y: 3 });
    expect(out.radius).toBe(0);
  });

  test('height = 0 line bounds: radius = 0, center = 수평 중심을 기록한다', () => {
    const out = makeCircle();
    fromBoundsInto(out, { min: { x: 0, y: 3 }, max: { x: 6, y: 3 } });
    expect(out.center).toEqual({ x: 3, y: 3 });
    expect(out.radius).toBe(0);
  });

  test('empty bounds + out.center === bounds.min aliasing에서도 안전하게 기록한다', () => {
    const shared = { x: 5, y: 2 };
    const out: CircleWritable = { center: shared, radius: 0 };
    // x inverted → empty: max.x(1) < min.x(5)
    fromBoundsInto(out, { min: shared, max: { x: 1, y: 8 } });
    expect(out.center).toEqual({ x: 5, y: 2 });
    expect(out.radius).toBe(0);
  });

  test('empty bounds + out.center === bounds.max aliasing에서도 안전하게 기록한다', () => {
    const shared = { x: 1, y: 8 };
    const out: CircleWritable = { center: shared, radius: 0 };
    // x inverted → empty: max.x(1) < min.x(5), center = (min.x, min.y) = (5, 2)
    fromBoundsInto(out, { min: { x: 5, y: 2 }, max: shared });
    expect(out.center).toEqual({ x: 5, y: 2 });
    expect(out.radius).toBe(0);
  });
});

describe('circle scalar query - area', () => {
  test('radius > 0이면 π * r²를 반환한다', () => {
    expect(area({ center: { x: 0, y: 0 }, radius: 5 })).toBe(Math.PI * 25);
  });

  test('radius === 0이면 0을 반환한다 (empty circle)', () => {
    expect(area({ center: { x: 0, y: 0 }, radius: 0 })).toBe(0);
  });

  test('radius < 0이면 0을 반환한다 (empty circle)', () => {
    expect(area({ center: { x: 0, y: 0 }, radius: -3 })).toBe(0);
  });

  test('tuple center에서도 동작한다', () => {
    expect(area({ center: [0, 0], radius: 3 })).toBe(Math.PI * 9);
  });
});

describe('circle scalar query - arcLength', () => {
  test('radius > 0이면 r * |θ|를 반환한다', () => {
    // radius 2, centralAngle π → 2π
    expect(arcLength({ center: { x: 0, y: 0 }, radius: 2 }, Math.PI)).toBe(2 * Math.PI);
  });

  test('음수 centralAngle은 양수 angle과 같은 결과를 반환한다', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: 2 }, -Math.PI)).toBe(
      arcLength({ center: { x: 0, y: 0 }, radius: 2 }, Math.PI)
    );
  });

  test('radius === 0이면 0을 반환한다 (empty circle)', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: 0 }, Math.PI)).toBe(0);
  });

  test('radius < 0이면 0을 반환한다 (empty circle)', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: -3 }, Math.PI)).toBe(0);
  });

  test('tuple center에서도 동작한다', () => {
    expect(arcLength({ center: [0, 0], radius: 3 }, Math.PI / 2)).toBe((3 * Math.PI) / 2);
  });

  test('centralAngle = Infinity이면 Infinity를 반환한다', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: 2 }, Infinity)).toBe(Infinity);
  });

  test('centralAngle = -Infinity이면 Infinity를 반환한다 (부호 무시)', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: 2 }, -Infinity)).toBe(Infinity);
  });

  test('radius = Infinity, centralAngle = 0이면 NaN을 반환한다 (Infinity * 0)', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: Infinity }, 0)).toBeNaN();
  });

  test('radius = -Infinity이면 empty 분기로 0을 반환한다', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: -Infinity }, Math.PI)).toBe(0);
  });

  test('radius = NaN이면 NaN을 반환한다', () => {
    expect(arcLength({ center: { x: 0, y: 0 }, radius: NaN }, Math.PI)).toBeNaN();
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
    expect(circumference({ center: { x: 0, y: 0 }, radius: 5 })).toBe(2 * Math.PI * 5);
  });

  test('radius === 0이면 0을 반환한다 (empty circle)', () => {
    expect(circumference({ center: { x: 0, y: 0 }, radius: 0 })).toBe(0);
  });

  test('radius < 0이면 0을 반환한다 (empty circle)', () => {
    expect(circumference({ center: { x: 0, y: 0 }, radius: -3 })).toBe(0);
  });

  test('tuple center에서도 동작한다', () => {
    expect(circumference({ center: [0, 0], radius: 4 })).toBe(2 * Math.PI * 4);
  });
});

describe('circle scalar query - distanceToPoint', () => {
  test('외부 점까지 unsigned 거리를 반환한다', () => {
    // center (0,0), radius 3, point (5,0) → 5 - 3 = 2
    expect(distanceToPoint({ center: { x: 0, y: 0 }, radius: 3 }, { x: 5, y: 0 })).toBe(2);
  });

  test('경계 위 점은 0을 반환한다 (closed boundary)', () => {
    // center (0,0), radius 5, point (5,0) → distance = 5 - 5 = 0
    expect(distanceToPoint({ center: { x: 0, y: 0 }, radius: 5 }, { x: 5, y: 0 })).toBe(0);
  });

  test('내부 점은 0을 반환한다', () => {
    // center (0,0), radius 10, point (3,4) → dist = 5 < 10 → 0
    expect(distanceToPoint({ center: { x: 0, y: 0 }, radius: 10 }, { x: 3, y: 4 })).toBe(0);
  });

  test('center와 같은 점은 0을 반환한다 (non-empty circle)', () => {
    expect(distanceToPoint({ center: { x: 2, y: 3 }, radius: 5 }, { x: 2, y: 3 })).toBe(0);
  });

  test('empty circle (radius=0)은 center까지의 거리를 반환한다', () => {
    // center (0,0), radius 0, point (3,4) → dist = 5
    expect(distanceToPoint({ center: { x: 0, y: 0 }, radius: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  test('empty circle (radius<0)은 center까지의 거리를 반환한다', () => {
    // center (0,0), radius -2, point (0,5) → dist = 5
    expect(distanceToPoint({ center: { x: 0, y: 0 }, radius: -2 }, { x: 0, y: 5 })).toBe(5);
  });

  test('empty circle (radius=0), point = center이면 0을 반환한다', () => {
    expect(distanceToPoint({ center: { x: 2, y: 3 }, radius: 0 }, { x: 2, y: 3 })).toBe(0);
  });

  test('empty circle (radius<0), point = center이면 0을 반환한다', () => {
    expect(distanceToPoint({ center: { x: 2, y: 3 }, radius: -5 }, { x: 2, y: 3 })).toBe(0);
  });

  test('tuple center / tuple point에서도 동작한다', () => {
    // center [0,0], radius 3, point [3,4] → dist = 5, outside → 5 - 3 = 2
    expect(distanceToPoint({ center: [0, 0], radius: 3 }, [3, 4])).toBe(2);
  });

  test('object center, tuple point 혼합에서도 동작한다', () => {
    // center {x:0,y:0}, radius 3, point (5,0) → outside → 5 - 3 = 2
    expect(distanceToPoint({ center: { x: 0, y: 0 }, radius: 3 }, [5, 0])).toBe(2);
  });
});

describe('circle boolean query - containsPoint', () => {
  test('내부 점은 true를 반환한다', () => {
    // center (0,0), radius 10, point (3,4) → dist = 5 < 10 → true
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: 10 }, { x: 3, y: 4 })).toBe(true);
  });

  test('경계 위 점은 true를 반환한다 (closed boundary)', () => {
    // center (0,0), radius 5, point (3,4) → dist = 5 = radius → true
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: 5 }, { x: 3, y: 4 })).toBe(true);
  });

  test('외부 점은 false를 반환한다', () => {
    // center (0,0), radius 4, point (3,4) → dist = 5 > 4 → false
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: 4 }, { x: 3, y: 4 })).toBe(false);
  });

  test('empty circle (radius=0)은 false를 반환한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('empty circle (radius<0)은 false를 반환한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: -1 }, { x: 0, y: 0 })).toBe(false);
  });

  test('empty circle (radius=0), point ≠ center이면 false를 반환한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: 0 }, { x: 1, y: 0 })).toBe(false);
  });

  test('empty circle (radius<0), point ≠ center이면 false를 반환한다', () => {
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: -1 }, { x: 1, y: 0 })).toBe(false);
  });

  test('tuple center / tuple point에서도 동작한다', () => {
    // center [0,0], radius 5, point [3,4] → dist = 5 = radius → true
    expect(containsPoint({ center: [0, 0], radius: 5 }, [3, 4])).toBe(true);
  });

  test('object center, tuple point 혼합에서도 동작한다', () => {
    // center {x:0,y:0}, radius 3, point [1,2] → dist = sqrt(5) < 3 → true
    expect(containsPoint({ center: { x: 0, y: 0 }, radius: 3 }, [1, 2])).toBe(true);
  });
});
