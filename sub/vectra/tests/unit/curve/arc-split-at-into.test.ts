/**
 * arcSplitAtInto unit test.
 *
 * 검증 방법:
 * - t = 0, t = 1, interior t, t < 0, t > 1 경계.
 * - NaN t는 split angle을 NaN으로 보존한다.
 * - degenerate radius, zero-sweep arc, negative sweep도 동일한 angle 분할 구조를 반환한다.
 * - rotated ellipse field(cx/cy/rx/ry/xRotation/sweep)이 두 segment에 보존된다.
 * - out.length = 0 clear 후 항상 길이 2를 반환한다.
 * - 반환값이 out과 같다.
 * - 반환 segment object가 입력 centerArc object와 같은 reference가 아니다.
 */

import { describe, expect, it } from 'vitest';
import { arcSplitAtInto } from '../../../src/curve/arc-split-at-into';
import type { CenterArcLike, CenterArcWritable } from '../../../src/types';

const halfCircle: CenterArcLike = {
  cx: 0,
  cy: 0,
  rx: 1,
  ry: 1,
  xRotation: 0,
  startAngle: 0,
  endAngle: Math.PI,
  sweep: true,
};

const rotatedEllipse: CenterArcLike = {
  cx: 5,
  cy: -3,
  rx: 4,
  ry: 2,
  xRotation: Math.PI / 6,
  startAngle: -Math.PI / 4,
  endAngle: Math.PI / 3,
  sweep: false,
};

describe('arcSplitAtInto', () => {
  it('t = 0.5에서 segment[0]은 [startAngle, mid], segment[1]은 [mid, endAngle]', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, 0.5);
    expect(out).toHaveLength(2);

    const mid = Math.PI / 2;
    expect(out[0].startAngle).toBe(0);
    expect(out[0].endAngle).toBe(mid);
    expect(out[1].startAngle).toBe(mid);
    expect(out[1].endAngle).toBe(Math.PI);
  });

  it('interior t = 0.25에서 정확한 분할 angle을 만든다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, 0.25);
    const split = Math.PI * 0.25;
    expect(out[0].startAngle).toBe(0);
    expect(out[0].endAngle).toBe(split);
    expect(out[1].startAngle).toBe(split);
    expect(out[1].endAngle).toBe(Math.PI);
  });

  it('t = 0이면 [zero-sweep start, original]를 반환한다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, 0);
    expect(out).toHaveLength(2);
    expect(out[0].startAngle).toBe(0);
    expect(out[0].endAngle).toBe(0);
    expect(out[1].startAngle).toBe(0);
    expect(out[1].endAngle).toBe(Math.PI);
  });

  it('t = 1이면 [original, zero-sweep end]를 반환한다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, 1);
    expect(out).toHaveLength(2);
    expect(out[0].startAngle).toBe(0);
    expect(out[0].endAngle).toBe(Math.PI);
    expect(out[1].startAngle).toBe(Math.PI);
    expect(out[1].endAngle).toBe(Math.PI);
  });

  it('t < 0이면 t = 0과 동일하게 clamp된다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, -1.5);
    expect(out[0].startAngle).toBe(0);
    expect(out[0].endAngle).toBe(0);
    expect(out[1].startAngle).toBe(0);
    expect(out[1].endAngle).toBe(Math.PI);
  });

  it('t > 1이면 t = 1과 동일하게 clamp된다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, 2.5);
    expect(out[0].startAngle).toBe(0);
    expect(out[0].endAngle).toBe(Math.PI);
    expect(out[1].startAngle).toBe(Math.PI);
    expect(out[1].endAngle).toBe(Math.PI);
  });

  it('NaN t는 split angle을 NaN으로 만든다 (non-finite pass-through)', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, Number.NaN);
    expect(out).toHaveLength(2);
    expect(out[0].startAngle).toBe(0);
    expect(Number.isNaN(out[0].endAngle)).toBe(true);
    expect(Number.isNaN(out[1].startAngle)).toBe(true);
    expect(out[1].endAngle).toBe(Math.PI);
    // split angle만 NaN으로 새고 다른 field는 원본을 보존한다.
    for (const seg of out) {
      expect(seg.cx).toBe(halfCircle.cx);
      expect(seg.cy).toBe(halfCircle.cy);
      expect(seg.rx).toBe(halfCircle.rx);
      expect(seg.ry).toBe(halfCircle.ry);
      expect(seg.xRotation).toBe(halfCircle.xRotation);
      expect(seg.sweep).toBe(halfCircle.sweep);
    }
  });

  it('Infinity t는 t = 1로 clamp되고 split angle은 endAngle이다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, Number.POSITIVE_INFINITY);
    expect(out[0].endAngle).toBe(Math.PI);
    expect(out[1].startAngle).toBe(Math.PI);
    for (const seg of out) {
      expect(seg.cx).toBe(halfCircle.cx);
      expect(seg.cy).toBe(halfCircle.cy);
      expect(seg.rx).toBe(halfCircle.rx);
      expect(seg.ry).toBe(halfCircle.ry);
      expect(seg.xRotation).toBe(halfCircle.xRotation);
      expect(seg.sweep).toBe(halfCircle.sweep);
    }
  });

  it('-Infinity t는 t = 0으로 clamp되고 split angle은 startAngle이다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, Number.NEGATIVE_INFINITY);
    expect(out[0].endAngle).toBe(0);
    expect(out[1].startAngle).toBe(0);
    for (const seg of out) {
      expect(seg.cx).toBe(halfCircle.cx);
      expect(seg.cy).toBe(halfCircle.cy);
      expect(seg.rx).toBe(halfCircle.rx);
      expect(seg.ry).toBe(halfCircle.ry);
      expect(seg.xRotation).toBe(halfCircle.xRotation);
      expect(seg.sweep).toBe(halfCircle.sweep);
    }
  });

  it('degenerate radius(rx = 0)도 동일한 angle 분할 구조를 반환한다', () => {
    const degenerate: CenterArcLike = { ...halfCircle, rx: 0 };
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, degenerate, 0.5);
    expect(out).toHaveLength(2);
    expect(out[0].rx).toBe(0);
    expect(out[0].endAngle).toBe(Math.PI / 2);
    expect(out[1].startAngle).toBe(Math.PI / 2);
  });

  it('degenerate radius(ry = 0)도 동일한 angle 분할 구조를 반환한다', () => {
    const degenerate: CenterArcLike = { ...halfCircle, ry: 0 };
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, degenerate, 0.5);
    expect(out).toHaveLength(2);
    expect(out[0].ry).toBe(0);
    expect(out[0].endAngle).toBe(Math.PI / 2);
  });

  it('negative radius(rx < 0)도 실패로 보지 않고 분할한다', () => {
    const negativeRadius: CenterArcLike = { ...halfCircle, rx: -1 };
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, negativeRadius, 0.5);
    expect(out).toHaveLength(2);
    expect(out[0].rx).toBe(-1);
    expect(out[1].rx).toBe(-1);
    expect(out[0].endAngle).toBe(Math.PI / 2);
    expect(out[1].startAngle).toBe(Math.PI / 2);
  });

  it('zero-sweep arc(startAngle === endAngle)도 분할한다', () => {
    const zeroSweep: CenterArcLike = { ...halfCircle, startAngle: 1, endAngle: 1 };
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, zeroSweep, 0.5);
    expect(out).toHaveLength(2);
    expect(out[0].startAngle).toBe(1);
    expect(out[0].endAngle).toBe(1);
    expect(out[1].startAngle).toBe(1);
    expect(out[1].endAngle).toBe(1);
  });

  it('negative sweep(endAngle < startAngle)도 동일하게 보간한다', () => {
    const negative: CenterArcLike = {
      ...halfCircle,
      startAngle: Math.PI,
      endAngle: 0,
      sweep: false,
    };
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, negative, 0.25);
    const split = Math.PI + (0 - Math.PI) * 0.25;
    expect(out[0].startAngle).toBe(Math.PI);
    expect(out[0].endAngle).toBe(split);
    expect(out[1].startAngle).toBe(split);
    expect(out[1].endAngle).toBe(0);
    expect(out[0].sweep).toBe(false);
    expect(out[1].sweep).toBe(false);
  });

  it('rotated ellipse의 cx/cy/rx/ry/xRotation/sweep을 두 segment에 보존한다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, rotatedEllipse, 0.3);
    for (const seg of out) {
      expect(seg.cx).toBe(rotatedEllipse.cx);
      expect(seg.cy).toBe(rotatedEllipse.cy);
      expect(seg.rx).toBe(rotatedEllipse.rx);
      expect(seg.ry).toBe(rotatedEllipse.ry);
      expect(seg.xRotation).toBe(rotatedEllipse.xRotation);
      expect(seg.sweep).toBe(rotatedEllipse.sweep);
    }
    const split = rotatedEllipse.startAngle + (rotatedEllipse.endAngle - rotatedEllipse.startAngle) * 0.3;
    expect(out[0].startAngle).toBe(rotatedEllipse.startAngle);
    expect(out[0].endAngle).toBe(split);
    expect(out[1].startAngle).toBe(split);
    expect(out[1].endAngle).toBe(rotatedEllipse.endAngle);
  });

  it('out 기존 내용이 삭제된다', () => {
    const sentinel: CenterArcWritable = {
      cx: 99,
      cy: 99,
      rx: 99,
      ry: 99,
      xRotation: 99,
      startAngle: 99,
      endAngle: 99,
      sweep: true,
    };
    const out: CenterArcWritable[] = [sentinel];
    arcSplitAtInto(out, halfCircle, 0.5);
    expect(out).toHaveLength(2);
    expect(out[0]).not.toBe(sentinel);
    expect(out[1]).not.toBe(sentinel);
  });

  it('out을 반환한다', () => {
    const out: CenterArcWritable[] = [];
    const ret = arcSplitAtInto(out, halfCircle, 0.5);
    expect(ret).toBe(out);
  });

  it('반환 segment object는 입력 centerArc object와 같은 reference가 아니다', () => {
    const input: CenterArcLike = { ...halfCircle };
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, input, 0.5);
    expect(out[0]).not.toBe(input);
    expect(out[1]).not.toBe(input);
  });

  it('두 segment object는 서로 다른 reference다', () => {
    const out: CenterArcWritable[] = [];
    arcSplitAtInto(out, halfCircle, 0.5);
    expect(out[0]).not.toBe(out[1]);
  });
});
