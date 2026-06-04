import { describe, expect, test } from 'vitest';
import { circleFrom } from '../../../src/circle/circle-from';
import { closestPoint } from '../../../src/circle/closest-point';
import { closestPointInto } from '../../../src/circle/closest-point-into';
import { copyInto } from '../../../src/circle/copy-into';
import { fromBounds } from '../../../src/circle/from-bounds';
import { fromBoundsInto } from '../../../src/circle/from-bounds-into';
import { pointAtAngle } from '../../../src/circle/point-at-angle';
import { pointAtAngleInto } from '../../../src/circle/point-at-angle-into';
import { pointAtTurn } from '../../../src/circle/point-at-turn';
import { pointAtTurnInto } from '../../../src/circle/point-at-turn-into';
import { scale } from '../../../src/circle/scale';
import { scaleInto } from '../../../src/circle/scale-into';
import { translate } from '../../../src/circle/translate';
import { translateInto } from '../../../src/circle/translate-into';
import type { CircleWritable, XYWritable } from '../../../src/types';

function makeCircle(cx = 0, cy = 0, r = 5): CircleWritable {
  return { center: { x: cx, y: cy }, radius: r };
}

function makeBounds(minX = 0, minY = 0, maxX = 10, maxY = 10) {
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

// ─── closestPoint ───────────────────────────────────────────────────────────

describe('circle companion - closestPoint', () => {
  test('circle 외부 점에서 가장 가까운 표면 위 점을 새 object로 반환한다', () => {
    const result = closestPoint(makeCircle(0, 0, 5), { x: 10, y: 0 });

    expect(result.x).toBeCloseTo(5, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('closestPointInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, makeCircle(3, 4, 2), { x: 8, y: 4 });
    const result = closestPoint(makeCircle(3, 4, 2), { x: 8, y: 4 });

    expect(result.x).toBeCloseTo((out as { x: number; y: number }).x, 10);
    expect(result.y).toBeCloseTo((out as { x: number; y: number }).y, 10);
  });

  test('center와 point가 같으면 angle 0 위치 (cx+r, cy)를 반환한다', () => {
    const result = closestPoint(makeCircle(2, 3, 5), { x: 2, y: 3 });

    expect(result.x).toBe(7);
    expect(result.y).toBe(3);
  });

  test('empty circle(r<=0)은 center 좌표를 반환한다', () => {
    const result = closestPoint(makeCircle(1, 2, 0), { x: 10, y: 10 });

    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
  });

  test('새 object를 반환하고 입력을 수정하지 않는다', () => {
    const circle = makeCircle(0, 0, 5);
    const result = closestPoint(circle, { x: 10, y: 0 });

    expect(result).not.toBe(circle);
    expect(result).not.toBe(circle.center);
  });
});

// ─── pointAtAngle ────────────────────────────────────────────────────────────

describe('circle companion - pointAtAngle', () => {
  test('angle=0에서 (cx+r, cy) 위치를 새 object로 반환한다', () => {
    const result = pointAtAngle(makeCircle(0, 0, 5), 0);

    expect(result.x).toBeCloseTo(5, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('pointAtAngleInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    pointAtAngleInto(out, makeCircle(1, 2, 3), Math.PI / 3);
    const result = pointAtAngle(makeCircle(1, 2, 3), Math.PI / 3);

    expect(result.x).toBeCloseTo((out as { x: number; y: number }).x, 10);
    expect(result.y).toBeCloseTo((out as { x: number; y: number }).y, 10);
  });

  test('empty circle(r<=0)은 center 좌표를 반환한다', () => {
    const result = pointAtAngle(makeCircle(3, 4, -1), 0);

    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });
});

// ─── pointAtTurn ─────────────────────────────────────────────────────────────

describe('circle companion - pointAtTurn', () => {
  test('turn=0에서 (cx+r, cy) 위치를 새 object로 반환한다', () => {
    const result = pointAtTurn(makeCircle(0, 0, 5), 0);

    expect(result.x).toBeCloseTo(5, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('turn=0.5에서 (-r, 0) 위치인 (cx-r, cy)를 반환한다', () => {
    const result = pointAtTurn(makeCircle(0, 0, 5), 0.5);

    expect(result.x).toBeCloseTo(-5, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  test('pointAtTurnInto와 동일한 결과를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    pointAtTurnInto(out, makeCircle(1, 2, 3), 0.25);
    const result = pointAtTurn(makeCircle(1, 2, 3), 0.25);

    expect(result.x).toBeCloseTo((out as { x: number; y: number }).x, 10);
    expect(result.y).toBeCloseTo((out as { x: number; y: number }).y, 10);
  });

  test('empty circle(r<=0)은 center 좌표를 반환한다', () => {
    const result = pointAtTurn(makeCircle(3, 4, 0), 0.5);

    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });
});

// ─── circleFrom ──────────────────────────────────────────────────────────────

describe('circle companion - circleFrom', () => {
  test('center와 radius를 새 plain object로 반환한다', () => {
    const result = circleFrom(makeCircle(3, 4, 5));

    expect(result.center).toEqual({ x: 3, y: 4 });
    expect(result.radius).toBe(5);
  });

  test('copyInto와 동일한 결과를 반환한다', () => {
    const out: CircleWritable = makeCircle();
    copyInto(out, makeCircle(1, 2, 3));
    const result = circleFrom(makeCircle(1, 2, 3));

    expect(result.center.x).toBe(out.center.x);
    expect(result.center.y).toBe(out.center.y);
    expect(result.radius).toBe(out.radius);
  });

  test('새 object를 반환하고 입력을 수정하지 않는다', () => {
    const circle = makeCircle(3, 4, 5);
    const result = circleFrom(circle);

    expect(result).not.toBe(circle);
    expect(result.center).not.toBe(circle.center);
  });

  test('tuple shorthand 입력을 처리한다', () => {
    const result = circleFrom([[3, 4], 5]);

    expect(result.center).toEqual({ x: 3, y: 4 });
    expect(result.radius).toBe(5);
  });
});

// ─── fromBounds ──────────────────────────────────────────────────────────────

describe('circle companion - fromBounds', () => {
  test('정사각형 bounds에서 내접원을 새 plain object로 반환한다', () => {
    const result = fromBounds(makeBounds(0, 0, 10, 10));

    expect(result.center).toEqual({ x: 5, y: 5 });
    expect(result.radius).toBe(5);
  });

  test('fromBoundsInto와 동일한 결과를 반환한다', () => {
    const out: CircleWritable = makeCircle();
    fromBoundsInto(out, makeBounds(2, 4, 12, 8));
    const result = fromBounds(makeBounds(2, 4, 12, 8));

    expect(result.center.x).toBe(out.center.x);
    expect(result.center.y).toBe(out.center.y);
    expect(result.radius).toBe(out.radius);
  });

  test('empty bounds는 radius 0과 min corner를 반환한다', () => {
    const result = fromBounds(makeBounds(5, 6, 2, 3));

    expect(result.center).toEqual({ x: 5, y: 6 });
    expect(result.radius).toBe(0);
  });
});

// ─── translate ───────────────────────────────────────────────────────────────

describe('circle companion - translate', () => {
  test('center를 offset만큼 이동한 새 plain object를 반환한다', () => {
    const result = translate(makeCircle(1, 2, 5), { x: 3, y: -1 });

    expect(result.center).toEqual({ x: 4, y: 1 });
    expect(result.radius).toBe(5);
  });

  test('translateInto와 동일한 결과를 반환한다', () => {
    const out: CircleWritable = makeCircle();
    translateInto(out, makeCircle(1, 2, 3), { x: 4, y: 5 });
    const result = translate(makeCircle(1, 2, 3), { x: 4, y: 5 });

    expect(result.center.x).toBe(out.center.x);
    expect(result.center.y).toBe(out.center.y);
    expect(result.radius).toBe(out.radius);
  });
});

// ─── scale ───────────────────────────────────────────────────────────────────

describe('circle companion - scale', () => {
  test('center와 radius를 scalar로 곱한 새 plain object를 반환한다', () => {
    const result = scale(makeCircle(2, 4, 5), 2);

    expect(result.center).toEqual({ x: 4, y: 8 });
    expect(result.radius).toBe(10);
  });

  test('scaleInto와 동일한 결과를 반환한다', () => {
    const out: CircleWritable = makeCircle();
    scaleInto(out, makeCircle(1, 2, 3), 1.5);
    const result = scale(makeCircle(1, 2, 3), 1.5);

    expect(result.center.x).toBe(out.center.x);
    expect(result.center.y).toBe(out.center.y);
    expect(result.radius).toBe(out.radius);
  });

  test('음수 scalar로 음수 radius가 될 수 있다 — caller 책임', () => {
    const result = scale(makeCircle(0, 0, 5), -1);

    expect(result.radius).toBe(-5);
  });
});
