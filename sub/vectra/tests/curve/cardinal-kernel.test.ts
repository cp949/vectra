/**
 * cardinal 내부 커널 테스트.
 * clampCardinalTension, cardinalSegmentCount, cardinalGetPoints,
 * cardinalSegmentAt, cardinalSegmentToCubic 다섯 internal helper를 검증한다.
 */
import { describe, expect, it } from 'vitest';
import {
  cardinalGetPoints,
  cardinalSegmentAt,
  cardinalSegmentCount,
  cardinalSegmentToCubic,
  clampCardinalTension,
} from '../../src/curve/cardinal.internal';
import { expectClose } from './_cardinal-test-helpers';

describe('clampCardinalTension', () => {
  it.each<[number, number]>([
    [-1, 0],
    [0, 0],
    [0.5, 0.5],
    [1, 1],
    [2, 1],
  ])('입력 %f는 %f로 clamp한다', (input, expected) => {
    expect(clampCardinalTension(input)).toBe(expected);
  });
});

describe('cardinalSegmentCount', () => {
  it.each<[number, boolean, number]>([
    [4, false, 3],
    [2, false, 1],
    [1, false, 0],
    [0, false, -1],
    [4, true, 4],
    [3, true, 3],
  ])('n=%i, closed=%s → %i', (n, closed, expected) => {
    expect(cardinalSegmentCount(n, closed)).toBe(expected);
  });
});

const pts4 = [
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 30 },
  { x: 4, y: 40 },
];

describe('cardinalGetPoints — open curve', () => {
  it('segIndex=0은 phantom p[-1] = 2*p[0]-p[1]을 첫 점으로 채운다', () => {
    // phantom p[-1] = 2*pts4[0] - pts4[1] = (0, 0)
    expect(cardinalGetPoints(pts4, 0, false)).toEqual([0, 0, 1, 10, 2, 20, 3, 30]);
  });

  it('마지막 segIndex는 phantom p[n] = 2*p[n-1]-p[n-2]를 끝 점으로 채운다', () => {
    // phantom p[4] = 2*pts4[3] - pts4[2] = (5, 50)
    expect(cardinalGetPoints(pts4, 2, false)).toEqual([2, 20, 3, 30, 4, 40, 5, 50]);
  });
});

describe('cardinalGetPoints — closed curve', () => {
  it('마지막 segIndex의 p2/p3은 wrap한다', () => {
    // p0=pts4[2], p1=pts4[3], p2=pts4[0](wrap), p3=pts4[1](wrap)
    expect(cardinalGetPoints(pts4, 3, true)).toEqual([3, 30, 4, 40, 1, 10, 2, 20]);
  });
});

describe('cardinalSegmentAt — 직선 4점 endpoint', () => {
  // 직선 위 등간격 4점 (0,0)/(1,0)/(2,0)/(3,0)
  it.each<[number, number, number]>([
    [0, 1, 0],
    [1, 2, 0],
  ])('localT=%f는 (%f, %f)를 반환한다', (localT, ex, ey) => {
    const out = { x: 0, y: 0 };
    cardinalSegmentAt(out, 0, 0, 1, 0, 2, 0, 3, 0, localT, 0);
    expectClose(out.x, ex);
    expectClose(out.y, ey);
  });
});

describe('cardinalSegmentAt — tension=1', () => {
  it('localT=0.5는 p1과 p2의 산술 중간점을 반환한다', () => {
    // tension=1: tangent=0 → 각 segment가 cubic easing
    const out = { x: 0, y: 0 };
    cardinalSegmentAt(out, 0, 0, 0, 0, 4, 4, 4, 4, 0.5, 1);
    expectClose(out.x, 2);
    expectClose(out.y, 2);
  });
});

describe('cardinalSegmentAt — output object', () => {
  it('전달한 out을 그대로 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(cardinalSegmentAt(out, 0, 0, 1, 0, 2, 0, 3, 0, 0.5, 0)).toBe(out);
  });
});

describe('cardinalSegmentToCubic — tension=0', () => {
  it('직선 4점 변환은 c0=p1, c1=p1+(p2-p0)/6, c2=p2-(p3-p1)/6, c3=p2와 일치한다', () => {
    // s=0.5 → c1=(1+1/3, 0)=(4/3,0), c2=(2-1/3, 0)=(5/3,0)
    const r = cardinalSegmentToCubic(0, 0, 1, 0, 2, 0, 3, 0, 0);
    const expected = [1, 0, 4 / 3, 0, 5 / 3, 0, 2, 0];
    for (let i = 0; i < expected.length; i++) expectClose(r[i], expected[i]);
  });
});

describe('cardinalSegmentToCubic — tension=1', () => {
  it('tangent=0이 되어 c1=p1, c2=p2와 일치한다', () => {
    const r = cardinalSegmentToCubic(0, 0, 1, 2, 3, 4, 5, 6, 1);
    const expected = [1, 2, 1, 2, 3, 4, 3, 4];
    for (let i = 0; i < expected.length; i++) expectClose(r[i], expected[i]);
  });
});

describe('cardinalSegmentToCubic — cardinalSegmentAt 일치', () => {
  it('Bezier t=0.5 평가가 cardinalSegmentAt localT=0.5와 같다', () => {
    const [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y] = [0, 1, 2, 3, 5, 2, 7, 4];
    const [c0x, c0y, c1x, c1y, c2x, c2y, c3x, c3y] = cardinalSegmentToCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 0);
    const u = 0.5;
    const bx = (1 - u) ** 3 * c0x + 3 * (1 - u) ** 2 * u * c1x + 3 * (1 - u) * u ** 2 * c2x + u ** 3 * c3x;
    const by = (1 - u) ** 3 * c0y + 3 * (1 - u) ** 2 * u * c1y + 3 * (1 - u) * u ** 2 * c2y + u ** 3 * c3y;
    const out = { x: 0, y: 0 };
    cardinalSegmentAt(out, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 0.5, 0);
    expectClose(bx, out.x);
    expectClose(by, out.y);
  });
});
