import { arcTAtLength } from '../curve/arc-t-at-length';
import { centerArcToEndpointInto } from '../curve/center-arc-to-endpoint-into';
import { cubicSplitInto } from '../curve/cubic-split-into';
import { cubicTAtLength } from '../curve/cubic-t-at-length';
import { quadraticSplitInto } from '../curve/quadratic-split-into';
import { quadraticTAtLength } from '../curve/quadratic-t-at-length';
import { polylineTotalLength } from '../internal/polyline';
import type {
  ArcCommand,
  ArcCommandWritable,
  CenterArcWritable,
  CubicCommand,
  CubicCurveWritable,
  PathCommand,
  QuadraticCommand,
  QuadraticCurveWritable,
  XYObjectWritable,
} from '../types/index';
import {
  createCenterArcBuf,
  type DrawSegment,
  flattenDrawSegmentInto,
  forEachDrawSegment,
} from './path-segments.internal';

/**
 * splitAtLengthInto에서 두 path command sequence(outA, outB)를 만들기 위한 path-local
 * slicing helper. public domain barrel은 사용하지 않고, curve domain의 t-at-length /
 * split helper를 직접 호출한다.
 */

/**
 * line segment를 t 위치에서 split해 두 line endpoint를 만든다.
 *
 * `t`는 segment의 두 endpoint를 잇는 직선 비례 위치다 (curve t와 동일 의미).
 */
function splitLineEndpoint(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  t: number
): { x: number; y: number } {
  return { x: fromX + t * (toX - fromX), y: fromY + t * (toY - fromY) };
}

function measureSegmentLength(
  seg: DrawSegment,
  segBuf: XYObjectWritable[],
  centerArcBuf: CenterArcWritable,
  flatOpts: { flatness: number; maxRecursion: number }
): number {
  flattenDrawSegmentInto(segBuf, seg, flatOpts, centerArcBuf);
  return polylineTotalLength(segBuf);
}

function appendCommandsBeforeSegment(
  outA: PathCommand[],
  commands: readonly PathCommand[],
  scanIndex: number,
  seg: DrawSegment
): number {
  let nextIndex = scanIndex;
  while (nextIndex < commands.length && commands[nextIndex] !== seg.command) {
    outA.push(commands[nextIndex]);
    nextIndex += 1;
  }
  return nextIndex;
}

function writeLineSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'line' },
  t: number
): void {
  const mid = splitLineEndpoint(seg.fromX, seg.fromY, seg.command.x, seg.command.y, t);
  outA.push({ kind: 'line', x: mid.x, y: mid.y });
  outB.push({ kind: 'move', x: mid.x, y: mid.y });
  outB.push({ kind: 'line', x: seg.command.x, y: seg.command.y });
}

function writeCloseSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment & { kind: 'close' },
  t: number
): void {
  const mid = splitLineEndpoint(seg.fromX, seg.fromY, seg.subpathStartX, seg.subpathStartY, t);
  // outA는 split 지점까지의 line만, outB는 split 지점에서 시작해 subpath start로 가는
  // line + 원본 close (close는 이미 subpath start에 도달했으므로 zero-length no-op)
  outA.push({ kind: 'line', x: mid.x, y: mid.y });
  outB.push({ kind: 'move', x: mid.x, y: mid.y });
  outB.push({ kind: 'line', x: seg.subpathStartX, y: seg.subpathStartY });
  outB.push(seg.command);
}

function writeQuadraticSplit(
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

function writeCubicSplit(
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

function writeArcSplit(outA: PathCommand[], outB: PathCommand[], centerArc: CenterArcWritable, local: number): void {
  const t = arcTAtLength(centerArc, local);
  const midAngle = centerArc.startAngle + (centerArc.endAngle - centerArc.startAngle) * t;
  const leftCenter: CenterArcWritable = {
    cx: centerArc.cx,
    cy: centerArc.cy,
    rx: centerArc.rx,
    ry: centerArc.ry,
    xRotation: centerArc.xRotation,
    startAngle: centerArc.startAngle,
    endAngle: midAngle,
    sweep: centerArc.sweep,
  };
  const rightCenter: CenterArcWritable = {
    cx: centerArc.cx,
    cy: centerArc.cy,
    rx: centerArc.rx,
    ry: centerArc.ry,
    xRotation: centerArc.xRotation,
    startAngle: midAngle,
    endAngle: centerArc.endAngle,
    sweep: centerArc.sweep,
  };
  const leftEndpoint: ArcCommandWritable = {
    kind: 'arc',
    rx: 0,
    ry: 0,
    xRotation: 0,
    largeArc: false,
    sweep: false,
    x: 0,
    y: 0,
  };
  const rightEndpoint: ArcCommandWritable = {
    kind: 'arc',
    rx: 0,
    ry: 0,
    xRotation: 0,
    largeArc: false,
    sweep: false,
    x: 0,
    y: 0,
  };
  centerArcToEndpointInto(leftEndpoint, leftCenter);
  centerArcToEndpointInto(rightEndpoint, rightCenter);
  // 원본 ArcCommand의 rx/ry는 SVG radius correction 전 raw 값일 수 있지만, center form은
  // correction 후 값을 보존하므로 split 결과 endpoint arc의 rx/ry는 corrected 값이 된다.
  const leftCmd: ArcCommand = {
    kind: 'arc',
    rx: leftEndpoint.rx,
    ry: leftEndpoint.ry,
    xRotation: leftEndpoint.xRotation,
    largeArc: leftEndpoint.largeArc,
    sweep: leftEndpoint.sweep,
    x: leftEndpoint.x,
    y: leftEndpoint.y,
  };
  const rightCmd: ArcCommand = {
    kind: 'arc',
    rx: rightEndpoint.rx,
    ry: rightEndpoint.ry,
    xRotation: rightEndpoint.xRotation,
    largeArc: rightEndpoint.largeArc,
    sweep: rightEndpoint.sweep,
    x: rightEndpoint.x,
    y: rightEndpoint.y,
  };
  outA.push(leftCmd);
  outB.push({ kind: 'move', x: leftEndpoint.x, y: leftEndpoint.y });
  outB.push(rightCmd);
}

function writeSplitSegment(
  outA: PathCommand[],
  outB: PathCommand[],
  seg: DrawSegment,
  local: number,
  segLen: number,
  centerArcBuf: CenterArcWritable
): void {
  if (seg.kind === 'line') {
    writeLineSplit(outA, outB, seg, segLen === 0 ? 0 : local / segLen);
  } else if (seg.kind === 'close') {
    writeCloseSplit(outA, outB, seg, segLen === 0 ? 0 : local / segLen);
  } else if (seg.kind === 'quadratic') {
    writeQuadraticSplit(outA, outB, seg, local);
  } else if (seg.kind === 'cubic') {
    writeCubicSplit(outA, outB, seg, local);
  } else if (seg.kind === 'arc') {
    // centerArcBuf는 measureSegmentLength의 arc 분기에서 이미 채워졌다.
    writeArcSplit(outA, outB, centerArcBuf, local);
  }
}

function appendRemainingCommands(outB: PathCommand[], commands: readonly PathCommand[], splitIndex: number): void {
  for (let i = splitIndex; i < commands.length; i++) {
    outB.push(commands[i]);
  }
}

/**
 * commands를 distance 위치에서 두 part로 split하여 outA, outB에 기록한다.
 *
 * `forEachDrawSegment`로 segment를 순회하면서 누적 arc-length로 split 위치를 찾는다.
 * `distance < cumulativeLen + segLen` (strict `<`)을 만족하는 첫 segment 내부에서 split이
 * 발생한다. 이 함수는 outA / outB가 비어 있는 상태로 시작한다고 가정하고, split 전 commands는
 * outA에, split 후 commands는 outB에 기록한다.
 *
 * empty path / move-only path / `distance <= 0` / `distance >= totalLength` 같은 경계 처리는
 * caller(`splitAtLengthInto`)가 담당한다. 여기서는 split 발생 케이스만 처리한다.
 *
 * @returns split 발생 시 true. distance가 어떤 segment 안에서도 발견되지 않으면 false (caller가
 *   distance >= totalLength fallback을 적용해야 한다).
 */
export function splitCommandsAtLength(
  outA: PathCommand[],
  outB: PathCommand[],
  commands: readonly PathCommand[],
  distance: number,
  flatOpts: { flatness: number; maxRecursion: number }
): boolean {
  // segBuf, centerArcBuf는 함수 로컬 재사용 버퍼 — 모듈 레벨 상태 금지
  const segBuf: XYObjectWritable[] = [];
  const centerArcBuf: CenterArcWritable = createCenterArcBuf();

  // 입력 command가 commands에서 어느 인덱스에 있는지 추적할 수는 없다 (forEachDrawSegment는
  // index를 노출하지 않음). 따라서 각 visit마다 split이 발생했는지 표시하고, split 발생 후
  // 남은 commands를 caller가 별도로 append하기 위해 split 발생 위치의 command identity를
  // 보관한다.
  let split = false;
  let cumulativeLen = 0;
  // split된 segment 직후에 따라오는 command들을 가리키기 위한 markers — split이 일어난 visit
  // 시점에 commands 배열의 어느 인덱스까지 outA에 push했는지 기록.
  let splitIndex = -1;

  // commands에서 현재 visit 중인 drawing command가 어느 인덱스인지 찾기 위해 별도 인덱스를
  // visitor 바깥에서 관리한다 (forEachDrawSegment 호출 시점에 cmd === commands[i]인 i를 찾아간다).
  let scanIndex = 0;

  forEachDrawSegment(commands, (seg) => {
    if (split) return;

    // commands 안에서 이 drawing segment의 command를 찾아 그 직전까지의 command(Move 등)를 outA에
    // 누적한다. 이미 처리한 command는 건너뛴다.
    scanIndex = appendCommandsBeforeSegment(outA, commands, scanIndex, seg);

    const segLen = measureSegmentLength(seg, segBuf, centerArcBuf, flatOpts);

    if (distance < cumulativeLen + segLen) {
      // split 발생: 이 segment를 두 부분으로 나눠 outA, outB에 각각 push
      const local = Math.max(0, distance - cumulativeLen);
      writeSplitSegment(outA, outB, seg, local, segLen, centerArcBuf);

      split = true;
      // split이 발생한 segment command의 다음 인덱스를 기록
      splitIndex = scanIndex + 1;
      return;
    }

    cumulativeLen += segLen;
    // 이 segment의 command를 outA에 push하고 scanIndex 진행
    outA.push(seg.command);
    scanIndex += 1;
  });

  if (split && splitIndex >= 0) {
    // split 발생 이후 남은 commands를 outB에 그대로 append (이후 subpath 등)
    appendRemainingCommands(outB, commands, splitIndex);
  }

  return split;
}
