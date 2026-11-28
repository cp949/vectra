import type { Triangle, TriangleWritable } from '../types/flat-shapes.internal';

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
