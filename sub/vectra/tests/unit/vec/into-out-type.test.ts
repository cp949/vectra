/**
 * v2로 바꾼 vec Into 함수가 전달받은 out을 그 구체 타입 그대로 반환하는지 확인한다.
 * 묶음에서 vec Into 함수를 바꾸면 이 목록에 더한다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { absInto } from '../../../src/vec/abs-into';
import { addInto } from '../../../src/vec/add-into';
import { addScaledInto } from '../../../src/vec/add-scaled-into';
import { ceilInto } from '../../../src/vec/ceil-into';
import { clampInto } from '../../../src/vec/clamp-into';
import { clampLengthInto } from '../../../src/vec/clamp-length-into';

/** 메서드를 가진 외부 점 클래스. Into 반환값으로 메서드를 이어 부를 수 있어야 한다. */
class Sprite {
  x = 0;
  y = 0;
  shift(dx: number): Sprite {
    this.x += dx;
    return this;
  }
}

const a = { x: -1.5, y: 2 };
const b = { x: 3, y: -4 };

describe('vec Into 반환 타입', () => {
  test('외부 클래스 out을 넘기면 같은 객체를 그 클래스 타입으로 반환한다', () => {
    const cases = [
      (out: Sprite) => absInto(out, a),
      (out: Sprite) => addInto(out, a, b),
      (out: Sprite) => addScaledInto(out, a, b, 2),
      (out: Sprite) => ceilInto(out, a),
      (out: Sprite) => clampInto(out, a, { x: -1, y: -1 }, { x: 1, y: 1 }),
      (out: Sprite) => clampLengthInto(out, b, 1, 2),
    ];
    for (const run of cases) {
      const sprite = new Sprite();
      const result = run(sprite);
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
  });
});
