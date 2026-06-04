/**
 * quadraticSampleInto unit test.
 *
 * quadratic Bezier curve를 균등 steps로 샘플링해 XYObjectWritable[] 배열에 push한다.
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 */
import { describe, expect, it } from 'vitest';
import { quadraticSampleInto } from '../../../src/curve/quadratic-sample-into';

/** 직선 quadratic 곡선: p0=(0,0), p1=(1,0), p2=(2,0) */
const LINE_P0 = { x: 0, y: 0 };
const LINE_P1 = { x: 1, y: 0 };
const LINE_P2 = { x: 2, y: 0 };

describe('quadraticSampleInto', () => {
  it('steps=2 이면 start/end 두 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const result = quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 2);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ x: 0, y: 0 });
    expect(out[1]).toMatchObject({ x: 2, y: 0 });
  });

  it('steps=3 이면 start/middle/end 세 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toMatchObject({ x: 0, y: 0 });
    // t=0.5: (1-0.5)^2*0 + 2*(1-0.5)*0.5*1 + 0.5^2*2 = 0 + 0.5 + 0.5 = 1
    expect(out[1].x).toBeCloseTo(1, 10);
    expect(out[1].y).toBeCloseTo(0, 10);
    expect(out[2]).toMatchObject({ x: 2, y: 0 });
  });

  it('options object { steps: 3 }와 number 3이 동일한 결과를 반환한다', () => {
    const out1: { x: number; y: number }[] = [];
    const out2: { x: number; y: number }[] = [];
    quadraticSampleInto(out1, LINE_P0, LINE_P1, LINE_P2, 3);
    quadraticSampleInto(out2, LINE_P0, LINE_P1, LINE_P2, { steps: 3 });
    expect(out1).toHaveLength(out2.length);
    for (let i = 0; i < out1.length; i++) {
      expect(out1[i].x).toBeCloseTo(out2[i].x, 10);
      expect(out1[i].y).toBeCloseTo(out2[i].y, 10);
    }
  });

  it('options를 생략하면 기본값 32개 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2);
    expect(out).toHaveLength(32);
  });

  it('steps=1 (< 2)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 1)).toThrow(RangeError);
  });

  it('steps > 0xffffffff이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 0x100000000)).toThrow(RangeError);
  });

  it('fractional steps (1.5)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 1.5)).toThrow(RangeError);
  });

  it('NaN steps이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, Number.NaN)).toThrow(RangeError);
  });

  it('오류 시 기존 out 내용을 보존한다', () => {
    const existing = { x: 99, y: 99 };
    const out: { x: number; y: number }[] = [existing];
    expect(() => quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 1)).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(existing);
  });

  it('각 출력 point는 새로운 object이다', () => {
    const out: { x: number; y: number }[] = [];
    quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 3);
    expect(out[0]).not.toBe(LINE_P0);
    expect(out[2]).not.toBe(LINE_P2);
    expect(out[0]).not.toBe(out[1]);
    expect(out[1]).not.toBe(out[2]);
  });

  it('반환값은 out 배열 자체이다', () => {
    const out: { x: number; y: number }[] = [];
    const result = quadraticSampleInto(out, LINE_P0, LINE_P1, LINE_P2, 2);
    expect(result).toBe(out);
  });
});
