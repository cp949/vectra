/**
 * curve.cubicChainFlattenInto — cubic control point chain을 연결 polyline point collection으로 flatten.
 *
 * 검증: 단일 segment가 cubicFlattenInto와 deep equal, 다중 segment 연결점 dedup,
 * short chain 빈 배열, invalid length RangeError, tuple/object 입력, flatness 단조성,
 * out clear / return identity / result object 신규 생성, non-finite(NaN/Infinity/-Infinity) 및
 * degenerate 입력이 cubicFlattenInto 정책과 일치.
 */
import { describe, expect, it } from 'vitest';
import { cubicChainFlattenInto } from '../../../src/curve/cubic-chain-flatten-into';
import { cubicFlattenInto } from '../../../src/curve/cubic-flatten-into';

// p0=(0,0), c1=(1,2), c2=(2,2), p1=(3,0) — 첫 segment
const SEG0 = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 0 },
];
// p1=(3,0), c1=(4,-2), c2=(5,-2), p2=(6,0) — 둘째 segment (p1 공유)
const SEG1_TAIL = [
  { x: 4, y: -2 },
  { x: 5, y: -2 },
  { x: 6, y: 0 },
];
const TWO_SEG_CHAIN = [...SEG0, ...SEG1_TAIL];

describe('cubicChainFlattenInto', () => {
  it('단일 segment chain이 cubicFlattenInto 결과와 deep equal이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, SEG0);

    const expected: { x: number; y: number }[] = [];
    cubicFlattenInto(expected, SEG0[0], SEG0[1], SEG0[2], SEG0[3]);

    expect(out).toEqual(expected);
  });

  it('두 segment chain에서 연결점이 한 번만 나온다', () => {
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, TWO_SEG_CHAIN);

    const seg0: { x: number; y: number }[] = [];
    cubicFlattenInto(seg0, SEG0[0], SEG0[1], SEG0[2], SEG0[3]);
    const seg1: { x: number; y: number }[] = [];
    cubicFlattenInto(seg1, { x: 3, y: 0 }, SEG1_TAIL[0], SEG1_TAIL[1], SEG1_TAIL[2]);

    // 둘째 segment의 첫 point(연결점 = seg0 끝점)를 제거하고 이어붙인 것과 같다
    const expected = [...seg0, ...seg1.slice(1)];
    expect(out).toEqual(expected);
    // 연결점 (3,0)은 정확히 한 번만 나온다
    expect(out.filter((p) => p.x === 3 && p.y === 0)).toHaveLength(1);
  });

  it('세 segment chain이 segment별 flatten을 연결점 dedup으로 이어붙인 것과 같다', () => {
    const threeSegChain = [...TWO_SEG_CHAIN, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 0 }];
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, threeSegChain);

    const seg0: { x: number; y: number }[] = [];
    cubicFlattenInto(seg0, SEG0[0], SEG0[1], SEG0[2], SEG0[3]);
    const seg1: { x: number; y: number }[] = [];
    cubicFlattenInto(seg1, { x: 3, y: 0 }, SEG1_TAIL[0], SEG1_TAIL[1], SEG1_TAIL[2]);
    const seg2: { x: number; y: number }[] = [];
    cubicFlattenInto(seg2, { x: 6, y: 0 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 0 });

    const expected = [...seg0, ...seg1.slice(1), ...seg2.slice(1)];
    expect(out).toEqual(expected);
  });

  it('points.length가 4 미만이면 빈 배열을 반환한다', () => {
    for (const len of [0, 1, 2, 3]) {
      const out: { x: number; y: number }[] = [];
      const points = TWO_SEG_CHAIN.slice(0, len);
      expect(cubicChainFlattenInto(out, points)).toEqual([]);
    }
  });

  it('length가 4 + 3n 형식이 아니면 RangeError를 던진다', () => {
    for (const len of [5, 6, 8, 9]) {
      const out: { x: number; y: number }[] = [];
      const points = [...TWO_SEG_CHAIN, { x: 7, y: 1 }, { x: 8, y: 1 }].slice(0, len);
      expect(() => cubicChainFlattenInto(out, points)).toThrow(RangeError);
    }
  });

  it('tuple 입력과 object 입력이 같은 결과를 만든다', () => {
    const tupleChain: [number, number][] = TWO_SEG_CHAIN.map((p) => [p.x, p.y]);
    const outTuple: { x: number; y: number }[] = [];
    cubicChainFlattenInto(outTuple, tupleChain);

    const outObject: { x: number; y: number }[] = [];
    cubicChainFlattenInto(outObject, TWO_SEG_CHAIN);

    expect(outTuple).toEqual(outObject);
  });

  it('flatness가 작을수록 point 수가 증가한다', () => {
    const outCoarse: { x: number; y: number }[] = [];
    cubicChainFlattenInto(outCoarse, TWO_SEG_CHAIN, { flatness: 1.0 });

    const outFine: { x: number; y: number }[] = [];
    cubicChainFlattenInto(outFine, TWO_SEG_CHAIN, { flatness: 0.05 });

    // 곡률이 있는 chain에서 flatness를 줄이면 subdivision이 늘어 point 수가 실제로 증가한다.
    expect(outFine.length).toBeGreaterThan(outCoarse.length);
  });

  it('호출 시 기존 out 내용을 clear한다', () => {
    const sentinel = { x: 99, y: 99 };
    const out = [sentinel];
    cubicChainFlattenInto(out, SEG0);
    expect(out[0]).not.toBe(sentinel);
  });

  it('out을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const ret = cubicChainFlattenInto(out, SEG0);
    expect(ret).toBe(out);
  });

  it('result point는 입력 point를 재사용하지 않는 새 object다', () => {
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, SEG0);
    for (const inputPoint of SEG0) {
      expect(out).not.toContain(inputPoint);
    }
  });

  it('입력 points 배열과 그 원소를 mutate하지 않는다', () => {
    const input = TWO_SEG_CHAIN.map((p) => ({ ...p }));
    const snapshot = input.map((p) => ({ ...p }));
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, input);
    expect(input).toEqual(snapshot);
  });

  // non-finite 입력은 measureFlatness를 non-finite로 만들어 flatness 분기가 절대 충족되지 않으므로
  // maxRecursion 상한까지 분할한다. 기본 maxRecursion(32)은 2^32 point 폭주를 부르므로 작은 값으로 제한한다.
  it('NaN 입력은 cubicFlattenInto 정책과 일치한다', () => {
    const chain = [
      { x: 0, y: 0 },
      { x: Number.NaN, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 0 },
    ];
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, chain, { maxRecursion: 4 });

    const expected: { x: number; y: number }[] = [];
    cubicFlattenInto(expected, chain[0], chain[1], chain[2], chain[3], { maxRecursion: 4 });

    expect(out).toEqual(expected);
    expect(out.some((p) => Number.isNaN(p.x))).toBe(true);
  });

  it('Infinity / -Infinity 입력은 cubicFlattenInto 정책과 일치한다', () => {
    const chain = [
      { x: 0, y: 0 },
      { x: Number.POSITIVE_INFINITY, y: 2 },
      { x: 2, y: Number.NEGATIVE_INFINITY },
      { x: 3, y: 0 },
    ];
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, chain, { maxRecursion: 4 });

    const expected: { x: number; y: number }[] = [];
    cubicFlattenInto(expected, chain[0], chain[1], chain[2], chain[3], { maxRecursion: 4 });

    expect(out).toEqual(expected);
    expect(out.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))).toBe(true);
  });

  it('zero-length degenerate segment는 시작/끝 두 점을 만든다', () => {
    const pt = { x: 5, y: 5 };
    const out: { x: number; y: number }[] = [];
    cubicChainFlattenInto(out, [pt, pt, pt, pt]);
    expect(out).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });
});
