import { emptyInto } from '../bounds/empty-into';
import { arcBoundsInto } from '../curve/arc-bounds-into';
import { cubicBoundsInto } from '../curve/cubic-bounds-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticBoundsInto } from '../curve/quadratic-bounds-into';
import { readX, readY, writeXY } from '../internal/xy';
import type {
  BoundsWritable,
  CenterArcWritable,
  PathCommand,
  PathMeasurementOptions,
  XYWritable,
} from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';

/** point 하나를 포함하도록 bounds 누적기를 확장한다. */
function includePoint(out: BoundsWritable, x: number, y: number): void {
  const minX = Math.min(readX(out.min), x);
  const minY = Math.min(readY(out.min), y);
  const maxX = Math.max(readX(out.max), x);
  const maxY = Math.max(readY(out.max), y);
  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
}

/** segment-local bounds를 path bounds 누적기에 병합한다. */
function includeBounds(out: BoundsWritable, bounds: BoundsWritable): void {
  includePoint(out, readX(bounds.min), readY(bounds.min));
  includePoint(out, readX(bounds.max), readY(bounds.max));
}

/**
 * commands의 bounding box를 out에 기록한다.
 * empty path → sentinel bounds { min:(Infinity,Infinity), max:(-Infinity,-Infinity) } 기록.
 *
 * exact curve bounds 방식을 사용한다 (line/close는 endpoint 포함,
 * quadratic/cubic은 interior extrema까지, arc는 center form으로 변환 후 extrema 계산).
 * options 파라미터는 API 일관성 유지용으로 선언하며 활용하지 않는다.
 *
 * @param out bounds를 기록할 writable output
 * @param commands bounds를 계산할 path command sequence
 * @param _options adaptive subdivision option (exact bounds 사용이므로 미활용)
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(
  out: Out,
  commands: readonly PathCommand[],
  _options?: PathMeasurementOptions
): Out {
  // BoundsWritable<XYWritable, XYWritable>은 object/tuple min·max를 모두 허용한다.
  // 내부 helper 함수들은 BoundsWritable<XYObjectWritable>을 요구하므로
  // 단언(as)으로 전달한다. writeXY가 tuple/object를 모두 처리하므로 런타임 안전.
  const outObj = out as BoundsWritable;

  // empty path sentinel으로 초기화
  emptyInto(outObj);

  // curve segment 계산에 쓸 함수 로컬 scratch 객체
  const scratchBounds: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  const centerArcBuf: CenterArcWritable = {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    xRotation: 0,
    startAngle: 0,
    endAngle: 0,
    sweep: false,
  };

  forEachDrawSegment(commands, (seg) => {
    const { fromX, fromY } = seg;

    if (seg.kind === 'line') {
      // line segment: 두 endpoint를 포함하도록 확장
      includePoint(outObj, fromX, fromY);
      includePoint(outObj, seg.command.x, seg.command.y);
    } else if (seg.kind === 'close') {
      // close segment: current → subpath start 직선의 두 endpoint 포함
      includePoint(outObj, fromX, fromY);
      includePoint(outObj, seg.subpathStartX, seg.subpathStartY);
    } else if (seg.kind === 'quadratic') {
      // quadratic: interior extrema까지 정확히 포함
      const cmd = seg.command;
      quadraticBoundsInto(scratchBounds, [fromX, fromY], [cmd.x1, cmd.y1], [cmd.x, cmd.y]);
      includeBounds(outObj, scratchBounds);
    } else if (seg.kind === 'cubic') {
      // cubic: interior extrema까지 정확히 포함
      const cmd = seg.command;
      cubicBoundsInto(scratchBounds, [fromX, fromY], [cmd.x1, cmd.y1], [cmd.x2, cmd.y2], [cmd.x, cmd.y]);
      includeBounds(outObj, scratchBounds);
    } else if (seg.kind === 'arc') {
      // arc: endpoint form → center form 변환 후 extrema 계산
      endpointArcToCenterInto(centerArcBuf, [fromX, fromY], seg.command);
      arcBoundsInto(scratchBounds, centerArcBuf);
      includeBounds(outObj, scratchBounds);
    }
  });

  return out;
}
