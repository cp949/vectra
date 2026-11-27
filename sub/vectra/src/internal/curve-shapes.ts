import type { CubicCurveWritable, QuadraticCurveWritable } from '../types/flat-shapes.internal';

/** 좌표가 0인 이차 베지어 출력 객체를 만든다. */
export function createZeroQuadraticCurve(): QuadraticCurveWritable {
  return { kind: 'quadratic', x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
}

/** 좌표가 0인 삼차 베지어 출력 객체를 만든다. */
export function createZeroCubicCurve(): CubicCurveWritable {
  return { kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
}
