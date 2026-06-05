/**
 * vec point-output helper 단위 테스트.
 *
 * perpendicularInto/fromAngleInto/rotateInto/rotateAroundInto 및 관련 companion을 검증한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
import type { XYWritable } from '../../../src/types';
import { fromAngle } from '../../../src/vec/from-angle';
import { fromAngleInto } from '../../../src/vec/from-angle-into';
import { normalize } from '../../../src/vec/normalize';
import { perpendicular } from '../../../src/vec/perpendicular';
import { perpendicularInto } from '../../../src/vec/perpendicular-into';
import { rotate } from '../../../src/vec/rotate';
import { rotateAround } from '../../../src/vec/rotate-around';
import { rotateAroundInto } from '../../../src/vec/rotate-around-into';
import { rotateInto } from '../../../src/vec/rotate-into';

describe('vec point-output - perpendicularInto', () => {
  test('object 입력에서 CCW 90도 수직 벡터 (-y, x)를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = perpendicularInto(out, { x: 3, y: 4 });

    expect(result).toBe(out);
    expect(out).toEqual({ x: -4, y: 3 });
  });

  test('tuple 입력에서 CCW 90도 수직 벡터를 out에 기록한다', () => {
    // [1, 0] → (-0, 1) 인데 -0과 +0은 수학적으로 동일하므로 toBeCloseTo로 검증한다
    const out: XYWritable = { x: 0, y: 0 };

    const result = perpendicularInto(out, [1, 0]);

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('zero vector 입력에서 (0, 0)을 out에 기록하고 throw하지 않는다', () => {
    // 영 벡터 입력: (-0, 0)이 나올 수 있으므로 toBeCloseTo로 검증한다
    const out: XYWritable = { x: 99, y: 99 };

    const result = perpendicularInto(out, { x: 0, y: 0 });

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    // self-aliasing: out과 input이 같은 object일 때 잘못된 결과가 나오면 안 된다
    const vec: XYWritable = { x: 3, y: 4 };

    perpendicularInto(vec, vec);

    expect(vec).toEqual({ x: -4, y: 3 });
  });

  test('mutable tuple out에 수직 벡터를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = perpendicularInto(out, { x: 2, y: 5 });

    expect(result).toBe(out);
    expect(out[0]).toBe(-5);
    expect(out[1]).toBe(2);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('vec point-output - fromAngleInto', () => {
  test('angle=0에서 (1, 0) unit vector를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = fromAngleInto(out, 0);

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('angle=π/2에서 (0, 1) unit vector를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    fromAngleInto(out, Math.PI / 2);

    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('angle=π에서 (-1, 0) unit vector를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    fromAngleInto(out, Math.PI);

    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('mutable tuple out에 unit vector를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = fromAngleInto(out, 0);

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(1, 10);
    expect(out[1]).toBeCloseTo(0, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('vec point-output - rotateInto', () => {
  test('(1, 0) 벡터를 90도 CCW 회전하면 (0, 1)이 된다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = rotateInto(out, { x: 1, y: 0 }, Math.PI / 2);

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('(1, 0) 벡터를 180도 회전하면 (-1, 0)이 된다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    rotateInto(out, [1, 0], Math.PI);

    expect(out.x).toBeCloseTo(-1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    // self-aliasing: 회전 전 x를 읽어두지 않으면 y 계산에서 오염된 값이 사용된다
    const vec: XYWritable = { x: 1, y: 0 };

    rotateInto(vec, vec, Math.PI / 2);

    expect(vec.x).toBeCloseTo(0, 10);
    expect(vec.y).toBeCloseTo(1, 10);
  });

  test('mutable tuple out에 회전 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = rotateInto(out, [1, 0], Math.PI / 2);

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(0, 10);
    expect(out[1]).toBeCloseTo(1, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('vec point-output - rotateAroundInto', () => {
  test('center=(2,2) 기준으로 (3,2)를 90도 CCW 회전하면 (2,3)이 된다', () => {
    // (3,2)는 center에서 (1,0) 방향이므로 90도 회전하면 center에서 (0,1) 방향인 (2,3)
    const out: XYWritable = { x: 0, y: 0 };

    const result = rotateAroundInto(out, { x: 3, y: 2 }, { x: 2, y: 2 }, Math.PI / 2);

    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(3, 10);
  });

  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    const vec: XYWritable = { x: 3, y: 2 };

    rotateAroundInto(vec, vec, { x: 2, y: 2 }, Math.PI / 2);

    expect(vec.x).toBeCloseTo(2, 10);
    expect(vec.y).toBeCloseTo(3, 10);
  });

  test('center object는 mutate되지 않는다', () => {
    // center는 XYInput이므로 읽기만 해야 하고 변경되면 안 된다
    const out: XYWritable = { x: 0, y: 0 };
    const center: XYWritable = { x: 2, y: 2 };

    rotateAroundInto(out, { x: 3, y: 2 }, center, Math.PI / 2);

    expect(center).toEqual({ x: 2, y: 2 });
  });

  test('mutable tuple out에 회전 결과를 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = rotateAroundInto(out, { x: 3, y: 2 }, { x: 2, y: 2 }, Math.PI / 2);

    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(2, 10);
    expect(out[1]).toBeCloseTo(3, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

// --- companion 함수 테스트 ---

describe('vec companion - normalize', () => {
  test('입력 벡터를 정규화해 새 object를 반환한다', () => {
    const result = normalize({ x: 3, y: 4 });

    expect(result.x).toBeCloseTo(0.6, 10);
    expect(result.y).toBeCloseTo(0.8, 10);
  });

  test('영벡터 입력에서 { x: 0, y: 0 }을 반환하고 throw하지 않는다', () => {
    const result = normalize({ x: 0, y: 0 });

    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('vec companion - perpendicular', () => {
  test('CCW 90도 수직 벡터 (-y, x)를 새 object로 반환한다', () => {
    const result = perpendicular({ x: 3, y: 4 });

    expect(result).toEqual({ x: -4, y: 3 });
  });
});

describe('vec companion - fromAngle', () => {
  test('angle=0에서 (1, 0) unit vector를 새 object로 반환한다', () => {
    const result = fromAngle(0);

    expect(result.x).toBeCloseTo(1, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });
});

describe('vec companion - rotate', () => {
  test('(1, 0)를 90도 CCW 회전하면 (0, 1)인 새 object를 반환한다', () => {
    const result = rotate({ x: 1, y: 0 }, Math.PI / 2);

    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(1, 10);
  });
});

describe('vec companion - rotateAround', () => {
  test('center=(2,2) 기준으로 (3,2)를 90도 CCW 회전하면 (2,3)인 새 object를 반환한다', () => {
    const result = rotateAround({ x: 3, y: 2 }, { x: 2, y: 2 }, Math.PI / 2);

    expect(result.x).toBeCloseTo(2, 10);
    expect(result.y).toBeCloseTo(3, 10);
  });
});
