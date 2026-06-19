/**
 * path-slice writer characterization 테스트.
 *
 * writeArcSplit(가장 fragile, center-arc 변환) / writeQuadraticSplit / writeCubicSplit를
 * .internal에서 직접 import해 현재 split 동작을 golden 값으로 고정한다(분할 후 회귀 net).
 *
 * 각 writer는 outA/outB 빈 배열 + 알려진 DrawSegment/CenterArcWritable를 받아 split 결과를
 * push한다. midAngle 분할 endpoint, corrected rx/ry, control point 보간을 toBeCloseTo로 고정한다.
 */
import { describe, expect, test } from 'vitest';
import type { DrawSegment } from '../../../src/path/path-segments.internal';
import { writeArcSplit } from '../../../src/path/path-slice-arc-writer.internal';
import { writeCubicSplit, writeQuadraticSplit } from '../../../src/path/path-slice-curve-writers.internal';
import type { ArcCommand, CenterArcWritable, CubicCommand, PathCommand, QuadraticCommand } from '../../../src/types';

describe('writeArcSplit (center-arc 변환, 가장 fragile)', () => {
  // 사분원: cx=0,cy=0,rx=10,ry=10, startAngle=0..PI/2, sweep=true
  const centerArc: CenterArcWritable = {
    cx: 0,
    cy: 0,
    rx: 10,
    ry: 10,
    xRotation: 0,
    startAngle: 0,
    endAngle: Math.PI / 2,
    sweep: true,
  };

  test('중간 split: midAngle endpoint + corrected rx/ry golden', () => {
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    // local = 사분원 호 길이의 절반
    writeArcSplit(outA, outB, centerArc, (10 * Math.PI) / 2 / 2);

    expect(outA).toHaveLength(1);
    const left = outA[0] as ArcCommand;
    expect(left.kind).toBe('arc');
    expect(left.rx).toBeCloseTo(10, 9);
    expect(left.ry).toBeCloseTo(10, 9);
    expect(left.sweep).toBe(true);
    expect(left.largeArc).toBe(false);
    // 45도 분할점 (10*cos45, 10*sin45)
    expect(left.x).toBeCloseTo(7.071067853243047, 9);
    expect(left.y).toBeCloseTo(7.071067770487903, 9);

    expect(outB).toHaveLength(2);
    expect(outB[0]).toEqual({ kind: 'move', x: left.x, y: left.y });
    const right = outB[1] as ArcCommand;
    expect(right.kind).toBe('arc');
    expect(right.rx).toBeCloseTo(10, 9);
    expect(right.ry).toBeCloseTo(10, 9);
    expect(right.x).toBeCloseTo(0, 9);
    expect(right.y).toBeCloseTo(10, 9);
  });

  test('t=0 (전체가 outB): leftCmd endpoint = startAngle endpoint', () => {
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    writeArcSplit(outA, outB, centerArc, 0);

    const left = outA[0] as ArcCommand;
    // midAngle == startAngle == 0 → endpoint (10, 0)
    expect(left.x).toBeCloseTo(10, 9);
    expect(left.y).toBeCloseTo(0, 9);
    const right = outB[1] as ArcCommand;
    expect(right.x).toBeCloseTo(0, 9);
    expect(right.y).toBeCloseTo(10, 9);
  });
});

describe('writeQuadraticSplit', () => {
  const seg: DrawSegment & { kind: 'quadratic' } = {
    kind: 'quadratic',
    fromX: 0,
    fromY: 0,
    startsSubpath: false,
    subpathStartX: 0,
    subpathStartY: 0,
    command: { kind: 'quadratic', x1: 5, y1: 10, x: 10, y: 0 },
  };

  test('control point 보간 golden', () => {
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    writeQuadraticSplit(outA, outB, seg, 6);

    const left = outA[0] as QuadraticCommand;
    expect(left.kind).toBe('quadratic');
    expect(left.x1).toBeCloseTo(1.8330568633973598, 9);
    expect(left.y1).toBeCloseTo(3.6661137267947197, 9);
    expect(left.x).toBeCloseTo(3.6661137267947197, 9);
    expect(left.y).toBeCloseTo(4.6441494820309055, 9);

    expect(outB[0]).toEqual({ kind: 'move', x: left.x, y: left.y });
    const right = outB[1] as QuadraticCommand;
    expect(right.x1).toBeCloseTo(6.83305686339736, 9);
    expect(right.y1).toBeCloseTo(6.33388627320528, 9);
    expect(right.x).toBeCloseTo(10, 9);
    expect(right.y).toBeCloseTo(0, 9);
  });
});

describe('writeCubicSplit', () => {
  const seg: DrawSegment & { kind: 'cubic' } = {
    kind: 'cubic',
    fromX: 0,
    fromY: 0,
    startsSubpath: false,
    subpathStartX: 0,
    subpathStartY: 0,
    command: { kind: 'cubic', x1: 0, y1: 10, x2: 10, y2: 10, x: 10, y: 0 },
  };

  test('control point 보간 golden', () => {
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    writeCubicSplit(outA, outB, seg, 10);

    const left = outA[0] as CubicCommand;
    expect(left.kind).toBe('cubic');
    expect(left.x1).toBeCloseTo(0, 9);
    expect(left.y1).toBeCloseTo(4.999999962747097, 9);
    expect(left.x2).toBeCloseTo(2.499999962747097, 9);
    expect(left.y2).toBeCloseTo(7.499999962747097, 9);
    expect(left.x).toBeCloseTo(4.9999999441206455, 9);
    expect(left.y).toBeCloseTo(7.5, 9);

    expect(outB[0]).toEqual({ kind: 'move', x: left.x, y: left.y });
    const right = outB[1] as CubicCommand;
    expect(right.x1).toBeCloseTo(7.499999962747097, 9);
    expect(right.y1).toBeCloseTo(7.500000037252903, 9);
    expect(right.x2).toBeCloseTo(10, 9);
    expect(right.y2).toBeCloseTo(5.000000037252903, 9);
    expect(right.x).toBeCloseTo(10, 9);
    expect(right.y).toBeCloseTo(0, 9);
  });
});
