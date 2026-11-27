import type { XYInput } from '../types';
import type { CubicCurve, QuadraticCurve } from '../types/flat-shapes.internal';
import { readX, readY } from './xy';

// v2-migration: 곡선 호출처가 평평한 제어점을 넘기면 이 변환을 지운다.
/** 기존 제어점 세 개를 평평한 이차 베지어로 옮긴다. */
export function flatQuadraticFromLegacyPoints(p0: XYInput, p1: XYInput, p2: XYInput): QuadraticCurve {
  return {
    kind: 'quadratic',
    x0: readX(p0),
    y0: readY(p0),
    x1: readX(p1),
    y1: readY(p1),
    x2: readX(p2),
    y2: readY(p2),
  };
}

/** 기존 제어점 네 개를 평평한 삼차 베지어로 옮긴다. */
export function flatCubicFromLegacyPoints(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput): CubicCurve {
  return {
    kind: 'cubic',
    x0: readX(p0),
    y0: readY(p0),
    x1: readX(p1),
    y1: readY(p1),
    x2: readX(p2),
    y2: readY(p2),
    x3: readX(p3),
    y3: readY(p3),
  };
}
