/**
 * matrix builder skew 함수 단위 테스트.
 *
 * skewXInto / skewX / skewYInto / skewY
 */

import { describe, expect, test } from 'vitest';
import { skewX } from '../../../src/matrix/skew-x';
import { skewXInto } from '../../../src/matrix/skew-x-into';
import { skewY } from '../../../src/matrix/skew-y';
import { skewYInto } from '../../../src/matrix/skew-y-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

describe('matrix builder - skewXInto', () => {
  test('angle=0이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const result = skewXInto(out, 0);
    expect(result).toBe(out);
    expectNearMatrix(result, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('angle=π/4이면 c=tan(π/4)=1을 기록한다', () => {
    const out = makeMatrix();
    skewXInto(out, Math.PI / 4);
    expect(out.a).toBeCloseTo(1);
    expect(out.b).toBeCloseTo(0);
    expect(out.c).toBeCloseTo(1);
    expect(out.d).toBeCloseTo(1);
    expect(out.tx).toBeCloseTo(0);
    expect(out.ty).toBeCloseTo(0);
  });

  test('음수 angle도 정상 처리한다', () => {
    const out = makeMatrix();
    skewXInto(out, -Math.PI / 4);
    expect(out.c).toBeCloseTo(-1);
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    expect(skewXInto(out, 0)).toBe(out);
  });

  test('subclass 확장 타입도 반환한다', () => {
    const out: { a: number; b: number; c: number; d: number; tx: number; ty: number; tag: string } = {
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      tx: 0,
      ty: 0,
      tag: 'skewX',
    };
    const result = skewXInto(out, 0);
    expect(result).toBe(out);
    expect(result.tag).toBe('skewX');
  });
});

describe('matrix builder - skewX', () => {
  test('새 object로 X축 skew matrix를 반환한다', () => {
    const result = skewX(Math.PI / 6);
    expect(result.a).toBeCloseTo(1);
    expect(result.b).toBeCloseTo(0);
    expect(result.c).toBeCloseTo(Math.tan(Math.PI / 6));
    expect(result.d).toBeCloseTo(1);
    expect(result.tx).toBeCloseTo(0);
    expect(result.ty).toBeCloseTo(0);
  });
});

describe('matrix builder - skewYInto', () => {
  test('angle=0이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    skewYInto(out, 0);
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('angle=π/4이면 b=tan(π/4)=1을 기록한다', () => {
    const out = makeMatrix();
    skewYInto(out, Math.PI / 4);
    expect(out.a).toBeCloseTo(1);
    expect(out.b).toBeCloseTo(1);
    expect(out.c).toBeCloseTo(0);
    expect(out.d).toBeCloseTo(1);
    expect(out.tx).toBeCloseTo(0);
    expect(out.ty).toBeCloseTo(0);
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    expect(skewYInto(out, 0)).toBe(out);
  });
});

describe('matrix builder - skewY', () => {
  test('새 object로 Y축 skew matrix를 반환한다', () => {
    const result = skewY(Math.PI / 6);
    expect(result.a).toBeCloseTo(1);
    expect(result.b).toBeCloseTo(Math.tan(Math.PI / 6));
    expect(result.c).toBeCloseTo(0);
    expect(result.d).toBeCloseTo(1);
  });
});
