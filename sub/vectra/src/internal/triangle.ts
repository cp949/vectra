import type { TriangleLike, TriangleTuple, XYInput } from '../types';
import { readX, readY } from './xy';

/** TriangleLike가 tuple인지 확인하는 type guard */
function isTriangleTuple(t: TriangleLike): t is TriangleTuple {
  return Array.isArray(t);
}

/** triangle input에서 첫 번째 vertex(a)를 읽는다. */
export function readTriangleA(t: TriangleLike): XYInput {
  return isTriangleTuple(t) ? t[0] : t.a;
}

/** triangle input에서 두 번째 vertex(b)를 읽는다. */
export function readTriangleB(t: TriangleLike): XYInput {
  return isTriangleTuple(t) ? t[1] : t.b;
}

/** triangle input에서 세 번째 vertex(c)를 읽는다. */
export function readTriangleC(t: TriangleLike): XYInput {
  return isTriangleTuple(t) ? t[2] : t.c;
}

/** triangle 세 vertex의 좌표를 평탄화해 반환한다. */
export function readTriangleRawCoords(t: TriangleLike): {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
} {
  const a = readTriangleA(t);
  const b = readTriangleB(t);
  const c = readTriangleC(t);
  return {
    ax: readX(a),
    ay: readY(a),
    bx: readX(b),
    by: readY(b),
    cx: readX(c),
    cy: readY(c),
  };
}

/** triangle의 signed area × 2를 반환한다. 양수=CCW, 음수=CW, 0=degenerate. */
export function triangleSignedArea2x(t: TriangleLike): number {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(t);
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

/** triangle vertex 중 non-finite(NaN, Infinity, -Infinity) 좌표가 있으면 true를 반환한다. */
export function hasNonFiniteVertex(t: TriangleLike): boolean {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(t);
  return (
    !Number.isFinite(ax) ||
    !Number.isFinite(ay) ||
    !Number.isFinite(bx) ||
    !Number.isFinite(by) ||
    !Number.isFinite(cx) ||
    !Number.isFinite(cy)
  );
}
