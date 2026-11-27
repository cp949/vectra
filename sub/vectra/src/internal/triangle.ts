import type { TriangleLike, TriangleTuple, XYInput } from '../types';
import type { Triangle, TriangleWritable } from '../types/flat-shapes.internal';
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

/** 평평한 triangle의 부호 있는 면적을 두 배로 반환한다. */
export function flatTriangleSignedArea2x(t: Triangle): number {
  return (t.x2 - t.x1) * (t.y3 - t.y1) - (t.y2 - t.y1) * (t.x3 - t.x1);
}

/** 평평한 triangle의 꼭짓점에 유한하지 않은 좌표가 있는지 판정한다. */
export function hasNonFiniteTriangleVertex(t: Triangle): boolean {
  return (
    !Number.isFinite(t.x1) ||
    !Number.isFinite(t.y1) ||
    !Number.isFinite(t.x2) ||
    !Number.isFinite(t.y2) ||
    !Number.isFinite(t.x3) ||
    !Number.isFinite(t.y3)
  );
}

/** 꼭짓점 세 개가 원점인 평평한 triangle 객체를 만든다. */
export function createZeroTriangle(): TriangleWritable {
  return { x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
}
