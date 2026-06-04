import { describe, expect, test } from 'vitest';
import { pointAtAngle } from '../../../src/ellipse/point-at-angle';
import { pointAtAngleInto } from '../../../src/ellipse/point-at-angle-into';
import { pointAtTurn } from '../../../src/ellipse/point-at-turn';
import { pointAtTurnInto } from '../../../src/ellipse/point-at-turn-into';
import { scale } from '../../../src/ellipse/scale';
import { scaleInto } from '../../../src/ellipse/scale-into';
import { translate } from '../../../src/ellipse/translate';
import { translateInto } from '../../../src/ellipse/translate-into';
import type { EllipseWritable, XYTupleWritable } from '../../../src/types';
import { makeEllipse } from './_helpers';

// ─── pointAtAngleInto ────────────────────────────────────────────────────────

describe('ellipse point - pointAtAngleInto', () => {
  test('angle=0에서 x축 양의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointAtAngleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, 0);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(4, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('angle=π/2에서 y축 양의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, Math.PI / 2);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(6, 10);
  });

  test('angle=π에서 x축 음의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, Math.PI);
    expect(out.x).toBeCloseTo(-2, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('angle=3π/2에서 y축 음의 끝점을 기록한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, (3 * Math.PI) / 2);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(-2, 10);
  });

  test('empty ellipse (radiusX=0)이면 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    pointAtAngleInto(out, { center: { x: 5, y: 3 }, radiusX: 0, radiusY: 4 }, 0);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });

  test('empty ellipse (radiusY<=0)이면 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    pointAtAngleInto(out, { center: { x: 5, y: 3 }, radiusX: 3, radiusY: -1 }, 0);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });

  test('mutable tuple output에도 기록한다', () => {
    const out: [number, number] = [0, 0];
    pointAtAngleInto(out, { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 2 }, 0);
    expect(out[0]).toBeCloseTo(5, 10);
    expect(out[1]).toBeCloseTo(0, 10);
  });

  test('tuple EllipseLike input을 처리한다', () => {
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, [[0, 0], 5, 2] as const, 0);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});

// ─── pointAtAngle ────────────────────────────────────────────────────────────

describe('ellipse point - pointAtAngle', () => {
  test('angle=0에서 x축 양의 끝점 plain object를 반환한다', () => {
    const result = pointAtAngle({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, 0);
    expect(result.x).toBeCloseTo(4, 10);
    expect(result.y).toBeCloseTo(2, 10);
  });

  test('angle=π/2에서 y축 양의 끝점 plain object를 반환한다', () => {
    const result = pointAtAngle({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, Math.PI / 2);
    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(6, 10);
  });

  test('empty ellipse이면 center plain object를 반환한다', () => {
    const result = pointAtAngle({ center: { x: 5, y: 3 }, radiusX: 0, radiusY: 4 }, 0);
    expect(result.x).toBe(5);
    expect(result.y).toBe(3);
  });

  test('pointAtAngleInto와 같은 좌표를 반환한다', () => {
    const e = { center: { x: 2, y: -1 }, radiusX: 4, radiusY: 3 };
    const out = { x: 0, y: 0 };
    pointAtAngleInto(out, e, 1.2);
    const result = pointAtAngle(e, 1.2);
    expect(result.x).toBeCloseTo(out.x, 10);
    expect(result.y).toBeCloseTo(out.y, 10);
  });
});

// ─── pointAtTurnInto ─────────────────────────────────────────────────────────

describe('ellipse point - pointAtTurnInto', () => {
  test('turn=0에서 angle=0과 같은 좌표를 기록한다', () => {
    const e = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, 0);
    const result = pointAtTurnInto(out2, e, 0);
    expect(result).toBe(out2);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('turn=0.25에서 angle=π/2와 같은 좌표를 기록한다', () => {
    const e = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, Math.PI / 2);
    pointAtTurnInto(out2, e, 0.25);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('turn=0.5에서 angle=π와 같은 좌표를 기록한다', () => {
    const e = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, Math.PI);
    pointAtTurnInto(out2, e, 0.5);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('turn=0.75에서 angle=3π/2와 같은 좌표를 기록한다', () => {
    const e = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtAngleInto(out1, e, (3 * Math.PI) / 2);
    pointAtTurnInto(out2, e, 0.75);
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });

  test('empty ellipse이면 center를 기록한다', () => {
    const out = { x: 9, y: 9 };
    pointAtTurnInto(out, { center: { x: 5, y: 3 }, radiusX: 0, radiusY: 4 }, 0.5);
    expect(out.x).toBe(5);
    expect(out.y).toBe(3);
  });

  test('turn wrap 없음: turn=1.0은 turn=0과 같다', () => {
    const e = { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 };
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointAtTurnInto(out1, e, 0);
    pointAtTurnInto(out2, e, 1);
    // angle = 2π이면 cos(2π)=1, sin(2π)≈0, angle=0과 실질적으로 같다
    expect(out2.x).toBeCloseTo(out1.x, 10);
    expect(out2.y).toBeCloseTo(out1.y, 10);
  });
});

// ─── pointAtTurn ─────────────────────────────────────────────────────────────

describe('ellipse point - pointAtTurn', () => {
  test('turn=0에서 plain object를 반환한다', () => {
    const e = { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 };
    const result = pointAtTurn(e, 0);
    const ref = { x: 0, y: 0 };
    pointAtTurnInto(ref, e, 0);
    expect(result.x).toBeCloseTo(ref.x, 10);
    expect(result.y).toBeCloseTo(ref.y, 10);
  });

  test('empty ellipse이면 center plain object를 반환한다', () => {
    const result = pointAtTurn({ center: { x: 5, y: 3 }, radiusX: -1, radiusY: 2 }, 0.5);
    expect(result.x).toBe(5);
    expect(result.y).toBe(3);
  });
});

// ─── translateInto ───────────────────────────────────────────────────────────

describe('ellipse transform - translateInto', () => {
  test('center에 offset을 더하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = translateInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, { x: 5, y: -1 });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 6, y: 1 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });

  test('radii는 그대로 복사한다', () => {
    const out = makeEllipse();
    translateInto(out, { center: { x: 0, y: 0 }, radiusX: 7, radiusY: 5 }, { x: 2, y: 3 });
    expect(out.radiusX).toBe(7);
    expect(out.radiusY).toBe(5);
  });

  test('out === ellipse aliasing에서도 안전하게 동작한다', () => {
    const out = makeEllipse(3, 4, 5, 2);
    translateInto(out, out, { x: 1, y: 2 });
    expect(out.center).toEqual({ x: 4, y: 6 });
    expect(out.radiusX).toBe(5);
    expect(out.radiusY).toBe(2);
  });

  test('tuple offset input을 처리한다', () => {
    const out = makeEllipse();
    translateInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, [5, -1]);
    expect(out.center).toEqual({ x: 6, y: 1 });
  });

  test('tuple EllipseLike input을 처리한다', () => {
    const out = makeEllipse();
    translateInto(out, [[1, 2], 3, 4] as const, { x: 5, y: -1 });
    expect(out.center).toEqual({ x: 6, y: 1 });
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    translateInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, { x: 5, y: -1 });
    expect(center).toEqual([6, 1]);
    expect(out.radiusX).toBe(3);
    expect(out.radiusY).toBe(4);
  });
});

// ─── translate ───────────────────────────────────────────────────────────────

describe('ellipse transform - translate', () => {
  test('center에 offset을 더한 plain object를 반환한다', () => {
    const result = translate({ center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, { x: 5, y: -1 });
    expect(result).toEqual({ center: { x: 6, y: 1 }, radiusX: 3, radiusY: 4 });
  });

  test('translateInto와 같은 결과를 반환한다', () => {
    const e = { center: { x: 2, y: -1 }, radiusX: 4, radiusY: 3 };
    const offset = { x: -3, y: 7 };
    const out = makeEllipse();
    translateInto(out, e, offset);
    const result = translate(e, offset);
    expect(result.center).toEqual(out.center);
    expect(result.radiusX).toBe(out.radiusX);
    expect(result.radiusY).toBe(out.radiusY);
  });

  test('tuple EllipseLike input과 tuple offset을 처리한다', () => {
    const result = translate([[1, 2], 3, 4] as const, [5, -1]);
    expect(result).toEqual({ center: { x: 6, y: 1 }, radiusX: 3, radiusY: 4 });
  });
});

// ─── scaleInto ───────────────────────────────────────────────────────────────

describe('ellipse transform - scaleInto', () => {
  test('center와 radii에 scale.x, scale.y를 곱하고 out을 반환한다', () => {
    const out = makeEllipse();
    const result = scaleInto(out, { center: { x: 2, y: 3 }, radiusX: 4, radiusY: 5 }, { x: 2, y: 3 });
    expect(result).toBe(out);
    expect(out.center).toEqual({ x: 4, y: 9 });
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
  });

  test('non-uniform scale을 각 축에 독립 적용한다', () => {
    const out = makeEllipse();
    scaleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, { x: 0.5, y: 2 });
    expect(out.center).toEqual({ x: 0.5, y: 4 });
    expect(out.radiusX).toBe(1.5);
    expect(out.radiusY).toBe(8);
  });

  test('out === ellipse aliasing에서도 안전하게 동작한다', () => {
    const out = makeEllipse(2, 3, 4, 5);
    scaleInto(out, out, { x: 2, y: 3 });
    expect(out.center).toEqual({ x: 4, y: 9 });
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
  });

  test('uniform scale (scale.x === scale.y)을 처리한다', () => {
    const out = makeEllipse();
    scaleInto(out, { center: { x: 1, y: 2 }, radiusX: 3, radiusY: 4 }, { x: 2, y: 2 });
    expect(out.center).toEqual({ x: 2, y: 4 });
    expect(out.radiusX).toBe(6);
    expect(out.radiusY).toBe(8);
  });

  test('tuple scale input을 처리한다', () => {
    const out = makeEllipse();
    scaleInto(out, { center: { x: 2, y: 3 }, radiusX: 4, radiusY: 5 }, [2, 3]);
    expect(out.center).toEqual({ x: 4, y: 9 });
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
  });

  test('tuple EllipseLike input을 처리한다', () => {
    const out = makeEllipse();
    scaleInto(out, [[2, 3], 4, 5] as const, { x: 2, y: 3 });
    expect(out.center).toEqual({ x: 4, y: 9 });
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
  });

  test('mutable tuple center storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const out: EllipseWritable<XYTupleWritable> = { center, radiusX: 0, radiusY: 0 };
    scaleInto(out, { center: { x: 2, y: 3 }, radiusX: 4, radiusY: 5 }, { x: 2, y: 3 });
    expect(center).toEqual([4, 9]);
    expect(out.radiusX).toBe(8);
    expect(out.radiusY).toBe(15);
  });
});

// ─── scale ───────────────────────────────────────────────────────────────────

describe('ellipse transform - scale', () => {
  test('center와 radii에 scale.x, scale.y를 곱한 plain object를 반환한다', () => {
    const result = scale({ center: { x: 2, y: 3 }, radiusX: 4, radiusY: 5 }, { x: 2, y: 3 });
    expect(result).toEqual({ center: { x: 4, y: 9 }, radiusX: 8, radiusY: 15 });
  });

  test('scaleInto와 같은 결과를 반환한다', () => {
    const e = { center: { x: 2, y: -1 }, radiusX: 4, radiusY: 3 };
    const s = { x: 0.5, y: 2 };
    const out = makeEllipse();
    scaleInto(out, e, s);
    const result = scale(e, s);
    expect(result.center).toEqual(out.center);
    expect(result.radiusX).toBe(out.radiusX);
    expect(result.radiusY).toBe(out.radiusY);
  });

  test('tuple EllipseLike input과 tuple scale을 처리한다', () => {
    const result = scale([[2, 3], 4, 5] as const, [2, 3]);
    expect(result).toEqual({ center: { x: 4, y: 9 }, radiusX: 8, radiusY: 15 });
  });
});
