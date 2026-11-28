/**
 * cubicSampleInto가 t = i / (steps - 1) 위치의 점을 끝점 포함으로 기록하는지 검증한다.
 * 기본 steps 32, 잘못된 steps의 RangeError, 오류 시 out 보존을 다룬다.
 * 출력 점이 매번 새 객체인지도 확인한다.
 */
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';
import { describe, expect, it } from 'vitest';
import { cubicSampleInto } from '../../../src/curve/cubic-sample-into';

/** 직선 cubic 곡선: p0=(0,0), p1=(1,0), p2=(2,0), p3=(3,0) */
const LINE_P0 = { x: 0, y: 0 };
const LINE_P1 = { x: 1, y: 0 };
const LINE_P2 = { x: 2, y: 0 };
const LINE_P3 = { x: 3, y: 0 };

describe('cubicSampleInto', () => {
  it('steps=2 이면 start/end 두 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const result = cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 2 });
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ x: 0, y: 0 });
    expect(out[1]).toMatchObject({ x: 3, y: 0 });
  });

  it('steps=3 이면 start/middle/end 세 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 3 });
    expect(out).toHaveLength(3);
    expect(out[0]).toMatchObject({ x: 0, y: 0 });
    // t=0.5 직선 cubic: (1-t)^3*0 + 3*(1-t)^2*t*1 + 3*(1-t)*t^2*2 + t^3*3 = 1.5
    expect(out[1].x).toBeCloseTo(1.5, 10);
    expect(out[1].y).toBeCloseTo(0, 10);
    expect(out[2]).toMatchObject({ x: 3, y: 0 });
  });

  it('options를 생략하면 기본값 32개 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3));
    expect(out).toHaveLength(32);
  });

  it('steps=1 (< 2)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() =>
      cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 1 })
    ).toThrow(RangeError);
  });

  it('steps > 0xffffffff이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() =>
      cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 0x100000000 })
    ).toThrow(RangeError);
  });

  it('fractional steps (1.5)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() =>
      cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 1.5 })
    ).toThrow(RangeError);
  });

  it('NaN steps이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() =>
      cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: Number.NaN })
    ).toThrow(RangeError);
  });

  it('오류 시 기존 out 내용을 보존한다', () => {
    const existing = { x: 99, y: 99 };
    const out: { x: number; y: number }[] = [existing];
    expect(() =>
      cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 1 })
    ).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(existing);
  });

  it('각 출력 point는 새로운 object이다', () => {
    const out: { x: number; y: number }[] = [];
    cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 3 });
    expect(out[0]).not.toBe(LINE_P0);
    expect(out[2]).not.toBe(LINE_P3);
    expect(out[0]).not.toBe(out[1]);
    expect(out[1]).not.toBe(out[2]);
  });

  it('반환값은 out 배열 자체이다', () => {
    const out: { x: number; y: number }[] = [];
    const result = cubicSampleInto(out, flatCubicFromLegacyPoints(LINE_P0, LINE_P1, LINE_P2, LINE_P3), { steps: 2 });
    expect(result).toBe(out);
  });
});
