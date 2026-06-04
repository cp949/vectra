/**
 * matrix builder fitBounds 함수 단위 테스트.
 *
 * fitBoundsInto / fitBounds
 */

import { describe, expect, test } from 'vitest';
import { fitBounds } from '../../../src/matrix/fit-bounds';
import { fitBoundsInto } from '../../../src/matrix/fit-bounds-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

describe('matrix builder - fitBoundsInto', () => {
  test('contain 모드: 정사각형 src를 가로로 넓은 dest에 맞춘다', () => {
    // src: [0,0]-[100,100], dest: [0,0]-[200,100]
    const out = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const dest = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    fitBoundsInto(out, src, dest, { mode: 'contain' });
    expect(out.a).toBeCloseTo(1);
    expect(out.d).toBeCloseTo(1);
    expect(out.tx).toBeCloseTo(50);
    expect(out.ty).toBeCloseTo(0);
  });

  test('stretch 모드: src를 dest에 비율 무시하고 맞춘다', () => {
    const out = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: 100, y: 50 } };
    const dest = { min: { x: 10, y: 20 }, max: { x: 210, y: 120 } };
    fitBoundsInto(out, src, dest, { mode: 'stretch' });
    expect(out.a).toBeCloseTo(2);
    expect(out.d).toBeCloseTo(2);
    expect(out.tx).toBeCloseTo(10);
    expect(out.ty).toBeCloseTo(20);
  });

  test('empty src(min.x >= max.x)이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const src = { min: { x: 50, y: 0 }, max: { x: 50, y: 100 } };
    const dest = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    fitBoundsInto(out, src, dest);
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('empty dest(min.y >= max.y)이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const dest = { min: { x: 0, y: 50 }, max: { x: 100, y: 50 } };
    fitBoundsInto(out, src, dest);
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('유효하지 않은 mode는 RangeError를 던진다', () => {
    const out = makeMatrix();
    const b = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    expect(() => fitBoundsInto(out, b, b, { mode: 'fill' as never })).toThrow(RangeError);
  });

  test('Infinity component는 RangeError를 던진다', () => {
    const out = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: Infinity, y: 100 } };
    const dest = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    expect(() => fitBoundsInto(out, src, dest)).toThrow(RangeError);
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    const b = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    expect(fitBoundsInto(out, b, b)).toBe(out);
  });

  test('mode 기본값은 contain이다', () => {
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const dest = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    fitBoundsInto(out1, src, dest);
    fitBoundsInto(out2, src, dest, { mode: 'contain' });
    expectNearMatrix(out1, out2);
  });

  test('tuple BoundsLike input도 처리한다', () => {
    const out = makeMatrix();
    // BoundsTuple = [min: XYInput, max: XYInput]
    fitBoundsInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ]
    );
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });
});

describe('matrix builder - fitBounds', () => {
  test('새 object로 fit matrix를 반환한다', () => {
    const result = fitBounds(
      { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } },
      { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } }
    );
    // srcRatio=2, destRatio=1 → width 기준 scale=0.5
    expect(result.a).toBeCloseTo(0.5);
    expect(result.d).toBeCloseTo(0.5);
  });
});
