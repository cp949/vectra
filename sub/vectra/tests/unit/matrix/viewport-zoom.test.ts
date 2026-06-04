/**
 * matrix viewport zoom helper 단위 테스트.
 *
 * S6-RM-006: zoomToFitInto / zoomToFit / zoomAtPointInto / zoomAtPoint /
 * clampViewportBoundsInto / clampViewportBounds
 */

import { describe, expect, test } from 'vitest';
import { clampViewportBounds } from '../../../src/matrix/clamp-viewport-bounds';
import { clampViewportBoundsInto } from '../../../src/matrix/clamp-viewport-bounds-into';
import { transformPointInto } from '../../../src/matrix/transform-point-into';
import { zoomAtPoint } from '../../../src/matrix/zoom-at-point';
import { zoomAtPointInto } from '../../../src/matrix/zoom-at-point-into';
import { zoomToFit } from '../../../src/matrix/zoom-to-fit';
import { zoomToFitInto } from '../../../src/matrix/zoom-to-fit-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

type ObjectBounds = { min: { x: number; y: number }; max: { x: number; y: number } };

/** 테스트용 object BoundsWritable 생성 helper */
function makeBounds(): ObjectBounds {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

/** bounds min/max 좌표가 근사적으로 같은지 확인하는 helper */
function expectBounds(actual: ObjectBounds, minX: number, minY: number, maxX: number, maxY: number) {
  expect(actual.min.x).toBeCloseTo(minX);
  expect(actual.min.y).toBeCloseTo(minY);
  expect(actual.max.x).toBeCloseTo(maxX);
  expect(actual.max.y).toBeCloseTo(maxY);
}

describe('matrix viewport - zoomToFitInto', () => {
  test('contain 모드: 가로로 넓은 viewport에 content를 가운데 맞춘다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    zoomToFitInto(out, content, viewport, { mode: 'contain' });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 50, ty: 0 });
  });

  test('mode 기본값은 contain이다', () => {
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    zoomToFitInto(out1, content, viewport);
    zoomToFitInto(out2, content, viewport, { mode: 'contain' });
    expectNearMatrix(out1, out2);
  });

  test('cover 모드: viewport를 완전히 덮는다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    zoomToFitInto(out, content, viewport, { mode: 'cover' });
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: -50 });
  });

  test('contain 모드: 세로로 긴 viewport는 width 기준 scale로 세로 가운데 맞춘다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 100, y: 200 } };
    // srcRatio 1 > destRatio 0.5 → scale = dw/sw = 1, 세로로 (200-100)/2 = 50 이동
    zoomToFitInto(out, content, viewport, { mode: 'contain' });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 50 });
  });

  test('cover 모드: 세로로 긴 viewport는 height 기준 scale로 덮는다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 100, y: 200 } };
    // srcRatio 1 > destRatio 0.5 → scale = dh/sh = 2, 가로로 (100-200)/2 = -50 이동
    zoomToFitInto(out, content, viewport, { mode: 'cover' });
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: -50, ty: 0 });
  });

  test('stretch 모드: 비율 무시하고 viewport에 정확히 맞춘다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 50 } };
    const viewport = { min: { x: 10, y: 20 }, max: { x: 210, y: 120 } };
    zoomToFitInto(out, content, viewport, { mode: 'stretch' });
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: 10, ty: 20 });
  });

  test('number padding은 네 방향 동일 inset이다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 120, y: 120 } };
    // padded viewport [10,10]-[110,110] → 100x100, scale 1, content를 (10,10)로 이동
    zoomToFitInto(out, content, viewport, { padding: 10 });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 10 });
  });

  test('asymmetric padding은 방향별 inset을 적용한다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 200 } };
    // padded viewport [10,20]-[170,160] → 160x140, contain scale = 140/100 = 1.4
    zoomToFitInto(out, content, viewport, { padding: { left: 10, top: 20, right: 30, bottom: 40 } });
    expectNearMatrix(out, { a: 1.4, b: 0, c: 0, d: 1.4, tx: 20, ty: 20 });
  });

  test('누락된 padding 방향은 0으로 처리한다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    zoomToFitInto(out, content, viewport, { padding: {} });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 50, ty: 0 });
  });

  test('empty content이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const content = { min: { x: 50, y: 0 }, max: { x: 50, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    zoomToFitInto(out, content, viewport);
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('padding으로 viewport가 empty가 되면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    // padding 60 → padded [60,60]-[40,40], pvMin >= pvMax → identity
    zoomToFitInto(out, content, viewport, { padding: 60 });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('tuple BoundsLike input도 처리한다', () => {
    const out = makeMatrix();
    zoomToFitInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
      [
        { x: 0, y: 0 },
        { x: 200, y: 100 },
      ]
    );
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 50, ty: 0 });
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    const b = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    expect(zoomToFitInto(out, b, b)).toBe(out);
  });

  test('유효하지 않은 mode는 RangeError를 던진다', () => {
    const out = makeMatrix();
    const b = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    expect(() => zoomToFitInto(out, b, b, { mode: 'fill' as never })).toThrow(RangeError);
  });

  test('non-finite bounds component는 RangeError를 던진다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: Infinity, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    expect(() => zoomToFitInto(out, content, viewport)).toThrow(RangeError);
  });

  test('non-finite padding은 RangeError를 던진다', () => {
    const out = makeMatrix();
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    expect(() => zoomToFitInto(out, content, viewport, { padding: Number.NaN })).toThrow(RangeError);
    expect(() => zoomToFitInto(out, content, viewport, { padding: { top: Infinity } })).toThrow(RangeError);
  });
});

describe('matrix viewport - zoomToFit', () => {
  test('Into 결과와 같은 matrix를 새 object로 반환한다', () => {
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    const result = zoomToFit(content, viewport, { mode: 'cover' });
    const expected = zoomToFitInto(makeMatrix(), content, viewport, { mode: 'cover' });
    expectNearMatrix(result, expected);
  });

  test('매 호출 새 plain object를 반환한다', () => {
    const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };
    const viewport = { min: { x: 0, y: 0 }, max: { x: 200, y: 100 } };
    const a = zoomToFit(content, viewport);
    const b = zoomToFit(content, viewport);
    expect(a).not.toBe(b);
  });
});

describe('matrix viewport - zoomAtPointInto', () => {
  test('identity matrix에 focal point 고정 zoom을 합성한다', () => {
    const out = makeMatrix();
    const identity = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    zoomAtPointInto(out, identity, { x: 100, y: 50 }, 2);
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: -100, ty: -50 });
  });

  test('translated matrix에 focal point 고정 zoom을 합성한다', () => {
    const out = makeMatrix();
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    zoomAtPointInto(out, matrix, { x: 100, y: 50 }, 2);
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: -80, ty: -10 });
  });

  test('focal point에 매핑되던 source point는 zoom 후에도 focal point에 남는다', () => {
    const out = makeMatrix();
    // matrix는 원점 기준 2배 scale. source (50,25)가 output focal (100,50)에 매핑된다.
    const matrix = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    const focal = { x: 100, y: 50 };
    const source = { x: 50, y: 25 };
    zoomAtPointInto(out, matrix, focal, 3);
    const mapped = transformPointInto({ x: 0, y: 0 }, out, source);
    expect(mapped.x).toBeCloseTo(focal.x);
    expect(mapped.y).toBeCloseTo(focal.y);
  });

  test('회전+이동 matrix에서도 focal point에 매핑되던 source point가 zoom 후 focal point에 남는다', () => {
    const out = makeMatrix();
    // 90° 회전 + 이동. b, c가 0이 아니다. (a·x + c·y + tx, b·x + d·y + ty) 기준 source (43,-95)가 focal로 매핑된다.
    const matrix = { a: 0, b: 1, c: -1, d: 0, tx: 5, ty: 7 };
    const focal = { x: 100, y: 50 };
    const source = { x: 43, y: -95 };
    zoomAtPointInto(out, matrix, focal, 3);
    const mapped = transformPointInto({ x: 0, y: 0 }, out, source);
    expect(mapped.x).toBeCloseTo(focal.x);
    expect(mapped.y).toBeCloseTo(focal.y);
  });

  test('tuple MatrixLike input과 tuple XYInput focal point도 처리한다', () => {
    const out = makeMatrix();
    zoomAtPointInto(out, [1, 0, 0, 1, 0, 0], [100, 50], 2);
    expectNearMatrix(out, { a: 2, b: 0, c: 0, d: 2, tx: -100, ty: -50 });
  });

  test('out === matrix aliasing이 안전하다', () => {
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const result = zoomAtPointInto(matrix, matrix, { x: 100, y: 50 }, 2);
    expect(result).toBe(matrix);
    expectNearMatrix(matrix, { a: 2, b: 0, c: 0, d: 2, tx: -80, ty: -10 });
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    const identity = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(zoomAtPointInto(out, identity, { x: 0, y: 0 }, 2)).toBe(out);
  });

  test('scaleFactor가 0, 음수, Infinity, NaN이면 RangeError를 던진다', () => {
    const out = makeMatrix();
    const identity = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const focal = { x: 0, y: 0 };
    expect(() => zoomAtPointInto(out, identity, focal, 0)).toThrow(RangeError);
    expect(() => zoomAtPointInto(out, identity, focal, -2)).toThrow(RangeError);
    expect(() => zoomAtPointInto(out, identity, focal, Infinity)).toThrow(RangeError);
    expect(() => zoomAtPointInto(out, identity, focal, Number.NaN)).toThrow(RangeError);
  });

  test('non-finite matrix component는 RangeError를 던진다', () => {
    const out = makeMatrix();
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: Infinity, ty: 0 };
    expect(() => zoomAtPointInto(out, matrix, { x: 0, y: 0 }, 2)).toThrow(RangeError);
  });

  test('non-finite focal point component는 RangeError를 던진다', () => {
    const out = makeMatrix();
    const identity = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(() => zoomAtPointInto(out, identity, { x: Number.NaN, y: 0 }, 2)).toThrow(RangeError);
  });
});

describe('matrix viewport - zoomAtPoint', () => {
  test('Into 결과와 같은 matrix를 새 object로 반환한다', () => {
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const result = zoomAtPoint(matrix, { x: 100, y: 50 }, 2);
    const expected = zoomAtPointInto(makeMatrix(), matrix, { x: 100, y: 50 }, 2);
    expectNearMatrix(result, expected);
  });

  test('매 호출 새 plain object를 반환하고 input matrix를 변경하지 않는다', () => {
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 };
    const a = zoomAtPoint(matrix, { x: 100, y: 50 }, 2);
    const b = zoomAtPoint(matrix, { x: 100, y: 50 }, 2);
    expect(a).not.toBe(b);
    expectNearMatrix(matrix, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 });
  });
});

describe('matrix viewport - clampViewportBoundsInto', () => {
  const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };

  test('content 내부 viewport는 normalized copy로 유지한다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: 10, y: 10 }, max: { x: 40, y: 40 } }, content);
    expectBounds(out, 10, 10, 40, 40);
  });

  test('왼쪽/위로 벗어나면 content min에 맞게 translate한다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: -20, y: -20 }, max: { x: 10, y: 10 } }, content);
    expectBounds(out, 0, 0, 30, 30);
  });

  test('오른쪽/아래로 벗어나면 content max에 맞게 translate한다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: 90, y: 90 }, max: { x: 130, y: 130 } }, content);
    expectBounds(out, 60, 60, 100, 100);
  });

  test('viewport가 content보다 큰 축은 content 중심에 맞춘다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 200, y: 200 } }, content);
    expectBounds(out, -50, -50, 150, 150);
  });

  test('number padding은 content clamp 영역을 안쪽으로 줄인다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 40, y: 40 } }, content, { padding: 10 });
    expectBounds(out, 10, 10, 50, 50);
  });

  test('asymmetric padding은 방향별 inset을 적용한다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 40, y: 30 } }, content, {
      padding: { left: 10, top: 20, right: 30, bottom: 40 },
    });
    expectBounds(out, 10, 20, 50, 50);
  });

  test('inverted viewport는 normalized copy로 처리한다', () => {
    const out = makeBounds();
    clampViewportBoundsInto(out, { min: { x: 40, y: 40 }, max: { x: 10, y: 10 } }, content);
    expectBounds(out, 10, 10, 40, 40);
  });

  test('padded content가 empty이면 normalized viewport copy를 기록한다', () => {
    const out = makeBounds();
    // padding 60 → padded [60,60]-[40,40] empty
    clampViewportBoundsInto(out, { min: { x: 10, y: 10 }, max: { x: 40, y: 40 } }, content, { padding: 60 });
    expectBounds(out, 10, 10, 40, 40);
  });

  test('padded content가 한 축에서 zero-size(min===max)이면 normalized viewport copy를 기록한다', () => {
    const out = makeBounds();
    // padding left+right = content width(100) → padded content x축 [50,50] zero-size empty.
    // strict 경계였다면 x축을 50 중심으로 centering(35..65)했겠지만 inclusive 경계로 viewport를 그대로 둔다.
    clampViewportBoundsInto(out, { min: { x: 10, y: 10 }, max: { x: 40, y: 40 } }, content, {
      padding: { left: 50, right: 50 },
    });
    expectBounds(out, 10, 10, 40, 40);
  });

  test('tuple BoundsLike input과 nested tuple output을 처리한다', () => {
    const out = { min: [0, 0] as [number, number], max: [0, 0] as [number, number] };
    clampViewportBoundsInto(
      out,
      [
        { x: -20, y: -20 },
        { x: 10, y: 10 },
      ],
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ]
    );
    expect(out.min[0]).toBeCloseTo(0);
    expect(out.min[1]).toBeCloseTo(0);
    expect(out.max[0]).toBeCloseTo(30);
    expect(out.max[1]).toBeCloseTo(30);
  });

  test('out.min === viewportBounds.min aliasing이 안전하다', () => {
    const shared = { x: -20, y: -20 };
    const viewport = { min: shared, max: { x: 10, y: 10 } };
    const out = { min: shared, max: { x: 0, y: 0 } };
    const result = clampViewportBoundsInto(out, viewport, content);
    expect(result).toBe(out);
    expectBounds(out, 0, 0, 30, 30);
  });

  test('out을 반환한다', () => {
    const out = makeBounds();
    expect(clampViewportBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, content)).toBe(out);
  });

  test('non-finite bounds component는 RangeError를 던진다', () => {
    const out = makeBounds();
    expect(() => clampViewportBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: Infinity, y: 10 } }, content)).toThrow(
      RangeError
    );
  });

  test('non-finite padding은 RangeError를 던진다', () => {
    const out = makeBounds();
    expect(() =>
      clampViewportBoundsInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, content, { padding: Number.NaN })
    ).toThrow(RangeError);
  });
});

describe('matrix viewport - clampViewportBounds', () => {
  const content = { min: { x: 0, y: 0 }, max: { x: 100, y: 100 } };

  test('Into 결과와 같은 bounds를 새 object로 반환한다', () => {
    const viewport = { min: { x: -20, y: -20 }, max: { x: 10, y: 10 } };
    const result = clampViewportBounds(viewport, content);
    expect(result.min.x).toBeCloseTo(0);
    expect(result.min.y).toBeCloseTo(0);
    expect(result.max.x).toBeCloseTo(30);
    expect(result.max.y).toBeCloseTo(30);
  });

  test('매 호출 새 plain object를 반환한다', () => {
    const viewport = { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } };
    const a = clampViewportBounds(viewport, content);
    const b = clampViewportBounds(viewport, content);
    expect(a).not.toBe(b);
  });
});
