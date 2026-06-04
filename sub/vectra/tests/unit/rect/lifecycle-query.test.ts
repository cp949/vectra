import { describe, expect, test } from 'vitest';
import { area } from '../../../src/rect/area';
import { bottom } from '../../../src/rect/bottom';
import { bottomLeftInto } from '../../../src/rect/bottom-left-into';
import { bottomRightInto } from '../../../src/rect/bottom-right-into';
import { centerInto } from '../../../src/rect/center-into';
import { copyInto } from '../../../src/rect/copy-into';
import { isEmpty } from '../../../src/rect/is-empty';
import { left } from '../../../src/rect/left';
import { right } from '../../../src/rect/right';
import { sizeInto } from '../../../src/rect/size-into';
import { top } from '../../../src/rect/top';
import { topLeftInto } from '../../../src/rect/top-left-into';
import { topRightInto } from '../../../src/rect/top-right-into';
import type { RectWritable, XYWritable } from '../../../src/types';

describe('rect lifecycle - copyInto', () => {
  test('x, y, width, height 인자로 rect를 기록하고 out을 반환한다', () => {
    const out: RectWritable = { x: 0, y: 0, width: 0, height: 0 };

    const result = copyInto(out, 1, 2, 10, 20);

    expect(result).toBe(out);
    expect(out).toEqual({ x: 1, y: 2, width: 10, height: 20 });
  });

  test('음수와 zero dimension을 그대로 기록한다', () => {
    const negative: RectWritable = { x: 0, y: 0, width: 0, height: 0 };
    const zero: RectWritable = { x: 0, y: 0, width: 1, height: 1 };

    copyInto(negative, 5, 5, -3, -4);
    copyInto(zero, 3, 7, 0, 0);

    expect(negative).toEqual({ x: 5, y: 5, width: -3, height: -4 });
    expect(zero).toEqual({ x: 3, y: 7, width: 0, height: 0 });
  });

  test('RectLike의 필드를 out에 복사한다', () => {
    const out: RectWritable = { x: 0, y: 0, width: 0, height: 0 };
    const src = { x: 2, y: 3, width: 8, height: 6 };

    const result = copyInto(out, src);

    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 3, width: 8, height: 6 });
  });

  test('RectTuple의 component를 out에 복사한다', () => {
    const out: RectWritable = { x: 0, y: 0, width: 0, height: 0 };

    const result = copyInto(out, [2, 3, 8, 6]);

    expect(result).toBe(out);
    expect(out).toEqual({ x: 2, y: 3, width: 8, height: 6 });
  });

  test('source를 mutate하지 않는다', () => {
    const out: RectWritable = { x: 0, y: 0, width: 0, height: 0 };
    const src = { x: 2, y: 3, width: 8, height: 6 };

    copyInto(out, src);

    expect(src).toEqual({ x: 2, y: 3, width: 8, height: 6 });
  });

  test('out === src aliasing 호출도 정의대로 동작한다', () => {
    const out: RectWritable = { x: 5, y: 10, width: 20, height: 30 };

    copyInto(out, out);

    expect(out).toEqual({ x: 5, y: 10, width: 20, height: 30 });
  });

  test('음수 dimension을 가진 rect를 복사한다', () => {
    const out: RectWritable = { x: 0, y: 0, width: 0, height: 0 };
    const src = { x: 1, y: 2, width: -5, height: -3 };

    copyInto(out, src);

    expect(out).toEqual({ x: 1, y: 2, width: -5, height: -3 });
  });
});

describe('rect query - left/top/right/bottom', () => {
  test('left는 rect.x를 반환한다', () => {
    expect(left({ x: 3, y: 7, width: 10, height: 5 })).toBe(3);
  });

  test('tuple rect의 left는 첫 번째 component를 반환한다', () => {
    expect(left([3, 7, 10, 5])).toBe(3);
  });

  test('top은 rect.y를 반환한다', () => {
    expect(top({ x: 3, y: 7, width: 10, height: 5 })).toBe(7);
  });

  test('tuple rect의 top은 두 번째 component를 반환한다', () => {
    expect(top([3, 7, 10, 5])).toBe(7);
  });

  test('right는 rect.x + rect.width를 반환한다', () => {
    expect(right({ x: 3, y: 7, width: 10, height: 5 })).toBe(13);
  });

  test('tuple rect의 right는 x + width를 반환한다', () => {
    expect(right([3, 7, 10, 5])).toBe(13);
  });

  test('bottom은 rect.y + rect.height를 반환한다', () => {
    expect(bottom({ x: 3, y: 7, width: 10, height: 5 })).toBe(12);
  });

  test('tuple rect의 bottom은 y + height를 반환한다', () => {
    expect(bottom([3, 7, 10, 5])).toBe(12);
  });

  test('음수 x/y에서 edge를 올바르게 계산한다', () => {
    const r = { x: -5, y: -3, width: 10, height: 6 };

    expect(left(r)).toBe(-5);
    expect(top(r)).toBe(-3);
    expect(right(r)).toBe(5);
    expect(bottom(r)).toBe(3);
  });

  test('음수 width에서 right는 x보다 작다', () => {
    expect(right({ x: 5, y: 0, width: -3, height: 4 })).toBe(2);
  });

  test('음수 height에서 bottom은 y보다 작다', () => {
    expect(bottom({ x: 0, y: 5, width: 4, height: -3 })).toBe(2);
  });
});

describe('rect query - isEmpty', () => {
  test('양수 width/height는 empty가 아니다', () => {
    expect(isEmpty({ x: 0, y: 0, width: 1, height: 1 })).toBe(false);
  });

  test('tuple rect의 양수 width/height는 empty가 아니다', () => {
    expect(isEmpty([0, 0, 1, 1])).toBe(false);
  });

  test('width === 0이면 empty이다', () => {
    expect(isEmpty({ x: 0, y: 0, width: 0, height: 5 })).toBe(true);
  });

  test('height === 0이면 empty이다', () => {
    expect(isEmpty({ x: 0, y: 0, width: 5, height: 0 })).toBe(true);
  });

  test('width < 0이면 empty이다', () => {
    expect(isEmpty({ x: 0, y: 0, width: -1, height: 5 })).toBe(true);
  });

  test('height < 0이면 empty이다', () => {
    expect(isEmpty({ x: 0, y: 0, width: 5, height: -1 })).toBe(true);
  });

  test('width와 height 모두 0이면 empty이다', () => {
    expect(isEmpty({ x: 0, y: 0, width: 0, height: 0 })).toBe(true);
  });
});

describe('rect query - area', () => {
  test('양수 width/height의 area를 반환한다', () => {
    expect(area({ x: 0, y: 0, width: 4, height: 5 })).toBe(20);
  });

  test('tuple rect의 area를 반환한다', () => {
    expect(area([0, 0, 4, 5])).toBe(20);
  });

  test('width === 0이면 area는 0이다 (empty)', () => {
    expect(area({ x: 0, y: 0, width: 0, height: 5 })).toBe(0);
  });

  test('height === 0이면 area는 0이다 (empty)', () => {
    expect(area({ x: 0, y: 0, width: 5, height: 0 })).toBe(0);
  });

  test('width < 0이면 area는 0이다 (empty)', () => {
    expect(area({ x: 0, y: 0, width: -3, height: 5 })).toBe(0);
  });

  test('height < 0이면 area는 0이다 (empty)', () => {
    expect(area({ x: 0, y: 0, width: 5, height: -3 })).toBe(0);
  });

  test('width와 height 모두 음수이면 area는 0이다', () => {
    expect(area({ x: 0, y: 0, width: -3, height: -4 })).toBe(0);
  });

  test('소수 width/height의 area를 계산한다', () => {
    expect(area({ x: 0, y: 0, width: 2.5, height: 4 })).toBe(10);
  });
});

describe('rect 결과 기록 - centerInto', () => {
  test('rect 중심점을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    centerInto(out, { x: 0, y: 0, width: 10, height: 6 });

    expect(out).toEqual({ x: 5, y: 3 });
  });

  test('tuple rect 중심점을 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    centerInto(out, [0, 0, 10, 6]);

    expect(out).toEqual({ x: 5, y: 3 });
  });

  test('원점이 아닌 위치의 rect 중심점을 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    centerInto(out, { x: 2, y: 4, width: 6, height: 8 });

    expect(out).toEqual({ x: 5, y: 8 });
  });

  test('음수 좌표 rect의 중심점을 계산한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    centerInto(out, { x: -4, y: -6, width: 8, height: 12 });

    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('out === rect 좌표공유 aliasing에서도 안전하다', () => {
    // out과 rect는 타입이 다르므로 직접 동일성은 없지만
    // 같은 x/y 필드를 가진 object를 공유할 수 있다
    const shared: RectWritable & XYWritable = { x: 2, y: 4, width: 6, height: 8 };

    centerInto(shared, shared);

    // 입력 x=2, y=4, width=6, height=8 → center = (5, 8)
    expect(shared.x).toBe(5);
    expect(shared.y).toBe(8);
  });

  test('tuple out에 결과를 기록하고 동일 참조를 반환한다', () => {
    const out: [number, number] = [0, 0];

    const result = centerInto(out, { x: 0, y: 0, width: 10, height: 6 });

    expect(result).toBe(out);
    expect(out[0]).toBe(5);
    expect(out[1]).toBe(3);
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    const result = centerInto(out, { x: 0, y: 0, width: 10, height: 6 });

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
    const result = centerInto(p, { x: 0, y: 0, width: 10, height: 6 }).translateX(10);

    expect(result.x).toBe(15);
    expect(result.y).toBe(3);
  });
});

describe('rect 결과 기록 - sizeInto', () => {
  test('rect size(width, height)를 out에 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    sizeInto(out, { x: 0, y: 0, width: 10, height: 6 });

    expect(out).toEqual({ x: 10, y: 6 });
  });

  test('음수 dimension을 raw로 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };

    sizeInto(out, { x: 0, y: 0, width: -3, height: -4 });

    expect(out).toEqual({ x: -3, y: -4 });
  });

  test('out === rect 좌표공유 aliasing에서도 안전하다', () => {
    // out과 rect가 같은 object를 공유하면 x/y가 width/height로 덮여쓰인다.
    // 사전 read가 깨지면 두 번째 write에서 손상된 값을 읽을 수 있다.
    const shared: RectWritable & XYWritable = { x: 2, y: 4, width: 6, height: 8 };

    sizeInto(shared, shared);

    expect(shared.x).toBe(6);
    expect(shared.y).toBe(8);
  });
});

describe('rect 결과 기록 - corner Into 함수', () => {
  const r = { x: 2, y: 3, width: 8, height: 6 };

  test('topLeftInto는 (x, y)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    topLeftInto(out, r);
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('topRightInto는 (right, y)를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    topRightInto(out, r);
    expect(out).toEqual({ x: 10, y: 3 });
  });

  test('bottomLeftInto는 (x, bottom)을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    bottomLeftInto(out, r);
    expect(out).toEqual({ x: 2, y: 9 });
  });

  test('bottomRightInto는 (right, bottom)을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    bottomRightInto(out, r);
    expect(out).toEqual({ x: 10, y: 9 });
  });

  test('음수 origin rect의 corner를 올바르게 계산한다', () => {
    const nr = { x: -5, y: -3, width: 10, height: 6 };
    const out: XYWritable = { x: 0, y: 0 };

    topLeftInto(out, nr);
    expect(out).toEqual({ x: -5, y: -3 });

    topRightInto(out, nr);
    expect(out).toEqual({ x: 5, y: -3 });

    bottomLeftInto(out, nr);
    expect(out).toEqual({ x: -5, y: 3 });

    bottomRightInto(out, nr);
    expect(out).toEqual({ x: 5, y: 3 });
  });

  test('topLeftInto: tuple out에 기록하고 동일 참조를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = topLeftInto(out, r);
    expect(result).toBe(out);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
  });

  test('topRightInto: out === rect aliasing에서도 안전하다', () => {
    // out과 rect가 같은 object를 공유하면 x는 rect.x + rect.width로 덮여쓰인다.
    // 사전 read 없이 out.x를 먼저 쓰면 후속 width 계산이 오염될 수 있다.
    const shared: RectWritable & XYWritable = { x: 2, y: 4, width: 6, height: 8 };

    topRightInto(shared, shared);

    expect(shared.x).toBe(8);
    expect(shared.y).toBe(4);
  });

  test('bottomLeftInto: out === rect aliasing에서도 안전하다', () => {
    const shared: RectWritable & XYWritable = { x: 2, y: 4, width: 6, height: 8 };

    bottomLeftInto(shared, shared);

    expect(shared.x).toBe(2);
    expect(shared.y).toBe(12);
  });

  test('bottomRightInto: out === rect aliasing에서도 안전하다', () => {
    // x/y 모두 +width/+height에 의존하므로 corner 4종 중 회귀 표면이 가장 넓다.
    const shared: RectWritable & XYWritable = { x: 2, y: 4, width: 6, height: 8 };

    bottomRightInto(shared, shared);

    expect(shared.x).toBe(8);
    expect(shared.y).toBe(12);
  });
});
