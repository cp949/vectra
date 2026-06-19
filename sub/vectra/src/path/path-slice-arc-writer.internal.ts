import { arcTAtLength } from '../curve/arc-t-at-length';
import { centerArcToEndpointInto } from '../curve/center-arc-to-endpoint-into';
import type { ArcCommand, ArcCommandWritable, CenterArcWritable, PathCommand } from '../types/index';

/**
 * arc curve type의 split writer (가장 fragile). center-arc form을 midAngle에서 둘로 나눈 뒤
 * centerArcToEndpointInto로 endpoint arc로 환원해 outA/outB에 push한다.
 */

export function writeArcSplit(
  outA: PathCommand[],
  outB: PathCommand[],
  centerArc: CenterArcWritable,
  local: number
): void {
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
