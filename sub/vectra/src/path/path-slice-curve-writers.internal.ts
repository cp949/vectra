import { cubicSplitInto } from '../curve/cubic-split-into';
import { cubicTAtLength } from '../curve/cubic-t-at-length';
import { quadraticSplitInto } from '../curve/quadratic-split-into';
import { quadraticTAtLength } from '../curve/quadratic-t-at-length';
import type {
  CubicCommand,
  CubicCurveWritable,
  PathCommand,
  QuadraticCommand,
  QuadraticCurveWritable,
} from '../types/index';
import type { DrawSegment } from './path-segments.internal';

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
  const cmd = seg.command;
  const p0 = { x: seg.fromX, y: seg.fromY };
  const p1 = { x: cmd.x1, y: cmd.y1 };
  const p2 = { x: cmd.x, y: cmd.y };
  const t = quadraticTAtLength(p0, p1, p2, local);
  const left: QuadraticCurveWritable = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
  };
  const right: QuadraticCurveWritable = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
  };
  quadraticSplitInto(left, right, p0, p1, p2, t);
  const leftCmd: QuadraticCommand = {
    kind: 'quadratic',
    x1: left.p1.x,
    y1: left.p1.y,
    x: left.p2.x,
    y: left.p2.y,
  };
  const rightCmd: QuadraticCommand = {
    kind: 'quadratic',
    x1: right.p1.x,
    y1: right.p1.y,
    x: right.p2.x,
    y: right.p2.y,
  };
  outA.push(leftCmd);
  outB.push({ kind: 'move', x: right.p0.x, y: right.p0.y });
  outB.push(rightCmd);
}

export function writeCubicSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'cubic' },
  local: number
): void {
  const cmd = seg.command;
  const p0 = { x: seg.fromX, y: seg.fromY };
  const p1 = { x: cmd.x1, y: cmd.y1 };
  const p2 = { x: cmd.x2, y: cmd.y2 };
  const p3 = { x: cmd.x, y: cmd.y };
  const t = cubicTAtLength(p0, p1, p2, p3, local);
  const left: CubicCurveWritable = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
  const right: CubicCurveWritable = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
  cubicSplitInto(left, right, p0, p1, p2, p3, t);
  const leftCmd: CubicCommand = {
    kind: 'cubic',
    x1: left.p1.x,
    y1: left.p1.y,
    x2: left.p2.x,
    y2: left.p2.y,
    x: left.p3.x,
    y: left.p3.y,
  };
  const rightCmd: CubicCommand = {
    kind: 'cubic',
    x1: right.p1.x,
    y1: right.p1.y,
    x2: right.p2.x,
    y2: right.p2.y,
    x: right.p3.x,
    y: right.p3.y,
  };
  outA.push(leftCmd);
  outB.push({ kind: 'move', x: right.p0.x, y: right.p0.y });
  outB.push(rightCmd);
}
