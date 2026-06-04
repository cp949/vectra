/**
 * matrix builder fitRect 함수 단위 테스트.
 *
 * fitRectInto / fitRect
 */

import { describe, expect, test } from 'vitest';
import { fitRect } from '../../../src/matrix/fit-rect';
import { fitRectInto } from '../../../src/matrix/fit-rect-into';
import { expectNearMatrix, makeMatrix } from './_builder-extensions-test-helpers';

describe('matrix builder - fitRectInto', () => {
  test('contain 모드: 정사각형 src를 가로로 넓은 dest에 맞춘다 (height 기준 scale)', () => {
    // src: 100×100, dest: 200×100 → contain: height 기준 scale=1, center x 오프셋
    const out = makeMatrix();
    const src = { x: 0, y: 0, width: 100, height: 100 };
    const dest = { x: 0, y: 0, width: 200, height: 100 };
    fitRectInto(out, src, dest, { mode: 'contain' });
    // srcRatio=1, destRatio=2 → srcRatio <= destRatio → height 기준 scale = 100/100 = 1
    // scaledW=100, center offset = (200-100)/2 = 50
    expect(out.a).toBeCloseTo(1);
    expect(out.d).toBeCloseTo(1);
    expect(out.tx).toBeCloseTo(50);
    expect(out.ty).toBeCloseTo(0);
  });

  test('contain 모드: 가로로 넓은 src를 정사각형 dest에 맞춘다 (width 기준 scale)', () => {
    // src: 200×100, dest: 100×100 → srcRatio=2, destRatio=1 → width 기준 scale=0.5
    const out = makeMatrix();
    const src = { x: 0, y: 0, width: 200, height: 100 };
    const dest = { x: 0, y: 0, width: 100, height: 100 };
    fitRectInto(out, src, dest, { mode: 'contain' });
    expect(out.a).toBeCloseTo(0.5);
    expect(out.d).toBeCloseTo(0.5);
    expect(out.tx).toBeCloseTo(0);
    expect(out.ty).toBeCloseTo(25);
  });

  test('cover 모드: 정사각형 src로 가로로 넓은 dest를 덮는다 (width 기준 scale)', () => {
    // src: 100×100, dest: 200×100 → srcRatio=1, destRatio=2 → cover: width 기준 scale=2
    const out = makeMatrix();
    const src = { x: 0, y: 0, width: 100, height: 100 };
    const dest = { x: 0, y: 0, width: 200, height: 100 };
    fitRectInto(out, src, dest, { mode: 'cover' });
    expect(out.a).toBeCloseTo(2);
    expect(out.d).toBeCloseTo(2);
  });

  test('stretch 모드: src를 dest에 비율 무시하고 맞춘다', () => {
    const out = makeMatrix();
    const src = { x: 0, y: 0, width: 100, height: 50 };
    const dest = { x: 10, y: 20, width: 200, height: 100 };
    fitRectInto(out, src, dest, { mode: 'stretch' });
    expect(out.a).toBeCloseTo(2);
    expect(out.d).toBeCloseTo(2);
    expect(out.tx).toBeCloseTo(10);
    expect(out.ty).toBeCloseTo(20);
  });

  test('mode 기본값은 contain이다', () => {
    const out1 = makeMatrix();
    const out2 = makeMatrix();
    const src = { x: 0, y: 0, width: 100, height: 100 };
    const dest = { x: 0, y: 0, width: 200, height: 100 };
    fitRectInto(out1, src, dest);
    fitRectInto(out2, src, dest, { mode: 'contain' });
    expectNearMatrix(out1, out2);
  });

  test('empty src(width=0)이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    fitRectInto(out, { x: 0, y: 0, width: 0, height: 100 }, { x: 0, y: 0, width: 100, height: 100 });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('empty dest(height=0)이면 identity matrix를 기록한다', () => {
    const out = makeMatrix();
    fitRectInto(out, { x: 0, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 100, height: 0 });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('유효하지 않은 mode는 RangeError를 던진다', () => {
    const out = makeMatrix();
    expect(() =>
      fitRectInto(
        out,
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 0, y: 0, width: 10, height: 10 },
        {
          mode: 'invalid' as never,
        }
      )
    ).toThrow(RangeError);
  });

  test('Infinity component는 RangeError를 던진다', () => {
    const out = makeMatrix();
    expect(() =>
      fitRectInto(out, { x: Infinity, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 100, height: 100 })
    ).toThrow(RangeError);
  });

  test('out을 반환한다', () => {
    const out = makeMatrix();
    const src = { x: 0, y: 0, width: 100, height: 100 };
    const dest = { x: 0, y: 0, width: 100, height: 100 };
    expect(fitRectInto(out, src, dest)).toBe(out);
  });

  test('tuple RectLike input도 처리한다', () => {
    const out = makeMatrix();
    // [x, y, width, height]
    fitRectInto(out, [0, 0, 100, 100], [0, 0, 100, 100]);
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('src와 dest 크기가 같으면 identity에 가까운 matrix를 기록한다', () => {
    const out = makeMatrix();
    fitRectInto(out, { x: 0, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 100, height: 100 });
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('src origin이 0이 아닐 때 올바른 tx/ty를 기록한다', () => {
    // src: [50,50,100,100], dest: [0,0,100,100] → scale=1, tx = 0 + 0 - 50*1 = -50
    const out = makeMatrix();
    fitRectInto(out, { x: 50, y: 50, width: 100, height: 100 }, { x: 0, y: 0, width: 100, height: 100 });
    expect(out.a).toBeCloseTo(1);
    expect(out.tx).toBeCloseTo(-50);
    expect(out.ty).toBeCloseTo(-50);
  });

  test('contain + flipY: y축을 뒤집고 fitted rect를 dest center에 맞춘다', () => {
    // src: 100×100, dest: 200×100, contain → scale=1, scaledW=100, scaledH=100
    // tx = 0 + (200-100)/2 - 0*1 = 50
    // ty = 0 + (100+100)/2 + 0*1 = 100
    // 검증: src top-left (0,0) → (50, 100), src bottom-left (0,100) → (50, 0)
    const out = makeMatrix();
    fitRectInto(
      out,
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 0, y: 0, width: 200, height: 100 },
      {
        mode: 'contain',
        flipY: true,
      }
    );
    expect(out.a).toBeCloseTo(1);
    expect(out.b).toBeCloseTo(0);
    expect(out.c).toBeCloseTo(0);
    expect(out.d).toBeCloseTo(-1);
    expect(out.tx).toBeCloseTo(50);
    expect(out.ty).toBeCloseTo(100);
  });

  test('cover + flipY: 기존 cover scale을 유지하고 d < 0을 기록한다', () => {
    // src: 100×100, dest: 200×100, cover → scale=2
    // scaledW=200, scaledH=200
    // tx = 0 + (200-200)/2 - 0*2 = 0
    // ty = 0 + (100+200)/2 + 0*2 = 150
    const out = makeMatrix();
    fitRectInto(
      out,
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 0, y: 0, width: 200, height: 100 },
      {
        mode: 'cover',
        flipY: true,
      }
    );
    expect(out.a).toBeCloseTo(2);
    expect(out.d).toBeCloseTo(-2);
    expect(out.tx).toBeCloseTo(0);
    expect(out.ty).toBeCloseTo(150);
  });

  test('stretch + flipY: d = -dh/sh, ty = dy + dh + sy*(dh/sh)를 기록한다', () => {
    // src: [0,0,100,50], dest: [10,20,200,100]
    // a = 200/100 = 2, d = -(100/50) = -2
    // tx = 10 - 0*(200/100) = 10
    // ty = 20 + 100 + 0*(100/50) = 120
    const out = makeMatrix();
    fitRectInto(
      out,
      { x: 0, y: 0, width: 100, height: 50 },
      { x: 10, y: 20, width: 200, height: 100 },
      {
        mode: 'stretch',
        flipY: true,
      }
    );
    expect(out.a).toBeCloseTo(2);
    expect(out.d).toBeCloseTo(-2);
    expect(out.tx).toBeCloseTo(10);
    expect(out.ty).toBeCloseTo(120);
  });

  test('empty src + flipY: identity matrix를 기록한다', () => {
    const out = makeMatrix();
    fitRectInto(
      out,
      { x: 0, y: 0, width: 0, height: 100 },
      { x: 0, y: 0, width: 100, height: 100 },
      {
        flipY: true,
      }
    );
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('empty dest + flipY: identity matrix를 기록한다', () => {
    const out = makeMatrix();
    fitRectInto(
      out,
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 0, y: 0, width: 0, height: 0 },
      {
        flipY: true,
      }
    );
    expectNearMatrix(out, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
  });

  test('non-finite scalar + flipY: RangeError를 던진다', () => {
    const out = makeMatrix();
    expect(() =>
      fitRectInto(
        out,
        { x: NaN, y: 0, width: 100, height: 100 },
        { x: 0, y: 0, width: 100, height: 100 },
        {
          flipY: true,
        }
      )
    ).toThrow(RangeError);
  });

  test('Infinity component + flipY도 RangeError를 던진다', () => {
    const out = makeMatrix();
    expect(() =>
      fitRectInto(
        out,
        { x: Infinity, y: 0, width: 100, height: 100 },
        { x: 0, y: 0, width: 100, height: 100 },
        {
          flipY: true,
        }
      )
    ).toThrow(RangeError);
  });

  test('contain + flipY: src origin이 0이 아닐 때 올바른 tx/ty를 기록한다', () => {
    // src: {x:50, y:30, width:100, height:100}, dest: {x:0, y:0, width:200, height:100}
    // srcRatio=1, destRatio=2 → height 기준 scale=1
    // scaledW=100, scaledH=100
    // a=1, d=-1
    // tx = 0 + (200-100)/2 - 50*1 = 50 - 50 = 0
    // ty = 0 + (100+100)/2 + 30*1 = 100 + 30 = 130
    const out = makeMatrix();
    fitRectInto(
      out,
      { x: 50, y: 30, width: 100, height: 100 },
      { x: 0, y: 0, width: 200, height: 100 },
      {
        mode: 'contain',
        flipY: true,
      }
    );
    expect(out.a).toBeCloseTo(1);
    expect(out.d).toBeCloseTo(-1);
    expect(out.tx).toBeCloseTo(0);
    expect(out.ty).toBeCloseTo(130);
  });
});

describe('matrix builder - fitRect', () => {
  test('새 object로 fit matrix를 반환한다', () => {
    const result = fitRect({ x: 0, y: 0, width: 100, height: 100 }, { x: 0, y: 0, width: 50, height: 50 });
    expect(result.a).toBeCloseTo(0.5);
    expect(result.d).toBeCloseTo(0.5);
  });

  test('flipY option을 전달해 새 object에 같은 matrix를 반환한다', () => {
    const src = { x: 0, y: 0, width: 100, height: 100 };
    const dest = { x: 0, y: 0, width: 200, height: 100 };
    const result = fitRect(src, dest, { mode: 'contain', flipY: true });
    const out = makeMatrix();
    fitRectInto(out, src, dest, { mode: 'contain', flipY: true });
    expectNearMatrix(result, out);
  });
});
