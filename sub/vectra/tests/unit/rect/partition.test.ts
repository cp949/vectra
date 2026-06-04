/**
 * quadrantsInto / quadrants / halvesInto / halves 통합 테스트.
 *
 * 테스트 커버리지:
 *  - 기본 center (raw center) / 명시 center로 사분면 분할
 *  - tuple RectLike 입력
 *  - center가 rect 밖인 negative dimension 결과
 *  - empty rect raw 산식
 *  - nested out aliasing 안전
 *  - quadrants companion: Into와 결과 일치, 새 object 반환, input mutation 없음
 *  - halvesInto: 기본값 axis/ratio, axis x/y, ratio 경계값
 *  - halvesInto: invalid axis / ratio → RangeError
 *  - halvesInto: negative dimension raw 산식
 *  - halvesInto: nested out aliasing 안전
 *  - halves companion: Into와 결과 일치, 새 object 반환, input mutation 없음
 */

import { describe, expect, test } from 'vitest';
import { halves } from '../../../src/rect/halves';
import { halvesInto } from '../../../src/rect/halves-into';
import { quadrants } from '../../../src/rect/quadrants';
import { quadrantsInto } from '../../../src/rect/quadrants-into';

// 기본 rect (0, 0, 100, 60)
const rect = { x: 0, y: 0, width: 100, height: 60 };

// 오프셋 rect (10, 20, 80, 40)
const offsetRect = { x: 10, y: 20, width: 80, height: 40 };

// tuple 형태
const rectTuple = [0, 0, 100, 60] as const;

// empty rect
const emptyRect = { x: 5, y: 3, width: 0, height: 0 };

// negative dimension rect
const negRect = { x: 10, y: 10, width: -20, height: -10 };

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
  test('nw: (x, y, cx-x, cy-y)', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect);
    // cx = 50, cy = 30
    expect(out.nw).toEqual({ x: 0, y: 0, width: 50, height: 30 });
  });

  test('ne: (cx, y, x+w-cx, cy-y)', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect);
    expect(out.ne).toEqual({ x: 50, y: 0, width: 50, height: 30 });
  });

  test('se: (cx, cy, x+w-cx, y+h-cy)', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect);
    expect(out.se).toEqual({ x: 50, y: 30, width: 50, height: 30 });
  });

  test('sw: (x, cy, cx-x, y+h-cy)', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect);
    expect(out.sw).toEqual({ x: 0, y: 30, width: 50, height: 30 });
  });

  test('반환값이 out과 동일한 reference이다', () => {
    const out = makeQuadOut();
    const ret = quadrantsInto(out, rect);
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

  test('center tuple [cx, cy]로 사분면 계산', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect, [40, 15] as const);
    expect(out.nw).toEqual({ x: 0, y: 0, width: 40, height: 15 });
    expect(out.ne).toEqual({ x: 40, y: 0, width: 60, height: 15 });
    expect(out.se).toEqual({ x: 40, y: 15, width: 60, height: 45 });
    expect(out.sw).toEqual({ x: 0, y: 15, width: 40, height: 45 });
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — tuple RectLike
// --------------------------------------------------------------------------

describe('quadrantsInto — tuple RectLike 입력', () => {
  test('tuple rect를 object rect와 동일하게 처리한다', () => {
    const out1 = makeQuadOut();
    const out2 = makeQuadOut();
    quadrantsInto(out1, rect);
    quadrantsInto(out2, rectTuple);
    expect(out1).toEqual(out2);
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — 오프셋 rect
// --------------------------------------------------------------------------

describe('quadrantsInto — 오프셋 rect', () => {
  test('x,y 오프셋이 반영된 사분면 좌표', () => {
    const out = makeQuadOut();
    quadrantsInto(out, offsetRect);
    // cx = 10 + 80/2 = 50, cy = 20 + 40/2 = 40
    expect(out.nw).toEqual({ x: 10, y: 20, width: 40, height: 20 });
    expect(out.ne).toEqual({ x: 50, y: 20, width: 40, height: 20 });
    expect(out.se).toEqual({ x: 50, y: 40, width: 40, height: 20 });
    expect(out.sw).toEqual({ x: 10, y: 40, width: 40, height: 20 });
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — center가 rect 밖
// --------------------------------------------------------------------------

describe('quadrantsInto — center가 rect 밖 (negative dimension)', () => {
  test('center가 왼쪽 밖이면 ne/se의 width가 음수가 된다', () => {
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
// quadrantsInto — empty rect
// --------------------------------------------------------------------------

describe('quadrantsInto — empty rect', () => {
  test('empty rect (0 dimension)에서 raw 산식 적용', () => {
    const out = makeQuadOut();
    quadrantsInto(out, emptyRect);
    // cx = 5 + 0/2 = 5, cy = 3 + 0/2 = 3
    expect(out.nw).toEqual({ x: 5, y: 3, width: 0, height: 0 });
    expect(out.ne).toEqual({ x: 5, y: 3, width: 0, height: 0 });
    expect(out.se).toEqual({ x: 5, y: 3, width: 0, height: 0 });
    expect(out.sw).toEqual({ x: 5, y: 3, width: 0, height: 0 });
  });
});

// --------------------------------------------------------------------------
// quadrantsInto — nested out aliasing 안전
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

  test('center가 입력 rect와 동일한 object여도 정확히 계산한다', () => {
    // aliasing: center === rect — readX/readY로 cx=rect.x, cy=rect.y가 된다
    const sharedRect = { x: 10, y: 20, width: 100, height: 60 };
    const out = makeQuadOut();
    quadrantsInto(out, sharedRect, sharedRect);
    // cx = rect.x = 10, cy = rect.y = 20
    expect(out.nw).toEqual({ x: 10, y: 20, width: 0, height: 0 });
    expect(out.ne).toEqual({ x: 10, y: 20, width: 100, height: 0 });
    expect(out.se).toEqual({ x: 10, y: 20, width: 100, height: 60 });
    expect(out.sw).toEqual({ x: 10, y: 20, width: 0, height: 60 });
  });
});

// --------------------------------------------------------------------------
// quadrants — companion
// --------------------------------------------------------------------------

describe('quadrants — companion', () => {
  test('quadrantsInto와 동일한 결과를 반환한다', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect);
    const result = quadrants(rect);
    expect(result.nw).toEqual(out.nw);
    expect(result.ne).toEqual(out.ne);
    expect(result.se).toEqual(out.se);
    expect(result.sw).toEqual(out.sw);
  });

  test('명시 center를 Into에 위임한다', () => {
    const out = makeQuadOut();
    quadrantsInto(out, rect, { x: 30, y: 20 });
    const result = quadrants(rect, { x: 30, y: 20 });
    expect(result.nw).toEqual(out.nw);
    expect(result.ne).toEqual(out.ne);
    expect(result.se).toEqual(out.se);
    expect(result.sw).toEqual(out.sw);
  });

  test('호출마다 새 nested object를 반환한다', () => {
    const r1 = quadrants(rect);
    const r2 = quadrants(rect);
    expect(r1.nw).not.toBe(r2.nw);
    expect(r1.ne).not.toBe(r2.ne);
    expect(r1.se).not.toBe(r2.se);
    expect(r1.sw).not.toBe(r2.sw);
  });

  test('input rect가 mutation되지 않는다', () => {
    const input = { x: 0, y: 0, width: 100, height: 60 };
    quadrants(input);
    expect(input).toEqual({ x: 0, y: 0, width: 100, height: 60 });
  });
});

// --------------------------------------------------------------------------
// halvesInto — 기본값 (axis: 'x', ratio: 0.5)
// --------------------------------------------------------------------------

describe('halvesInto — 기본값 axis x, ratio 0.5', () => {
  test('기본값으로 left/right 50:50 분할', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect);
    // split = 0 + 100 * 0.5 = 50
    expect(out.first).toEqual({ x: 0, y: 0, width: 50, height: 60 });
    expect(out.second).toEqual({ x: 50, y: 0, width: 50, height: 60 });
  });

  test('반환값이 out과 동일한 reference이다', () => {
    const out = makeHalvesOut();
    const ret = halvesInto(out, rect);
    expect(ret).toBe(out);
  });
});

// --------------------------------------------------------------------------
// halvesInto — axis: 'x'
// --------------------------------------------------------------------------

describe('halvesInto — axis x', () => {
  test('ratio=0.3: left 30% / right 70%', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'x', ratio: 0.3 });
    // split = 0 + 100 * 0.3 = 30
    expect(out.first).toEqual({ x: 0, y: 0, width: 30, height: 60 });
    expect(out.second).toEqual({ x: 30, y: 0, width: 70, height: 60 });
  });

  test('ratio=0: first width=0, second width=full', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'x', ratio: 0 });
    expect(out.first).toEqual({ x: 0, y: 0, width: 0, height: 60 });
    expect(out.second).toEqual({ x: 0, y: 0, width: 100, height: 60 });
  });

  test('ratio=1: first width=full, second width=0', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'x', ratio: 1 });
    expect(out.first).toEqual({ x: 0, y: 0, width: 100, height: 60 });
    expect(out.second).toEqual({ x: 100, y: 0, width: 0, height: 60 });
  });

  test('오프셋 rect에서 x offset 반영', () => {
    const out = makeHalvesOut();
    halvesInto(out, offsetRect, { axis: 'x', ratio: 0.5 });
    // split = 10 + 80 * 0.5 = 50
    expect(out.first).toEqual({ x: 10, y: 20, width: 40, height: 40 });
    expect(out.second).toEqual({ x: 50, y: 20, width: 40, height: 40 });
  });
});

// --------------------------------------------------------------------------
// halvesInto — axis: 'y'
// --------------------------------------------------------------------------

describe('halvesInto — axis y', () => {
  test('ratio=0.5: top/bottom 50:50 분할', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'y', ratio: 0.5 });
    // split = 0 + 60 * 0.5 = 30
    expect(out.first).toEqual({ x: 0, y: 0, width: 100, height: 30 });
    expect(out.second).toEqual({ x: 0, y: 30, width: 100, height: 30 });
  });

  test('ratio=0.25: top 25% / bottom 75%', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'y', ratio: 0.25 });
    // split = 0 + 60 * 0.25 = 15
    expect(out.first).toEqual({ x: 0, y: 0, width: 100, height: 15 });
    expect(out.second).toEqual({ x: 0, y: 15, width: 100, height: 45 });
  });

  test('ratio=0: first height=0, second height=full', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'y', ratio: 0 });
    expect(out.first).toEqual({ x: 0, y: 0, width: 100, height: 0 });
    expect(out.second).toEqual({ x: 0, y: 0, width: 100, height: 60 });
  });

  test('ratio=1: first height=full, second height=0', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'y', ratio: 1 });
    expect(out.first).toEqual({ x: 0, y: 0, width: 100, height: 60 });
    expect(out.second).toEqual({ x: 0, y: 60, width: 100, height: 0 });
  });
});

// --------------------------------------------------------------------------
// halvesInto — RangeError
// --------------------------------------------------------------------------

describe('halvesInto — RangeError 조건', () => {
  test('ratio < 0이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { ratio: -0.1 })).toThrow(RangeError);
  });

  test('ratio > 1이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { ratio: 1.1 })).toThrow(RangeError);
  });

  test('ratio = NaN이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { ratio: Number.NaN })).toThrow(RangeError);
  });

  test('axis가 유효하지 않은 문자열이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    const badAxis = 'z' as 'x';
    expect(() => halvesInto(out, rect, { axis: badAxis })).toThrow(RangeError);
  });

  test('axis=undefined이면 기본값 x로 처리한다 (에러 없음)', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { axis: undefined })).not.toThrow();
  });

  test('ratio = Infinity이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { ratio: Infinity })).toThrow(RangeError);
  });

  test('ratio = -Infinity이면 RangeError를 던진다', () => {
    const out = makeHalvesOut();
    expect(() => halvesInto(out, rect, { ratio: -Infinity })).toThrow(RangeError);
  });
});

// --------------------------------------------------------------------------
// halvesInto — negative dimension raw 산식
// --------------------------------------------------------------------------

describe('halvesInto — negative dimension raw 산식', () => {
  test('negative width rect, axis x: raw 산식으로 분할', () => {
    const out = makeHalvesOut();
    halvesInto(out, negRect, { axis: 'x', ratio: 0.5 });
    // split = 10 + (-20) * 0.5 = 10 - 10 = 0
    expect(out.first).toEqual({ x: 10, y: 10, width: -10, height: -10 });
    expect(out.second).toEqual({ x: 0, y: 10, width: -10, height: -10 });
  });

  test('negative height rect, axis y: raw 산식으로 분할', () => {
    const out = makeHalvesOut();
    halvesInto(out, negRect, { axis: 'y', ratio: 0.5 });
    // split = 10 + (-10) * 0.5 = 10 - 5 = 5
    expect(out.first).toEqual({ x: 10, y: 10, width: -20, height: -5 });
    expect(out.second).toEqual({ x: 10, y: 5, width: -20, height: -5 });
  });
});

// --------------------------------------------------------------------------
// halvesInto — nested out aliasing 안전
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

  test('out.second가 입력 rect와 동일한 object여도 정확히 계산한다', () => {
    const shared = { x: 0, y: 0, width: 100, height: 60 };
    const out = {
      first: { x: 0, y: 0, width: 0, height: 0 },
      second: shared,
    };
    halvesInto(out, shared);
    expect(out.first).toEqual({ x: 0, y: 0, width: 50, height: 60 });
    expect(out.second).toEqual({ x: 50, y: 0, width: 50, height: 60 });
  });
});

// --------------------------------------------------------------------------
// halves — companion
// --------------------------------------------------------------------------

describe('halves — companion', () => {
  test('halvesInto와 동일한 결과를 반환한다 (기본값)', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect);
    const result = halves(rect);
    expect(result.first).toEqual(out.first);
    expect(result.second).toEqual(out.second);
  });

  test('axis y, ratio 0.3을 Into에 위임한다', () => {
    const out = makeHalvesOut();
    halvesInto(out, rect, { axis: 'y', ratio: 0.3 });
    const result = halves(rect, { axis: 'y', ratio: 0.3 });
    expect(result.first).toEqual(out.first);
    expect(result.second).toEqual(out.second);
  });

  test('호출마다 새 nested object를 반환한다', () => {
    const r1 = halves(rect);
    const r2 = halves(rect);
    expect(r1.first).not.toBe(r2.first);
    expect(r1.second).not.toBe(r2.second);
  });

  test('input rect가 mutation되지 않는다', () => {
    const input = { x: 0, y: 0, width: 100, height: 60 };
    halves(input);
    expect(input).toEqual({ x: 0, y: 0, width: 100, height: 60 });
  });

  test('invalid ratio: RangeError를 던진다', () => {
    expect(() => halves(rect, { ratio: -1 })).toThrow(RangeError);
  });

  test('invalid axis: RangeError를 던진다', () => {
    const badAxis = 'z' as 'x';
    expect(() => halves(rect, { axis: badAxis })).toThrow(RangeError);
  });
});
