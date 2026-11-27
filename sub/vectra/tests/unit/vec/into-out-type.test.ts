/**
 * v2로 바꾼 vec Into 함수가 전달받은 out을 그 구체 타입 그대로 반환하는지 확인한다.
 * 묶음에서 vec Into 함수를 바꾸면 이 목록에 더한다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import type { Matrix, Point, PointWritable } from '../../../src/types/flat-shapes.internal';
import { absInto } from '../../../src/vec/abs-into';
import { addInto } from '../../../src/vec/add-into';
import { addScaledInto } from '../../../src/vec/add-scaled-into';
import { ceilInto } from '../../../src/vec/ceil-into';
import { clampInto } from '../../../src/vec/clamp-into';
import { clampLengthInto } from '../../../src/vec/clamp-length-into';
import { copyInto } from '../../../src/vec/copy-into';
import { cornerBisectorInto } from '../../../src/vec/corner-bisector-into';
import { directionToInto } from '../../../src/vec/direction-to-into';
import { divideInto } from '../../../src/vec/divide-into';
import { floorInto } from '../../../src/vec/floor-into';
import { fromAngleInto } from '../../../src/vec/from-angle-into';
import { fromPolarInto } from '../../../src/vec/from-polar-into';
import { lerpInto } from '../../../src/vec/lerp-into';
import { maxInto } from '../../../src/vec/max-into';
import { midpointInto } from '../../../src/vec/midpoint-into';
import { minInto } from '../../../src/vec/min-into';
import { moduloInto } from '../../../src/vec/modulo-into';
import { moveTowardInto } from '../../../src/vec/move-toward-into';
import { multiplyInto } from '../../../src/vec/multiply-into';
import { negateInto } from '../../../src/vec/negate-into';
import { normalLeftInto } from '../../../src/vec/normal-left-into';
import { normalRightInto } from '../../../src/vec/normal-right-into';
import { normalizeInto } from '../../../src/vec/normalize-into';
import { oneInto } from '../../../src/vec/one-into';
import { perpendicularInto } from '../../../src/vec/perpendicular-into';
import { pointOnRayInto } from '../../../src/vec/point-on-ray-into';
import { projectOnInto } from '../../../src/vec/project-on-into';
import { reflectAcrossNormalInto } from '../../../src/vec/reflect-across-normal-into';
import { reflectInto } from '../../../src/vec/reflect-into';
import { rejectFromInto } from '../../../src/vec/reject-from-into';
import { rotateAroundInto } from '../../../src/vec/rotate-around-into';
import { rotateInto } from '../../../src/vec/rotate-into';
import { roundInto } from '../../../src/vec/round-into';
import { scaleInto } from '../../../src/vec/scale-into';
import { setLengthInto } from '../../../src/vec/set-length-into';
import { slerpInto } from '../../../src/vec/slerp-into';
import { slideInto } from '../../../src/vec/slide-into';
import { snapToGridInto } from '../../../src/vec/snap-to-grid-into';
import { subInto } from '../../../src/vec/sub-into';
import { subtractScaledInto } from '../../../src/vec/subtract-scaled-into';
import { type PolarWritable, toPolarInto } from '../../../src/vec/to-polar-into';
import { transformInto } from '../../../src/vec/transform-into';
import { zeroInto } from '../../../src/vec/zero-into';

/** 메서드를 가진 외부 점 클래스. Into 반환값으로 메서드를 이어 부를 수 있어야 한다. */
class Sprite {
  x = 0;
  y = 0;
  shift(dx: number): Sprite {
    this.x += dx;
    return this;
  }
}

/** 메서드를 가진 외부 극좌표 출력 클래스. */
class Polar {
  r = 0;
  theta = 0;

  rotate(angle: number): Polar {
    this.theta += angle;
    return this;
  }
}

const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 2, ty: 3 };
const a = { x: -1.5, y: 2 };
const b = { x: 3, y: -4 };

describe('vec Into 반환 타입', () => {
  test('반직선 위 점을 구할 때 x/y 입력과 출력을 받는다', () => {
    expectTypeOf(pointOnRayInto).parameter(0).toEqualTypeOf<PointWritable>();
    expectTypeOf(pointOnRayInto).parameter(1).toEqualTypeOf<Point>();
  });

  test('성분별 최솟값은 x/y 입력과 출력을 받는다', () => {
    expectTypeOf(minInto).parameter(0).toEqualTypeOf<PointWritable>();
    expectTypeOf(minInto).parameter(1).toEqualTypeOf<Point>();
  });

  test('각도에서 벡터를 만들 때 x/y 출력을 받는다', () => {
    expectTypeOf(fromAngleInto).parameter(0).toEqualTypeOf<PointWritable>();
  });

  test('복사는 x/y 입력과 출력을 받는다', () => {
    expectTypeOf(copyInto).parameter(0).toEqualTypeOf<PointWritable>();
    expectTypeOf(copyInto).parameter(1).toEqualTypeOf<Point>();
  });

  test('외부 클래스 out을 넘기면 같은 객체를 그 클래스 타입으로 반환한다', () => {
    const cases = [
      (out: Sprite) => absInto(out, a),
      (out: Sprite) => addInto(out, a, b),
      (out: Sprite) => addScaledInto(out, a, b, 2),
      (out: Sprite) => ceilInto(out, a),
      (out: Sprite) => clampInto(out, a, { x: -1, y: -1 }, { x: 1, y: 1 }),
      (out: Sprite) => clampLengthInto(out, b, 1, 2),
      (out: Sprite) => copyInto(out, a),
      (out: Sprite) => cornerBisectorInto(out, a, b, { x: 0, y: 0 }),
      (out: Sprite) => directionToInto(out, a, b),
      (out: Sprite) => divideInto(out, a, b),
      (out: Sprite) => floorInto(out, a),
      (out: Sprite) => fromAngleInto(out, 1),
      (out: Sprite) => fromPolarInto(out, 2, 1),
      (out: Sprite) => lerpInto(out, a, b, 0.5),
      (out: Sprite) => maxInto(out, a, b),
      (out: Sprite) => midpointInto(out, a, b),
      (out: Sprite) => minInto(out, a, b),
      (out: Sprite) => moduloInto(out, a, b),
      (out: Sprite) => moveTowardInto(out, a, b, 1),
      (out: Sprite) => multiplyInto(out, a, b),
      (out: Sprite) => negateInto(out, a),
      (out: Sprite) => normalLeftInto(out, a),
      (out: Sprite) => normalRightInto(out, a),
      (out: Sprite) => normalizeInto(out, a),
      (out: Sprite) => oneInto(out),
      (out: Sprite) => perpendicularInto(out, a),
      (out: Sprite) => pointOnRayInto(out, a, b, 1),
      (out: Sprite) => projectOnInto(out, a, b),
      (out: Sprite) => reflectAcrossNormalInto(out, a, b),
      (out: Sprite) => reflectInto(out, a, b),
      (out: Sprite) => rejectFromInto(out, a, b),
      (out: Sprite) => rotateAroundInto(out, a, b, 1),
      (out: Sprite) => rotateInto(out, a, 1),
      (out: Sprite) => roundInto(out, a),
      (out: Sprite) => scaleInto(out, a, 2),
      (out: Sprite) => setLengthInto(out, a, 2),
      (out: Sprite) => slerpInto(out, { x: 1, y: 0 }, { x: 0, y: 1 }, 0.5),
      (out: Sprite) => slideInto(out, a, b),
      (out: Sprite) => snapToGridInto(out, a, b),
      (out: Sprite) => subInto(out, a, b),
      (out: Sprite) => subtractScaledInto(out, a, b, 2),
      (out: Sprite) => transformInto(out, a, matrix),
      (out: Sprite) => zeroInto(out),
    ];
    for (const run of cases) {
      const sprite = new Sprite();
      const result = run(sprite);
      if (result === false) throw new Error('결과가 정의되는 입력을 사용한다');
      expect(result).toBe(sprite);
      expect(result.shift(0)).toBe(sprite);
    }

    const sprite = new Sprite();
    expectTypeOf(absInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(addInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(addScaledInto(sprite, a, b, 2)).toEqualTypeOf<Sprite>();
    expectTypeOf(ceilInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(clampInto(sprite, a, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(clampLengthInto(sprite, b, 1, 2)).toEqualTypeOf<Sprite>();
    expectTypeOf(copyInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(cornerBisectorInto(sprite, a, b, { x: 0, y: 0 })).toEqualTypeOf<Sprite | false>();
    expectTypeOf(directionToInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(divideInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(floorInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(fromAngleInto(sprite, 1)).toEqualTypeOf<Sprite>();
    expectTypeOf(fromPolarInto(sprite, 2, 1)).toEqualTypeOf<Sprite>();
    expectTypeOf(lerpInto(sprite, a, b, 0.5)).toEqualTypeOf<Sprite>();
    expectTypeOf(maxInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(midpointInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(minInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(moduloInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(moveTowardInto(sprite, a, b, 1)).toEqualTypeOf<Sprite>();
    expectTypeOf(multiplyInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(negateInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(normalLeftInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(normalRightInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(normalizeInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(oneInto(sprite)).toEqualTypeOf<Sprite>();
    expectTypeOf(perpendicularInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(pointOnRayInto(sprite, a, b, 1)).toEqualTypeOf<Sprite | false>();
    expectTypeOf(projectOnInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(reflectAcrossNormalInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(reflectInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(rejectFromInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(rotateAroundInto(sprite, a, b, 1)).toEqualTypeOf<Sprite>();
    expectTypeOf(rotateInto(sprite, a, 1)).toEqualTypeOf<Sprite>();
    expectTypeOf(roundInto(sprite, a)).toEqualTypeOf<Sprite>();
    expectTypeOf(scaleInto(sprite, a, 2)).toEqualTypeOf<Sprite>();
    expectTypeOf(setLengthInto).parameter(0).toEqualTypeOf<PointWritable>();
    expectTypeOf(setLengthInto(sprite, a, 2)).toEqualTypeOf<Sprite>();
    expectTypeOf(slerpInto(sprite, { x: 1, y: 0 }, { x: 0, y: 1 }, 0.5)).toEqualTypeOf<Sprite>();
    expectTypeOf(slideInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(snapToGridInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(subInto(sprite, a, b)).toEqualTypeOf<Sprite>();
    expectTypeOf(subtractScaledInto(sprite, a, b, 2)).toEqualTypeOf<Sprite>();
    expectTypeOf(transformInto(sprite, a, matrix)).toEqualTypeOf<Sprite>();
    expectTypeOf(zeroInto(sprite)).toEqualTypeOf<Sprite>();
    expectTypeOf(transformInto).parameter(2).toEqualTypeOf<Matrix>();
  });

  test('toPolarInto는 메서드가 있는 극좌표 out의 인스턴스와 타입을 보존한다', () => {
    const polar = new Polar();
    const result = toPolarInto(polar, { x: 1, y: 0 });
    expectTypeOf(toPolarInto).parameter(0).toEqualTypeOf<PolarWritable>();
    expectTypeOf(toPolarInto).parameter(1).toEqualTypeOf<Point>();
    expectTypeOf(result).toEqualTypeOf<Polar>();
    expect(result).toBe(polar);
    expect(result.r).toBe(1);
    expect(result.rotate(0)).toBe(polar);
  });
});
