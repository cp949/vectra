import { createZeroCubicCurve, createZeroQuadraticCurve } from '../internal/curve-shapes';
import { cubicSplitInto } from '../curve/cubic-split-into';
import { cubicTAtLength } from '../curve/cubic-t-at-length';
import { quadraticSplitInto } from '../curve/quadratic-split-into';
import { quadraticTAtLength } from '../curve/quadratic-t-at-length';
import type { CubicCommand, PathCommand, QuadraticCommand } from '../types/index';
import { cubicCurveFromSegment, quadraticCurveFromSegment, type DrawSegment } from './path-segments.internal';

/**
 * quadratic/cubic curve type의 split writer. arc-length 기준 t를 구한 뒤 curve domain의
 * split helper로 두 sub-curve를 만들어 outA/outB에 push한다.
 */

export function writeQuadraticSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'quadratic' },
  local: number
): void {
  const curve = quadraticCurveFromSegment(seg);
  const t = quadraticTAtLength(curve, local);
  const left = createZeroQuadraticCurve();
  const right = createZeroQuadraticCurve();
  quadraticSplitInto(left, right, curve, t);
  const leftCmd: QuadraticCommand = {
    kind: 'quadratic',
    x1: left.x1,
    y1: left.y1,
    x: left.x2,
    y: left.y2,
  };
  const rightCmd: QuadraticCommand = {
    kind: 'quadratic',
    x1: right.x1,
    y1: right.y1,
    x: right.x2,
    y: right.y2,
  };
  outA.push(leftCmd);
  outB.push({ kind: 'move', x: right.x0, y: right.y0 });
  outB.push(rightCmd);
}

export function writeCubicSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'cubic' },
  local: number
): void {
  const curve = cubicCurveFromSegment(seg);
  const t = cubicTAtLength(curve, local);
  const left = createZeroCubicCurve();
  const right = createZeroCubicCurve();
  cubicSplitInto(left, right, curve, t);
  const leftCmd: CubicCommand = {
    kind: 'cubic',
    x1: left.x1,
    y1: left.y1,
    x2: left.x2,
    y2: left.y2,
    x: left.x3,
    y: left.y3,
  };
  const rightCmd: CubicCommand = {
    kind: 'cubic',
    x1: right.x1,
    y1: right.y1,
    x2: right.x2,
    y2: right.y2,
    x: right.x3,
    y: right.y3,
  };
  outA.push(leftCmd);
  outB.push({ kind: 'move', x: right.x0, y: right.y0 });
  outB.push(rightCmd);
}
