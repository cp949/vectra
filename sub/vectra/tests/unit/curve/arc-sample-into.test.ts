/**
 * arcSampleInto unit test.
 *
 * center form arc를 균등 steps로 샘플링해 XYObjectWritable[] 배열에 push한다.
 * sampling 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 */
import { describe, expect, it } from 'vitest';
import { arcSampleInto } from '../../../src/curve/arc-sample-into';
import type { CurveSampleOptions } from '../../../src/types';

// type-level check: CurveSampleOptions는 types에서 import 가능해야 한다
const _check: CurveSampleOptions = {};
void _check;

/**
 * 원형 quarter arc: cx=0, cy=0, rx=1, ry=1, xRotation=0.
 * startAngle=0, endAngle=π/2, sweep=true.
 * t=0: (1,0), t=1: (0,1).
 */
const QUARTER_ARC = {
  cx: 0,
  cy: 0,
  rx: 1,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI / 2,
  sweep: true,
};

/** degenerate arc: rx=0 */
const DEGENERATE_ARC = {
  cx: 5,
  cy: 7,
  rx: 0,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI / 2,
  sweep: true,
};

describe('arcSampleInto', () => {
  it('steps=2 이면 start/end 두 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const result = arcSampleInto(out, QUARTER_ARC, 2);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    // t=0: cos(0)=1, sin(0)=0
    expect(out[0].x).toBeCloseTo(1, 10);
    expect(out[0].y).toBeCloseTo(0, 10);
    // t=1: cos(π/2)=0, sin(π/2)=1
    expect(out[1].x).toBeCloseTo(0, 10);
    expect(out[1].y).toBeCloseTo(1, 10);
  });

  it('steps=3 이면 quarter arc의 세 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    arcSampleInto(out, QUARTER_ARC, 3);
    expect(out).toHaveLength(3);
    // t=0: (1, 0)
    expect(out[0].x).toBeCloseTo(1, 10);
    expect(out[0].y).toBeCloseTo(0, 10);
    // t=0.5: angle=π/4, cos(π/4)=sin(π/4)=√2/2
    const s = Math.sqrt(2) / 2;
    expect(out[1].x).toBeCloseTo(s, 10);
    expect(out[1].y).toBeCloseTo(s, 10);
    // t=1: (0, 1)
    expect(out[2].x).toBeCloseTo(0, 10);
    expect(out[2].y).toBeCloseTo(1, 10);
  });

  it('options object { steps: 3 }와 number 3이 동일한 결과를 반환한다', () => {
    const out1: { x: number; y: number }[] = [];
    const out2: { x: number; y: number }[] = [];
    arcSampleInto(out1, QUARTER_ARC, 3);
    arcSampleInto(out2, QUARTER_ARC, { steps: 3 });
    expect(out1).toHaveLength(out2.length);
    for (let i = 0; i < out1.length; i++) {
      expect(out1[i].x).toBeCloseTo(out2[i].x, 10);
      expect(out1[i].y).toBeCloseTo(out2[i].y, 10);
    }
  });

  it('options를 생략하면 기본값 32개 점을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    arcSampleInto(out, QUARTER_ARC);
    expect(out).toHaveLength(32);
  });

  it('steps=1 (< 2)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => arcSampleInto(out, QUARTER_ARC, 1)).toThrow(RangeError);
  });

  it('steps > 0xffffffff이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => arcSampleInto(out, QUARTER_ARC, 0x100000000)).toThrow(RangeError);
  });

  it('fractional steps (1.5)이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => arcSampleInto(out, QUARTER_ARC, 1.5)).toThrow(RangeError);
  });

  it('NaN steps이면 RangeError를 던진다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => arcSampleInto(out, QUARTER_ARC, Number.NaN)).toThrow(RangeError);
  });

  it('오류 시 기존 out 내용을 보존한다', () => {
    const existing = { x: 99, y: 99 };
    const out: { x: number; y: number }[] = [existing];
    expect(() => arcSampleInto(out, QUARTER_ARC, 1)).toThrow(RangeError);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(existing);
  });

  it('degenerate arc (rx=0)이면 모든 점이 center 좌표이다', () => {
    const out: { x: number; y: number }[] = [];
    arcSampleInto(out, DEGENERATE_ARC, 3);
    expect(out).toHaveLength(3);
    for (const pt of out) {
      expect(pt.x).toBeCloseTo(5, 10);
      expect(pt.y).toBeCloseTo(7, 10);
    }
  });

  it('각 출력 point는 새로운 object이다', () => {
    const out: { x: number; y: number }[] = [];
    arcSampleInto(out, QUARTER_ARC, 3);
    expect(out[0]).not.toBe(out[1]);
    expect(out[1]).not.toBe(out[2]);
  });

  it('반환값은 out 배열 자체이다', () => {
    const out: { x: number; y: number }[] = [];
    const result = arcSampleInto(out, QUARTER_ARC, 2);
    expect(result).toBe(out);
  });
});
