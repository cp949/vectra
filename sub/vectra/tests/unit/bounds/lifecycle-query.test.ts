/** 경계 상자의 초기화와 복사, 위치 및 크기 조회를 시험한다. */

import { describe, expect, test } from 'vitest';
import { centerInto } from '../../../src/bounds/center-into';
import { copyInto } from '../../../src/bounds/copy-into';
import { emptyInto } from '../../../src/bounds/empty-into';
import { height } from '../../../src/bounds/height';
import { highInto } from '../../../src/bounds/high-into';
import { isEmpty } from '../../../src/bounds/is-empty';
import { lowInto } from '../../../src/bounds/low-into';
import { width } from '../../../src/bounds/width';
import type { BoundsWritable, PointWritable } from '../../../src/types/flat-shapes.internal';
import { sentinel } from './relation-expansion.helpers';

/** 영점 경계 상자 출력을 만든다. */
function makeBounds(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

describe('bounds lifecycle - emptyInto', () => {
  test('sentinel값 (Infinity, Infinity), (-Infinity, -Infinity)를 기록한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(out).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });

  test('emptyInto 결과는 isEmpty로 true를 반환한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(isEmpty(out)).toBe(true);
  });
});

describe('bounds lifecycle - copyInto', () => {
  test('경계 좌표를 복사한다', () => {
    const out = makeBounds();
    const src = { minX: 1, minY: 2, maxX: 5, maxY: 6 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out).toEqual({ minX: 1, minY: 2, maxX: 5, maxY: 6 });
  });

  test('out === bounds alias에서도 안전하게 복사한다', () => {
    const out = makeBounds();
    out.minX = 3;
    out.minY = 4;
    out.maxX = 7;
    out.maxY = 8;
    copyInto(out, out);
    expect(out).toEqual({ minX: 3, minY: 4, maxX: 7, maxY: 8 });
  });

  test('소스 bounds를 mutate하지 않는다', () => {
    const out = makeBounds();
    const src = { minX: 1, minY: 2, maxX: 5, maxY: 6 };
    copyInto(out, src);
    expect(src).toEqual({ minX: 1, minY: 2, maxX: 5, maxY: 6 });
  });
});

describe('bounds query - width', () => {
  test('경계 상자의 width를 반환한다', () => {
    expect(width({ minX: 1, minY: 0, maxX: 5, maxY: 0 })).toBe(4);
  });

  test('zero-width bounds는 0을 반환한다', () => {
    expect(width({ minX: 3, minY: 0, maxX: 3, maxY: 5 })).toBe(0);
  });

  test('inverted x bounds는 음수 width를 반환한다', () => {
    expect(width({ minX: 5, minY: 0, maxX: 1, maxY: 0 })).toBe(-4);
  });

  test('sentinel bounds는 -Infinity width를 반환한다', () => {
    expect(width(sentinel())).toBe(-Infinity);
  });
});

describe('bounds query - height', () => {
  test('경계 상자의 height를 반환한다', () => {
    expect(height({ minX: 0, minY: 1, maxX: 0, maxY: 5 })).toBe(4);
  });

  test('zero-height bounds는 0을 반환한다', () => {
    expect(height({ minX: 0, minY: 3, maxX: 5, maxY: 3 })).toBe(0);
  });

  test('inverted y bounds는 음수 height를 반환한다', () => {
    expect(height({ minX: 0, minY: 5, maxX: 0, maxY: 1 })).toBe(-4);
  });

  test('sentinel bounds는 -Infinity height를 반환한다', () => {
    expect(height(sentinel())).toBe(-Infinity);
  });
});

describe('bounds query - isEmpty', () => {
  test('정상 bounds(width > 0, height > 0)는 false를 반환한다', () => {
    expect(isEmpty({ minX: 0, minY: 0, maxX: 5, maxY: 5 })).toBe(false);
  });

  test('zero-width bounds(선 extent)는 empty가 아니다 - false를 반환한다', () => {
    expect(isEmpty({ minX: 3, minY: 0, maxX: 3, maxY: 5 })).toBe(false);
  });

  test('zero-height bounds(선 extent)는 empty가 아니다 - false를 반환한다', () => {
    expect(isEmpty({ minX: 0, minY: 3, maxX: 5, maxY: 3 })).toBe(false);
  });

  test('point bounds(max === min)는 empty가 아니다 - false를 반환한다', () => {
    expect(isEmpty({ minX: 3, minY: 3, maxX: 3, maxY: 3 })).toBe(false);
  });

  test('x가 inverted인 bounds는 true를 반환한다', () => {
    expect(isEmpty({ minX: 5, minY: 0, maxX: 1, maxY: 5 })).toBe(true);
  });

  test('y가 inverted인 bounds는 true를 반환한다', () => {
    expect(isEmpty({ minX: 0, minY: 5, maxX: 5, maxY: 1 })).toBe(true);
  });

  test('x와 y 모두 inverted인 bounds는 true를 반환한다', () => {
    expect(isEmpty({ minX: 5, minY: 5, maxX: 1, maxY: 1 })).toBe(true);
  });

  test('sentinel bounds는 true를 반환한다', () => {
    const out = makeBounds();
    emptyInto(out);
    expect(isEmpty(out)).toBe(true);
  });
});

describe('bounds point 출력 - centerInto', () => {
  test('object min/max로 center를 계산하여 기록한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    centerInto(out, { minX: 0, minY: 0, maxX: 4, maxY: 6 });
    expect(out).toEqual({ x: 2, y: 3 });
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    const result = centerInto(out, { minX: 0, minY: 0, maxX: 4, maxY: 6 });
    expect(result).toBe(out);
  });
});

describe('bounds point 출력 - lowInto', () => {
  test('최솟값 좌표를 out에 기록한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    lowInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 6 });
    expect(out).toEqual({ x: 1, y: 2 });
  });
});

describe('bounds point 출력 - highInto', () => {
  test('최댓값 좌표를 out에 기록한다', () => {
    const out: PointWritable = { x: 0, y: 0 };
    highInto(out, { minX: 1, minY: 2, maxX: 5, maxY: 6 });
    expect(out).toEqual({ x: 5, y: 6 });
  });
});
