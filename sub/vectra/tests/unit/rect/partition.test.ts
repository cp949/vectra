/**
 * quadrantsInto / quadrants / halvesInto / halves 통합 테스트.
 *
 * 테스트 커버리지:
 *  - quadrantsInto: 기본 center 분할 / 명시 center / invalid(center 밖 raw 산식) 대표
 *  - quadrantsInto: nested out/center aliasing 안전 (버그 이력 대표 1개)
 *  - quadrants companion: Into 결과 일치, 호출마다 새 nested object 반환 (대표 1개)
 *  - halvesInto: 기본값 분할 / 명시 axis·ratio / invalid axis·ratio 대표
 *  - halvesInto: nested out aliasing 안전 (버그 이력 대표 1개)
 *  - halves companion: Into 결과 일치, 호출마다 새 nested object 반환 (대표 1개)
 */

import { describe, expect, test } from 'vitest';
import { halves } from '../../../src/rect/halves';
import { halvesInto } from '../../../src/rect/halves-into';
import { quadrants } from '../../../src/rect/quadrants';
import { quadrantsInto } from '../../../src/rect/quadrants-into';

// 기본 rect (0, 0, 100, 60)
const rect = { x: 0, y: 0, width: 100, height: 60 };

/** quadrantsInto 출력 구조를 새로 만든다. */
function makeQuadOut() {
  return {
    nw: { x: 0, y: 0, width: 0, height: 0 },
    ne: { x: 0, y: 0, width: 0, height: 0 },
    se: { x: 0, y: 0, width: 0, height: 0 },
    sw: { x: 0, y: 0, width: 0, height: 0 },
  };
}

/** halvesInto 출력 구조를 새로 만든다. */
function makeHalvesOut() {
  return {
    first: { x: 0, y: 0, width: 0, height: 0 },
    second: { x: 0, y: 0, width: 0, height: 0 },
  };
}

// --------------------------------------------------------------------------
// quadrantsInto — 기본 center
// --------------------------------------------------------------------------

describe('quadrantsInto — 기본 center (raw center)', () => {
  test('기본 center로 4사분면을 분할하고 반환값이 out과 동일한 reference이다', () => {
    const out = makeQuadOut();
    const ret = quadrantsInto(out, rect);
    // cx = 50, cy = 30
    expect(out.nw).toEqual({ x: 0, y: 0, width: 50, height: 30 });
    expect(out.ne).toEqual({ x: 50, y: 0, width: 50, height: 30 });
    expect(out.se).toEqual({ x: 50, y: 30, width: 50, height: 30 });
    expect(out.sw).toEqual({ x: 0, y: 30, width: 50, height: 30 });
    expect(ret).toBe(out);
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — 명시 center
// --------------------------------------------------------------------------

describe('quadrantsInto — 명시 center', () => {
  test('center { x, y } object로 사분면 계산', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect, { x: 30, y: 20 });
    // cx=30, cy=20
    expect(out.nw).toEqual({ x: 0, y: 0, width: 30, height: 20 });
    expect(out.ne).toEqual({ x: 30, y: 0, width: 70, height: 20 });
    expect(out.se).toEqual({ x: 30, y: 20, width: 70, height: 40 });
    expect(out.sw).toEqual({ x: 0, y: 20, width: 30, height: 40 });
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — center가 rect 밖 (invalid 대표)
// --------------------------------------------------------------------------

describe('quadrantsInto — center가 rect 밖 (negative dimension)', () => {
  test('center가 왼쪽 밖이면 nw width가 음수, ne width가 full을 넘는다', () => {
    const out = makeQuadOut();
    // rect: (0,0,100,60), center: (-10,30)
    quadrantsInto(out, rect, { x: -10, y: 30 });
    // nw: width = -10 - 0 = -10 (음수)
    expect(out.nw.width).toBe(-10);
    // ne: width = 0 + 100 - (-10) = 110
    expect(out.ne.width).toBe(110);
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — nested out aliasing 안전 (버그 이력 대표)
// --------------------------------------------------------------------------

describe('quadrantsInto — nested out aliasing', () => {
  test('out.nw가 입력 rect와 동일한 object여도 정확히 계산한다', () => {
    // aliasing: out.nw === rect
    const shared = { x: 0, y: 0, width: 100, height: 60 };
    const out = {
      nw: shared,
      ne: { x: 0, y: 0, width: 0, height: 0 },
      se: { x: 0, y: 0, width: 0, height: 0 },
      sw: { x: 0, y: 0, width: 0, height: 0 },
    };
    quadrantsInto(out, shared);
    // cx=50, cy=30; nw.width = 50-0=50 (shared.width이 50으로 바뀌어도 cx는 먼저 읽힘)
    expect(out.nw).toEqual({ x: 0, y: 0, width: 50, height: 30 });
    expect(out.ne).toEqual({ x: 50, y: 0, width: 50, height: 30 });
    expect(out.se).toEqual({ x: 50, y: 30, width: 50, height: 30 });
    expect(out.sw).toEqual({ x: 0, y: 30, width: 50, height: 30 });
  });
});

// --------------------------------------------------------------------------
// quadrants — companion
// --------------------------------------------------------------------------

describe('quadrants — companion', () => {
  test('quadrantsInto와 동일한 결과를 반환하고 호출마다 새 nested object를 만든다', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect);
    const result = quadrants(rect);
    expect(result.nw).toEqual(out.nw);
    expect(result.ne).toEqual(out.ne);
    expect(result.se).toEqual(out.se);
    expect(result.sw).toEqual(out.sw);

    const r2 = quadrants(rect);
    expect(result.nw).not.toBe(r2.nw);
    expect(result.ne).not.toBe(r2.ne);
    expect(result.se).not.toBe(r2.se);
    expect(result.sw).not.toBe(r2.sw);
  });
});

// --------------------------------------------------------------------------
// halvesInto — 기본값 (axis: 'x', ratio: 0.5)
// --------------------------------------------------------------------------

describe('halvesInto — 기본값 axis x, ratio 0.5', () => {
  test('기본값으로 left/right 50:50 분할하고 반환값이 out과 동일한 reference이다', () => {
    const out = makeHalvesOut();
    const ret = halvesInto(out, rect);
    // split = 0 + 100 * 0.5 = 50
    expect(out.first).toEqual({ x: 0, y: 0, width: 50, height: 60 });
    expect(out.second).toEqual({ x: 50, y: 0, width: 50, height: 60 });
    expect(ret).toBe(out);
  });
});

// --------------------------------------------------------------------------
// halvesInto — 명시 axis·ratio
// --------------------------------------------------------------------------

describe('halvesInto — 명시 axis y, ratio', () => {
  test('axis y, ratio 0.25: top 25% / bottom 75%', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'y', ratio: 0.25 });
    // split = 0 + 60 * 0.25 = 15
    expect(out.first).toEqual({ x: 0, y: 0, width: 100, height: 15 });
    expect(out.second).toEqual({ x: 0, y: 15, width: 100, height: 45 });
  });
});

// --------------------------------------------------------------------------
// halvesInto — RangeError (invalid ratio/axis 대표)
// --------------------------------------------------------------------------

describe('halvesInto — RangeError 조건', () => {
  test('ratio가 [0,1] 밖이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { ratio: -0.1 })).toThrow(RangeError);
  });

  test('axis가 유효하지 않은 문자열이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    const badAxis = 'z' as 'x';
    expect(() => halvesInto(out, rect, { axis: badAxis })).toThrow(RangeError);
  });
});

// --------------------------------------------------------------------------
// halvesInto — nested out aliasing 안전 (버그 이력 대표)
// --------------------------------------------------------------------------

describe('halvesInto — nested out aliasing', () => {
  test('out.first가 입력 rect와 동일한 object여도 정확히 계산한다', () => {
    const shared = { x: 0, y: 0, width: 100, height: 60 };
    const out = {
      first: shared,
      second: { x: 0, y: 0, width: 0, height: 0 },
    };
    halvesInto(out, shared);
    // first.width = 50으로 바뀌어도 split 계산은 먼저 local로 읽힘
    expect(out.first).toEqual({ x: 0, y: 0, width: 50, height: 60 });
    expect(out.second).toEqual({ x: 50, y: 0, width: 50, height: 60 });
  });
});

// --------------------------------------------------------------------------
// halves — companion
// --------------------------------------------------------------------------

describe('halves — companion', () => {
  test('halvesInto와 동일한 결과를 반환하고 호출마다 새 nested object를 만든다', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect);
    const result = halves(rect);
    expect(result.first).toEqual(out.first);
    expect(result.second).toEqual(out.second);

    const r2 = halves(rect);
    expect(result.first).not.toBe(r2.first);
    expect(result.second).not.toBe(r2.second);
  });
});
