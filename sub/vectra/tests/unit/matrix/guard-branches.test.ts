/**
 * matrix fit 함수의 cover 모드 축 선택 테스트.
 *
 * cover는 dest 전체를 덮어야 하므로 src가 dest보다 세로로 길면 width 기준, 가로로 길면 height 기준으로
 * scale을 고른다. `fitBoundsInto`는 두 방향을, `fitRectInto`는 가로로 긴 src를 확인한다.
 */

import { describe, test } from 'vitest';
import { fitBoundsInto } from '../../../src/matrix/fit-bounds-into';
import { fitRectInto } from '../../../src/matrix/fit-rect-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

describe('fitBoundsInto — cover 모드', () => {
  test('세로로 긴 src는 width 기준 scale로 dest를 덮는다', () => {
    // src 100×200, dest 100×100 → srcRatio 0.5 <= destRatio 1 → scale = 100/100 = 1
    const out = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: 100, y: 200 } };
    const dest = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    fitBoundsInto(out, src, dest, { mode: 'cover' });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: -50 });
  });

  test('가로로 긴 src는 height 기준 scale로 dest를 덮는다', () => {
    // src 200×100, dest 100×100 → srcRatio 2 > destRatio 1 → scale = 100/100 = 1
    const out = makeMatrix();
    const src = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    const dest = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    fitBoundsInto(out, src, dest, { mode: 'cover' });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: -50, ty: 0 });
  });
});

describe('fitRectInto — cover 모드', () => {
  test('가로로 긴 src는 height 기준 scale로 dest를 덮는다', () => {
    const out = makeMatrix();
    const src = { x: 0, y: 0, width: 200, height: 100 };
    const dest = { x: 0, y: 0, width: 100, height: 100 };
    fitRectInto(out, src, dest, { mode: 'cover' });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: -50, ty: 0 });
  });
});
