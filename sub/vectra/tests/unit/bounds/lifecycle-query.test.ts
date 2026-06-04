import { describe, expect, test } from 'vitest';
import { centerInto } from '../../../src/bounds/center-into';
import { copyInto } from '../../../src/bounds/copy-into';
import { emptyInto } from '../../../src/bounds/empty-into';
import { height } from '../../../src/bounds/height';
import { highInto } from '../../../src/bounds/high-into';
import { isEmpty } from '../../../src/bounds/is-empty';
import { lowInto } from '../../../src/bounds/low-into';
import { width } from '../../../src/bounds/width';
import type { BoundsWritable, XYWritable } from '../../../src/types';

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

describe('bounds lifecycle - emptyInto', () => {
  test('sentinel값 (Infinity, Infinity), (-Infinity, -Infinity)를 기록한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(out.min).toEqual({ x: Infinity, y: Infinity });
    expect(out.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('emptyInto 결과는 isEmpty로 true를 반환한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(isEmpty(out)).toBe(true);
  });
});

describe('bounds lifecycle - copyInto', () => {
  test('min, max 인자로 bounds를 기록하고 out을 반환한다', () => {
    const out = makeBounds();
    const result = copyInto(out, { x: 1, y: 2 }, { x: 5, y: 6 });
    expect(result).toBe(out);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('tuple min, tuple max 인자로 bounds를 기록한다', () => {
    const out = makeBounds();
    copyInto(out, [1, 2], [5, 6]);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('min = out.max, max = out.min 교환 alias에서도 안전하다', () => {
    const out = makeBounds();
    out.min.x = 1;
    out.min.y = 2;
    out.max.x = 5;
    out.max.y = 6;
    copyInto(out, out.max, out.min);
    expect(out.min).toEqual({ x: 5, y: 6 });
    expect(out.max).toEqual({ x: 1, y: 2 });
  });

  test('object min/max BoundsLike를 복사한다', () => {
    const out = makeBounds();
    const src = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('tuple min/max BoundsLike를 복사한다', () => {
    const out = makeBounds();
    const src = { min: [1, 2] as const, max: [5, 6] as const };
    copyInto(out, src);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('tuple shorthand BoundsLike를 복사한다', () => {
    const out = makeBounds();
    copyInto(out, [
      [1, 2],
      [5, 6],
    ]);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('object min, tuple max 혼합 BoundsLike를 복사한다', () => {
    const out = makeBounds();
    const src = { min: { x: 1, y: 2 }, max: [5, 6] as const };
    copyInto(out, src);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('tuple min, object max 혼합 BoundsLike를 복사한다', () => {
    const out = makeBounds();
    const src = { min: [1, 2] as const, max: { x: 5, y: 6 } };
    copyInto(out, src);
    expect(out.min).toEqual({ x: 1, y: 2 });
    expect(out.max).toEqual({ x: 5, y: 6 });
  });

  test('out === bounds alias에서도 안전하게 복사한다', () => {
    const out = makeBounds();
    out.min.x = 3;
    out.min.y = 4;
    out.max.x = 7;
    out.max.y = 8;
    copyInto(out, out);
    expect(out.min).toEqual({ x: 3, y: 4 });
    expect(out.max).toEqual({ x: 7, y: 8 });
  });

  test('소스 bounds를 mutate하지 않는다', () => {
    const out = makeBounds();
    const src = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    copyInto(out, src);
    expect(src.min).toEqual({ x: 1, y: 2 });
    expect(src.max).toEqual({ x: 5, y: 6 });
  });
});

describe('bounds query - width', () => {
  test('object min/max의 width를 반환한다', () => {
    expect(width({ min: { x: 1, y: 0 }, max: { x: 5, y: 0 } })).toBe(4);
  });

  test('tuple min/max의 width를 반환한다', () => {
    expect(width({ min: [1, 0], max: [5, 0] })).toBe(4);
  });

  test('tuple shorthand BoundsLike의 width를 반환한다', () => {
    expect(
      width([
        [1, 0],
        [5, 0],
      ])
    ).toBe(4);
  });

  test('zero-width bounds는 0을 반환한다', () => {
    expect(width({ min: { x: 3, y: 0 }, max: { x: 3, y: 5 } })).toBe(0);
  });

  test('inverted x bounds는 음수 width를 반환한다', () => {
    expect(width({ min: { x: 5, y: 0 }, max: { x: 1, y: 0 } })).toBe(-4);
  });

  test('sentinel bounds는 -Infinity width를 반환한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(width(out)).toBe(-Infinity);
  });
});

describe('bounds query - height', () => {
  test('object min/max의 height를 반환한다', () => {
    expect(height({ min: { x: 0, y: 1 }, max: { x: 0, y: 5 } })).toBe(4);
  });

  test('tuple min/max의 height를 반환한다', () => {
    expect(height({ min: [0, 1], max: [0, 5] })).toBe(4);
  });

  test('tuple shorthand BoundsLike의 height를 반환한다', () => {
    expect(
      height([
        [0, 1],
        [0, 5],
      ])
    ).toBe(4);
  });

  test('zero-height bounds는 0을 반환한다', () => {
    expect(height({ min: { x: 0, y: 3 }, max: { x: 5, y: 3 } })).toBe(0);
  });

  test('inverted y bounds는 음수 height를 반환한다', () => {
    expect(height({ min: { x: 0, y: 5 }, max: { x: 0, y: 1 } })).toBe(-4);
  });

  test('sentinel bounds는 -Infinity height를 반환한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(height(out)).toBe(-Infinity);
  });
});

describe('bounds query - isEmpty', () => {
  test('정상 bounds(width > 0, height > 0)는 false를 반환한다', () => {
    expect(isEmpty({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } })).toBe(false);
  });

  test('zero-width bounds(선 extent)는 empty가 아니다 - false를 반환한다', () => {
    expect(isEmpty({ min: { x: 3, y: 0 }, max: { x: 3, y: 5 } })).toBe(false);
  });

  test('zero-height bounds(선 extent)는 empty가 아니다 - false를 반환한다', () => {
    expect(isEmpty({ min: { x: 0, y: 3 }, max: { x: 5, y: 3 } })).toBe(false);
  });

  test('point bounds(max === min)는 empty가 아니다 - false를 반환한다', () => {
    expect(isEmpty({ min: { x: 3, y: 3 }, max: { x: 3, y: 3 } })).toBe(false);
  });

  test('x가 inverted인 bounds는 true를 반환한다', () => {
    expect(isEmpty({ min: { x: 5, y: 0 }, max: { x: 1, y: 5 } })).toBe(true);
  });

  test('y가 inverted인 bounds는 true를 반환한다', () => {
    expect(isEmpty({ min: { x: 0, y: 5 }, max: { x: 5, y: 1 } })).toBe(true);
  });

  test('x와 y 모두 inverted인 bounds는 true를 반환한다', () => {
    expect(isEmpty({ min: { x: 5, y: 5 }, max: { x: 1, y: 1 } })).toBe(true);
  });

  test('sentinel bounds는 true를 반환한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(isEmpty(out)).toBe(true);
  });

  test('tuple min/max inverted bounds는 true를 반환한다', () => {
    expect(isEmpty({ min: [5, 0], max: [1, 5] })).toBe(true);
  });

  test('tuple min/max 정상 bounds는 false를 반환한다', () => {
    expect(isEmpty({ min: [0, 0], max: [5, 5] })).toBe(false);
  });

  test('tuple shorthand BoundsLike를 empty 판정에 사용한다', () => {
    expect(
      isEmpty([
        [5, 0],
        [1, 5],
      ])
    ).toBe(true);
  });
});

describe('bounds point 출력 - centerInto', () => {
  test('object min/max로 center를 계산하여 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    centerInto(out, { min: { x: 0, y: 0 }, max: { x: 4, y: 6 } });
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('tuple min/max로 center를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    centerInto(out, { min: [0, 0], max: [4, 6] });
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('object min, tuple max 혼합으로 center를 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    centerInto(out, { min: { x: 2, y: 2 }, max: [6, 8] });
    expect(out).toEqual({ x: 4, y: 5 });
  });

  test('out이 bounds.min과 alias되어도 안전하게 기록한다', () => {
    const minPt: XYWritable = { x: 0, y: 0 };
    const maxPt: XYWritable = { x: 4, y: 6 };
    const bounds: BoundsWritable = { min: minPt, max: maxPt };
    // out === bounds.min aliasing
    centerInto(minPt, bounds);
    expect(minPt).toEqual({ x: 2, y: 3 });
  });

  test('out이 bounds.max와 alias되어도 안전하게 기록한다', () => {
    const minPt: XYWritable = { x: 0, y: 0 };
    const maxPt: XYWritable = { x: 4, y: 6 };
    const bounds: BoundsWritable = { min: minPt, max: maxPt };
    // out === bounds.max aliasing
    centerInto(maxPt, bounds);
    expect(maxPt).toEqual({ x: 2, y: 3 });
  });

  test('tuple out에 결과를 기록하고 동일 참조를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = centerInto(out, { min: { x: 0, y: 0 }, max: { x: 4, y: 6 } });
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = centerInto(out, { min: { x: 0, y: 0 }, max: { x: 4, y: 6 } });
    expect(result).toBe(out);
  });

  test('외부 Point class instance를 반환해 method chaining이 가능하다', () => {
    class Point {
      constructor(
        public x: number,
        public y: number
      ) {}

      translateX(dx: number): this {
        this.x += dx;
        return this;
      }
    }

    const p = new Point(0, 0);
    const result = centerInto(p, { min: { x: 0, y: 0 }, max: { x: 4, y: 6 } }).translateX(10);

    expect(result.x).toBe(12);
    expect(result.y).toBe(3);
  });
});

describe('bounds point 출력 - lowInto', () => {
  test('object min을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    lowInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } });
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('tuple min을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    lowInto(out, { min: [3, 4], max: [7, 8] });
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('out === bounds.min alias에서도 안전하게 기록한다', () => {
    const minPt: XYWritable = { x: 1, y: 2 };
    const bounds: BoundsWritable = { min: minPt, max: { x: 5, y: 6 } };
    lowInto(minPt, bounds);
    expect(minPt).toEqual({ x: 1, y: 2 });
  });

  test('out === bounds.max alias에서 max를 min 값으로 안전하게 덮어쓴다', () => {
    // self-write가 아닌 실제 덮어쓰기 시나리오로 aliasing 보호를 검증한다.
    const minPt: XYWritable = { x: 1, y: 2 };
    const maxPt: XYWritable = { x: 5, y: 6 };
    const bounds: BoundsWritable = { min: minPt, max: maxPt };
    lowInto(maxPt, bounds);
    expect(maxPt).toEqual({ x: 1, y: 2 });
    expect(minPt).toEqual({ x: 1, y: 2 });
  });

  test('tuple out에 결과를 기록하고 동일 참조를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = lowInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } });
    expect(result).toBe(out);
    expect(out[0]).toBe(1);
    expect(out[1]).toBe(2);
  });
});

describe('bounds point 출력 - highInto', () => {
  test('object max를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    highInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } });
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('tuple max를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    highInto(out, { min: [1, 2], max: [5, 6] });
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('out === bounds.max alias에서도 안전하게 기록한다', () => {
    const maxPt: XYWritable = { x: 5, y: 6 };
    const bounds: BoundsWritable = { min: { x: 1, y: 2 }, max: maxPt };
    highInto(maxPt, bounds);
    expect(maxPt).toEqual({ x: 5, y: 6 });
  });

  test('out === bounds.min alias에서 min을 max 값으로 안전하게 덮어쓴다', () => {
    // self-write가 아닌 실제 덮어쓰기 시나리오로 aliasing 보호를 검증한다.
    const minPt: XYWritable = { x: 1, y: 2 };
    const maxPt: XYWritable = { x: 5, y: 6 };
    const bounds: BoundsWritable = { min: minPt, max: maxPt };
    highInto(minPt, bounds);
    expect(minPt).toEqual({ x: 5, y: 6 });
    expect(maxPt).toEqual({ x: 5, y: 6 });
  });

  test('tuple out에 결과를 기록하고 동일 참조를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = highInto(out, { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } });
    expect(result).toBe(out);
    expect(out[0]).toBe(5);
    expect(out[1]).toBe(6);
  });
});
