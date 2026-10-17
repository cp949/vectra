/**
 * circle 생성·복사의 center와 radius 두 인자 형태 테스트.
 *
 * `circleFrom`과 `copyInto`는 `CircleLike` 하나 또는 center와 radius 두 인자를 받는다.
 * 두 인자 형태에서 center 좌표와 radius가 그대로 기록되는지 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { circleFrom } from '../../../src/circle/circle-from';
import { copyInto } from '../../../src/circle/copy-into';

describe('circleFrom', () => {
  test('center와 radius 두 인자로 새 circle을 만든다', () => {
    expect(circleFrom({ x: 1, y: 2 }, 3)).toEqual({ center: { x: 1, y: 2 }, radius: 3 });
  });
});

describe('copyInto', () => {
  test('center와 radius 두 인자를 out에 기록하고 out을 돌려준다', () => {
    const out = { center: { x: 0, y: 0 }, radius: 0 };
    expect(copyInto(out, { x: 4, y: 5 }, 6)).toBe(out);
    expect(out).toEqual({ center: { x: 4, y: 5 }, radius: 6 });
  });

  test('radius가 0이어도 두 인자 형태로 처리한다', () => {
    const out = { center: { x: 9, y: 9 }, radius: 9 };
    copyInto(out, [7, 8], 0);
    expect(out).toEqual({ center: { x: 7, y: 8 }, radius: 0 });
  });
});
