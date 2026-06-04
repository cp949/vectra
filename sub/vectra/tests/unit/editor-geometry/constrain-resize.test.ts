/**
 * editor-geometry constrain-resize 단위 테스트
 *
 * constrainResizeInto / constrainResize 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { constrainResize } from '../../../src/editor-geometry/constrain-resize';
import { constrainResizeInto } from '../../../src/editor-geometry/constrain-resize-into';

// ---------------------------------------------------------------------------
// 테스트 helper
// ---------------------------------------------------------------------------

/** 가변 size object 생성 helper */
function makeSize(width = 0, height = 0): { width: number; height: number } {
  return { width, height };
}

// ---------------------------------------------------------------------------
// options 없음 — proposed 그대로
// ---------------------------------------------------------------------------

describe('options 없음', () => {
  test('proposed를 그대로 기록한다', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 200, height: 160 });
    expect(out.width).toBe(200);
    expect(out.height).toBe(160);
  });

  test('companion constrainResize: proposed 그대로 반환', () => {
    const result = constrainResize({ width: 100, height: 80 }, { width: 50, height: 40 });
    expect(result.width).toBe(50);
    expect(result.height).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// aspectLock — current 기준 ratio 보정
// ---------------------------------------------------------------------------

describe('aspectLock', () => {
  test('proposed width가 ratio에 맞게 height를 보정한다 (width dominant)', () => {
    // current: 100×80 → ratio = 100/80 = 1.25
    // proposed: 200×80 → 200/ratio = 160 이어야 함
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 200, height: 80 }, { aspectLocked: true });
    expect(out.width).toBeCloseTo(200);
    expect(out.height).toBeCloseTo(160);
  });

  test('proposed height가 ratio에 맞게 width를 보정한다 (height dominant)', () => {
    // current: 100×80 → ratio = 1.25
    // proposed: 100×200 → width는 200*1.25 = 250 이어야 함
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 100, height: 200 }, { aspectLocked: true });
    expect(out.width).toBeCloseTo(250);
    expect(out.height).toBeCloseTo(200);
  });

  test('proposed가 이미 ratio에 맞으면 변경 없음', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 150, height: 120 }, { aspectLocked: true });
    expect(out.width).toBeCloseTo(150);
    expect(out.height).toBeCloseTo(120);
  });

  test('aspectLock: false이면 proposed 그대로', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 200, height: 80 }, { aspectLocked: false });
    expect(out.width).toBe(200);
    expect(out.height).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// min/max clamp
// ---------------------------------------------------------------------------

describe('minWidth / maxWidth clamp', () => {
  test('proposed width가 minWidth보다 작으면 minWidth로 clamp', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 10, height: 80 }, { minWidth: 50 });
    expect(out.width).toBe(50);
    expect(out.height).toBe(80);
  });

  test('proposed width가 maxWidth보다 크면 maxWidth로 clamp', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 300, height: 80 }, { maxWidth: 200 });
    expect(out.width).toBe(200);
    expect(out.height).toBe(80);
  });

  test('proposed height가 minHeight보다 작으면 minHeight로 clamp', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 100, height: 10 }, { minHeight: 40 });
    expect(out.width).toBe(100);
    expect(out.height).toBe(40);
  });

  test('proposed height가 maxHeight보다 크면 maxHeight로 clamp', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 100, height: 300 }, { maxHeight: 200 });
    expect(out.width).toBe(100);
    expect(out.height).toBe(200);
  });

  test('min > max이면 min 우선', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 150, height: 80 }, { minWidth: 100, maxWidth: 50 });
    expect(out.width).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// aspectLock + min/max 조합 — ratio 먼저, 그다음 clamp
// ---------------------------------------------------------------------------

describe('aspectLock + min/max 조합', () => {
  test('ratio 보정 후 minWidth로 clamp: 두 축 모두 보정됨', () => {
    // current: 100×80, ratio = 1.25
    // proposed: 200×80 → aspectLock → 200×160
    // minWidth: 50 → 200 >= 50, clamp 없음
    // minHeight: 50 → 160 >= 50, clamp 없음
    const out = makeSize();
    constrainResizeInto(
      out,
      { width: 100, height: 80 },
      { width: 200, height: 80 },
      { aspectLocked: true, minWidth: 50, minHeight: 50 }
    );
    expect(out.width).toBeCloseTo(200);
    expect(out.height).toBeCloseTo(160);
  });

  test('ratio 보정 후 maxWidth clamp: clamp가 비율을 깨뜨린다', () => {
    // current: 100×80, ratio = 1.25
    // proposed: 200×80 → aspectLock → 200×160
    // maxWidth: 150 → width clamp to 150 (height는 별도로 clamp, 비율 깨짐)
    const out = makeSize();
    constrainResizeInto(
      out,
      { width: 100, height: 80 },
      { width: 200, height: 80 },
      { aspectLocked: true, maxWidth: 150 }
    );
    expect(out.width).toBe(150);
    expect(out.height).toBeCloseTo(160); // height clamp는 없으므로 그대로
  });
});

// ---------------------------------------------------------------------------
// degenerate current (0 width 또는 0 height)
// ---------------------------------------------------------------------------

describe('degenerate current', () => {
  test('current.width === 0: NaN propagation', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 0, height: 80 }, { width: 100, height: 80 }, { aspectLocked: true });
    expect(out.width).toBeNaN();
    expect(out.height).toBeNaN();
  });

  test('current.height === 0: NaN propagation', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 0 }, { width: 100, height: 80 }, { aspectLocked: true });
    expect(out.width).toBeNaN();
    expect(out.height).toBeNaN();
  });

  test('aspectLock 없이 current degenerate: proposed 그대로', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 0, height: 0 }, { width: 100, height: 80 });
    expect(out.width).toBe(100);
    expect(out.height).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// NaN propagation
// ---------------------------------------------------------------------------

describe('NaN propagation', () => {
  test('proposed.width NaN: NaN 기록', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: Number.NaN, height: 80 });
    expect(out.width).toBeNaN();
  });

  test('proposed.height NaN: NaN 기록', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: 100, height: Number.NaN });
    expect(out.height).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// companion constrainResize — Out 반환 검증
// ---------------------------------------------------------------------------

describe('companion constrainResize', () => {
  test('aspectLock 보정값 반환', () => {
    const result = constrainResize({ width: 100, height: 80 }, { width: 200, height: 80 }, { aspectLocked: true });
    expect(result.width).toBeCloseTo(200);
    expect(result.height).toBeCloseTo(160);
  });

  test('minWidth clamp 반환', () => {
    const result = constrainResize({ width: 100, height: 80 }, { width: 10, height: 80 }, { minWidth: 50 });
    expect(result.width).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// 음수 size 경계 — aspectLocked 시 minWidth clamp 보장
// ---------------------------------------------------------------------------

describe('음수 proposed size', () => {
  test('aspectLocked: proposed.width 음수 → height dominant → ratio 보정', () => {
    // current: 100×80, ratio = 1.25
    // proposed: -50×80 → scaleW = -0.5, scaleH = 1.0 → height dominant → w = 80*1.25 = 100
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: -50, height: 80 }, { aspectLocked: true });
    expect(out.width).toBe(100);
    expect(out.height).toBe(80);
  });

  test('aspectLocked 없이 proposed.width 음수 → minWidth(default 0)로 clamp', () => {
    const out = makeSize();
    constrainResizeInto(out, { width: 100, height: 80 }, { width: -50, height: 80 });
    expect(out.width).toBe(0);
    expect(out.height).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// Out 다형성 — constrainResizeInto가 Out을 반환한다
// ---------------------------------------------------------------------------

describe('Out 다형성', () => {
  test('extra field가 있는 object: field 보존 + Out 반환', () => {
    const out = { width: 0, height: 0, label: 'test' };
    const returned = constrainResizeInto(out, { width: 100, height: 80 }, { width: 200, height: 160 });
    expect(returned).toBe(out);
    expect(returned.label).toBe('test');
    expect(returned.width).toBe(200);
    expect(returned.height).toBe(160);
  });
});
