/**
 * vec 할당형 wrapper 5개를 검증하는 테스트.
 * 대상: clampLength, lerp, midpoint, projectOn, reflectAcrossNormal.
 * `clampLength`, `projectOn`, `reflectAcrossNormal`은 대응 `*Into`와 같은 값을 반환하는지 본다.
 * `lerp`, `midpoint`는 interpolation 함수에 위임하는 wrapper이므로 원본과 같은 값을 반환하는지 본다.
 * 모두 호출마다 새 객체를 반환해야 한다.
 */
import { describe, expect, test } from 'vitest';
import { lerpPoint } from '../../../src/interpolation/lerp-point';
import { midpoint as interpolationMidpoint } from '../../../src/interpolation/midpoint';
import { clampLength } from '../../../src/vec/clamp-length';
import { clampLengthInto } from '../../../src/vec/clamp-length-into';
import { lerp } from '../../../src/vec/lerp';
import { midpoint } from '../../../src/vec/midpoint';
import { projectOn } from '../../../src/vec/project-on';
import { projectOnInto } from '../../../src/vec/project-on-into';
import { reflectAcrossNormal } from '../../../src/vec/reflect-across-normal';
import { reflectAcrossNormalInto } from '../../../src/vec/reflect-across-normal-into';

describe('vec 할당형 wrapper - clampLength', () => {
  test('긴 벡터는 maxLength로 줄여 대응 Into와 같은 값을 반환한다', () => {
    const v = { x: 6, y: 8 };
    const result = clampLength(v, 2, 5);
    expect(result).toEqual(clampLengthInto({ x: 0, y: 0 }, v, 2, 5));
    expect(result.x).toBeCloseTo(3, 12);
    expect(result.y).toBeCloseTo(4, 12);
  });

  test('짧은 벡터는 minLength로 늘린다', () => {
    const v = { x: 0.6, y: 0.8 };
    const result = clampLength(v, 2, 5);
    expect(result).toEqual(clampLengthInto({ x: 0, y: 0 }, v, 2, 5));
    expect(result.x).toBeCloseTo(1.2, 12);
    expect(result.y).toBeCloseTo(1.6, 12);
  });

  test('입력을 바꾸지 않고 새 객체를 반환한다', () => {
    const v = { x: 6, y: 8 };
    const result = clampLength(v, 2, 5);
    expect(result).not.toBe(v);
    expect(v).toEqual({ x: 6, y: 8 });
  });
});

describe('vec 할당형 wrapper - lerp / midpoint', () => {
  test('lerp는 lerpPoint와 같은 값을 반환한다', () => {
    const a = { x: 0, y: 10 };
    const b = { x: 10, y: 30 };
    expect(lerp(a, b, 0.25)).toEqual(lerpPoint(a, b, 0.25));
    expect(lerp(a, b, 0.25)).toEqual({ x: 2.5, y: 15 });
  });

  test('lerp는 t를 clamp하지 않고 extrapolation한다', () => {
    expect(lerp({ x: 0, y: 10 }, { x: 10, y: 30 }, 1.5)).toEqual({ x: 15, y: 40 });
  });

  test('lerp는 호출마다 새 객체를 반환한다', () => {
    const a = { x: 0, y: 10 };
    const b = { x: 10, y: 30 };
    const first = lerp(a, b, 0.5);
    const second = lerp(a, b, 0.5);
    expect(first).not.toBe(second);
    expect(first).not.toBe(a);
    expect(first).not.toBe(b);
  });

  test('midpoint는 interpolation midpoint와 같은 값을 반환한다', () => {
    const a = { x: 0, y: 10 };
    const b = { x: 10, y: 30 };
    expect(midpoint(a, b)).toEqual(interpolationMidpoint(a, b));
    expect(midpoint(a, b)).toEqual({ x: 5, y: 20 });
  });

  test('midpoint는 호출마다 새 객체를 반환한다', () => {
    const a = { x: 0, y: 10 };
    const b = { x: 10, y: 30 };
    const first = midpoint(a, b);
    expect(first).not.toBe(midpoint(a, b));
    expect(first).not.toBe(a);
    expect(first).not.toBe(b);
  });
});

describe('vec 할당형 wrapper - projectOn / reflectAcrossNormal', () => {
  test('projectOn은 대응 Into와 같은 값을 반환한다', () => {
    const v = { x: 3, y: 4 };
    const direction = { x: 1, y: 0 };
    const result = projectOn(v, direction);
    expect(result).toEqual(projectOnInto({ x: 0, y: 0 }, v, direction));
    expect(result).toEqual({ x: 3, y: 0 });
  });

  test('projectOn은 vector와 direction의 순서를 구분한다', () => {
    const v = { x: 3, y: 4 };
    const direction = { x: 0, y: 1 };
    expect(projectOn(v, direction)).toEqual({ x: 0, y: 4 });
    // direction은 단위 벡터로 가정한다. 인자를 바꾸면 (0, 1)·(3, 4) = 4를 (3, 4)에 곱해 (12, 16)이 된다.
    expect(projectOn(direction, v)).toEqual({ x: 12, y: 16 });
  });

  test('reflectAcrossNormal은 대응 Into와 같은 값을 반환한다', () => {
    const v = { x: 3, y: -4 };
    const n = { x: 0, y: 1 };
    const result = reflectAcrossNormal(v, n);
    expect(result).toEqual(reflectAcrossNormalInto({ x: 0, y: 0 }, v, n));
    expect(result).toEqual({ x: 3, y: 4 });
  });

  test('두 wrapper 모두 입력을 바꾸지 않고 새 객체를 반환한다', () => {
    const v = { x: 3, y: -4 };
    const n = { x: 0, y: 1 };
    const projected = projectOn(v, n);
    const reflected = reflectAcrossNormal(v, n);
    expect(projected).not.toBe(v);
    expect(projected).not.toBe(n);
    expect(reflected).not.toBe(v);
    expect(reflected).not.toBe(n);
    expect(v).toEqual({ x: 3, y: -4 });
    expect(n).toEqual({ x: 0, y: 1 });
  });
});
