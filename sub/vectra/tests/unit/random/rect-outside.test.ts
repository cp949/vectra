/**
 * random rect-outside sampling 단위 테스트.
 *
 * outer rect 내부이면서 inner rect 밖인 영역의 direct slab(top/bottom/left/right) 선택,
 * containment/zero-outside-area/empty-inner failure policy, RNG 소비 3회와 boundary 동작,
 * output atomicity를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { pointInRectOutsideInto } from '../../../src/random/point-in-rect-outside-into';

import { sequence } from './_geometry-test-helpers';

// 표준 fixture: outer(0,0,100,80) 안에 inner(25,20,50,30)이 중앙 배치.
// slab 면적: top=2000, bottom=3000, left=750, right=750, total=6500.
// 누적 경계(u*6500 기준): top<2000, bottom<5000, left<5750, right<6500.
const OUTER = { x: 0, y: 0, width: 100, height: 80 };
const INNER = { x: 25, y: 20, width: 50, height: 30 };

/** 호출 횟수를 세는 rng. 실패 분기의 RNG 미소비 검증에 쓴다. */
const countingRng = () => {
  let calls = 0;
  const rng = () => {
    calls += 1;
    return 0.5;
  };
  return { rng, getCalls: () => calls };
};

describe('pointInRectOutsideInto — direct slab 선택', () => {
  test('첫 slab(top)을 선택하고 slab 내부 좌표를 기록한다', () => {
    const out = { x: -1, y: -1 };
    // u=0 → target=0 → top slab. fx=0.5 → x=50, fy=0.5 → y=10
    const result = pointInRectOutsideInto(out, OUTER, INNER, sequence([0, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 50, y: 10 });
  });

  test('bottom slab을 선택하고 slab 내부 좌표를 기록한다', () => {
    const out = { x: 0, y: 0 };
    // u=0.5 → target=3250 → bottom slab(2000..5000). fx=0.5 → x=50, fy=0.5 → y=50+15=65
    const result = pointInRectOutsideInto(out, OUTER, INNER, sequence([0.5, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 50, y: 65 });
  });

  test('left slab을 선택하고 inner y 범위로 제한된 좌표를 기록한다', () => {
    const out = { x: 0, y: 0 };
    // u=0.8 → target=5200 → left slab(5000..5750). fx=0.5 → x=12.5, fy=0.5 → y=20+15=35
    const result = pointInRectOutsideInto(out, OUTER, INNER, sequence([0.8, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 12.5, y: 35 });
  });

  test('마지막 slab(right)을 선택하고 inner y 범위로 제한된 좌표를 기록한다', () => {
    const out = { x: 0, y: 0 };
    // u=0.92 → target=5980 → right slab(5750..6500). fx=0.5 → x=75+12.5=87.5, fy=0.5 → y=35
    const result = pointInRectOutsideInto(out, OUTER, INNER, sequence([0.92, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 87.5, y: 35 });
  });

  test('tuple RectLike outer/inner 입력을 지원한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointInRectOutsideInto(out, [0, 0, 100, 80], [25, 20, 50, 30], sequence([0, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 50, y: 10 });
  });

  test('inner가 outer 좌변에 접하면(leftWidth=0) left slab 없이 area-uniform을 유지한다', () => {
    const out = { x: 0, y: 0 };
    // inner(0,20,50,30): leftWidth=0 → left slab 제외.
    // top=2000, bottom=3000, right=750*30/... right x=[50,100] y=[20,50] width50 height30=1500. total=6500.
    // u=0.8 → target=5200 → top(0..2000) no, bottom(2000..5000) no, right(5000..6500) yes.
    // fx=0.5 → x=50+25=75, fy=0.5 → y=20+15=35
    const result = pointInRectOutsideInto(
      out,
      OUTER,
      { x: 0, y: 20, width: 50, height: 30 },
      sequence([0.8, 0.5, 0.5])
    );
    expect(result).toBe(true);
    expect(out).toEqual({ x: 75, y: 35 });
  });
});

describe('pointInRectOutsideInto — RNG boundary', () => {
  test('u=0이면 첫 slab(top)을 선택하고 fx=fy=0이면 outer 좌상단을 기록한다', () => {
    const out = { x: -1, y: -1 };
    const result = pointInRectOutsideInto(out, OUTER, INNER, sequence([0, 0, 0]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('u가 1에 근접하면 마지막 slab(right)을 선택한다', () => {
    const out = { x: 0, y: 0 };
    const u = 0.9999999999;
    const result = pointInRectOutsideInto(out, OUTER, INNER, sequence([u, u, u]));
    expect(result).toBe(true);
    // right slab: x=75+u*25 → ~100, y=20+u*30 → ~50
    expect(out.x).toBeCloseTo(75 + u * 25);
    expect(out.y).toBeCloseTo(20 + u * 30);
    expect(out.x).toBeLessThan(100);
    expect(out.y).toBeLessThan(50);
  });

  test('성공 시 RNG를 정확히 3회 소비한다', () => {
    const out = { x: 0, y: 0 };
    const { rng, getCalls } = countingRng();
    const result = pointInRectOutsideInto(out, OUTER, INNER, rng);
    expect(result).toBe(true);
    expect(getCalls()).toBe(3);
  });
});

describe('pointInRectOutsideInto — empty inner', () => {
  test('inner width=0이면 hole 없이 outer 전체를 sampling한다', () => {
    const out = { x: 0, y: 0 };
    // inner(50,20,0,30): left/right만 inner y 범위, top/bottom은 full width.
    // top=2000, bottom=3000, left=1500, right=1500, total=8000=outer area.
    // u=0 → top, fx=0.5 → x=50, fy=0.5 → y=10
    const result = pointInRectOutsideInto(out, OUTER, { x: 50, y: 20, width: 0, height: 30 }, sequence([0, 0.5, 0.5]));
    expect(result).toBe(true);
    expect(out).toEqual({ x: 50, y: 10 });
  });

  test('inner height=0이면 hole 없이 outer 전체를 sampling한다', () => {
    const out = { x: 0, y: 0 };
    // inner(50,40,50,0): top y[0,40]=4000, bottom y[40,80]=4000, left/right innerH=0 제외. total=8000.
    // u=0.5 → target=4000 → bottom(4000..8000)? 4000<4000 false → bottom. fx=0.5 → x=50, fy=0.5 → y=40+20=60
    const result = pointInRectOutsideInto(
      out,
      OUTER,
      { x: 50, y: 40, width: 50, height: 0 },
      sequence([0.5, 0.5, 0.5])
    );
    expect(result).toBe(true);
    expect(out).toEqual({ x: 50, y: 60 });
  });
});

describe('pointInRectOutsideInto — failure policy', () => {
  test('inner가 outer 전체를 덮으면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 7, y: 8 };
    const { rng, getCalls } = countingRng();
    const result = pointInRectOutsideInto(out, OUTER, { x: 0, y: 0, width: 100, height: 80 }, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(getCalls()).toBe(0);
  });

  test('inner가 outer 밖으로 삐져나가면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 1, y: 2 };
    const { rng, getCalls } = countingRng();
    // inner x1 = 25+90 = 115 > 100 → containment 실패
    const result = pointInRectOutsideInto(out, OUTER, { x: 25, y: 20, width: 90, height: 30 }, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 1, y: 2 });
    expect(getCalls()).toBe(0);
  });

  test('inner dimension이 음수이면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 3, y: 4 };
    const { rng, getCalls } = countingRng();
    const result = pointInRectOutsideInto(out, OUTER, { x: 25, y: 20, width: -10, height: 30 }, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 3, y: 4 });
    expect(getCalls()).toBe(0);
  });

  test('outer width=0이면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 5, y: 6 };
    const { rng, getCalls } = countingRng();
    const result = pointInRectOutsideInto(out, { x: 0, y: 0, width: 0, height: 80 }, INNER, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
    expect(getCalls()).toBe(0);
  });

  test('outer height<0이면 false를 반환하고 out을 유지한다', () => {
    const out = { x: 5, y: 6 };
    const result = pointInRectOutsideInto(
      out,
      { x: 0, y: 0, width: 100, height: -1 },
      INNER,
      sequence([0.5, 0.5, 0.5])
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('outer width가 Infinity이면 area 합계가 non-finite이므로 false를 반환한다', () => {
    const out = { x: 5, y: 6 };
    const { rng, getCalls } = countingRng();
    const result = pointInRectOutsideInto(out, { x: 0, y: 0, width: Infinity, height: 80 }, INNER, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
    expect(getCalls()).toBe(0);
  });

  test('outer width=-0이면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 5, y: 6 };
    const { rng, getCalls } = countingRng();
    // -0 > 0 === false로 degenerate outer 분기에서 닫힌다. signed zero를 canonicalize하지 않는다.
    const result = pointInRectOutsideInto(out, { x: 0, y: 0, width: -0, height: 80 }, INNER, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
    expect(getCalls()).toBe(0);
  });

  test('inner 좌표가 NaN이면 containment에서 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 5, y: 6 };
    const { rng, getCalls } = countingRng();
    // NaN 좌표는 containment 비교가 false가 되어 닫힌다.
    const result = pointInRectOutsideInto(out, OUTER, { x: NaN, y: 20, width: 50, height: 30 }, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
    expect(getCalls()).toBe(0);
  });

  test('inner width가 NaN이면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 5, y: 6 };
    const { rng, getCalls } = countingRng();
    // NaN width는 음수 검사(NaN < 0 === false)를 통과하지만 containment(ix1 = NaN)에서 닫힌다.
    const result = pointInRectOutsideInto(out, OUTER, { x: 25, y: 20, width: NaN, height: 30 }, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
    expect(getCalls()).toBe(0);
  });

  test('inner dimension이 Infinity이면 false를 반환하고 RNG를 소비하지 않는다', () => {
    const out = { x: 5, y: 6 };
    const { rng, getCalls } = countingRng();
    // inner width=Infinity → ix1=Infinity > outer x1로 containment에서 닫힌다.
    const result = pointInRectOutsideInto(out, OUTER, { x: 25, y: 20, width: Infinity, height: 30 }, rng);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 5, y: 6 });
    expect(getCalls()).toBe(0);
  });
});
