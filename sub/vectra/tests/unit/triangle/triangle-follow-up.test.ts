/**
 * TASK-02 / TASK-03: triangle altitude, equilateral scalar, orthocenter, excenter/excircle 단위 테스트
 *
 * 대상 함수:
 *   equilateralAltitude, equilateralSide
 *   altitudeInto, altitude
 *   orthocenterInto, orthocenter
 *   excentersInto, excirclesInto
 */
import { describe, expect, test } from 'vitest';
import { altitude } from '../../../src/triangle/altitude';
import { altitudeInto } from '../../../src/triangle/altitude-into';
import { equilateralAltitude } from '../../../src/triangle/equilateral-altitude';
import { equilateralSide } from '../../../src/triangle/equilateral-side';
import { excentersInto } from '../../../src/triangle/excenters-into';
import { excirclesInto } from '../../../src/triangle/excircles-into';
import { orthocenter } from '../../../src/triangle/orthocenter';
import { orthocenterInto } from '../../../src/triangle/orthocenter-into';

// ─── 공통 fixture ───────────────────────────────────────────────────────────

/** 3-4-5 직각삼각형: a(0,0) b(3,0) c(0,4) — CCW */
const right345 = { x1: 0, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };

/** collinear(degenerate) triangle — opposite side zero-length 아님, 단 area=0 */
const collinear = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };

/** opposite side zero-length: b와 c가 같은 점 */
const zeroSide = { x1: 0, y1: 1, x2: 2, y2: 0, x3: 2, y3: 0 };

/** plain segment writable seed를 만든다. */
function seg(ax = 0, ay = 0, bx = 0, by = 0): { x1: number; y1: number; x2: number; y2: number } {
  return { x1: ax, y1: ay, x2: bx, y2: by };
}

/** acute triangle: A=(0,0) B=(4,0) C=(2,3) */
const acute = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 };

// ─── equilateralAltitude ─────────────────────────────────────────────────────

describe('equilateralAltitude', () => {
  test('변 길이 2인 정삼각형의 높이는 Math.sqrt(3)이다', () => {
    expect(equilateralAltitude(2)).toBeCloseTo(Math.sqrt(3), 10);
  });

  test('변 길이 1인 정삼각형의 높이는 Math.sqrt(3)/2이다', () => {
    expect(equilateralAltitude(1)).toBeCloseTo(Math.sqrt(3) / 2, 10);
  });

  test('변 길이 0: 0을 반환한다', () => {
    expect(equilateralAltitude(0)).toBe(0);
  });

  test('음수 입력: JS 산술 결과를 그대로 반환한다', () => {
    expect(equilateralAltitude(-2)).toBeCloseTo(-Math.sqrt(3), 10);
  });

  test('NaN 입력: NaN을 반환한다', () => {
    expect(equilateralAltitude(Number.NaN)).toBeNaN();
  });

  test('Infinity 입력: Infinity를 반환한다', () => {
    expect(equilateralAltitude(Infinity)).toBe(Infinity);
  });
});

// ─── equilateralSide ─────────────────────────────────────────────────────────

describe('equilateralSide', () => {
  test('높이 Math.sqrt(3)인 정삼각형의 변 길이는 2이다', () => {
    expect(equilateralSide(Math.sqrt(3))).toBeCloseTo(2, 10);
  });

  test('높이 Math.sqrt(3)/2인 정삼각형의 변 길이는 1이다', () => {
    expect(equilateralSide(Math.sqrt(3) / 2)).toBeCloseTo(1, 10);
  });

  test('equilateralSide(equilateralAltitude(s)) === s 왕복 변환', () => {
    const s = 5;
    expect(equilateralSide(equilateralAltitude(s))).toBeCloseTo(s, 10);
  });

  test('높이 0: 0을 반환한다', () => {
    expect(equilateralSide(0)).toBe(0);
  });

  test('음수 입력: JS 산술 결과를 그대로 반환한다', () => {
    expect(equilateralSide(-Math.sqrt(3))).toBeCloseTo(-2, 10);
  });

  test('NaN 입력: NaN을 반환한다', () => {
    expect(equilateralSide(Number.NaN)).toBeNaN();
  });

  test('Infinity 입력: Infinity를 반환한다', () => {
    expect(equilateralSide(Infinity)).toBe(Infinity);
  });
});

// ─── altitudeInto ─────────────────────────────────────────────────────────────

describe('altitudeInto', () => {
  test('index 0: A에서 BC로 내린 수선을 기록한다', () => {
    // right345: a(0,0) b(3,0) c(0,4)
    // BC: from (3,0) to (0,4), direction (-3,4), lenSq=25
    // P = a = (0,0)
    // t = ((0-3)*(-3) + (0-0)*(4)) / 25 = 9/25
    // foot = (3 + 9/25*(-3), 0 + 9/25*4) = (3 - 27/25, 36/25) = (48/25, 36/25)
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, right345, 0);
    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(0, 10); // source vertex A
    expect(out.y1).toBeCloseTo(0, 10);
    expect(out.x2).toBeCloseTo(48 / 25, 10); // foot on BC
    expect(out.y2).toBeCloseTo(36 / 25, 10);
  });

  test('index 1: B에서 CA로 내린 수선을 기록한다', () => {
    // right345: b(3,0), CA: from (0,4) to (0,0)
    // direction = (0,-4), lenSq = 16
    // t = ((3-0)*0 + (0-4)*(-4)) / 16 = 16/16 = 1
    // foot = (0 + 1*0, 4 + 1*(-4)) = (0, 0)
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, right345, 1);
    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(3, 10); // source vertex B
    expect(out.y1).toBeCloseTo(0, 10);
    expect(out.x2).toBeCloseTo(0, 10); // foot on CA
    expect(out.y2).toBeCloseTo(0, 10);
  });

  test('index 2: C에서 AB로 내린 수선을 기록한다', () => {
    // right345: c(0,4), AB: from (0,0) to (3,0)
    // direction = (3,0), lenSq = 9
    // t = ((0-0)*3 + (4-0)*0) / 9 = 0
    // foot = (0 + 0*3, 0 + 0*0) = (0, 0)
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, right345, 2);
    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(0, 10); // source vertex C
    expect(out.y1).toBeCloseTo(4, 10);
    expect(out.x2).toBeCloseTo(0, 10); // foot on AB
    expect(out.y2).toBeCloseTo(0, 10);
  });

  test('invalid index(-1): false를 반환하고 out을 수정하지 않는다', () => {
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, right345, -1);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.x2).toBe(99);
  });

  test('invalid index(3): false를 반환하고 out을 수정하지 않는다', () => {
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, right345, 3);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
    expect(out.x2).toBe(99);
  });

  test('invalid index(NaN): false를 반환하고 out을 수정하지 않는다', () => {
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, right345, Number.NaN);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
  });

  test('non-finite vertex를 포함한 triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const tri = { x1: Infinity, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, tri, 0);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
  });

  test('opposite side zero-length: false를 반환하고 out을 수정하지 않는다', () => {
    // zeroSide: a(0,1) b(2,0) c(2,0) — index 0: side BC zero-length
    const out = seg(99, 99, 99, 99);
    const result = altitudeInto(out, zeroSide, 0);
    expect(result).toBe(false);
    expect(out.x1).toBe(99);
  });

  test('collinear triangle: height 0 segment를 기록하고 true를 반환한다', () => {
    // collinear: a(0,0) b(2,0) c(4,0)
    // index 0: A(0,0)에서 BC(2,0→4,0)로의 수선
    // BC direction = (2,0), lenSq = 4
    // t = ((0-2)*2 + (0-0)*0) / 4 = -4/4 = -1
    // foot = (2 + (-1)*2, 0) = (0, 0) = A 자신
    // out.a == out.b → height 0
    const out = seg();
    const result = altitudeInto(out, collinear, 0);
    expect(result).toBe(out);
    expect(out.x1).toBeCloseTo(0, 10); // source vertex A
    expect(out.y1).toBeCloseTo(0, 10);
    expect(out.x2).toBeCloseTo(0, 10); // foot = same point (height 0)
    expect(out.y2).toBeCloseTo(0, 10);
  });
});

// ─── altitude ─────────────────────────────────────────────────────────────────

describe('altitude', () => {
  test('index 0: plain segment object를 반환한다', () => {
    const result = altitude(right345, 0);
    expect(result).not.toBeUndefined();
    expect(result?.x1).toBeCloseTo(0, 10);
    expect(result?.y1).toBeCloseTo(0, 10);
    expect(result?.x2).toBeCloseTo(48 / 25, 10);
    expect(result?.y2).toBeCloseTo(36 / 25, 10);
  });

  test('index 1: plain segment object를 반환한다', () => {
    const result = altitude(right345, 1);
    expect(result).not.toBeUndefined();
    expect(result?.x1).toBeCloseTo(3, 10);
    expect(result?.x2).toBeCloseTo(0, 10);
    expect(result?.y2).toBeCloseTo(0, 10);
  });

  test('invalid index: undefined를 반환한다', () => {
    expect(altitude(right345, 5)).toBeUndefined();
  });

  test('opposite side zero-length: undefined를 반환한다', () => {
    expect(altitude(zeroSide, 0)).toBeUndefined();
  });

  test('non-finite vertex: undefined를 반환한다', () => {
    const tri = { x1: NaN, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    expect(altitude(tri, 0)).toBeUndefined();
  });

  test('반환값은 { a: { x, y }, b: { x, y } } 구조의 plain object이다', () => {
    const result = altitude(right345, 2);
    expect(result).not.toBeUndefined();
    if (result) {
      expect(typeof result.x1).toBe('number');
      expect(typeof result.y1).toBe('number');
      expect(typeof result.x2).toBe('number');
      expect(typeof result.y2).toBe('number');
    }
  });
});

// ─── orthocenterInto ──────────────────────────────────────────────────────────

describe('orthocenterInto', () => {
  test('3-4-5 직각삼각형의 수심은 직각 vertex A=(0,0)와 일치한다', () => {
    // right345: A(0,0) B(3,0) C(0,4) — 직각은 A
    const out = { x: 99, y: 99 };
    const result = orthocenterInto(out, right345);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('acute triangle의 수심 좌표가 expected value와 일치한다', () => {
    // acute: A(0,0) B(4,0) C(2,3)
    // circumcenter D=24, ux=2, uy=5/6
    // orthocenter = (0+4+2-2*2, 0+0+3-2*(5/6)) = (2, 3-5/3) = (2, 4/3)
    const out = { x: 0, y: 0 };
    const result = orthocenterInto(out, acute);
    expect(result).toBe(out);
    expect(out.x).toBeCloseTo(2, 10);
    expect(out.y).toBeCloseTo(4 / 3, 10);
  });

  test('collinear triangle: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    const result = orthocenterInto(out, collinear);
    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('non-finite vertex: false를 반환하고 out을 수정하지 않는다', () => {
    const tri = { x1: Infinity, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    const out = { x: 99, y: 99 };
    const result = orthocenterInto(out, tri);
    expect(result).toBe(false);
    expect(out.x).toBe(99);
  });
});

// ─── orthocenter ──────────────────────────────────────────────────────────────

describe('orthocenter', () => {
  test('3-4-5 직각삼각형의 수심은 A=(0,0)이다', () => {
    const result = orthocenter(right345);
    expect(result).not.toBeUndefined();
    expect(result?.x).toBeCloseTo(0, 10);
    expect(result?.y).toBeCloseTo(0, 10);
  });

  test('collinear triangle: undefined를 반환한다', () => {
    expect(orthocenter(collinear)).toBeUndefined();
  });

  test('non-finite vertex: undefined를 반환한다', () => {
    const tri = { x1: NaN, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    expect(orthocenter(tri)).toBeUndefined();
  });
});

// ─── excentersInto ────────────────────────────────────────────────────────────

describe('excentersInto', () => {
  test('right345에서 A/B/C opposite excenter 3개를 순서대로 반환한다', () => {
    // a=5, b=4, c=3; da=2, db=4, dc=6
    // A-opp: (-5*0+4*3+3*0)/2=6, (-5*0+4*0+3*4)/2=6  → (6, 6)
    // B-opp: (5*0-4*3+3*0)/4=-3, (5*0-4*0+3*4)/4=3   → (-3, 3)
    // C-opp: (5*0+4*3-3*0)/6=2, (5*0+4*0-3*4)/6=-2   → (2, -2)
    const out: { x: number; y: number }[] = [];
    const result = excentersInto(out, right345);
    expect(result).toBe(out);
    expect(out).toHaveLength(3);
    expect(out[0]?.x).toBeCloseTo(6, 10);
    expect(out[0]?.y).toBeCloseTo(6, 10);
    expect(out[1]?.x).toBeCloseTo(-3, 10);
    expect(out[1]?.y).toBeCloseTo(3, 10);
    expect(out[2]?.x).toBeCloseTo(2, 10);
    expect(out[2]?.y).toBeCloseTo(-2, 10);
  });

  test('기존 array 내용을 지운다 (array reset)', () => {
    const out: { x: number; y: number }[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
      { x: 7, y: 8 },
    ];
    excentersInto(out, right345);
    expect(out).toHaveLength(3);
  });

  test('collinear triangle: 빈 array를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    excentersInto(out, collinear);
    expect(out).toHaveLength(0);
  });

  test('non-finite vertex: 빈 array를 반환한다', () => {
    const tri = { x1: Infinity, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    const out: { x: number; y: number }[] = [];
    excentersInto(out, tri);
    expect(out).toHaveLength(0);
  });
});

// ─── excirclesInto ────────────────────────────────────────────────────────────

describe('excirclesInto', () => {
  test('right345에서 center와 radius 3개를 순서대로 반환한다', () => {
    // area=6; ra=6/(da/2)=6/1=6, rb=6/(db/2)=6/2=3, rc=6/(dc/2)=6/3=2
    const out: { cx: number; cy: number; r: number }[] = [];
    const result = excirclesInto(out, right345);
    expect(result).toBe(out);
    expect(out).toHaveLength(3);
    expect(out[0]?.cx).toBeCloseTo(6, 10);
    expect(out[0]?.cy).toBeCloseTo(6, 10);
    expect(out[0]?.r).toBeCloseTo(6, 10);
    expect(out[1]?.cx).toBeCloseTo(-3, 10);
    expect(out[1]?.cy).toBeCloseTo(3, 10);
    expect(out[1]?.r).toBeCloseTo(3, 10);
    expect(out[2]?.cx).toBeCloseTo(2, 10);
    expect(out[2]?.cy).toBeCloseTo(-2, 10);
    expect(out[2]?.r).toBeCloseTo(2, 10);
  });

  test('기존 array 내용을 지운다 (array reset)', () => {
    const dummy = { cx: 0, cy: 0, r: 1 };
    const out = [dummy, dummy, dummy, dummy];
    excirclesInto(out, right345);
    expect(out).toHaveLength(3);
  });

  test('collinear triangle: 빈 array를 반환한다', () => {
    const out: { cx: number; cy: number; r: number }[] = [];
    excirclesInto(out, collinear);
    expect(out).toHaveLength(0);
  });

  test('non-finite vertex: 빈 array를 반환한다', () => {
    const tri = { x1: NaN, y1: 0, x2: 3, y2: 0, x3: 0, y3: 4 };
    const out: { cx: number; cy: number; r: number }[] = [];
    excirclesInto(out, tri);
    expect(out).toHaveLength(0);
  });
});
