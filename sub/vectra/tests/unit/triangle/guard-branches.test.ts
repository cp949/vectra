/**
 * triangle 각 vertex별 각도 판정과 부동소수점 degenerate 경계 테스트.
 *
 * 둔각·직각·예각 판정을 A 외의 vertex에서도 확인한다. 면적은 0이 아니지만 변 길이 합이 삼각부등식의
 * 등호로 계산되는 얇은 삼각형은 방심·방접원을 만들지 않는다.
 */

import { describe, expect, test } from 'vitest';
import { excentersInto } from '../../../src/triangle/excenters-into';
import { excirclesInto } from '../../../src/triangle/excircles-into';
import { isAcute } from '../../../src/triangle/is-acute';
import { isObtuse } from '../../../src/triangle/is-obtuse';
import { isRight } from '../../../src/triangle/is-right';

/** A의 좌표가 `(ax, ay)`, B가 `(bx, by)`, C가 `(cx, cy)`인 plain triangle을 만든다. */
function tri(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by }, c: { x: cx, y: cy } };
}

/** 면적은 1e-17(0이 아님)이지만 `|BC| + |AB| = |CA|`가 부동소수점으로 정확히 성립하는 삼각형. */
const sliver = tri(0, 0, 1, 0, 2, 1e-17);

describe('각도 판정 — A 이외의 vertex', () => {
  test('isObtuse는 A가 둔각이면 true다', () => {
    expect(isObtuse(tri(0, 1, -3, 0, 3, 0))).toBe(true);
  });

  test('isObtuse는 B가 둔각이면 true다', () => {
    expect(isObtuse(tri(-3, 0, 0, 1, 3, 0))).toBe(true);
  });

  test('isAcute는 A가 예각이어도 B가 둔각이면 false다', () => {
    expect(isAcute(tri(-3, 0, 0, 1, 3, 0))).toBe(false);
  });

  test('isRight는 B가 직각이면 true다', () => {
    expect(isRight(tri(0, 3, 0, 0, 4, 0))).toBe(true);
  });

  test('isRight는 C가 직각이면 true다', () => {
    expect(isRight(tri(3, 0, 0, 4, 0, 0))).toBe(true);
  });
});

describe('excentersInto·excirclesInto — 얇은 삼각형', () => {
  test('면적이 0이 아니어도 변 길이 합이 삼각부등식의 등호이면 빈 배열을 돌려준다', () => {
    expect(excentersInto([{ x: 9, y: 9 }], sliver)).toEqual([]);
    expect(excirclesInto([{ center: { x: 9, y: 9 }, radius: 1 }], sliver)).toEqual([]);
  });
});
