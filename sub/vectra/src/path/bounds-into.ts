import type { BoundsWritable } from '../types/flat-shapes.internal';
import { arcBoundsInto } from '../curve/arc-bounds-into';
import { cubicBoundsInto } from '../curve/cubic-bounds-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticBoundsInto } from '../curve/quadratic-bounds-into';
import { createZeroBounds } from '../internal/bounds';
import type { CenterArcWritable, PathCommand, PathMeasurementOptions } from '../types/index';
import type { Bounds as FlatBounds } from '../types/flat-shapes.internal';
import { cubicCurveFromSegment, forEachDrawSegment, quadraticCurveFromSegment } from './path-segments.internal';

/** point 하나를 포함하도록 bounds 누적기를 확장한다. */
function includePoint(out: BoundsWritable, x: number, y: number): void {
  out.minX = Math.min(out.minX, x);
  out.minY = Math.min(out.minY, y);
  out.maxX = Math.max(out.maxX, x);
  out.maxY = Math.max(out.maxY, y);
}

/** 곡선의 평평한 경계를 경로 경계에 합친다. */
function includeBounds(out: BoundsWritable, bounds: FlatBounds): void {
  includePoint(out, bounds.minX, bounds.minY);
  includePoint(out, bounds.maxX, bounds.maxY);
}

/**
 * commands의 bounding box를 out에 기록한다.
 * empty path → sentinel bounds { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity } 기록.
 *
 * exact curve bounds 방식을 사용한다 (line/close는 endpoint 포함,
 * quadratic/cubic은 interior extrema까지, arc는 center form으로 변환 후 extrema 계산).
 * options 파라미터는 API 일관성 유지용으로 선언하며 활용하지 않는다.
 *
 * @param out 경계를 기록할 { minX, minY, maxX, maxY } 객체
 * @param commands bounds를 계산할 path command sequence
 * @param _options adaptive subdivision option (exact bounds 사용이므로 미활용)
 */
export function boundsInto<Out extends BoundsWritable>(
  out: Out,
  commands: readonly PathCommand[],
  _options?: PathMeasurementOptions
): Out {
  out.minX = Infinity;
  out.minY = Infinity;
  out.maxX = -Infinity;
  out.maxY = -Infinity;

  const scratchBounds = createZeroBounds();
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
      includePoint(out, fromX, fromY);
      includePoint(out, seg.command.x, seg.command.y);
    } else if (seg.kind === 'close') {
      // close segment: current → subpath start 직선의 두 endpoint 포함
      includePoint(out, fromX, fromY);
      includePoint(out, seg.subpathStartX, seg.subpathStartY);
    } else if (seg.kind === 'quadratic') {
      // quadratic: interior extrema까지 정확히 포함
      quadraticBoundsInto(scratchBounds, quadraticCurveFromSegment(seg));
      includeBounds(out, scratchBounds);
    } else if (seg.kind === 'cubic') {
      // cubic: interior extrema까지 정확히 포함
      cubicBoundsInto(scratchBounds, cubicCurveFromSegment(seg));
      includeBounds(out, scratchBounds);
    } else {
      // arc: endpoint form → center form 변환 후 extrema 계산
      endpointArcToCenterInto(centerArcBuf, { x: fromX, y: fromY }, seg.command);
      arcBoundsInto(scratchBounds, centerArcBuf);
      includeBounds(out, scratchBounds);
    }
  });

  return out;
}
